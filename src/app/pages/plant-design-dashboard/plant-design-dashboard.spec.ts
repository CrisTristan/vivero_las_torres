import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlantDesignDashboard } from './plant-design-dashboard';

describe('PlantDesignDashboard', () => {
  let component: PlantDesignDashboard;
  let fixture: ComponentFixture<PlantDesignDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlantDesignDashboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlantDesignDashboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
