import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  ButtonComponent,
  CellType,
  InputTextComponent,
  ITableDropdown,
  TableComponent,
  ToastService,
  ToastType,
} from '@EsmailElturky/ui-kit';
import { AdministrationService } from '../../services';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { IUser } from '../../interfaces';
import { TranslationService } from 'src/app/core/services';
import { skip } from 'rxjs';
import { ConfirmationService } from 'primeng/api';
import { ltrIsolate } from 'src/app/shared/functions';
import { ActionType } from 'src/app/features/promo-codes/enums';
import { ExportService } from 'src/app/shared/services';
import { AppPage } from 'src/app/core/constants/app-pages';
import { buildCrudDropdownItems } from 'src/app/core/utils/build-crud-dropdown';
import { injectPagePermissions } from 'src/app/core/utils/inject-page-permissions';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [TranslateModule, InputTextComponent, ButtonComponent, CommonModule, TableComponent],
  templateUrl: './users.html',
  styleUrl: './users.scss',
})
export class Users {
  private router = inject(Router);
  private administration = inject(AdministrationService);
  private destroyRef = inject(DestroyRef);
  private translateService = inject(TranslateService);
  private translationService = inject(TranslationService);
  private confirmationService = inject(ConfirmationService);
  private exportService = inject(ExportService);
  private toastService = inject(ToastService);

  translate = (key: string) => this.translateService.instant(key);
  readonly perms = injectPagePermissions(AppPage.User);

  searchQuery = signal('');

  private _users = signal<IUser[]>([]);
  users = this._users.asReadonly();

  totalCount = signal(0);
  pageSize = signal(10);
  currentPage = signal(1);

  tableColumns = signal<any>(this.buildTableColumns());

  tableDropdownItems = signal<ITableDropdown[]>([]);

  constructor() {
    this.tableDropdownItems.set(this.buildTableDropdownItems());
    toObservable(this.translationService.onLangChange)
      .pipe(skip(1), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.getUsers();
        this.tableColumns.set(this.buildTableColumns());
        this.tableDropdownItems.set(this.buildTableDropdownItems());
      });
  }

  ngOnInit() {
    this.getUsers();
  }

  private buildTableDropdownItems(): ITableDropdown[] {
    return buildCrudDropdownItems<IUser>(this.translate, this.perms, {
      onView: (row) => this.viewUser(row.id!),
      onEdit: (row) => this.editUser(row.id!),
      onDelete: (row) => this.deleteUser(row.id!),
      onActivate: (row) => this.confirmUserStatus(row.id!, true),
      onDeactivate: (row) => this.confirmUserStatus(row.id!, false),
    });
  }

  private buildTableColumns() {
    const t = (key: string) => this.translateService.instant(key);
    return [
      { field: 'id', header: t('table.id'), width: '160px', frozen: true },
      { field: 'username', header: t('table.userName'), width: '160px', frozen: true },
      { field: 'fullName', header: t('table.name'), width: '200px' },
      { field: 'phone', header: t('table.phoneNumber'), width: '200px' },
      {
        field: 'roleName',
        header: t('table.roleName'),
        width: '150px',
        type: CellType.Badge,
        badgeConfig: { Admin: 'success', User: 'info', Lead: 'warning' },
      },
      {
        field: 'statusName',
        header: t('table.status'),
        width: '150px',
        type: CellType.Badge,
        badgeConfig: { Active: 'success', Inactive: 'danger' },
      },
      { field: 'actions', header: '', width: '100px', type: CellType.Dropdown },
    ];
  }

  getUsers() {
    this.administration
      .getUsers({
        pageNo: this.currentPage(),
        pageSize: this.pageSize(),
        search: this.searchQuery(),
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res) => {
        const mapped = res.items.map((user) => ({
          ...user,
          phone: ltrIsolate([user.countryCode, user.phoneNumber].filter(Boolean).join(' ') || '-'),
        }));
        this._users.set(mapped);
        this.totalCount.set(res.totalCount);
        this.pageSize.set(res.pageSize);
        this.currentPage.set(res.currentPage);
      });
  }

  onSearchChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
    this.currentPage.set(1);
    this.getUsers();
  }

  addNewUser() {
    this.router.navigate(['/administration/users/add-user']);
  }

  viewUser(id: string) {
    this.router.navigate(['/administration/users/view-user', id]);
  }

  editUser(id: string) {
    this.router.navigate(['/administration/users/edit-user', id]);
  }

  deleteUser(id: string) {
    this.confirmationService.confirm({
      message: this.translate('messages.confirmDelete'),
      header: this.translate('common.confirm'),
      icon: 'pi pi-exclamation-triangle text-(--primary-500)!',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.administration
          .deleteUser(id)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(() => {
            this.getUsers();
          });
      },
    });
  }

  confirmUserStatus(id: string, activate: boolean) {
    const isDeactivate = !activate;
    this.confirmationService.confirm({
      message: this.translate(
        isDeactivate ? 'messages.confirmDeactivate' : 'messages.confirmActivate',
      ),
      header: this.translate('common.confirm'),
      icon: 'pi pi-exclamation-triangle text-(--primary-500)!',
      acceptButtonStyleClass: isDeactivate ? 'p-button-danger' : undefined,
      accept: () => {
        this.administration
          .actionUser(id, activate ? ActionType.Activate : ActionType.Deactivate)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(() => {
            this.getUsers();
          });
      },
    });
  }

  onPageChange(event: any) {
    if (event != this.currentPage()) {
      this.currentPage.set(event);
      this.getUsers();
    }
  }

  onRowsPerPageChanged(event: any) {
    if (event != this.pageSize()) {
      this.pageSize.set(event);
      this.getUsers();
    }
  }
  exporting = signal(false);

  exportUsers() {
    if (this.users().length === 0) {
      this.toastService.addToast(
        ToastType.Error,
        this.translate('common.error'),
        this.translate('uikit.table.noRecordsFound'),
      );
      return;
    }
    const url = this.administration.isAppAdmin()
      ? 'AdminAuth/Export'
      : 'OrganizationAuth/ExportUser';
    if (this.exporting()) return;
    this.exporting.set(true);
    this.exportService
      .export(url, 'users')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.exporting.set(false));
  }
}
