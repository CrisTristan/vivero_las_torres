import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuccessPaymentPage } from './success-payment-page';

describe('SuccessPaymentPage', () => {
  let component: SuccessPaymentPage;
  let fixture: ComponentFixture<SuccessPaymentPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SuccessPaymentPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SuccessPaymentPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
