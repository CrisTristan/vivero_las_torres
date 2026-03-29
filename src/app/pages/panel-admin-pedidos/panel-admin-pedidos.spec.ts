import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelAdminPedidos } from './panel-admin-pedidos';

describe('PanelAdminPedidos', () => {
  let component: PanelAdminPedidos;
  let fixture: ComponentFixture<PanelAdminPedidos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PanelAdminPedidos]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PanelAdminPedidos);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
