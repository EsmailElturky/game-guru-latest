import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AppPage } from '../constants/app-pages';
import { PermissionService } from '../services/permission/permission.service';

/**
 * Protects routes using `data.page` (AppPage).
 * - Default: view, add, edit, or delete grants access
 * - `isAdd`: requires Add
 * - `isEdit`: requires Edit
 * - `requiresView`: requires View only
 */
export const permissionGuard: CanActivateFn = (route) => {
  const permissionService = inject(PermissionService);
  const router = inject(Router);

  const page = route.data['page'] as AppPage | undefined;
  if (!page) {
    return true;
  }

  let allowed = false;

  if (route.data['isAdd']) {
    allowed = permissionService.canAdd(page);
  } else if (route.data['isEdit']) {
    allowed = permissionService.canEdit(page);
  } else if (route.data['requiresView']) {
    allowed = permissionService.canView(page);
  } else {
    allowed = permissionService.canAccessPage(page);
  }

  if (allowed) {
    return true;
  }

  void router.navigate(['/dashboard']);
  return false;
};
