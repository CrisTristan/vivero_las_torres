import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerShippingDataPage } from './customer-shipping-data-page';

describe('CustomerShippingDataPage', () => {
  let component: CustomerShippingDataPage;
  let fixture: ComponentFixture<CustomerShippingDataPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerShippingDataPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomerShippingDataPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
