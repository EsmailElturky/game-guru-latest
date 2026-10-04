import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { skip } from 'rxjs';
import {
  ButtonComponent,
  CellType,
  InputTextComponent,
  ITableDropdown,
  TableComponent,
  ToastService,
  ToastType,
} from '@EsmailElturky/ui-kit';
import { ConfirmationService } from 'primeng/api';
import { TranslationService } from 'src/app/core/services';
import { ltrIsolate, transformDate } from 'src/app/shared/functions';
import { CustomersService } from '../../services';
import { ICustomerTableRow, IEndUser } from '../../interfaces';
import { ExportService } from 'src/app/shared/services';
import { AppPage } from 'src/app/core/constants/app-pages';
import { buildCrudDropdownItems } from 'src/app/core/utils/build-crud-dropdown';
import { injectPagePermissions } from 'src/app/core/utils/inject-page-permissions';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [TranslateModule, InputTextComponent, ButtonComponent, CommonModule, TableComponent],
  templateUrl: './customers.html',
  styleUrl: './customers.scss',
})
export class Customers implements OnInit {
  private router = inject(Router);
  private customersService = inject(CustomersService);
  private destroyRef = inject(DestroyRef);
  private translateService = inject(TranslateService);
  private translationService = inject(TranslationService);
  private confirmationService = inject(ConfirmationService);
  private exportService = inject(ExportService);
  private toastService = inject(ToastService);
  translate = (key: string) => this.translateService.instant(key);
  readonly perms = injectPagePermissions(AppPage.Customer);

  searchQuery = signal('');
  totalCount = signal(0);
  pageSize = signal(10);
  currentPage = signal(1);
  loading = signal(false);

  private _customers = signal<ICustomerTableRow[]>([]);
  customers = this._customers.asReadonly();

  tableColumns = signal<any>(this.buildTableColumns());
  tableDropdownItems = signal<ITableDropdown[]>([]);

  constructor() {
    this.tableDropdownItems.set(this.buildTableDropdownItems());
    toObservable(this.translationService.onLangChange)
      .pipe(skip(1), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.getCustomers();
        this.tableColumns.set(this.buildTableColumns());
        this.tableDropdownItems.set(this.buildTableDropdownItems());
      });
  }

  ngOnInit() {
    this.getCustomers();
  }

  private buildTableColumns() {
    const t = (key: string) => this.translateService.instant(key);
    return [
      { field: 'id', header: t('table.id'), width: '120px', frozen: true },
      { field: 'fullName', header: t('table.name'), width: '220px' },
      { field: 'phone', header: t('table.phoneNumber'), width: '200px' },
      { field: 'email', header: t('table.email'), width: '240px' },
      { field: 'dateOfBirthDisplay', header: t('table.date'), width: '160px' },
      {
        field: 'statusName',
        header: t('table.status'),
        width: '150px',
        type: CellType.Badge,
        badgeConfig: { Active: 'success', Inactive: 'danger' },
      },
    ];
  }

  private buildTableDropdownItems(): ITableDropdown[] {
    return buildCrudDropdownItems<ICustomerTableRow>(this.translate, this.perms, {
      onView: (row) => this.viewCustomer(row.id),
      onEdit: (row) => this.editCustomer(row.id),
      onDelete: (row) => this.deleteCustomer(row.id),
      onActivate: (row) => this.confirmCustomerStatus(row.id, true),
      onDeactivate: (row) => this.confirmCustomerStatus(row.id, false),
    });
  }

  private mapStatusName(status: number): string {
    return status === 0 ? 'Active' : 'Inactive';
  }

  private mapRow(item: IEndUser): ICustomerTableRow {
    const isActive = item.status === 0;
    return {
      ...item,
      phone: ltrIsolate(item.phoneNumber?.trim() || '—'),
      email: item.email?.trim() || '—',
      statusName: this.mapStatusName(item.status),
      dateOfBirthDisplay: item.dateOfBirth ? transformDate(item.dateOfBirth) : '—',
      isActive,
    };
  }

  getCustomers() {
    this.loading.set(true);
    this.customersService
      .getAll({
        pageNo: this.currentPage(),
        pageSize: this.pageSize(),
        search: this.searchQuery(),
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this._customers.set(res.items.map((item) => this.mapRow(item)));
          this.totalCount.set(res.totalCount);
          this.pageSize.set(res.pageSize);
          this.currentPage.set(res.currentPage);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  onSearchChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
    this.currentPage.set(1);
    this.getCustomers();
  }

  addCustomer() {
    this.router.navigate(['/customers/add-customer']);
  }

  exportCustomers() {
    if (this.customers().length === 0) {
      this.toastService.addToast(
        ToastType.Error,
        this.translate('common.error'),
        this.translate('uikit.table.noRecordsFound'),
      );
      return;
    }
    this.exportService.export('EndUserAuth/Export', 'customers').pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
  }

  viewCustomer(id: number) {
    this.router.navigate(['/customers/view-customer', id]);
  }

  editCustomer(id: number) {
    this.router.navigate(['/customers/edit-customer', id]);
  }

  deleteCustomer(id: number) {
    this.confirmationService.confirm({
      message: this.translate('messages.confirmDelete'),
      header: this.translate('common.confirm'),
      icon: 'pi pi-exclamation-triangle text-(--primary-500)!',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        console.log('Deleted customer:', id);
      },
    });
  }

  confirmCustomerStatus(id: number, activate: boolean) {
    const isDeactivate = !activate;
    this.confirmationService.confirm({
      message: this.translate(
        isDeactivate ? 'messages.confirmDeactivate' : 'messages.confirmActivate',
      ),
      header: this.translate('common.confirm'),
      icon: 'pi pi-exclamation-triangle text-(--primary-500)!',
      acceptButtonStyleClass: isDeactivate ? 'p-button-danger' : undefined,
      accept: () => {
        console.log(activate ? 'Activated customer:' : 'Deactivated customer:', id);
      },
    });
  }

  onSelectionChange(event: unknown) {
    console.log(event);
  }

  onPageChange(event: { page?: number }) {
    const page = event?.page ?? 1;
    if (page !== this.currentPage()) {
      this.currentPage.set(page);
      this.getCustomers();
    }
  }

  onRowsPerPageChanged(size: number) {
    if (size !== this.pageSize()) {
      this.pageSize.set(size);
      this.currentPage.set(1);
      this.getCustomers();
    }
  }

  onSortChange(event: unknown) {
    console.log(event);
  }
}
