import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LayerToggleButton } from './layer-toggle-button';

describe('LayerToggleButton', () => {
  let component: LayerToggleButton;
  let fixture: ComponentFixture<LayerToggleButton>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LayerToggleButton]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LayerToggleButton);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
