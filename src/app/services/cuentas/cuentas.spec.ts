import { TestBed } from '@angular/core/testing';

import { Cuentas } from './cuentas';

describe('Cuentas', () => {
  let service: Cuentas;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Cuentas);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
