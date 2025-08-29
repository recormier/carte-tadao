// src/app/import-itineraire/import-itineraire.ts
import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LigneItem } from '../models/ligne-item.model';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-layer-item-selector',
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule ],
  templateUrl: './import-itineraire.html',
  styleUrls: ['./import-itineraire.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImportItineraireComponent {
  /* ------------------------------------------------------------------ */
  /* Entrées / sorties                                                   */
  /* ------------------------------------------------------------------ */
  @Input() title = 'Sélection';
  /** Liste complète des lignes disponibles */
  @Input() items: LigneItem[] = [];
  /** Identifiants déjà cochés */
  @Input() active: string[] = [];
  /** Ordre d'affichage des catégories */
  @Input() orderedTypes: string[] = ['Bulle', 'LR', 'CS', 'Allobus', 'Chronopro', 'Navette'];

  @Output() add    = new EventEmitter<string>();
  @Output() remove = new EventEmitter<string>();
  @Output() reorder = new EventEmitter<string[]>(); // 🔄 nouveau nom plus explicite
  /* ------------------------------------------------------------------ */
  /* UI state                                                            */
  /* ------------------------------------------------------------------ */
  dropdownOpen = false;
  search = '';

  /* ------------------------------------------------------------------ */
  /* Recherche & regroupement                                            */
  /* ------------------------------------------------------------------ */
  private get filtered(): LigneItem[] {
    const term = this.search.trim().toLowerCase();
    return term ? this.items.filter(it => it.id.toLowerCase().includes(term)) : this.items;
  }

  /** Retourne un tableau [{ type, value[] }] trié par orderedTypes */
  get groupedFiltered(): { type: string; value: LigneItem[] }[] {
    const buckets = new Map<string, LigneItem[]>();
    for (const it of this.filtered) {
      (buckets.get(it.type) ?? buckets.set(it.type, []).get(it.type)!).push(it);
    }
    return this.orderedTypes.filter(t => buckets.has(t)).map(t => ({ type: t, value: buckets.get(t)! }));
  }

  /* ------------------------------------------------------------------ */
  /* Helpers                                                             */
  /* ------------------------------------------------------------------ */
  isActive = (id: string) => this.active.includes(id);

  toggle(id: string, checked: boolean) {
    checked ? this.add.emit(id) : this.remove.emit(id);
  }

  /**
   * Permet la sélection dès le tout 1er clic même quand l'input a le focus.
   * On capte `mousedown`, on empêche le focus de se déplacer, puis on
   * inverse l'état nous‑mêmes.
   */
  toggleByMouse(ev: MouseEvent, id: string) {
    ev.preventDefault();              // empêche le blur de l'input
    const isChecked = this.isActive(id);
    this.toggle(id, !isChecked);      // inverse l'état manuellement
  }


  onCheckboxChange(event: Event, id: string) {
    const checked = (event.target as HTMLInputElement).checked;
    this.toggle(id, checked);
  }

  trackByIdCbb = (_: number, it: LigneItem) => it.id;
  trackById    = (_: number, id: string) => id;

  /* ------------------------------------------------------------------ */
  /* Dropdown control                                                    */
  /* ------------------------------------------------------------------ */
  openDropdown() { this.dropdownOpen = true;console.log('open') }
  toggleDropdown() { this.dropdownOpen = !this.dropdownOpen; }

  /**
   * Ouvre la dropdown au mousedown et rejoue le clic sur l'élément rendu
   * afin de permettre la sélection dès le premier clic.
   */
  onSearchMouseDown(ev: MouseEvent) {
    if (!this.dropdownOpen) {
      this.openDropdown();
      setTimeout(() => {
        const target = document.elementFromPoint(ev.clientX, ev.clientY) as HTMLElement | null;
        target?.click();
        console.log('cheopck') 
      });
    }
  }

  /** Ferme si on clique hors de .combo */
  @HostListener('document:click', ['$event'])
  closeOutside(ev: MouseEvent) {
    if (!(ev.target as HTMLElement)?.closest('.combo')) {
      this.dropdownOpen = false;
    }
  }

  getColorById(id: string): string {
  const item = this.items.find(it => it.id === id);
  return item?.couleur?.startsWith('#') ? item.couleur : `#${item?.couleur ?? 'ccc'}`;
}



drop(event: CdkDragDrop<string[]>) {
  moveItemInArray(this.active, event.previousIndex, event.currentIndex);

  // Notifie le parent si besoin
  this.reorder.emit(this.active);
}


}
