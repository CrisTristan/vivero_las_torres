import { TestBed } from '@angular/core/testing';

import { StockNotificationsService } from './stock-notifications-service';

describe('StockNotificationsService', () => {
  let service: StockNotificationsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StockNotificationsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
