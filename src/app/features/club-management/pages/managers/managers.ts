import { Component, DestroyRef, inject, signal } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  ButtonComponent,
  CellType,
  InputTextComponent,
  ITableDropdown,
  TableComponent,
} from '@EsmailElturky/ui-kit';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { skip } from 'rxjs';
import { TranslationService } from 'src/app/core/services';
import { AppPage } from 'src/app/core/constants/app-pages';
import { buildCrudDropdownItems } from 'src/app/core/utils/build-crud-dropdown';
import { injectPagePermissions } from 'src/app/core/utils/inject-page-permissions';

interface Manager {
  id: string;
  code: string;
  name: string;
  phone: string;
  roleName: string;
  status: 'Active' | 'Inactive';
  isActive?: boolean;
}

@Component({
  selector: 'app-managers',
  standalone: true,
  imports: [TranslateModule, InputTextComponent, ButtonComponent, CommonModule, TableComponent],
  templateUrl: './managers.html',
  styleUrl: './managers.scss',
})
export class Managers {
  private router = inject(Router);
  private translateService = inject(TranslateService);
  private confirmationService = inject(ConfirmationService);
  private destroyRef = inject(DestroyRef);
  private translationService = inject(TranslationService);

  translate = (key: string) => this.translateService.instant(key);
  readonly perms = injectPagePermissions(AppPage.Organization);

  searchQuery = signal('');

  managers = signal<Manager[]>([
    {
      id: '1',
      code: 'ALFGE99464565',
      name: 'Mohamed Alaa',
      phone: '(+966) 2358-9999-785',
      roleName: 'Lead',
      status: 'Active',
      isActive: true,
    },
    {
      id: '2',
      code: 'ALFGE99464565',
      name: 'Mohamed Alaa',
      phone: '(+966) 2358-9999-785',
      roleName: 'Lead',
      status: 'Inactive',
      isActive: false,
    },
    {
      id: '3',
      code: 'ALFGE99464565',
      name: 'Mohamed Alaa',
      phone: '(+966) 2358-9999-785',
      roleName: 'Lead',
      status: 'Active',
      isActive: true,
    },
    {
      id: '4',
      code: 'ALFGE99464565',
      name: 'Mohamed Alaa',
      phone: '(+966) 2358-9999-785',
      roleName: 'Lead',
      status: 'Active',
      isActive: true,
    },
    {
      id: '5',
      code: 'ALFGE99464565',
      name: 'Mohamed Alaa',
      phone: '(+966) 2358-9999-785',
      roleName: 'Lead',
      status: 'Active',
      isActive: true,
    },
  ]);

  tableColumns = signal<any>(this.buildTableColumns());
  tableDropdownItems = signal<ITableDropdown[]>([]);

  constructor() {
    this.tableDropdownItems.set(this.buildTableDropdownItems());
    toObservable(this.translationService.onLangChange)
      .pipe(skip(1), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.tableColumns.set(this.buildTableColumns());
        this.tableDropdownItems.set(this.buildTableDropdownItems());
      });
  }

  private buildTableColumns() {
    return [
      {
        field: 'code',
        header: this.translate('table.code'),
        width: '150px',
        sortable: true,
        frozen: true,
      },
      { field: 'name', header: this.translate('table.names'), width: '200px' },
      { field: 'phone', header: this.translate('table.phoneNumber'), width: '200px' },
      {
        field: 'roleName',
        header: this.translate('table.roleName'),
        width: '150px',
        type: CellType.Badge,
        badgeConfig: { Lead: 'info', Admin: 'success', User: 'secondary' },
      },
      {
        field: 'status',
        header: this.translate('table.status'),
        width: '150px',
        type: CellType.Badge,
        badgeConfig: { Active: 'success', Inactive: 'danger' },
      },
      { field: 'actions', header: '', width: '100px', type: CellType.Dropdown },
    ];
  }

  private buildTableDropdownItems(): ITableDropdown[] {
    return buildCrudDropdownItems<Manager>(this.translate, this.perms, {
      onView: (row) => this.viewManager(row.id),
      onEdit: (row) => this.editManager(row.id),
      onDelete: (row) => this.deleteManager(row.id),
      onDeactivate: (row) => this.deactivateManager(row.id),
    });
  }

  onSearchChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
  }

  addManager() {
    this.router.navigate(['/club-management/managers/add-manager']);
  }

  exportManagers() {
    console.log('export managers');
  }

  viewManager(managerId: string) {
    this.router.navigate(['/club-management/managers/view-manager', managerId]);
  }

  editManager(managerId: string) {
    this.router.navigate(['/club-management/managers/edit-manager', managerId]);
  }

  deleteManager(managerId: string) {
    this.confirmationService.confirm({
      message: this.translate('messages.confirmDelete'),
      header: this.translate('common.confirm'),
      icon: 'pi pi-exclamation-triangle text-(--primary-500)!',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        console.log('Deleted manager:', managerId);
      },
    });
  }

  deactivateManager(managerId: string) {
    this.confirmationService.confirm({
      message: this.translate('messages.confirmDeactivate'),
      header: this.translate('common.confirm'),
      icon: 'pi pi-exclamation-triangle text-(--primary-500)!',
      accept: () => {
        console.log('Deactivated manager:', managerId);
      },
    });
  }

  onSelectionChange(event: any) {
    console.log(event);
  }

  onPageChange(event: any) {
    console.log(event);
  }

  onSortChange(event: any) {
    console.log(event);
  }
}
