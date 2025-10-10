import { TestBed } from '@angular/core/testing';

import { Transferencias } from './transferencias';

describe('Transferencias', () => {
  let service: Transferencias;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Transferencias);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
