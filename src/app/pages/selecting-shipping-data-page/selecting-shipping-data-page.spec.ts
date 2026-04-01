import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectingShippingDataPage } from './selecting-shipping-data-page';

describe('SelectingShippingDataPage', () => {
  let component: SelectingShippingDataPage;
  let fixture: ComponentFixture<SelectingShippingDataPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectingShippingDataPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectingShippingDataPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
