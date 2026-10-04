import { Component, DestroyRef, inject, signal } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  InputTextComponent,
  ButtonComponent,
  TableComponent,
  CellType,
  ITableDropdown,
} from '@EsmailElturky/ui-kit';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { TranslationService } from 'src/app/core/services';
import { skip } from 'rxjs';
import { isActiveFromStatusName } from 'src/app/shared/functions';
import { ConfirmationService } from 'primeng/api';
import { OrganizationFacilityService } from '../../services/organization-facility.service';
import { IOrganizationFacilityListItem } from '../../interfaces/organization-facility.interface';
import { Auth } from 'src/app/features/auth/services/auth';
import { LocalStorage } from 'src/app/core/services';
import { ActionType } from 'src/app/features/promo-codes/enums';

type CourtRow = IOrganizationFacilityListItem & {
  dimensionsDisplay: string;
  nameArDisplay: string;
};

@Component({
  selector: 'app-courts',
  standalone: true,
  imports: [TranslateModule, InputTextComponent, ButtonComponent, CommonModule, TableComponent],
  templateUrl: './courts.html',
  styleUrl: './courts.scss',
})
export class Courts {
  private router = inject(Router);
  private translateService = inject(TranslateService);
  private organizationFacilityService = inject(OrganizationFacilityService);
  private confirmationService = inject(ConfirmationService);
  private destroyRef = inject(DestroyRef);
  private auth = inject(Auth);
  private localStorage = inject(LocalStorage);
  private translationService = inject(TranslationService);

  translate = (key: string) => this.translateService.instant(key);

  searchQuery = signal('');
  currentPage = signal(1);
  pageSize = signal(10);
  totalCount = signal(0);
  loading = signal(false);

  courts = signal<CourtRow[]>([]);

  tableColumns = signal<any>(this.buildTableColumns());

  tableDropdownItems = signal<ITableDropdown[]>([]);

  constructor() {
    this.tableDropdownItems.set(this.buildTableDropdownItems());
    toObservable(this.translationService.onLangChange)
      .pipe(skip(1), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.tableColumns.set(this.buildTableColumns());
        this.tableDropdownItems.set(this.buildTableDropdownItems());
      });
    this.loadCourts();
  }

  private buildTableColumns() {
    const t = (key: string) => this.translateService.instant(key);
    return [
      {
        field: 'organizationName',
        header: t('table.organization'),
        width: '200px',
        frozen: true,
      },
      { field: 'name', header: t('table.courtName'), width: '200px' },
      { field: 'nameArDisplay', header: t('table.stadiumNameAr'), width: '200px' },
      { field: 'description', header: t('table.description'), width: '260px' },
      { field: 'dimensionsDisplay', header: t('profile.dimensions'), width: '140px' },
      {
        field: 'statusName',
        header: t('table.status'),
        width: '150px',
        type: CellType.Badge,
        badgeConfig: {
          Activate: 'success',
          Deactivate: 'danger',
          Active: 'success',
          Inactive: 'danger',
        },
      },
      { field: 'actions', header: '', width: '100px', type: CellType.Dropdown },
    ];
  }

  private buildTableDropdownItems(): ITableDropdown[] {
    const t = (key: string) => this.translateService.instant(key);
    return [
      {
        label: t('common.view'),
        icon: 'pi pi-eye text-(--primary-500)!',
        command: (event: { rowData: CourtRow }) => this.viewCourt(event.rowData.id),
      },
      {
        label: t('common.edit'),
        icon: 'pi pi-pencil text-(--primary-500)!',
        command: (event: { rowData: CourtRow }) => this.editCourt(event.rowData.id),
      },
      {
        label: t('common.delete'),
        icon: 'pi pi-trash text-(--primary-500)!',
        command: (event: { rowData: CourtRow }) => this.deleteCourt(event.rowData.id),
      },
      {
        label: t('common.deactivate'),
        icon: 'pi pi-ban text-(--primary-500)!',
        command: (event: { rowData: CourtRow }) =>
          this.confirmCourtAction(event.rowData.id, ActionType.Deactivate),
        condition: (rowData: CourtRow) => rowData.isActive,
      },
      {
        label: t('common.activate'),
        icon: 'pi pi-check-circle text-(--primary-500)!',
        command: (event: { rowData: CourtRow }) =>
          this.confirmCourtAction(event.rowData.id, ActionType.Activate),
        condition: (rowData: CourtRow) => !rowData.isActive,
      },
    ];
  }

  private mapRows(items: IOrganizationFacilityListItem[]): CourtRow[] {
    return items.map((item) => ({
      ...item,
      isActive: item.isActive ?? isActiveFromStatusName(item.statusName),
      nameArDisplay: item.nameAr ?? '-',
      dimensionsDisplay:
        item.width != null && item.height != null ? `${item.width} × ${item.height}` : '-',
    }));
  }

  loadCourts() {
    this.loading.set(true);
    this.organizationFacilityService
      .getAll({
        pageNo: this.currentPage(),
        pageSize: this.pageSize(),
        search: this.searchQuery(),
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.courts.set(this.mapRows(res.items ?? []));
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
    this.loadCourts();
  }

  onPageChange(event: number) {
    if (event != this.currentPage()) {
      this.currentPage.set(event);
      this.loadCourts();
    }
  }

  onRowsPerPageChanged(rows: number) {
    if (rows !== this.pageSize()) {
      this.pageSize.set(rows);
      this.currentPage.set(1);
      this.loadCourts();
    }
  }

  addCourt() {
    this.router.navigate(['/profile/add-court']);
  }

  viewCourt(id: number) {
    this.router.navigate(['/profile/view-court', id]);
  }

  editCourt(id: number) {
    this.router.navigate(['/profile/edit-court', id]);
  }

  deleteCourt(id: number) {
    this.confirmationService.confirm({
      message: this.translate('messages.confirmDelete'),
      header: this.translate('common.confirm'),
      icon: 'pi pi-exclamation-triangle text-(--primary-500)!',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.organizationFacilityService
          .delete(id)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(() => this.loadCourts());
      },
    });
  }

  confirmCourtAction(id: number, actionType: ActionType) {
    const isDeactivate = actionType === ActionType.Deactivate;
    this.confirmationService.confirm({
      message: this.translate(
        isDeactivate ? 'messages.confirmDeactivate' : 'messages.confirmActivate',
      ),
      header: this.translate('common.confirm'),
      icon: 'pi pi-exclamation-triangle text-(--primary-500)!',
      acceptButtonStyleClass: isDeactivate ? 'p-button-danger' : undefined,
      accept: () => {
        this.organizationFacilityService
          .action({ id: +id, actionType })
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(() => this.loadCourts());
      },
    });
  }
}
