import { TestBed } from '@angular/core/testing';

import { Lookups } from './lookups';

describe('Lookups', () => {
  let service: Lookups;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Lookups);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
