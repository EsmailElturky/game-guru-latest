import { Component, inject, signal } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TableComponent, CellType } from '@EsmailElturky/ui-kit';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-requests',
  standalone: true,
  imports: [TranslateModule, TableComponent, CommonModule],
  templateUrl: './requests.html',
  styleUrl: './requests.scss',
})
export class Requests {
  private translateService = inject(TranslateService);

  translate = (key: string) => this.translateService.instant(key);

  requests = signal([
    {
      code: 'PAFEFE6751',
      date: 'June 23, 2025 at 9 AM',
      requestType: 'Data modification',
      status: 'Accepted',
    },
    {
      code: 'PAFEFE6751',
      date: 'June 23, 2025 at 9 AM',
      requestType: 'Data modification',
      status: 'Under Review',
    },
    {
      code: 'PAFEFE6751',
      date: 'June 23, 2025 at 9 AM',
      requestType: 'Data modification',
      status: 'Rejected',
    },
    {
      code: 'PAFEFE6751',
      date: 'June 23, 2025 at 9 AM',
      requestType: 'Data modification',
      status: 'Accepted',
    },
    {
      code: 'PAFEFE6751',
      date: 'June 23, 2025 at 9 AM',
      requestType: 'Data modification',
      status: 'Accepted',
    },
  ]);

  tableColumns = signal<any>([
    { field: 'code', header: this.translate('profile.requestsTab.code'), width: '200px' },
    { field: 'date', header: this.translate('profile.requestsTab.date'), width: '250px' },
    {
      field: 'requestType',
      header: this.translate('profile.requestsTab.requestType'),
      width: '200px',
    },
    {
      field: 'status',
      header: this.translate('profile.requestsTab.status'),
      width: '150px',
      type: CellType.Badge,
      badgeConfig: {
        Accepted: 'success',
        'Under Review': 'info',
        Rejected: 'danger',
      },
    },
  ]);
}
