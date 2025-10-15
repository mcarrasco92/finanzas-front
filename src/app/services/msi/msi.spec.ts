import { TestBed } from '@angular/core/testing';

import { Msi } from './msi';

describe('Msi', () => {
  let service: Msi;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Msi);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
