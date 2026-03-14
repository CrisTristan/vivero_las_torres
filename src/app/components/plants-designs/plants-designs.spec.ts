import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlantsDesigns } from './plants-designs';

describe('PlantsDesigns', () => {
  let component: PlantsDesigns;
  let fixture: ComponentFixture<PlantsDesigns>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlantsDesigns]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlantsDesigns);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
