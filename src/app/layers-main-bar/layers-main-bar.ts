import { Component, Input, OnInit } from '@angular/core';
import { LayerToggleButton } from "../layer-toggle-button/layer-toggle-button";
import { LayerService } from '../services/layer-service';
import { CommonModule  } from '@angular/common'; 
import { LayerConfig } from '../layers/layer.model';
import { PREDEFINED_LAYERS } from '../layers/layer.definitions';

@Component({
  selector: 'app-layers-main-bar',
  imports: [LayerToggleButton, CommonModule ],
  templateUrl: './layers-main-bar.html',
  styleUrl: './layers-main-bar.scss'
})
export class LayersMainBar implements OnInit {

  @Input()   layers: LayerConfig[] = structuredClone(PREDEFINED_LAYERS); // ✅ clone pour pouvoir modifier `visible`


  /** injecte le service une seule fois ici */
  constructor(public layerSvc: LayerService) {}

  /** injecte les valeurs par défaut au 1ᵉʳ rendu */
  ngOnInit(): void {
    this.layers.forEach(l => this.layerSvc.setVisible(l.id, l.visible));
  }

  onToggle(id: string, visible: boolean) {
    this.layerSvc.setVisible(id, visible);
  }

}
