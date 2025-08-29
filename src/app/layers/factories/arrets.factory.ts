// src/app/layers/factories/arrets.factory.ts
import { GeoJsonLayer } from '@deck.gl/layers';
import { LayerConfig } from '../layer.model';
import { LayerUIState } from '../../services/layer-service';
import { MapPopupComponent } from '../../map-popup/map-popup';
import { FactoryDeps } from './factory-registry'; 


export function createArretsLayer(
  cfg: LayerConfig,
  ui: () => LayerUIState,
  patch: (p: Partial<LayerUIState>) => void,
  { map, popup }: FactoryDeps                         // ← on déstructure
){

  /* ── 1. on lit l’état courant ───────────────── */
  const { hover, select } = ui();   // ← ajoute cette ligne 


  /* ── 2. couche de base (tout + hover) ───────── */
  const baseLayer = new GeoJsonLayer({
    id: cfg.id,
    data: cfg.source,
    pointRadiusMinPixels: 5,
    getPointRadius: f =>
      f.properties.id === hover ? 6 : 2,
    getFillColor: f =>
      f.properties.id === hover ? [250, 0, 0] : [255, 165, 0],
    getLineWidth: 1,
    lineWidthUnits: 'pixels',
    pickable: true,
    updateTriggers: { getFillColor: ui, getPointRadius: ui, dataTransform: ui  },
    onHover: info => patch({ hover: info.object?.properties.id ?? null }),
    onClick: info => {
      if (!info.layer || !info.object) return;
      patch({ select: info.object.properties.id });

        /*  Choisir la bonne coordonnée */
      const lngLat: [number, number] =
        info.object.geometry?.type === 'Point'
          ? (info.object.geometry.coordinates as [number, number]) // centre exact du point
          : (info.coordinate as [number, number]);                 // position du clic

      const props = info.object.properties;

      popup.open(
        map,
        lngLat,
        MapPopupComponent,
        {
          titre: `${props.nom_long}`,
          tabs: {
            infos:   ['Informations', `ID : ${props.code_arret}<br/>Catégorie : ${props.nom_court}`],
            horaires:['Horaires', props.pmr],
            extra:   ['Divers',    '… autre contenu HTML …']
          }
        },
        () => patch({ select: null })
      );
    }
  });

  /* ── 3. couche sélection (au-dessus) ─────────── */
const selectedLayer =
  select == null
    ? null
    : new GeoJsonLayer({
        id: `${cfg.id}-selected-${select}`,   // 👈 l’ID change
        data: cfg.source,
        pointRadiusMinPixels: 5,
        getPointRadius : 6,
        getLineWidth: 1,
        lineWidthUnits: 'pixels',
        dataTransform: (fc: any) =>
          Array.isArray(fc)
            ? fc.filter(f => f.properties.id === select)
            : { ...fc, features: fc.features.filter(
                  (f: any) => f.properties.id === select)
              },
        getFillColor: [255, 255, 0],
        parameters: { depthTest: false }
      });

 /* ── 4. on renvoie l’ensemble ────────────────── */
  return selectedLayer ? [baseLayer, selectedLayer] : [baseLayer];
}

