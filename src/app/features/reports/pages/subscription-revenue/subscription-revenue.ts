import { Component, computed, inject, signal } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  ButtonComponent,
  CellType,
  DatePickerComponent,
  SelectComponent,
  TableComponent,
} from '@EsmailElturky/ui-kit';
import { CommonModule } from '@angular/common';

export type SubscriptionRevenueStatus = 'Completed' | 'Upcoming' | 'Canceled';

export interface SubscriptionRevenueRow {
  id: string;
  organizationName: string;
  contactNumber: string;
  subscriptionBundle: string;
  dueDate: string;
  dueValue: string;
  paidValue: string;
  onHoldValue: string;
  status: SubscriptionRevenueStatus;
}

@Component({
  selector: 'app-subscription-revenue',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    ButtonComponent,
    DatePickerComponent,
    SelectComponent,
    TableComponent,
  ],
  templateUrl: './subscription-revenue.html',
  styleUrl: './subscription-revenue.scss',
})
export class SubscriptionRevenue {

  private translateService = inject(TranslateService);

  dateFrom = signal<Date | null>(null);
  dateTo = signal<Date | null>(null);
  selectedOrganization = signal<string | null>(null);
  selectedSubscriptionBundle = signal<string | null>(null);
  selectedStatus = signal<string | null>(null);
  rowsPerPage = signal(10);
  currentPage = signal(0);

  translate = (key: string) => this.translateService.instant(key);

  rowsPerPageOptions = signal<{ label: string; value: number }[]>([
    { label: '10', value: 10 },
    { label: '20', value: 20 },
    { label: '50', value: 50 },
  ]);

  rowsPerPageOptionValues = computed(() =>
    this.rowsPerPageOptions().map((o) => o.value),
  );

  private rawData = signal<SubscriptionRevenueRow[]>([
    {
      id: '1',
      organizationName: 'ALFGE99464565',
      contactNumber: 'Mohamed Alaa',
      subscriptionBundle: '(+966) 2358-9999-785',
      dueDate: 'June 23, 2025',
      dueValue: 'Padel Arena',
      paidValue: 'Football',
      onHoldValue: 'Football',
      status: 'Completed',
    },
    {
      id: '2',
      organizationName: 'ALFGE99464565',
      contactNumber: 'Mohamed Alaa',
      subscriptionBundle: '(+966) 2358-9999-785',
      dueDate: '9:00 PM - 10:00 PM',
      dueValue: 'Padel Arena',
      paidValue: 'Football',
      onHoldValue: 'Football',
      status: 'Completed',
    },
    {
      id: '3',
      organizationName: 'ALFGE99464565',
      contactNumber: 'Mohamed Alaa',
      subscriptionBundle: '(+966) 2358-9999-785',
      dueDate: 'June 23, 2025',
      dueValue: 'Padel Arena',
      paidValue: 'Football',
      onHoldValue: 'Football',
      status: 'Upcoming',
    },
    {
      id: '4',
      organizationName: 'ALFGE99464565',
      contactNumber: 'Mohamed Alaa',
      subscriptionBundle: '(+966) 2358-9999-785',
      dueDate: '9:00 PM - 10:00 PM',
      dueValue: 'Padel Arena',
      paidValue: 'Football',
      onHoldValue: 'Football',
      status: 'Completed',
    },
    {
      id: '5',
      organizationName: 'ALFGE99464565',
      contactNumber: 'Mohamed Alaa',
      subscriptionBundle: '(+966) 2358-9999-785',
      dueDate: 'June 23, 2025',
      dueValue: 'Padel Arena',
      paidValue: 'Football',
      onHoldValue: 'Football',
      status: 'Canceled',
    },
  ]);

  reportData = computed(() => {
    let data = this.rawData();
    const org = this.selectedOrganization();
    const bundle = this.selectedSubscriptionBundle();
    const status = this.selectedStatus();
    if (org) data = data.filter((r) => r.organizationName === org);
    if (bundle) data = data.filter((r) => r.subscriptionBundle === bundle);
    if (status) data = data.filter((r) => r.status === status);
    return data;
  });

  totalCount = computed(() => this.reportData().length);

  organizationOptions = signal<{ label: string; value: string }[]>([
    { label: 'ALFGE99464565', value: 'ALFGE99464565' },
  ]);

  subscriptionBundleOptions = signal<{ label: string; value: string }[]>([
    { label: '(+966) 2358-9999-785', value: '(+966) 2358-9999-785' },
  ]);

  statusOptions = signal<{ label: string; value: string }[]>([
    { label: 'Completed', value: 'Completed' },
    { label: 'Upcoming', value: 'Upcoming' },
    { label: 'Canceled', value: 'Canceled' },
  ]);

  tableColumns = signal<any>([
    {
      field: 'organizationName',
      header: this.translate('reports.subscriptionRevenue.organizationName'),
      width: '160px',
      sortable: true,
    },
    {
      field: 'contactNumber',
      header: this.translate('reports.subscriptionRevenue.contactNumber'),
      width: '160px',
    },
    {
      field: 'subscriptionBundle',
      header: this.translate('reports.subscriptionRevenue.subscriptionBundle'),
      width: '180px',
    },
    {
      field: 'dueDate',
      header: this.translate('reports.subscriptionRevenue.dueDate'),
      width: '180px',
    },
    {
      field: 'dueValue',
      header: this.translate('reports.subscriptionRevenue.dueValue'),
      width: '120px',
    },
    {
      field: 'paidValue',
      header: this.translate('reports.subscriptionRevenue.paidValue'),
      width: '120px',
    },
    {
      field: 'onHoldValue',
      header: this.translate('reports.subscriptionRevenue.onHoldValue'),
      width: '120px',
    },
    {
      field: 'status',
      header: this.translate('reports.subscriptionRevenue.status'),
      width: '140px',
      type: CellType.Badge,
      badgeConfig: {
        Completed: 'success',
        Upcoming: 'info',
        Canceled: 'danger',
      },
    },
  ]);

  exportReport() {
    console.log('export subscription revenue report');
  }

  onRowsPerPageChange(value: number) {
    this.rowsPerPage.set(value ?? 10);
  }

  onDateFromChange(value: Date | Date[] | null) {
    this.dateFrom.set(Array.isArray(value) ? value[0] ?? null : value);
  }

  onDateToChange(value: Date | Date[] | null) {
    this.dateTo.set(Array.isArray(value) ? value[0] ?? null : value);
  }

  onOrganizationChange(value: unknown) {
    this.selectedOrganization.set(value as string | null);
  }

  onSubscriptionBundleChange(value: unknown) {
    this.selectedSubscriptionBundle.set(value as string | null);
  }

  onStatusChange(value: unknown) {
    this.selectedStatus.set(value as string | null);
  }

  onSelectionChange(event: unknown) {
    console.log(event);
  }

  onPageChange(event: unknown) {
    console.log(event);
  }

  onSortChange(event: unknown) {
    console.log(event);
  }
}
