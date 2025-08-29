import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItineraryPickerComponent } from './itinary-picker';

describe('ItinaryPicker', () => {
  let component: ItineraryPickerComponent;
  let fixture: ComponentFixture<ItineraryPickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ItineraryPickerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ItineraryPickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
