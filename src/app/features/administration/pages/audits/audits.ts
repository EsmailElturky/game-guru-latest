import { Component, inject, signal } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  ButtonComponent,
  CellType,
  InputTextComponent,
  TableComponent,
} from '@EsmailElturky/ui-kit';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface Audit {
  id: string;
  userName: string;
  roleName: string;
  page: string;
  date: string;
}

@Component({
  selector: 'app-audits',
  standalone: true,
  imports: [TranslateModule, InputTextComponent, ButtonComponent, CommonModule, TableComponent],
  templateUrl: './audits.html',
  styleUrl: './audits.scss',
})
export class Audits {
  private router = inject(Router);
  private translateService = inject(TranslateService);

  translate = (key: string) => this.translateService.instant(key);

  searchQuery = signal('');
  fromDate = signal('');
  toDate = signal('');

  audits = signal<Audit[]>([
    {
      id: '1',
      userName: 'PAEFEEF6751',
      roleName: 'Padel Arena 3',
      page: '966 651651651651651',
      date: 'Content',
    },
    {
      id: '2',
      userName: 'PAEFEEF6751',
      roleName: 'Padel Arena 3',
      page: '966 651651651651651',
      date: 'Content',
    },
    {
      id: '3',
      userName: 'PAEFEEF6751',
      roleName: 'Padel Arena 3',
      page: '966 651651651651651',
      date: 'Content',
    },
    {
      id: '4',
      userName: 'PAEFEEF6751',
      roleName: 'Padel Arena 3',
      page: '966 651651651651651',
      date: 'Content',
    },
  ]);

  tableColumns = signal<any>([
    { field: 'userName', header: this.translate('table.userName'), width: '180px' },
    { field: 'roleName', header: this.translate('table.role'), width: '180px' },
    { field: 'page', header: this.translate('table.page'), width: '240px' },
    { field: 'date', header: this.translate('table.date'), width: '160px' },
    { field: 'actions', header: '', width: '100px', type: CellType.Dropdown },
  ]);

  tableDropdownItems = signal([
    {
      label: 'View',
      icon: 'pi pi-eye text-(--primary-500)!',
      command: (event: any) => this.viewAudit(event.rowData.id),
    },
  ]);

  onSearchChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
  }

  onFromDateChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.fromDate.set(input.value);
  }

  onToDateChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.toDate.set(input.value);
  }

  addAudit() {
    this.router.navigate(['/administration/audits/add-audit']);
  }

  exportAudits() {
    console.log('export audits');
  }

  viewAudit(auditId: string) {
    console.log(auditId);
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
