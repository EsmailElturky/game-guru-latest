import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { LocalStorage } from '../services';
import { environment } from 'src/environments/environment';

export const authGuard: CanActivateFn = (route, state) => {
  const localStorageService = inject(LocalStorage);
  const router = inject(Router);
  if (localStorageService.getItem(environment.tokenPropertyName)) {
    return true;
  } else {
    router.navigate(['/auth/login']);
    return false;
  }
};
