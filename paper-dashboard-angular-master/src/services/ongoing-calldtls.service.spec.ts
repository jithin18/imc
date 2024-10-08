import { TestBed } from '@angular/core/testing';

import { OngoingCalldtlsService } from './ongoing-calldtls.service';

describe('OngoingCalldtlsService', () => {
  let service: OngoingCalldtlsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OngoingCalldtlsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
