// src/app/services/layer-service.ts
import { HttpClient } from '@angular/common/http';
import { effect, Injectable, signal } from '@angular/core';
import { GeoJsonLayer } from '@deck.gl/layers'; // ou ce que tu utilises
import { createItineraireImportLayer } from '../layers/factories/itineraires-import.factory';
import bbox from '@turf/bbox';  // ← installe turf si nécessaire
import { BBox, FeatureCollection } from 'geojson';
import maplibregl from 'maplibre-gl';


/** États d’interface par couche */
export interface LayerUIState {
  hover:  string | null;   // id de la feature survolée
  select: string | null;   // id de la feature sélectionnée
}

@Injectable({ providedIn: 'root' })
export class LayerService {
constructor(private http: HttpClient) {
}

  /* ───────────────────────── Visibilité ───────────────────────── */
  public _visible = signal<Record<string, boolean>>({});
  /** Lecture seule côté consommateurs */
  visible = this._visible.asReadonly();
  

  /** Modifie la visibilité d’une couche */
  setVisible(id: string, isVisible: boolean): void {
    this._visible.update(s => ({ ...s, [id]: isVisible }));
  }

  /* ────────────────────── Hover & Sélection ───────────────────── */
  public _ui = signal<Record<string, LayerUIState>>({});
  /** Lecture seule : { epci: {hover,select}, … } */
  ui = this._ui.asReadonly();

  /**
   * Mets à jour l’état UI d’une couche
   * @param id     identifiant de la couche (ex. 'itineraire')
   * @param patch  propriétés à modifier (hover et/ou select)
   */
  updateUI(id: string, patch: Partial<LayerUIState>): void {
    this._ui.update(state => {
      // état courant OU valeurs par défaut si la couche n'existe pas encore
      const prev: LayerUIState = state[id] ?? { hover: null, select: null };

      return {
        ...state,
        [id]: {
          ...prev,   // hover / select existants
          ...patch   // on écrase uniquement ce qu'on veut changer
        }
      };
    });
  }





  /** Couches Deck.gl actuellement affichées (tu peux adapter le type) */
  private _layers = signal<Record<string, GeoJsonLayer>>({});
  private _geojson: any = null;
  private _loadedItineraires = signal<string[]>([]);
  loadedItineraires = this._loadedItineraires.asReadonly();

setLoadedLines(lines: string[], lineToZoom?: string) {
  this._loadedItineraires.set(lines);
  this.updateDynamicLayers(lineToZoom); // ← on la transmet
}

private async ensureGeojsonLoaded(): Promise<void> {
  if (!this._geojson) {
    this._geojson = await this.http.get<any>('layers-assets/itineraires.geojson').toPromise();
  }
}

private _dynamicLayers = signal<GeoJsonLayer[]>([]);
getAllLayers(): GeoJsonLayer[] {
  return this._dynamicLayers();
}



  /* ---------------------------------------------------------------- */
  private map: maplibregl.Map | null = null;          // ← référence carte

  /** À appeler une fois depuis MapComponent quand la carte est prête */
  setMapInstance(map: maplibregl.Map) {
    this.map = map;
  }
  /* ---------------------------------------------------------------- */


// ------ rien d’autre ne change jusqu’à updateDynamicLayers() ------

  public async updateDynamicLayers(lineToZoom?: string) {
    await this.ensureGeojsonLoaded();

    const selected = this._loadedItineraires();
// on crée les couches dans le même ordre
const layersInListOrder = selected.map(num => {
  const features = this._geojson.features.filter(
    (f: any) => f.properties.numero_ligne === num
  );
  return createItineraireImportLayer(num, { ...this._geojson, features });
});


    // 2 Zoom après la boucle, sur la ligne demandée
    if (this.map && lineToZoom) {
      const features = this._geojson.features.filter(
        (f: any) => f.properties.numero_ligne === lineToZoom
      );

      if (features.length) {
        const lineFC: FeatureCollection = {
          type: 'FeatureCollection',
          features
        };

        const [minX, minY, maxX, maxY]: BBox = bbox(lineFC);

        this.map.fitBounds(
          [
            [minX, minY],
            [maxX, maxY]
          ],
          { padding: 100, duration: 500 }
        );
      }
    }

    this._dynamicLayers.set([...layersInListOrder].reverse());
  
}

}

