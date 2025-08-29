// src/app/layers/factories/factory-registry.ts
import { createEpciLayer } from './epci.factory';
import { createCommunesLayer } from './communes.factory';
import type { LayerConfig } from '../layer.model';
import { createItinerairesLayer } from './itineraires.factory';
import { LayerUIState } from '../../services/layer-service';
import { createArretsLayer } from './arrets.factory';
import type { Layer } from '@deck.gl/core';
import { Overlay } from '@angular/cdk/overlay';
import { MapPopupService } from '../../map-popup/map-popup-service';
import maplibregl from 'maplibre-gl';

export interface FactoryDeps {
  map:   maplibregl.Map;        // obligatoire (ou mets `map?: …` si tu veux)
  popup: MapPopupService;       // idem
  overlay?: Overlay;            // déjà présent, reste optionnel
  getLoadedLines?: () => string[];
}

type LayerFactory = (
  cfg: LayerConfig,
  ui: () => LayerUIState,
  patch: (p: Partial<LayerUIState>) => void,
  deps: FactoryDeps                     // ← remplace l’ancien paramètre

) => Layer | Layer[];

export const LAYER_FACTORIES: Record<string, LayerFactory> = {
  epci: createEpciLayer,
  communes: createCommunesLayer,
  itineraires: createItinerairesLayer,
  arrets: createArretsLayer,
};