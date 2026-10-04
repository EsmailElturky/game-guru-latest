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

export type BookingRevenueStatus = 'Completed' | 'Upcoming' | 'Canceled';
export interface BookingRevenueRow {
  id: string;
  bookingId: string;
  court: string;
  organization: string;
  date: string;
  bookingValue: string;
  appShare: string;
  status: BookingRevenueStatus;
}

@Component({
  selector: 'app-booking-revenue',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    ButtonComponent,
    DatePickerComponent,
    SelectComponent,
    TableComponent,
  ],
  templateUrl: './booking-revenue.html',
  styleUrl: './booking-revenue.scss',
})
export class BookingRevenue {
  private translateService = inject(TranslateService);

  dateFrom = signal<Date | null>(null);
  dateTo = signal<Date | null>(null);
  selectedOrganization = signal<string | null>(null);
  selectedCourt = signal<string | null>(null);
  selectedStatus = signal<string | null>(null);
  rowsPerPage = signal(10);

  rowsPerPageOptions = signal<{ label: string; value: number }[]>([
    { label: '10', value: 10 },
    { label: '20', value: 20 },
    { label: '50', value: 50 },
  ]);

  rowsPerPageOptionValues = computed(() => this.rowsPerPageOptions().map((o) => o.value));

  translate = (key: string) => this.translateService.instant(key);

  private rawData = signal<BookingRevenueRow[]>([
    {
      id: '1',
      bookingId: 'ALFGE99464565',
      court: 'Mohamed Alaa',
      organization: '(+966) 2358-9999-785',
      date: 'June 23, 2025',
      bookingValue: 'Padel Arena',
      appShare: 'Football',
      status: 'Completed',
    },
    {
      id: '2',
      bookingId: 'ALFGE99464565',
      court: 'Mohamed Alaa',
      organization: '(+966) 2358-9999-785',
      date: '9:00 PM - 10:00 PM',
      bookingValue: 'Padel Arena',
      appShare: 'Football',
      status: 'Completed',
    },
    {
      id: '3',
      bookingId: 'ALFGE99464565',
      court: 'Mohamed Alaa',
      organization: '(+966) 2358-9999-785',
      date: 'June 23, 2025',
      bookingValue: 'Padel Arena',
      appShare: 'Football',
      status: 'Upcoming',
    },
    {
      id: '4',
      bookingId: 'ALFGE99464565',
      court: 'Mohamed Alaa',
      organization: '(+966) 2358-9999-785',
      date: '9:00 PM - 10:00 PM',
      bookingValue: 'Padel Arena',
      appShare: 'Football',
      status: 'Completed',
    },
    {
      id: '5',
      bookingId: 'ALFGE99464565',
      court: 'Mohamed Alaa',
      organization: '(+966) 2358-9999-785',
      date: 'June 23, 2025',
      bookingValue: 'Padel Arena',
      appShare: 'Football',
      status: 'Canceled',
    },
  ]);

  reportData = computed(() => {
    let data = this.rawData();
    const org = this.selectedOrganization();
    const court = this.selectedCourt();
    const status = this.selectedStatus();
    if (org) data = data.filter((r) => r.organization === org);
    if (court) data = data.filter((r) => r.court === court);
    if (status) data = data.filter((r) => r.status === status);
    return data;
  });

  totalCount = computed(() => this.reportData().length);

  organizationOptions = signal<{ label: string; value: string }[]>([
    { label: '(+966) 2358-9999-785', value: '(+966) 2358-9999-785' },
  ]);

  courtOptions = signal<{ label: string; value: string }[]>([
    { label: 'Mohamed Alaa', value: 'Mohamed Alaa' },
  ]);

  statusOptions = signal<{ label: string; value: string }[]>([
    { label: 'Completed', value: 'Completed' },
    { label: 'Upcoming', value: 'Upcoming' },
    { label: 'Canceled', value: 'Canceled' },
  ]);

  tableColumns = signal<any>([
    {
      field: 'bookingId',
      header: this.translate('reports.bookingRevenue.bookingId'),
      width: '160px',
      sortable: true,
    },
    { field: 'court', header: this.translate('reports.bookingRevenue.court'), width: '160px' },
    {
      field: 'organization',
      header: this.translate('reports.bookingRevenue.organization'),
      width: '180px',
    },
    { field: 'date', header: this.translate('reports.bookingRevenue.date'), width: '200px' },
    {
      field: 'bookingValue',
      header: this.translate('reports.bookingRevenue.bookingValue'),
      width: '140px',
    },
    {
      field: 'appShare',
      header: this.translate('reports.bookingRevenue.appShare'),
      width: '120px',
    },
    {
      field: 'status',
      header: this.translate('common.status'),
      width: '140px',
      type: CellType.Badge,
      badgeConfig: { Completed: 'success', Upcoming: 'info', Canceled: 'danger' },
    },
  ]);

  exportReport() {
    console.log('export booking revenue report');
  }

  onRowsPerPageChange(value: number) {
    this.rowsPerPage.set(value ?? 10);
  }

  onDateFromChange(value: Date | Date[] | null) {
    this.dateFrom.set(Array.isArray(value) ? (value[0] ?? null) : value);
  }

  onDateToChange(value: Date | Date[] | null) {
    this.dateTo.set(Array.isArray(value) ? (value[0] ?? null) : value);
  }

  onOrganizationChange(value: unknown) {
    this.selectedOrganization.set(value as string | null);
  }

  onCourtChange(value: unknown) {
    this.selectedCourt.set(value as string | null);
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
