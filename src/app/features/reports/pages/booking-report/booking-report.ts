import { CommonModule } from '@angular/common';
import { Component, DestroyRef, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ButtonComponent, CellType, SelectComponent, TableComponent } from '@EsmailElturky/ui-kit';
import { CardModule } from 'primeng/card';
import { Lookups } from 'src/app/shared/services';
import { LookupsEnum } from 'src/app/shared/enums';
import { ILookup, IPaginationResponse } from 'src/app/shared/interfaces';
import { transformDate } from 'src/app/shared/functions';
import { BookingReportService } from '../../services';
import { IBookingReportCards, IBookingReportRow } from '../../interfaces';

export interface MetricCard {
  value: string;
  labelKey: string;
  icon: string;
}

@Component({
  selector: 'app-booking-report',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    ButtonComponent,
    SelectComponent,
    TableComponent,
    CardModule,
  ],
  templateUrl: './booking-report.html',
  styleUrl: './booking-report.scss',
})
export class BookingReport {
  private readonly translateService = inject(TranslateService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly bookingReportService = inject(BookingReportService);
  private readonly lookupsService = inject(Lookups);

  translate = (key: string) => this.translateService.instant(key);

  searchQuery = signal('');
  selectedOrganization = signal<number>(0);
  currentPage = signal<number>(1);
  pageSize = signal<number>(10);

  cards = signal<MetricCard[]>([]);
  tableData = signal<IBookingReportRow[]>([]);
  totalCount = signal<number>(0);
  loadingCards = signal<boolean>(false);

  tableColumns = signal<any>(this.buildTableColumns());

  organizationOptions = toSignal(this.lookupsService.getLookup(LookupsEnum.GetOrganization), {
    initialValue: [] as ILookup[],
  });

  rowsPerPageOptionValues = signal<number[]>([10, 20, 50]);

  constructor() {
    // Reload the table whenever paging / search / organization changes.
    effect(() => {
      this.currentPage();
      this.pageSize();
      this.searchQuery();
      this.selectedOrganization();
      this.getReport();
    });

    // Reload the KPI cards whenever the organization changes.
    effect(() => {
      this.getCards(this.selectedOrganization());
    });

    // Rebuild localized columns and refetch localized data on language change.
    // Note: onLangChange is a plain EventEmitter (no replay), and this page is
    // lazy-loaded, so the first emission it receives is the user's first language
    // switch — do NOT skip it, or the first toggle won't retranslate the headers.
    this.translateService.onLangChange
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.tableColumns.set(this.buildTableColumns());
        this.getReport();
        this.getCards(this.selectedOrganization());
      });
  }

  private getCards(organizationId: number) {
    this.loadingCards.set(true);
    this.bookingReportService
      .getCards(organizationId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.cards.set(this.buildCards(data));
          this.loadingCards.set(false);
        },
        error: () => this.loadingCards.set(false),
      });
  }

  private getReport() {
    this.bookingReportService
      .getReport({
        pageNo: this.currentPage(),
        pageSize: this.pageSize(),
        search: this.searchQuery(),
        organizationId: this.selectedOrganization(),
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res) => {
        const normalized = this.normalizeReport(res);
        this.totalCount.set(normalized.totalCount);
        this.tableData.set(
          normalized.items.map((item) => ({
            ...item,
            dateDisplay: item.bookingDate ? transformDate(item.bookingDate) : '-',
          })),
        );
      });
  }

  /** GetReport may return a paginated wrapper, a bare array, or a single object. */
  private normalizeReport(
    res: IPaginationResponse<IBookingReportRow> | IBookingReportRow[] | IBookingReportRow,
  ): { items: IBookingReportRow[]; totalCount: number } {
    if (res && Array.isArray((res as IPaginationResponse<IBookingReportRow>).items)) {
      const paged = res as IPaginationResponse<IBookingReportRow>;
      return { items: paged.items, totalCount: paged.totalCount ?? paged.items.length };
    }
    if (Array.isArray(res)) {
      return { items: res, totalCount: res.length };
    }
    const items = res ? [res as IBookingReportRow] : [];
    return { items, totalCount: items.length };
  }

  private buildCards(data: IBookingReportCards): MetricCard[] {
    return [
      {
        value: this.formatAmount(data.totalBookingsCount),
        labelKey: 'reports.bookingReport.totalBookingsCount',
        icon: 'pi pi-calendar',
      },
      {
        value: this.formatAmount(data.totalBookingsCompletedCount),
        labelKey: 'reports.bookingReport.totalBookingsCompletedCount',
        icon: 'pi pi-check-circle',
      },
      {
        value: this.formatAmount(data.totalBookingsCancelledCount),
        labelKey: 'reports.bookingReport.totalBookingsCancelledCount',
        icon: 'pi pi-times-circle',
      },
      {
        value: this.formatAmount(data.totalBookingIncomeCount),
        labelKey: 'reports.bookingReport.totalBookingIncomeCount',
        icon: 'pi pi-wallet',
      },
      {
        value: this.formatAmount(data.totalClubsAmount),
        labelKey: 'reports.bookingReport.totalClubsAmount',
        icon: 'pi pi-building',
      },
      {
        value: this.formatAmount(data.totalTaxAmount),
        labelKey: 'reports.bookingReport.totalTaxAmount',
        icon: 'pi pi-percentage',
      },
      {
        value: this.formatAmount(data.totalRevenueCount),
        labelKey: 'reports.bookingReport.totalRevenueCount',
        icon: 'pi pi-chart-line',
      },
      {
        value: `${data.totalRevenuePercentage ?? 0}%`,
        labelKey: 'reports.bookingReport.totalRevenuePercentage',
        icon: 'pi pi-percentage',
      },
      {
        value: this.formatAmount(data.totalRevenueFixedAmount),
        labelKey: 'reports.bookingReport.totalRevenueFixedAmount',
        icon: 'pi pi-money-bill',
      },
      {
        value: this.formatAmount(data.totalSubscriptionRevenueCount),
        labelKey: 'reports.bookingReport.totalSubscriptionRevenueCount',
        icon: 'pi pi-credit-card',
      },
      {
        value: this.formatAmount(data.totalPromotionsCount),
        labelKey: 'reports.bookingReport.totalPromotionsCount',
        icon: 'pi pi-tag',
      },
    ];
  }

  private buildTableColumns() {
    const t = (key: string) => this.translateService.instant(key);
    return [
      {
        field: 'organizationName',
        header: t('reports.bookingReport.organization'),
        width: '200px',
      },
      { field: 'sportName', header: t('reports.bookingReport.sport'), width: '160px' },
      { field: 'dateDisplay', header: t('reports.bookingReport.bookingDate'), width: '200px' },
      {
        field: 'bookingAmount',
        header: t('reports.bookingReport.bookingAmount'),
        width: '160px',
      },
      {
        field: 'statusName',
        header: t('reports.bookingReport.status'),
        width: '160px',
        type: CellType.Badge,
        badgeConfig: {
          Completed: 'success',
          Cancelled: 'danger',
          Ready: 'secondary',
          Upcoming: 'warning',
        },
      },
    ];
  }

  private formatAmount(value: number | undefined): string {
    return (value ?? 0).toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  }

  onOrganizationChange(value: unknown) {
    this.selectedOrganization.set((value as number) ?? 0);
  }

  onPageChange(pageNo: number) {
    if (pageNo != this.currentPage()) {
      this.currentPage.set(pageNo);
    }
  }

  onRowsPerPageChanged(pageSize: unknown) {
    if (pageSize != this.pageSize()) {
      this.pageSize.set(pageSize as number);
    }
  }

  onSelectionChange(event: unknown) {
    console.log(event);
  }

  onSortChange(event: unknown) {
    console.log(event);
  }

  exportReport() {
    console.log('export booking report');
  }
}
