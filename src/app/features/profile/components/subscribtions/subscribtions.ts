import { Component, DestroyRef, inject, signal } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { TableComponent, CellType } from '@EsmailElturky/ui-kit';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ProfileService } from '../../services/profile.service';
import { IOrganizationMembership } from '../../interfaces/profile.interface';

type MembershipRow = IOrganizationMembership & {
  createdDateDisplay: string;
  percentageDisplay: string;
  isCurrentLabel: string;
};

@Component({
  selector: 'app-subscribtions',
  standalone: true,
  imports: [CommonModule, TranslateModule, TableComponent],
  templateUrl: './subscribtions.html',
  styleUrl: './subscribtions.scss',
})
export class Subscribtions {
  private translateService = inject(TranslateService);
  private profileService = inject(ProfileService);
  private destroyRef = inject(DestroyRef);

  translate = (key: string) => this.translateService.instant(key);

  memberships = signal<MembershipRow[]>([]);
  loading = signal(false);

  tableColumns = signal<any>([
    {
      field: 'membershipTypeName',
      header: this.translate('profile.membershipType'),
      width: '200px',
      sortable: true,
      frozen: true,
    },
    {
      field: 'fixedValue',
      header: this.translate('profile.fixedValue'),
      width: '130px',
    },
    {
      field: 'percentageDisplay',
      header: this.translate('profile.percentage'),
      width: '120px',
    },
    {
      field: 'days',
      header: this.translate('profile.membershipDays'),
      width: '100px',
    },
    {
      field: 'isCurrentLabel',
      header: this.translate('profile.isCurrent'),
      width: '130px',
    },
    {
      field: 'createdDateDisplay',
      header: this.translate('profile.membershipCreated'),
      width: '200px',
    },
    {
      field: 'statusName',
      header: this.translate('table.status'),
      width: '140px',
      type: CellType.Badge,
      badgeConfig: {
        Active: 'success',
        Inactive: 'danger',
        Cancelled: 'danger',
        Pending: 'info',
        Expired: 'warning',
      },
    },
  ]);

  constructor() {
    this.loadMemberships();
  }

  private mapRows(items: IOrganizationMembership[]): MembershipRow[] {
    const yes = this.translateService.instant('common.yes');
    const no = this.translateService.instant('common.no');
    return items.map((m) => ({
      ...m,
      createdDateDisplay: m.createdDate ? new Date(m.createdDate).toLocaleString() : '',
      percentageDisplay: `${m.percentage}%`,
      isCurrentLabel: m.isCurrent ? yes : no,
    }));
  }

  loadMemberships() {
    this.loading.set(true);
    this.profileService
      .getOrganizationMemberships()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (items) => {
          this.memberships.set(this.mapRows(items ?? []));
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }
}
