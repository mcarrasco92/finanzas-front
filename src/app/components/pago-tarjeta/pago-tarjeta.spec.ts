import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PagoTarjeta } from './pago-tarjeta';

describe('PagoTarjeta', () => {
  let component: PagoTarjeta;
  let fixture: ComponentFixture<PagoTarjeta>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PagoTarjeta]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PagoTarjeta);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
