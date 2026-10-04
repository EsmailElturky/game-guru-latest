import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { AppPage, Feature, FEATURE_PAGES } from '../../constants/app-pages';
import { PermissionAction } from '../../enums/permission-action.enum';
import { IPagePermission } from 'src/app/features/administration/interfaces';
import { Auth } from 'src/app/features/auth/services/auth';

@Injectable({
  providedIn: 'root',
})
export class PermissionService {
  private readonly auth = inject(Auth);

  /** `null` = full access (admin). `[]` = no permissions. */
  private readonly _pagePermissions = signal<IPagePermission[] | null>([]);
  private readonly _loaded = signal(false);

  readonly loaded = this._loaded.asReadonly();
  readonly pagePermissions = this._pagePermissions.asReadonly();

  // readonly hasFullAccess = computed(() => this.auth.isAdminApp() === true);

  constructor() {
    effect(() => {
      const user = this.auth.userData();
      if (!user) {
        this._pagePermissions.set([]);
        this._loaded.set(false);
        return;
      }
      this.loadUserPermissions();
    });
  }

  /** Show parent menu if user can access any child page in the feature. */
  canAccessFeature(feature: Feature): boolean {
    // if (this.hasFullAccess()) {
    //   return true;
    // }

    const pages = FEATURE_PAGES[feature];
    if (!pages.length) {
      return true;
    }

    return pages.some((page) => this.canAccessPage(page));
  }

  /** User can open the page if they have view, add, edit, or delete on it. */
  canAccessPage(page: AppPage | string): boolean {
    // if (this.hasFullAccess()) {
    //   return true;
    // }
    return this.canView(page) || this.canAdd(page) || this.canEdit(page) || this.canDelete(page);
  }

  canView(page: AppPage | string): boolean {
    return this.hasAction(page, PermissionAction.View);
  }

  canAdd(page: AppPage | string): boolean {
    return this.hasAction(page, PermissionAction.Add);
  }

  canEdit(page: AppPage | string): boolean {
    return this.hasAction(page, PermissionAction.Edit);
  }

  canDelete(page: AppPage | string): boolean {
    return this.hasAction(page, PermissionAction.Delete);
  }

  canActivate(page: AppPage | string): boolean {
    return this.hasAction(page, PermissionAction.Activate);
  }

  canDeactivate(page: AppPage | string): boolean {
    return this.hasAction(page, PermissionAction.Deactivate);
  }

  hasAction(page: AppPage | string, action: PermissionAction): boolean {
    // if (this.hasFullAccess()) {
    //   return true;
    // }

    const pagePermission = this.findPagePermission(page);
    if (!pagePermission?.pageActions?.length) {
      return false;
    }

    return pagePermission.pageActions.some(
      (a) => a.actionType === action && a.isSelected !== false,
    );
  }

  /** Read permissions from `game_guru_user.roles` (via Auth userData). */
  loadUserPermissions(): void {
    const user = this.auth.userData();
    if (!user) {
      this._pagePermissions.set([]);
      this._loaded.set(false);
      return;
    }

    // if (this.hasFullAccess()) {
    //   this._pagePermissions.set(null);
    //   this._loaded.set(true);
    //   return;
    // }

    this._pagePermissions.set(Array.isArray(user.roles) ? user.roles : []);
    this._loaded.set(true);
  }

  private findPagePermission(page: AppPage | string): IPagePermission | undefined {
    const permissions = this._pagePermissions();
    if (!permissions?.length) {
      return undefined;
    }

    const key = String(page);

    return permissions.find(
      (p) =>
        p.pageKey === key ||
        p.pageKey?.toLowerCase() === key.toLowerCase()
    );
  }
}
