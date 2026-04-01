import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerPurchaseHistoryPage } from './customer-purchase-history-page';

describe('CustomerPurchaseHistoryPage', () => {
  let component: CustomerPurchaseHistoryPage;
  let fixture: ComponentFixture<CustomerPurchaseHistoryPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerPurchaseHistoryPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomerPurchaseHistoryPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
