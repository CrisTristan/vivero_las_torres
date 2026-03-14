import { TestBed } from '@angular/core/testing';

import { SearchProductEvent } from './search-product-event';

describe('SearchProductEvent', () => {
  let service: SearchProductEvent;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SearchProductEvent);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
