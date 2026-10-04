import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { PermissionService } from '../services/permission/permission.service';
import { Feature } from '../constants/app-pages';

export const featureGuardGuard: CanActivateFn = (route, state) => {
  const permissionService = inject(PermissionService);
  const router = inject(Router);
  const feature = route.data['feature'] as Feature | undefined;
  if (!feature) {
    return true;
  }
  if (permissionService.canAccessFeature(feature)) {
    return true;
  }
  void router.navigate(['/dashboard']);
  return false;
};
