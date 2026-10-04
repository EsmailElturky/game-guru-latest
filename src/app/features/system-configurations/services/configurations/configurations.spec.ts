import { TestBed } from '@angular/core/testing';

import { Configurations } from './configurations';

describe('Configurations', () => {
  let service: Configurations;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Configurations);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
