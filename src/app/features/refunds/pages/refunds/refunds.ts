import { CommonModule } from '@angular/common';
import { Component, DestroyRef, effect, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  ButtonComponent,
  CellType,
  InputTextComponent,
  ITableDropdown,
  TableComponent,
} from '@EsmailElturky/ui-kit';
import { IBookingRefund, IBookingRefundTableRow } from '../../interfaces/booking-refund.interface';
import { BookingRefundService } from '../../services/booking-refund.service';
import { ltrIsolate } from 'src/app/shared/functions';
import { AppPage } from 'src/app/core/constants/app-pages';
import { buildCrudDropdownItems } from 'src/app/core/utils/build-crud-dropdown';
import { injectPagePermissions } from 'src/app/core/utils/inject-page-permissions';

@Component({
  selector: 'app-refunds',
  standalone: true,
  imports: [TranslateModule, InputTextComponent, ButtonComponent, CommonModule, TableComponent],
  templateUrl: './refunds.html',
  styleUrl: './refunds.scss',
})
export class Refunds {
  private router = inject(Router);
  private translateService = inject(TranslateService);
  private bookingRefundService = inject(BookingRefundService);
  private destroyRef = inject(DestroyRef);

  translate = (key: string) => this.translateService.instant(key);
  readonly perms = injectPagePermissions(AppPage.Refund);

  searchQuery = signal('');
  currentPage = signal(1);
  pageSize = signal(10);
  totalCount = signal(0);
  loading = signal(false);

  refunds = signal<IBookingRefundTableRow[]>([]);

  tableColumns = signal<any>([
    { field: 'id', header: this.translate('table.id'), width: '100px', frozen: true },
    { field: 'refundByName', header: this.translate('table.userName'), width: '220px' },
    { field: 'phoneDisplay', header: this.translate('table.phoneNumber'), width: '220px' },
    { field: 'refundDateDisplay', header: this.translate('refund.refundDate'), width: '200px' },
    {
      field: 'statusName',
      header: this.translate('table.status'),
      width: '170px',
      type: CellType.Badge,
      badgeConfig: {
        Completed: 'success',
        'Under Review': 'secondary',
        Rejected: 'danger',
        Pending: 'info',
        Approved: 'success',
        Cancelled: 'danger',
        Canceled: 'danger',
        Active: 'success',
        Inactive: 'danger',
      },
    },
    { field: 'actions', header: '', width: '140px', type: CellType.Dropdown },
  ]);

  tableDropdownItems = signal<ITableDropdown[]>(this.buildTableDropdownItems());

  private buildTableDropdownItems(): ITableDropdown[] {
    return buildCrudDropdownItems<IBookingRefundTableRow>(
      this.translate,
      this.perms,
      {
        onView: (row) => this.viewRefund(String(row.id)),
      },
      { showView: this.perms.canView() },
    );
  }

  constructor() {
    effect(() => {
      if (this.currentPage() || this.pageSize() || this.searchQuery()) {
        this.loadRefunds();
      }
    });
  }

  private mapRows(items: IBookingRefund[]): IBookingRefundTableRow[] {
    return items.map((item) => ({
      ...item,
      phoneDisplay: ltrIsolate(`${item.countryCode ?? ''} ${item.phoneNumber ?? ''}`.trim()),
      refundDateDisplay: item.refundDate ? new Date(item.refundDate).toLocaleString() : '',
    }));
  }

  loadRefunds() {
    this.loading.set(true);
    this.bookingRefundService
      .getAll({
        pageNo: this.currentPage(),
        pageSize: this.pageSize(),
        search: this.searchQuery(),
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.refunds.set(this.mapRows(res.items));
          this.totalCount.set(res.totalCount);
          if (res.pageSize) {
            this.pageSize.set(res.pageSize);
          }
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  onSearchChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
    this.currentPage.set(1);
  }

  exportRefunds() {
    console.log('export refunds');
  }

  viewRefund(id: string) {
    this.router.navigate(['/refunds/all-refunds/view-refund', id]);
  }

  onSelectionChange(event: unknown) {
    console.log(event);
  }

  onPageChange(event: any) {
    if (event != this.currentPage()) {
      this.currentPage.set(event);
    }
  }

  onRowsPerPageChanged(event: number) {
    if (event !== this.pageSize()) {
      this.pageSize.set(event);
      this.currentPage.set(1);
    }
  }
}
