import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { featureGuardGuard } from './feature-guard-guard';

describe('featureGuardGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => featureGuardGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
