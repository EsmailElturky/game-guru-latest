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

export interface RefundReportRow {
  id: string;
  refundId: string;
  userName: string;
  organizationName: string;
  bookingId: string;
  requestDate: string;
  status: 'Completed' | 'Pending' | 'Rejected';
  refundValue: string;
}

@Component({
  selector: 'app-refund-report',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    ButtonComponent,
    DatePickerComponent,
    SelectComponent,
    TableComponent,
  ],
  templateUrl: './refund-report.html',
  styleUrl: './refund-report.scss',
})
export class RefundReport {
  private translateService = inject(TranslateService);

  dateFrom = signal<Date | null>(null);
  dateTo = signal<Date | null>(null);
  selectedOrganization = signal<string | null>(null);
  rowsPerPage = signal(10);

  rowsPerPageOptions = signal<{ label: string; value: number }[]>([
    { label: '10', value: 10 },
    { label: '20', value: 20 },
    { label: '50', value: 50 },
  ]);

  translate = (key: string) => this.translateService.instant(key);

  rowsPerPageOptionValues = computed(() =>
    this.rowsPerPageOptions().map((o) => o.value),
  );

  private rawData = signal<RefundReportRow[]>([
    {
      id: '1',
      refundId: 'ALFGE99464565',
      userName: 'Mohamed Alaa',
      organizationName: '(+966) 2358-9999-785',
      bookingId: 'June 23, 2025\n9:00 PM - 10:00 PM',
      requestDate: 'Padel Arena',
      status: 'Completed',
      refundValue: '0.00',
    },
    {
      id: '2',
      refundId: 'ALFGE99464565',
      userName: 'Mohamed Alaa',
      organizationName: '(+966) 2358-9999-785',
      bookingId: 'June 23, 2025\n9:00 PM - 10:00 PM',
      requestDate: 'Padel Arena',
      status: 'Completed',
      refundValue: '0.00',
    },
    {
      id: '3',
      refundId: 'ALFGE99464565',
      userName: 'Mohamed Alaa',
      organizationName: '(+966) 2358-9999-785',
      bookingId: 'June 23, 2025\n9:00 PM - 10:00 PM',
      requestDate: 'Padel Arena',
      status: 'Completed',
      refundValue: '0.00',
    },
    {
      id: '4',
      refundId: 'ALFGE99464565',
      userName: 'Mohamed Alaa',
      organizationName: '(+966) 2358-9999-785',
      bookingId: 'June 23, 2025\n9:00 PM - 10:00 PM',
      requestDate: 'Padel Arena',
      status: 'Completed',
      refundValue: '0.00',
    },
    {
      id: '5',
      refundId: 'ALFGE99464565',
      userName: 'Mohamed Alaa',
      organizationName: '(+966) 2358-9999-785',
      bookingId: 'June 23, 2025\n9:00 PM - 10:00 PM',
      requestDate: 'Padel Arena',
      status: 'Completed',
      refundValue: '0.00',
    },
  ]);

  reportData = computed(() => {
    let data = this.rawData();
    const org = this.selectedOrganization();
    if (org) data = data.filter((r) => r.organizationName === org);
    return data;
  });

  totalCount = computed(() => this.reportData().length);

  organizationOptions = signal<{ label: string; value: string }[]>([
    { label: '(+966) 2358-9999-785', value: '(+966) 2358-9999-785' },
  ]);

  tableColumns = signal<any>([
    { field: 'refundId', header: this.translate('reports.refundReport.refundId'), width: '160px', sortable: true },
    { field: 'userName', header: this.translate('reports.refundReport.userName'), width: '160px' },
    { field: 'organizationName', header: this.translate('reports.refundReport.organizationName'), width: '180px' },
    { field: 'bookingId', header: this.translate('reports.refundReport.bookingId'), width: '220px' },
    { field: 'requestDate', header: this.translate('reports.refundReport.requestDate'), width: '140px' },
    {
      field: 'status',
      header: this.translate('reports.refundReport.status'),
      width: '140px',
      type: CellType.Badge,
      badgeConfig: { Completed: 'success', Pending: 'info', Rejected: 'danger' },
    },
    { field: 'refundValue', header: this.translate('reports.refundReport.value'), width: '100px' },
  ]);

  exportReport() {
    console.log('export refund report');
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
