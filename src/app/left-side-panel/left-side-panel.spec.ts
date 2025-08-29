import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeftSidePanel } from './left-side-panel';

describe('LeftSidePanel', () => {
  let component: LeftSidePanel;
  let fixture: ComponentFixture<LeftSidePanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LeftSidePanel]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LeftSidePanel);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
