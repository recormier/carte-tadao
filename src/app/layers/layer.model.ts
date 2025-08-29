export class LayerConfig {
  constructor(
  public id:string='epci',
  public source:string='layers-assets/epci.geojson',
  public name:string='EPCI',
  public icon:string='img/1.png',
  public visible :boolean= false
  ) {}
}
