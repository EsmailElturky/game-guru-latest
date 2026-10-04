import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  ButtonComponent,
  CellType,
  ITableDropdown,
  TableComponent,
  ToastService,
  ToastType,
} from '@EsmailElturky/ui-kit';
import { AdministrationService } from '../../services';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { IRole } from '../../interfaces';
import { TranslationService } from 'src/app/core/services';
import { skip } from 'rxjs';
import { ConfirmationService } from 'primeng/api';
import { ActionType } from 'src/app/features/promo-codes/enums';
import { ExportService } from 'src/app/shared/services';
import { AppPage } from 'src/app/core/constants/app-pages';
import { buildCrudDropdownItems } from 'src/app/core/utils/build-crud-dropdown';
import { injectPagePermissions } from 'src/app/core/utils/inject-page-permissions';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [TranslateModule, ButtonComponent, CommonModule, TableComponent],
  templateUrl: './roles.html',
  styleUrl: './roles.scss',
})
export class Roles {
  private router = inject(Router);
  private administration = inject(AdministrationService);
  private destroyRef = inject(DestroyRef);
  private translateService = inject(TranslateService);
  private translationService = inject(TranslationService);
  private confirmationService = inject(ConfirmationService);
  private toastService = inject(ToastService);
  private exportService = inject(ExportService);
  translate = (key: string) => this.translateService.instant(key);
  readonly perms = injectPagePermissions(AppPage.Role);

  searchQuery = signal('');

  private _roles = signal<IRole[]>([]);
  roles = this._roles.asReadonly();

  tableColumns = signal<any>(this.buildTableColumns());

  tableDropdownItems = signal<ITableDropdown[]>([]);

  constructor() {
    this.tableDropdownItems.set(this.buildTableDropdownItems());
    toObservable(this.translationService.onLangChange)
      .pipe(skip(1), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.getRoles();
        this.tableColumns.set(this.buildTableColumns());
        this.tableDropdownItems.set(this.buildTableDropdownItems());
      });
  }

  ngOnInit() {
    this.getRoles();
  }

  private buildTableDropdownItems(): ITableDropdown[] {
    return buildCrudDropdownItems<IRole>(this.translate, this.perms, {
      onView: (row) => this.viewRole(row.id),
      onEdit: (row) => this.editRole(row.id),
      onDelete: (row) => this.deleteRole(row.id),
      onActivate: (row) => this.confirmRoleAction(row.id, ActionType.Activate),
      onDeactivate: (row) => this.confirmRoleAction(row.id, ActionType.Deactivate),
    });
  }

  private buildTableColumns() {
    const t = (key: string) => this.translateService.instant(key);
    return [
      { field: 'id', header: t('table.id'), width: '100px', frozen: true },
      { field: 'name', header: t('table.roleName'), width: '200px' },
      { field: 'userCount', header: t('table.numberOfUsers'), width: '180px' },
      {
        field: 'statusName',
        header: t('table.status'),
        width: '150px',
        type: CellType.Badge,
        badgeConfig: { Activate: 'success', Deactivate: 'danger' },
      },
      { field: 'actions', header: '', width: '100px', type: CellType.Dropdown },
    ];
  }

  getRoles() {
    this.administration
      .getRoles()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((roles) => {
        this._roles.set(
          roles.map((role) => ({
            ...role,
            isActive: role.isActive ?? role.statusName === 'Activate',
          })),
        );
      });
  }

  onSearchChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
  }

  addRole() {
    this.router.navigate(['/administration/roles/add-new-role']);
  }

  exportRoles() {
    if (this.roles().length === 0) {
      this.toastService.addToast(
        ToastType.Error,
        this.translate('common.error'),
        this.translate('uikit.table.noRecordsFound'),
      );
      return;
    }
    const url = this.administration.isAppAdmin()
      ? 'AdminGroupRole/Export'
      : 'OrganizationGroupRole/Export';
    this.exportService.export(url, 'roles').pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
  }

  viewRole(roleId: number) {
    this.router.navigate(['/administration/roles/view-role', roleId]);
  }

  editRole(roleId: number) {
    this.router.navigate(['/administration/roles/edit-role', roleId]);
  }

  deleteRole(roleId: number) {
    this.confirmationService.confirm({
      message: this.translate('messages.confirmDelete'),
      header: this.translate('common.confirm'),
      icon: 'pi pi-exclamation-triangle text-(--primary-500)!',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.administration
          .deleteRole(roleId)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(() => {
            this.getRoles();
          });
      },
    });
  }

  confirmRoleAction(roleId: number, actionType: ActionType) {
    const isDeactivate = actionType === ActionType.Deactivate;
    this.confirmationService.confirm({
      message: this.translate(
        isDeactivate ? 'messages.confirmDeactivate' : 'messages.confirmActivate',
      ),
      header: this.translate('common.confirm'),
      icon: 'pi pi-exclamation-triangle text-(--primary-500)!',
      acceptButtonStyleClass: isDeactivate ? 'p-button-danger' : undefined,
      accept: () => {
        this.administration
          .roleAction({ id: roleId, actionType })
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(() => {
            this.getRoles();
          });
      },
    });
  }

  onSelectionChange(event: any) {
    // console.log(event);
  }

  onPageChange(event: any) {
    // console.log(event);
  }

  onSortChange(event: any) {
    // console.log(event);
  }
}
