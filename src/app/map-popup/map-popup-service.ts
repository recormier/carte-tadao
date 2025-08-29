// src/app/map-popup/map-popup.service.ts
import { EventEmitter, Injectable, Injector, Type, ComponentRef } from '@angular/core';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import maplibregl from 'maplibre-gl';

/**
 * Service générique : ouvre un composant Angular à une coordonnée géographique
 * et le recalcule à chaque mouvement de carte. Fermeture auto sur clic carte ou bouton ✕.
 */
@Injectable({ providedIn: 'root' })
export class MapPopupService {
  private ref: OverlayRef | null = null;
  private unsubscribeMove: (() => void) | null = null;

  constructor(private overlay: Overlay, private injector: Injector) {}

  /**
   * Ouvre un composant à la position [lng, lat].
   * @param map       Instance MapLibre
   * @param lngLat    [longitude, latitude]
   * @param component Composant Angular à afficher
   * @param data      Données à injecter dans le composant (facultatif)
   * @param onClose   Callback exécuté à chaque fermeture (facultatif)
   */
  open<T extends object>(
    map: maplibregl.Map,
    lngLat: [number, number],
    component: Type<T>,
    data?: Partial<T>,
    onClose?: () => void
  ): void {
    // 1️⃣  Ferme toute popup existante avant d'en ouvrir une nouvelle
    this.close();

    /* 2️⃣  Calcule la stratégie de position globale */
    const createStrategy = () => {
      const { x, y } = map.project(lngLat);
      return this.overlay
        .position()
        .global()
        .left(`${x}px`)
        .top(`${y}px`);
    };

    /* 3️⃣  Crée l'Overlay sans backdrop pour laisser la carte interactive */
    this.ref = this.overlay.create({
      positionStrategy: createStrategy(),
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
      hasBackdrop: false,
      panelClass: 'map-popup-panel'
    });

    /* 4️⃣  Instancie le composant dans l'Overlay */
    const portal = new ComponentPortal(component, null, this.injector);
    const compRef: ComponentRef<T> = this.ref.attach(portal);
    if (data) Object.assign(compRef.instance, data);

    /* 5️⃣  Met à jour la position à chaque déplacement/zoom */
    const move = () => this.ref!.updatePositionStrategy(createStrategy());
    map.on('move', move);

    /* 6️⃣  Ferme la popup au premier clic ailleurs sur la carte */
    const closeOnMapClick = () => {
      this.close();
      onClose?.();
    };
    // Utilise setTimeout pour ne pas fermer immédiatement sur le même clic
    setTimeout(() => map.once('click', closeOnMapClick));

    /* 7️⃣  Stocke la fonction de nettoyage */
    this.unsubscribeMove = () => {
      map.off('move', move);
      map.off('click', closeOnMapClick);
    };

    /* 8️⃣  Ferme si le composant émet un EventEmitter "close" */
    if ((compRef.instance as any).close instanceof EventEmitter) {
      (compRef.instance as any).close.subscribe(() => {
        this.close();
        onClose?.();
      });
    }
  }

  /**
   * Ferme la popup courante (s'il y en a une) et nettoie les listeners.
   */
  close(): void {
    this.unsubscribeMove?.();
    this.unsubscribeMove = null;

    this.ref?.dispose();
    this.ref = null;
  }
}
