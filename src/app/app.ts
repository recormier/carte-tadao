import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LayersMainBar } from './layers-main-bar/layers-main-bar';
import { MapComponent } from './map-component/map-component';
import { LeftSidePanelComponent } from './left-side-panel/left-side-panel';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet,LayersMainBar,MapComponent, LeftSidePanelComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected title = 'carte-tadao';
  panelOpen = false;  
}
