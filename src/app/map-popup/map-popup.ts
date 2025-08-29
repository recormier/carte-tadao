// src/app/map-popup/map-popup.ts
import { Component, EventEmitter, Output, ChangeDetectionStrategy, Input } from '@angular/core';
import { CommonModule  } from '@angular/common'; 

type TabDict = Record<string, [string /*titre*/, string /*html*/]>;

@Component({
  selector: 'app-map-popup',
  imports:[CommonModule],
  standalone: true,
  template: `
    <div class="popup">
      <button class="close" (click)="close.emit()">✕</button>

      <h3 class="mb-2">{{ titre }}</h3>

      <!-- barre d’onglets -->
      <nav class="tabs" *ngIf="tabKeys.length">
        <button *ngFor="let key of tabKeys"
                (click)="active = key"
                [class.active]="active === key">
          {{ tabs[key][0] }}
        </button>
      </nav>

      <!-- contenu de l’onglet actif -->
      <div class="content" [innerHTML]="tabs[active][1]"></div>
    </div>
  `,
  styles: [`
    .popup { background:#fff; border-radius:.5rem; padding:1rem;
             box-shadow:0 2px 8px rgba(0,0,0,.28); max-width:260px;
             pointer-events:auto; position:relative; }
    .close { position:absolute; top:4px; right:4px; border:none;
             background:none; font-size:1rem; cursor:pointer; }
    .tabs { display:flex; gap:.25rem; margin-bottom:.5rem; }
    .tabs button { flex:1; border:none; padding:.3rem .4rem;
                   background:#eee; cursor:pointer; border-radius:.25rem;
                   font-size:.8rem; }
    .tabs button.active { background:#d0d0ff; font-weight:600; }
    .content { max-height:140px; overflow:auto; font-size:.85rem; }
    h3 { margin:0 0 .4rem 0; font-size:1rem; }
  `]
})
export class MapPopupComponent {
  /* ——— données injectées ——— */
  @Input() titre = '';
  @Input() tabs: TabDict = {};

  /* ——— fermeture ——— */
  @Output() close = new EventEmitter<void>();

  /* ——— état onglet actif ——— */
  active: string = '';
  get tabKeys(): string[] { return Object.keys(this.tabs); }

  ngOnInit() {
    this.active = this.tabKeys[0] ?? '';   // active le 1er onglet par défaut
  }
}