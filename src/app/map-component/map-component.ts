import { AfterViewInit, Component, effect, inject, Injector, runInInjectionContext  } from '@angular/core';
import maplibregl from 'maplibre-gl';
import { MapboxOverlay } from '@deck.gl/mapbox';
import { GeoJsonLayer } from '@deck.gl/layers';
import { LayerService, LayerUIState } from '../services/layer-service';
import {
  PREDEFINED_LAYERS,
  LAYER_FACTORIES,
  FactoryDeps 
} from '../layers';
import { Overlay } from '@angular/cdk/overlay';
import { MapPopupService } from '../map-popup/map-popup-service';

@Component({
  selector: 'app-map-component',
  standalone: true,
  imports: [],
  templateUrl: './map-component.html',
  styleUrl: './map-component.scss'
})
export class MapComponent implements AfterViewInit {

    /* ——————————————————— DI & état ——————————————————— */
  private layerSvc = inject(LayerService); // ✅ injection autorisée
  private injectContext = inject(Injector); // pour runInInjectionContext()
  private overlaySvc = inject(Overlay);           // ✅ service CDK
  private popupSvc = inject(MapPopupService);

  hoveredId: string | null = null;   // ← ID survolé
  
  /* ——————————————————— MapLibre + Deck.gl ——————————————————— */
  mapLibreKey: string = 'yTJcG0moCgAfQvZZUCir';
  map!: maplibregl.Map;
  overlay!: MapboxOverlay;

  async ngAfterViewInit() {


    /* 1. Carte MapLibre */
    this.map = new maplibregl.Map({
      container: 'mapContainer',
      style: `https://api.maptiler.com/maps/streets/style.json?key=${this.mapLibreKey}`,
      center: [2.5, 50.5],
      zoom: 10,
    });

    // map-component.ts  (dans ngAfterViewInit, juste après avoir créé la map)
    this.layerSvc.setMapInstance(this.map);   // ← une seule fois

    /* 2. Overlay Deck.gl */
    this.overlay = new MapboxOverlay({ layers: [],useDevicePixels: false   });
    this.map.addControl(this.overlay);
    

    /* 3. Réagit au clic sur la map. */
    this.map.on('click', e => {
      const deck = (this.overlay as any)._deck;
      const { x, y } = e.point;

      // Quel objet Deck.gl se trouve sous le curseur ?
      const pick = deck.pickObject({ x, y, radius: 300});
      const layerIdClicked = pick?.layer?.id ?? '';   // chaîne vide = vide

      // Quel « cfg.id » correspond ?
      const clickedGroup =
        PREDEFINED_LAYERS.find(cfg => layerIdClicked.startsWith(cfg.id))
          ?.id ?? null;                               // null = rien

      // Parcours de tous les groupes connus :
      for (const id of Object.keys(this.layerSvc.ui())) {
        if (id !== clickedGroup &&
            this.layerSvc.ui()[id]?.select !== null) {
          this.layerSvc.updateUI(id, { select: null });
        }
      }
    });

    /* 🔄 écoute réactive de l’état */
    // ✅ bonne façon d'exécuter effect dans un contexte Angular
    /* 3. Réagit aux changements de visibilité */
    runInInjectionContext(this.injectContext, () => {
      effect(() => {
        const visible = this.layerSvc.visible();   // 1️⃣ visibilité
        const ui      = this.layerSvc.ui();        // 2️⃣ hover + select

        this.syncLayers(visible, ui);              // passe les deux


        //const lignes = this.lineSvc.loaded();
        //this.syncLineLayers(lignes);  // tu gères ici l'ajout/retrait des couches Deck.gl
      

      });
    });

  }
  

 /* ——————————————————— Construit / met à jour les couches ——————————————————— */
// ajoute / retire les couches Deck.gl selon l’état
private syncLayers(
  visibleState: Record<string, boolean>,
  uiState:      Record<string, LayerUIState>
) {
  const baseLayers: any[] = [];

  /** Objet commun passé à toutes les factories */
  const deps: FactoryDeps = {
    map: this.map,
    popup: this.popupSvc,
    overlay: this.overlaySvc
  };

  for (const cfg of PREDEFINED_LAYERS) {
    if (!visibleState[cfg.id]) continue;

    const factory = LAYER_FACTORIES[cfg.id];
    if (!factory) continue;

    const layerOrArray = factory(
      cfg,
      () => uiState[cfg.id] ?? { hover: null, select: null },
      patch => this.layerSvc.updateUI(cfg.id, patch),
      deps
    );

    baseLayers.push(...(Array.isArray(layerOrArray) ? layerOrArray : [layerOrArray]));
  }

  const lineLayers = this.layerSvc.getAllLayers();  // ← l’ordre y est respecté

  /** 👇 mise à jour du rendu Deck.gl : base en dessous, lignes importées au-dessus */
  this.overlay.setProps({
    layers: [...baseLayers, ...lineLayers]  // ← 👈 ceci garantit l’ordre visuel
  });
}
  
}




