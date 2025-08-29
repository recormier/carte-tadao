// src/app/layers/factories/itineraires.factory.ts
import { GeoJsonLayer } from '@deck.gl/layers';
import { LayerConfig } from '../layer.model';
import { LayerUIState } from '../../services/layer-service';
import { OverlayRef, Overlay } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { ItineraryPickerComponent } from '../../itinary-picker/itinary-picker';
import { FactoryDeps } from './factory-registry'; 

/**
 * Factory pour la couche Itinéraires
 * @param cfg      config simple (id, source…)
 * @param getHover fonction qui renvoie l'id survolé (ou null)
 * @param setHover fonction pour enregistrer un nouvel id survolé
 */

export function createItinerairesLayer(
  cfg: LayerConfig,
  ui: () => LayerUIState,
  patch: (p: Partial<LayerUIState>) => void,
  { overlay  }: FactoryDeps      // 👈 injecté ailleurs
){
  /* ── 1. on lit l’état courant ───────────────── */
  const { hover, select } = ui();   // ← ajoute cette ligne 
  let pickerRef: OverlayRef | null = null;

 /* ---------- petite popup de choix quand plusieurs traits ----------- */
  const openPicker = (x: number, y: number, features: any[]) => {
  pickerRef?.dispose();

  /* 1. point d’ancrage virtuel (coordon­nées du clic) */
  const origin = { x, y };

  /* 2. stratégie flexible qui pousse dans le viewport */
  const positionStrategy = overlay!.position()
    .flexibleConnectedTo(origin)
    .withPositions([
      /* position préférée : au-dessus du point */
      {
        originX: 'center', originY: 'top',
        overlayX: 'center', overlayY: 'bottom',
        offsetY: -8
      },
      /* fallback : en dessous du point */
      {
        originX: 'center', originY: 'bottom',
        overlayX: 'center', overlayY: 'top',
        offsetY: 8
      }
    ])
    .withPush(true);           // décale si dépasse la fenêtre

  /* 3. création de l’overlay */
  pickerRef = overlay!.create({
    positionStrategy,
    scrollStrategy: overlay!.scrollStrategies.reposition(),
    hasBackdrop: true,
    backdropClass: 'cdk-overlay-transparent-backdrop'
  });

  const comp = pickerRef.attach(
    new ComponentPortal(ItineraryPickerComponent)
  );
  comp.instance.features = features;

  comp.instance.hover.subscribe((f: any | null) => {
    const id = f?.properties?.id ?? null;
    patch({ hover: id });                // met à jour le style sur la carte
  });

  comp.instance.selected.subscribe((f: any) => {
    patch({ select: f.properties.id });
    pickerRef?.dispose();
  });

  pickerRef.backdropClick().subscribe(() => {
    patch({ hover: null });              // remet le hover à zéro
    pickerRef?.dispose();
  });
};

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
  /* ── 2. couche de base (tout + hover) ───────── */
  const baseLayer = new GeoJsonLayer({
    id: `${cfg.id}-base`,
    data: cfg.source,
    lineWidthUnits: 'pixels',
    getLineColor: f =>
      f.properties.id === hover ? [250, 0, 0] : [128, 128, 128],
    getLineWidth: f =>
      f.properties.id === hover ? 6 : 2,
    updateTriggers: { getLineColor: [hover],  getLineWidth: [hover], dataTransform: ui  },
    // augmente la zone détectable (pas visible)
    pickable: true,
    onHover: info => patch({ hover: info.object?.properties.id ?? null }),

    // ---------- onClick correctement typé ----------
    onClick: (info: any) => {
      /* 1. toutes les features de CETTE couche dans un rayon de 6 px */
      const x = info.x;
      const y = info.y;

      const deck = info.layer.context.deck;
      const picks = deck
        .pickMultipleObjects({ x, y, radius: 3 ,depth: 50 })
        .filter((p: any) => p.layer.id.startsWith(cfg.id));

      if (picks.length <= 1) {
        // 0 = clic vide → déselection ; 1 = sélection directe
        const chosen = picks[0]?.object ?? null;
        patch({ select: chosen?.properties.id ?? null });
        return;
      }

      /* 2. plusieurs objets → ouvrir le petit menu */
      openPicker(x, y, picks.map((p: any) => p.object));   // ← plus de .then
    },
  // -----------------------------------------------
   });

  /* ── 3. couche sélection (au-dessus) ─────────── */
const selectedLayer =
  select == null
    ? null
    : new GeoJsonLayer({
        id: `${cfg.id}-selected-${select}`,   // 👈 l’ID change
        data: cfg.source,
        lineWidthUnits: 'pixels',
        dataTransform: (fc: any) =>
          Array.isArray(fc)
            ? fc.filter(f => f.properties.id === select)
            : { ...fc, features: fc.features.filter(
                  (f: any) => f.properties.id === select)
              },
        getLineColor: f => {
          const hex = f.properties?.couleur ?? null;
          return f.properties.id === select ? hexToRgb(hex) : [128, 128, 128];
        },
        getLineWidth: 10,
        parameters: { depthTest: false }
      });

 /* ── 4. on renvoie l’ensemble ────────────────── */
  return selectedLayer ? [baseLayer, selectedLayer] : [baseLayer];
}
