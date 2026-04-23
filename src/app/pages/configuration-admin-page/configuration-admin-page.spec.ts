import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigurationAdminPage } from './configuration-admin-page';

describe('ConfigurationAdminPage', () => {
  let component: ConfigurationAdminPage;
  let fixture: ComponentFixture<ConfigurationAdminPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfigurationAdminPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfigurationAdminPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
