import { TestBed } from '@angular/core/testing';

import { PlantDesignService } from './plant-design-service';

describe('PlantDesignService', () => {
  let service: PlantDesignService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PlantDesignService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
