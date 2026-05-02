import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShippingMethodSelection } from './shipping-method-selection';

describe('ShippingMethodSelection', () => {
  let component: ShippingMethodSelection;
  let fixture: ComponentFixture<ShippingMethodSelection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShippingMethodSelection]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShippingMethodSelection);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
