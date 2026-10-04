import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { skip } from 'rxjs';
import {
  ButtonComponent,
  CellType,
  InputTextComponent,
  ITableDropdown,
  TableComponent,
  ToastService,
  ToastType,
} from '@EsmailElturky/ui-kit';
import { ConfirmationService } from 'primeng/api';
import { TranslationService } from 'src/app/core/services';
import { isActiveFromStatusName } from 'src/app/shared/functions';
import { OrganizationFacilityService } from 'src/app/features/profile/services/organization-facility.service';
import { IOrganizationFacilityListItem } from 'src/app/features/profile/interfaces/organization-facility.interface';
import { ActionType } from 'src/app/features/promo-codes/enums';
import { AppPage } from 'src/app/core/constants/app-pages';
import { buildCrudDropdownItems } from 'src/app/core/utils/build-crud-dropdown';
import { injectPagePermissions } from 'src/app/core/utils/inject-page-permissions';
import { ExportService } from 'src/app/shared/services/export/export-service';

type FacilityRow = IOrganizationFacilityListItem & {
  dimensionsDisplay: string;
  descriptionDisplay: string;
};

@Component({
  selector: 'app-facilities',
  standalone: true,
  imports: [TranslateModule, InputTextComponent, ButtonComponent, CommonModule, TableComponent],
  templateUrl: './facilities.html',
  styleUrl: './facilities.scss',
})
export class Facilities implements OnInit {
  private router = inject(Router);
  private facilityService = inject(OrganizationFacilityService);
  private destroyRef = inject(DestroyRef);
  private translateService = inject(TranslateService);
  private translationService = inject(TranslationService);
  private confirmationService = inject(ConfirmationService);
  private exportService = inject(ExportService);
  private toastService = inject(ToastService);

  translate = (key: string) => this.translateService.instant(key);
  readonly perms = injectPagePermissions(AppPage.Facility);

  searchQuery = signal('');
  currentPage = signal(1);
  pageSize = signal(10);
  totalCount = signal(0);
  loading = signal(false);

  private _facilities = signal<FacilityRow[]>([]);
  facilities = this._facilities.asReadonly();

  tableColumns = signal<any>(this.buildTableColumns());
  tableDropdownItems = signal<ITableDropdown[]>([]);

  constructor() {
    this.tableDropdownItems.set(this.buildTableDropdownItems());
    toObservable(this.translationService.onLangChange)
      .pipe(skip(1), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.loadFacilities();
        this.tableColumns.set(this.buildTableColumns());
        this.tableDropdownItems.set(this.buildTableDropdownItems());
      });
  }

  ngOnInit() {
    this.loadFacilities();
  }

  private buildTableColumns() {
    const t = (key: string) => this.translateService.instant(key);
    return [
      { field: 'id', header: t('table.id'), width: '100px', frozen: true },
      { field: 'name', header: t('table.courtName'), width: '200px' },
      { field: 'organizationName', header: t('table.organization'), width: '200px' },
      { field: 'descriptionDisplay', header: t('table.description'), width: '220px' },
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
    return buildCrudDropdownItems<FacilityRow>(this.translate, this.perms, {
      onView: (row) => this.viewFacility(row.id),
      onEdit: (row) => this.editFacility(row.id),
      onDelete: (row) => this.deleteFacility(row.id),
      onActivate: (row) => this.confirmFacilityAction(row.id, ActionType.Activate),
      onDeactivate: (row) => this.confirmFacilityAction(row.id, ActionType.Deactivate),
    });
  }

  private mapRows(items: IOrganizationFacilityListItem[]): FacilityRow[] {
    return items.map((item) => {
      const isActive = item.isActive ?? isActiveFromStatusName(item.statusName);
      return {
        ...item,
        isActive,
        statusName: item.statusName?.trim() || (isActive ? 'Active' : 'Inactive'),
        descriptionDisplay: item.description?.trim() || '—',
        dimensionsDisplay:
          item.width != null && item.height != null ? `${item.width} × ${item.height}` : '—',
      };
    });
  }

  loadFacilities() {
    this.loading.set(true);
    this.facilityService
      .getAll({
        pageNo: this.currentPage(),
        pageSize: this.pageSize(),
        search: this.searchQuery(),
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this._facilities.set(this.mapRows(res.items ?? []));
          this.totalCount.set(res.totalCount);
          if (res.pageSize) {
            this.pageSize.set(res.pageSize);
          }
          if (res.currentPage) {
            this.currentPage.set(res.currentPage);
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
    this.loadFacilities();
  }

  onPageChange(event: { page?: number }) {
    const page = event?.page ?? 1;
    if (page !== this.currentPage()) {
      this.currentPage.set(page);
      this.loadFacilities();
    }
  }

  onRowsPerPageChanged(size: number) {
    if (size !== this.pageSize()) {
      this.pageSize.set(size);
      this.currentPage.set(1);
      this.loadFacilities();
    }
  }

  addFacility() {
    this.router.navigate(['/club-management/facilities/add-facility']);
  }

  exportFacilities() {
    if (this.facilities().length === 0) {
      this.toastService.addToast(
        ToastType.Error,
        this.translate('common.error'),
        this.translate('uikit.table.noRecordsFound'),
      );
      return;
    }
    this.exportService.export('Facility/Export', 'facilities').pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
  }

  viewFacility(facilityId: number) {
    this.router.navigate(['/club-management/facilities/view-facility', facilityId]);
  }

  editFacility(facilityId: number) {
    this.router.navigate(['/club-management/facilities/edit-facility', facilityId]);
  }

  deleteFacility(facilityId: number) {
    this.confirmationService.confirm({
      message: this.translate('messages.confirmDelete'),
      header: this.translate('common.confirm'),
      icon: 'pi pi-exclamation-triangle text-(--primary-500)!',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.facilityService
          .delete(facilityId)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(() => this.loadFacilities());
      },
    });
  }

  confirmFacilityAction(facilityId: number, actionType: ActionType) {
    const isDeactivate = actionType === ActionType.Deactivate;
    this.confirmationService.confirm({
      message: this.translate(
        isDeactivate ? 'messages.confirmDeactivate' : 'messages.confirmActivate',
      ),
      header: this.translate('common.confirm'),
      icon: 'pi pi-exclamation-triangle text-(--primary-500)!',
      acceptButtonStyleClass: isDeactivate ? 'p-button-danger' : undefined,
      accept: () => {
        this.facilityService
          .action({ id: facilityId, actionType })
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(() => this.loadFacilities());
      },
    });
  }

  onSelectionChange(event: unknown) {
    console.log(event);
  }

  onSortChange(event: unknown) {
    console.log(event);
  }
}
