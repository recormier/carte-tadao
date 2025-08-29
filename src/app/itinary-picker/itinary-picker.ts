// itinerary-picker.component.ts
import { Component, EventEmitter, Output, Input } from '@angular/core';
import { CommonModule  } from '@angular/common'; 

@Component({
  selector: 'app-itinerary-picker',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="picker">
      <button *ngFor="let f of features"
              (mouseenter)="hover.emit(f)"
              (mouseleave)="hover.emit(null)"
              (click)="choose(f)">
        {{ f.properties.nom_commercial }}
      </button>
    </div>
  `,
  styles: [`
    .picker {
      display:flex;
      flex-direction:column;
      background:#fff;
      border:1px solid #ccc;
      padding:4px;
      box-shadow:0 2px 6px rgba(0,0,0,.25);
      max-height: 30vh;      /* 60 % de la hauteur viewport */
      overflow-y: auto;      /* scroll interne si liste longue */
    }
    button { all:unset; padding:4px 8px; cursor:pointer; }
    button:hover { background:#eee; }
  `]
})
export class ItineraryPickerComponent {
  @Input() features!: any[]; // résultats de pickObjects
  @Output() selected = new EventEmitter<any>();
  @Output() hover = new EventEmitter<any  | null>();   // 👈 nouveau

  choose(f: any) {
    this.selected.emit(f);
  }
}