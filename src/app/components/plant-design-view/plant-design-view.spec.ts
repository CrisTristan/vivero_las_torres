import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlantDesignView } from './plant-design-view';

describe('PlantDesignView', () => {
  let component: PlantDesignView;
  let fixture: ComponentFixture<PlantDesignView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlantDesignView]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlantDesignView);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
