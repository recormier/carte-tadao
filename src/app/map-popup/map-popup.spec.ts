import { TestBed } from '@angular/core/testing';

import { MapPopup } from './map-popup';

describe('MapPopup', () => {
  let service: MapPopup;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MapPopup);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
