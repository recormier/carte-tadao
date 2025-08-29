import { LayerService } from './../services/layer-service';
// src/app/left-side-panel/left-side-panel.ts
import { Component, Input, Output, EventEmitter, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImportItineraireComponent } from '../import-itineraire/import-itineraire';
import { LigneItem } from '../models/ligne-item.model';


/**
 * Bandeau latéral (gauche) rétractable.
 * Usage : <app-side-panel [(opened)]="panelOpen"> … </app-side-panel>
 */
@Component({
  selector: 'app-left-side-panel',
  standalone: true,
  imports: [CommonModule,ImportItineraireComponent],
  templateUrl: './left-side-panel.html',
  styleUrls: ['./left-side-panel.scss']
})
export class LeftSidePanelComponent {

    constructor(private layerService: LayerService) {}  // ← injection propre ici

  /** Etat ouvert / fermé (bindable en two‑way) */
  @Input() opened = false;
  @Output() openedChange = new EventEmitter<boolean>();

  toggle() {
    this.opened = !this.opened;
    this.openedChange.emit(this.opened);
  }
  
  allNumLi: LigneItem[] = [];     // remplis-les depuis ton service/HTTP
  loadedLines: string[] = [];


  /* Charge le GeoJSON via fetch() au montage */
  async ngOnInit() {
    const resp = await fetch('layers-assets/itineraires.geojson');
    //console.log('HTTP status', resp.status);          // ← 200 ?
    const gj = await resp.json();
    //console.log('Features', gj.features?.length);      // ← > 0 ?

    const items = gj.features
      .map((f: any) => ({
        id: f.properties.numero_ligne as string,
        type: f.properties.type_ligne as string,
        couleur: f.properties.couleur as string    // ← ajouté ici
      }))
      .filter((it: any): it is LigneItem =>
        it.id && it.type
      );

    /* — déduplication par id — */
    const uniq = new Map<string, LigneItem>();
    for (const it of items) {
      if (!uniq.has(it.id)) uniq.set(it.id, it);   // garde le premier rencontré
    }

    /* tableau final trié */
    this.allNumLi = [...uniq.values()]
      .sort((a, b) => a.id.localeCompare(b.id));

  }
loadLine(num: string) {
  console.log('[LeftSidePanel] loading', num);

  if (!this.loadedLines.includes(num)) {
    this.loadedLines = [num, ...this.loadedLines.filter(n => n !== num)];
    this.layerService.setLoadedLines(this.loadedLines, num);  // ← zoom sur cette ligne
  }
}

unloadLine(num: string) {
  console.log('[LeftSidePanel] unloading', num);
  this.loadedLines = this.loadedLines.filter(n => n !== num);
  this.layerService.setLoadedLines(this.loadedLines);
}

reorderLines(order: string[]) {
  this.layerService.setLoadedLines(order);
}

@HostBinding('class.open') get isOpen() {
  return this.opened;
}
}





