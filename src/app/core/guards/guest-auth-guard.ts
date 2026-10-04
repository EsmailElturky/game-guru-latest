import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { LocalStorage } from '../services';
import { environment } from 'src/environments/environment';

/**
 * Allows auth/onboarding routes only when logged out; sends authenticated users to profile.
 * Exception: Tap return to `/auth/login` with `email` + `password` query params (re-login flow).
 */
export const guestAuthGuard: CanActivateFn = (_route, state) => {
  const localStorageService = inject(LocalStorage);
  const router = inject(Router);
  const tree = router.parseUrl(state.url);
  const qp = tree.queryParams;
  const segs = tree.root.children['primary']?.segments.map((s) => s.path) ?? [];
  const isAuthLogin = segs[0] === 'auth' && segs[1] === 'login';
  if (isAuthLogin && qp['email'] && qp['password']) {
    return true;
  }
  if (localStorageService.getItem(environment.tokenPropertyName)) {
    void router.navigate(['/profile']);
    return false;
  }
  return true;
};
