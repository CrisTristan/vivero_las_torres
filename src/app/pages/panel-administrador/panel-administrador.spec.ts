import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelAdministrador } from './panel-administrador';

describe('PanelAdministrador', () => {
  let component: PanelAdministrador;
  let fixture: ComponentFixture<PanelAdministrador>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PanelAdministrador]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PanelAdministrador);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
