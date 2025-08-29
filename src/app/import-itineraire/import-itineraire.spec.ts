import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportItineraire } from './import-itineraire';

describe('ImportItineraire', () => {
  let component: ImportItineraire;
  let fixture: ComponentFixture<ImportItineraire>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImportItineraire]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImportItineraire);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
