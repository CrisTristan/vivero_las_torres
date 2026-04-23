import { TestBed } from '@angular/core/testing';

import { ConfigPanelAdminService } from './config-panel-admin-service';

describe('ConfigPanelAdminService', () => {
  let service: ConfigPanelAdminService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConfigPanelAdminService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
