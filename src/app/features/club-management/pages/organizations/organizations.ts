import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  ButtonComponent,
  CellType,
  InputTextComponent,
  ITableDropdown,
  TableComponent,
  ToastService,
  ToastType,
} from '@EsmailElturky/ui-kit';
import { ClubManagementService } from '../../services';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { IOrganization } from '../../interfaces';
import { TranslationService } from 'src/app/core/services';
import { skip } from 'rxjs';
import { isActiveFromStatusName, transformDate } from 'src/app/shared/functions';
import { ConfirmationService } from 'primeng/api';
import { ActionType } from 'src/app/features/promo-codes/enums';
import { ExportService } from 'src/app/shared/services';
import { AppPage } from 'src/app/core/constants/app-pages';
import { buildCrudDropdownItems } from 'src/app/core/utils/build-crud-dropdown';
import { injectPagePermissions } from 'src/app/core/utils/inject-page-permissions';

@Component({
  selector: 'app-organizations',
  standalone: true,
  imports: [TranslateModule, InputTextComponent, ButtonComponent, CommonModule, TableComponent],
  templateUrl: './organizations.html',
  styleUrl: './organizations.scss',
})
export class Organizations {
  private router = inject(Router);
  private clubManagement = inject(ClubManagementService);
  private destroyRef = inject(DestroyRef);
  private translateService = inject(TranslateService);
  private translationService = inject(TranslationService);
  private confirmationService = inject(ConfirmationService);
  private exportService = inject(ExportService);
  private toastService = inject(ToastService);
  translate = (key: string) => this.translateService.instant(key);
  readonly perms = injectPagePermissions(AppPage.Organization);

  searchQuery = signal('');

  private _organizations = signal<IOrganization[]>([]);
  organizations = this._organizations.asReadonly();

  totalCount = signal(0);
  pageSize = signal(10);
  currentPage = signal(1);

  tableColumns = signal<any>(this.buildTableColumns());

  tableDropdownItems = signal<ITableDropdown[]>([]);

  constructor() {
    this.tableDropdownItems.set(this.buildTableDropdownItems());
    toObservable(this.translationService.onLangChange)
      .pipe(skip(1), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.getOrganizations();
        this.tableColumns.set(this.buildTableColumns());
        this.tableDropdownItems.set(this.buildTableDropdownItems());
      });
  }

  ngOnInit() {
    this.getOrganizations();
  }

  private buildTableDropdownItems(): ITableDropdown[] {
    return buildCrudDropdownItems<IOrganization>(this.translate, this.perms, {
      onView: (row) => this.viewOrganization(row.id),
      onEdit: (row) => this.editOrganization(row.id),
      onDelete: (row) => this.deleteOrganization(row.id),
      onActivate: (row) => this.confirmOrganizationStatus(row.id, true),
      onDeactivate: (row) => this.confirmOrganizationStatus(row.id, false),
    });
  }

  private buildTableColumns() {
    const t = (key: string) => this.translateService.instant(key);
    return [
      { field: 'id', header: t('table.id'), width: '180px', frozen: true },
      { field: 'name', header: t('table.organizationName'), width: '220px' },
      { field: 'facilityCount', header: t('table.numberOfFacilities'), width: '180px' },
      { field: 'subscriptionEndDate', header: t('table.subscriptionEndDate'), width: '220px' },
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

  getOrganizations() {
    this.clubManagement
      .getOrganizations({
        pageNo: this.currentPage(),
        pageSize: this.pageSize(),
        search: this.searchQuery(),
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res) => {
        this._organizations.set(
          res.items.map((item) => ({
            ...item,
            subscriptionEndDate: transformDate(item.subscriptionEndDate),
            isActive: item.isActive ?? isActiveFromStatusName(item.statusName),
          })),
        );
        this.totalCount.set(res.totalCount);
        this.pageSize.set(res.pageSize);
        this.currentPage.set(res.currentPage);
      });
  }

  onSearchChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
    this.currentPage.set(1);
    this.getOrganizations();
  }

  addOrganization() {
    this.router.navigate(['/club-management/organizations/add-organization']);
  }

  exportOrganizations() {
    if (this.organizations().length === 0) {
      this.toastService.addToast(
        ToastType.Error,
        this.translate('common.error'),
        this.translate('uikit.table.noRecordsFound'),
      );
      return;
    }
    this.exportService.export('Organization/Export', 'organizations').pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
  }

  viewOrganization(organizationId: number) {
    this.router.navigate(['/club-management/organizations/view-organization', organizationId]);
  }

  editOrganization(organizationId: number) {
    this.router.navigate(['/club-management/organizations/edit-organization', organizationId]);
  }

  deleteOrganization(organizationId: number) {
    this.confirmationService.confirm({
      message: this.translate('messages.confirmDelete'),
      header: this.translate('common.confirm'),
      icon: 'pi pi-exclamation-triangle text-(--primary-500)!',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.clubManagement
          .deleteOrganization(organizationId)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(() => {
            this.getOrganizations();
          });
      },
    });
  }

  confirmOrganizationStatus(organizationId: number, activate: boolean) {
    const isDeactivate = !activate;
    this.confirmationService.confirm({
      message: this.translate(
        isDeactivate ? 'messages.confirmDeactivate' : 'messages.confirmActivate',
      ),
      header: this.translate('common.confirm'),
      icon: 'pi pi-exclamation-triangle text-(--primary-500)!',
      acceptButtonStyleClass: isDeactivate ? 'p-button-danger' : undefined,
      accept: () => {
        this.clubManagement
          .actionOrganization(
            organizationId,
            activate ? ActionType.Activate : ActionType.Deactivate,
          )
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(() => {
            this.getOrganizations();
          });
      },
    });
  }

  onPageChange(event: any) {
    if (event != this.currentPage()) {
      this.currentPage.set(event);
      this.getOrganizations();
    }
  }

  onRowsPerPageChanged(event: any) {
    if (event != this.pageSize()) {
      this.pageSize.set(event);
      this.getOrganizations();
    }
  }
}
