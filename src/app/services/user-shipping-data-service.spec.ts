import { TestBed } from '@angular/core/testing';

import { UserShippingDataService } from './user-shipping-data-service';

describe('UserShippingDataService', () => {
  let service: UserShippingDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserShippingDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
