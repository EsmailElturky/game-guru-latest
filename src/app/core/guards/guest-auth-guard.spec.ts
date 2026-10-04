import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { guestAuthGuard } from './guest-auth-guard';

describe('guestAuthGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => guestAuthGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
