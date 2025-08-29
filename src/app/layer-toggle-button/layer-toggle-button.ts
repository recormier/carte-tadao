import { Component, Input, model} from '@angular/core';

@Component({
  selector: 'app-layer-toggle-button',
  imports: [],
  templateUrl: './layer-toggle-button.html',
  styleUrl: './layer-toggle-button.scss'
})
export class LayerToggleButton {


  /** identifiant de la couche (optionnel si déjà connu du parent) */
  @Input() id!: string;

  /** chemin ou URL de l’icône */
  @Input() icon!: string;

  /** texte alternatif (facultatif) */
  @Input() alt = '';


  active = model<boolean>(false);

  toggle() {
    /* inverse la valeur : .set() ou .update() */
    this.active.update(v => !v);
    console.log(this.active())
  }
}
