import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShoppingCartPage } from './shopping-cart-page';

describe('ShoppingCartPage', () => {
  let component: ShoppingCartPage;
  let fixture: ComponentFixture<ShoppingCartPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShoppingCartPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShoppingCartPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
