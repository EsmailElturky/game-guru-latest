import { Component, computed, inject, signal } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  ButtonComponent,
  DatePickerComponent,
  SelectComponent,
  TableComponent,
} from '@EsmailElturky/ui-kit';
import { CommonModule } from '@angular/common';

export interface OrganizationRevenueRow {
  id: string;
  organization: string;
  court: string;
  bookingCount: string;
  totalRevenue: string;
  netRevenue: string;
  sportName: string;
}

@Component({
  selector: 'app-organization-revenue',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    ButtonComponent,
    DatePickerComponent,
    SelectComponent,
    TableComponent,
  ],
  templateUrl: './organization-revenue.html',
  styleUrl: './organization-revenue.scss',
})
export class OrganizationRevenue {
  private translateService = inject(TranslateService);

  dateFrom = signal<Date | null>(null);
  dateTo = signal<Date | null>(null);
  selectedOrganization = signal<string | null>(null);
  selectedCourt = signal<string | null>(null);
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

  private rawData = signal<OrganizationRevenueRow[]>([
    {
      id: '1',
      organization: 'ALFGE99464565',
      court: 'Mohamed Alaa',
      bookingCount: '(+966) 2358-9999-785',
      totalRevenue: '100 SR',
      netRevenue: '10 SR',
      sportName: 'Football',
    },
    {
      id: '2',
      organization: 'ALFGE99464565',
      court: 'Mohamed Alaa',
      bookingCount: '(+966) 2358-9999-785',
      totalRevenue: '100 SR',
      netRevenue: '10 SR',
      sportName: 'Football',
    },
    {
      id: '3',
      organization: 'ALFGE99464565',
      court: 'Mohamed Alaa',
      bookingCount: '(+966) 2358-9999-785',
      totalRevenue: '100 SR',
      netRevenue: '10 SR',
      sportName: 'Football',
    },
    {
      id: '4',
      organization: 'ALFGE99464565',
      court: 'Mohamed Alaa',
      bookingCount: '(+966) 2358-9999-785',
      totalRevenue: '100 SR',
      netRevenue: '10 SR',
      sportName: 'Football',
    },
    {
      id: '5',
      organization: 'ALFGE99464565',
      court: 'Mohamed Alaa',
      bookingCount: '(+966) 2358-9999-785',
      totalRevenue: '100 SR',
      netRevenue: '10 SR',
      sportName: 'Football',
    },
  ]);

  reportData = computed(() => {
    let data = this.rawData();
    const org = this.selectedOrganization();
    const court = this.selectedCourt();
    if (org) data = data.filter((r) => r.organization === org);
    if (court) data = data.filter((r) => r.court === court);
    return data;
  });

  totalCount = computed(() => this.reportData().length);

  organizationOptions = signal<{ label: string; value: string }[]>([
    { label: 'ALFGE99464565', value: 'ALFGE99464565' },
  ]);

  courtOptions = signal<{ label: string; value: string }[]>([
    { label: 'Mohamed Alaa', value: 'Mohamed Alaa' },
  ]);

  tableColumns = signal<any>([
    { field: 'organization', header: this.translate('reports.organizationRevenue.organization'), width: '160px', sortable: true },
    { field: 'court', header: this.translate('reports.organizationRevenue.court'), width: '160px' },
    { field: 'bookingCount', header: this.translate('reports.organizationRevenue.bookingCount'), width: '180px' },
    { field: 'totalRevenue', header: this.translate('reports.organizationRevenue.totalRevenue'), width: '140px' },
    { field: 'netRevenue', header: this.translate('reports.organizationRevenue.netRevenue'), width: '140px' },
    { field: 'sportName', header: this.translate('reports.organizationRevenue.sportName'), width: '140px' },
  ]);

  exportReport() {
    console.log('export organization revenue report');
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

  onCourtChange(value: unknown) {
    this.selectedCourt.set(value as string | null);
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
