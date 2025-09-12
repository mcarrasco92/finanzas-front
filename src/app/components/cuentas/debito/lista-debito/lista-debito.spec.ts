import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaDebito } from './lista-debito';

describe('ListaDebito', () => {
  let component: ListaDebito;
  let fixture: ComponentFixture<ListaDebito>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListaDebito]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListaDebito);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
