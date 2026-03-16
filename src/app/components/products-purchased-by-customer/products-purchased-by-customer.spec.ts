import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductsPurchasedByCustomer } from './products-purchased-by-customer';

describe('ProductsPurchasedByCustomer', () => {
  let component: ProductsPurchasedByCustomer;
  let fixture: ComponentFixture<ProductsPurchasedByCustomer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductsPurchasedByCustomer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductsPurchasedByCustomer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
