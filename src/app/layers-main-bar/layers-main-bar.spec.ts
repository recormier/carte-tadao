import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LayersMainBar } from './layers-main-bar';

describe('LayersMainBar', () => {
  let component: LayersMainBar;
  let fixture: ComponentFixture<LayersMainBar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LayersMainBar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LayersMainBar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
