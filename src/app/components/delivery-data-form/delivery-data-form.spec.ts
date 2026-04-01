import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeliveryDataForm } from './delivery-data-form';

describe('DeliveryDataForm', () => {
  let component: DeliveryDataForm;
  let fixture: ComponentFixture<DeliveryDataForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeliveryDataForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeliveryDataForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
