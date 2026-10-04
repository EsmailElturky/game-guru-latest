import { Component, computed, inject, signal } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  ButtonComponent,
  DatePickerComponent,
  SelectComponent,
  TableComponent,
} from '@EsmailElturky/ui-kit';
import { CommonModule } from '@angular/common';

export interface SportsRevenueRow {
  id: string;
  sportName: string;
  court: string;
  organization: string;
  bookingCount: string;
  totalRevenue: string;
  netRevenue: string;
}

@Component({
  selector: 'app-sports-revenue',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    ButtonComponent,
    DatePickerComponent,
    SelectComponent,
    TableComponent,
  ],
  templateUrl: './sports-revenue.html',
  styleUrl: './sports-revenue.scss',
})
export class SportsRevenue {
  private translateService = inject(TranslateService);

  dateFrom = signal<Date | null>(null);
  dateTo = signal<Date | null>(null);
  selectedOrganization = signal<string | null>(null);
  selectedCourt = signal<string | null>(null);
  selectedSport = signal<string | null>(null);
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

  private rawData = signal<SportsRevenueRow[]>([
    {
      id: '1',
      sportName: 'ALFGE99464565',
      court: 'Mohamed Alaa',
      organization: '(+966) 2358-9999-785',
      bookingCount: 'June 23, 2025\n9:00 PM - 10:00 PM',
      totalRevenue: 'Padel Arena',
      netRevenue: 'Football',
    },
    {
      id: '2',
      sportName: 'ALFGE99464565',
      court: 'Mohamed Alaa',
      organization: '(+966) 2358-9999-785',
      bookingCount: 'June 23, 2025\n9:00 PM - 10:00 PM',
      totalRevenue: 'Padel Arena',
      netRevenue: 'Football',
    },
    {
      id: '3',
      sportName: 'ALFGE99464565',
      court: 'Mohamed Alaa',
      organization: '(+966) 2358-9999-785',
      bookingCount: 'June 23, 2025\n9:00 PM - 10:00 PM',
      totalRevenue: 'Padel Arena',
      netRevenue: 'Football',
    },
    {
      id: '4',
      sportName: 'ALFGE99464565',
      court: 'Mohamed Alaa',
      organization: '(+966) 2358-9999-785',
      bookingCount: 'June 23, 2025\n9:00 PM - 10:00 PM',
      totalRevenue: 'Padel Arena',
      netRevenue: 'Football',
    },
    {
      id: '5',
      sportName: 'ALFGE99464565',
      court: 'Mohamed Alaa',
      organization: '(+966) 2358-9999-785',
      bookingCount: 'June 23, 2025\n9:00 PM - 10:00 PM',
      totalRevenue: 'Padel Arena',
      netRevenue: 'Football',
    },
  ]);

  reportData = computed(() => {
    let data = this.rawData();
    const org = this.selectedOrganization();
    const court = this.selectedCourt();
    const sport = this.selectedSport();
    if (org) data = data.filter((r) => r.organization === org);
    if (court) data = data.filter((r) => r.court === court);
    if (sport) data = data.filter((r) => r.sportName === sport);
    return data;
  });

  totalCount = computed(() => this.reportData().length);

  organizationOptions = signal<{ label: string; value: string }[]>([
    { label: '(+966) 2358-9999-785', value: '(+966) 2358-9999-785' },
  ]);

  courtOptions = signal<{ label: string; value: string }[]>([
    { label: 'Mohamed Alaa', value: 'Mohamed Alaa' },
  ]);

  sportOptions = signal<{ label: string; value: string }[]>([
    { label: 'Football', value: 'Football' },
    { label: 'ALFGE99464565', value: 'ALFGE99464565' },
  ]);

  tableColumns = signal<any>([
    { field: 'sportName', header: this.translate('reports.activitiesRevenue.sportName'), width: '160px', sortable: true },
    { field: 'court', header: this.translate('reports.activitiesRevenue.court'), width: '160px' },
    { field: 'organization', header: this.translate('reports.activitiesRevenue.organization'), width: '180px' },
    { field: 'bookingCount', header: this.translate('reports.activitiesRevenue.bookingCount'), width: '200px' },
    { field: 'totalRevenue', header: this.translate('reports.activitiesRevenue.totalRevenue'), width: '140px' },
    { field: 'netRevenue', header: this.translate('reports.activitiesRevenue.netRevenue'), width: '140px' },
  ]);

  exportReport() {
    console.log('export activities revenue report');
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

  onSportChange(value: unknown) {
    this.selectedSport.set(value as string | null);
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
