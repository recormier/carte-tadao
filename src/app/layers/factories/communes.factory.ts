// src/app/layers/factories/communes.factory.ts
import { GeoJsonLayer } from '@deck.gl/layers';
import { LayerConfig } from '../layer.model';

export function createCommunesLayer(cfg: LayerConfig) {
  return new GeoJsonLayer({
    id: cfg.id,
    data: cfg.source,
    getFillColor: [200, 150, 0, 30],
    getLineColor: [180, 120, 0],
    getLineWidth: 0.5,
    lineWidthUnits: 'pixels',
    pickable: true,
    onClick: info => {
      console.log('Commune →', info.object?.properties);
    }
  });
}