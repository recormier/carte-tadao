import { LayerConfig } from "./layer.model";

// layers/definitions.ts
export const PREDEFINED_LAYERS: LayerConfig[] = [
  { id: 'epci',     source:'layers-assets/epci.geojson',     name:'EPCI',       icon:'img/epci.png', visible:true  },
  { id: 'communes', source:'layers-assets/communes.geojson', name:'Communes',   icon:'img/communes.png', visible:false },
  { id: 'itineraires', source:'layers-assets/itineraires.geojson', name:'Itineraires',   icon:'img/itineraires.png', visible:true },
  { id: 'arrets', source:'layers-assets/arrets.geojson', name:'Arrets',   icon:'img/arrets.png', visible:false }

];