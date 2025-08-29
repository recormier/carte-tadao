// src/app/layers/factories/epci.factory.ts
import { GeoJsonLayer } from '@deck.gl/layers';
import { LayerConfig } from '../layer.model';

export function createEpciLayer(cfg: LayerConfig) {
  return new GeoJsonLayer({
    id: cfg.id,
    data: cfg.source,
    getFillColor: [0, 150, 200, 5],
    getLineColor: [0, 120, 200],
    getLineWidth: 1,
    lineWidthUnits: 'pixels',
    pickable: true,
    onClick: info => {
      console.log('EPCI →', info.object?.properties);
    }
  });
}