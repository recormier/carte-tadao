// src/app/layers/factories/itineraires-ligne.factory.ts
import { GeoJsonLayer } from '@deck.gl/layers';

export function createItineraireImportLayer(num_ligne: string, geojson: any): GeoJsonLayer {
    // Petit utilitaire – prend “#1E90FF” ou “1E90FF” et renvoie [30, 144, 255]
    const hexToRgb = (
    hex: string | null | undefined   // ← accepte null/undefined
    ): [number, number, number] => {
    // ✨ 1. garde-fou : valeur par défaut
    if (!hex || hex.length < 6) return [128, 128, 128];

    // ✨ 2. on enlève le # éventuel
    const h = hex.startsWith('#') ? hex.slice(1) : hex;

    // ✨ 3. conversion → entier base-16
    return [
        parseInt(h.slice(0, 2), 16),
        parseInt(h.slice(2, 4), 16),
        parseInt(h.slice(4, 6), 16)
    ];
    };
  
    return new GeoJsonLayer({
    id: `itineraire-${num_ligne}`,
    data: {
      ...geojson,
      features: geojson.features.filter(
        (f: any) => f.properties.numero_ligne === num_ligne
      )
    },
    pickable: true,
    lineWidthUnits: 'pixels',
    getLineColor: f => {
        const hex = f.properties?.couleur ?? null;
        return hexToRgb(hex);
    },
    getLineWidth: 4
  });
}







