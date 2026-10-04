import { inject } from '@angular/core';
import { AppPage } from '../constants/app-pages';
import { PermissionAction } from '../enums/permission-action.enum';
import { PermissionService } from '../services/permission/permission.service';

/** Injectable helper for a single page's permission checks (use in component field initializer). */
export function injectPagePermissions(page: AppPage) {
  const permissionService = inject(PermissionService);

  return {
    page,
    canAccessPage: () => permissionService.canAccessPage(page),
    canView: () => permissionService.canView(page),
    canAdd: () => permissionService.canAdd(page),
    canEdit: () => permissionService.canEdit(page),
    canDelete: () => permissionService.canDelete(page),
    canActivate: () => permissionService.canActivate(page),
    canDeactivate: () => permissionService.canDeactivate(page),
    canApprove: () => permissionService.hasAction(page, PermissionAction.Approve),
    canReject: () => permissionService.hasAction(page, PermissionAction.Reject),
  };
}

export type PagePermissions = ReturnType<typeof injectPagePermissions>;
