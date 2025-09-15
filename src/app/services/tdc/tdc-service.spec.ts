import { TestBed } from '@angular/core/testing';

import { TdcService } from './tdc-service';

describe('TdcService', () => {
  let service: TdcService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TdcService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
