import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelAdminProductos } from './panel-admin-productos';

describe('PanelAdminProductos', () => {
  let component: PanelAdminProductos;
  let fixture: ComponentFixture<PanelAdminProductos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PanelAdminProductos]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PanelAdminProductos);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
