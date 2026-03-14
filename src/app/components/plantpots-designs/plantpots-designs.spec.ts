import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlantpotsDesigns } from './plantpots-designs';

describe('PlantpotsDesigns', () => {
  let component: PlantpotsDesigns;
  let fixture: ComponentFixture<PlantpotsDesigns>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlantpotsDesigns]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlantpotsDesigns);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
