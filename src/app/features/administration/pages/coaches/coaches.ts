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
import { AdministrationService } from '../../services';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { ICoach } from '../../interfaces';
import { TranslationService } from 'src/app/core/services';
import { skip } from 'rxjs';
import { ltrIsolate } from 'src/app/shared/functions';
import { ExportService } from 'src/app/shared/services';
import { ActionType } from 'src/app/features/promo-codes/enums';
import { ConfirmationService } from 'primeng/api';
import { AppPage } from 'src/app/core/constants/app-pages';
import { buildCrudDropdownItems } from 'src/app/core/utils/build-crud-dropdown';
import { injectPagePermissions } from 'src/app/core/utils/inject-page-permissions';

@Component({
  selector: 'app-coaches',
  standalone: true,
  imports: [TranslateModule, InputTextComponent, ButtonComponent, CommonModule, TableComponent],
  templateUrl: './coaches.html',
  styleUrl: './coaches.scss',
})
export class Coaches {
  private router = inject(Router);
  private administration = inject(AdministrationService);
  private destroyRef = inject(DestroyRef);
  private translateService = inject(TranslateService);
  private translationService = inject(TranslationService);
  private exportService = inject(ExportService);
  private toastService = inject(ToastService);
  private confirmationService = inject(ConfirmationService);

  translate = (key: string) => this.translateService.instant(key);
  readonly perms = injectPagePermissions(AppPage.Coach);

  searchQuery = signal('');

  private _coaches = signal<ICoach[]>([]);
  coaches = this._coaches.asReadonly();

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
        this.getCoaches();
        this.tableColumns.set(this.buildTableColumns());
        this.tableDropdownItems.set(this.buildTableDropdownItems());
      });
  }

  private buildTableDropdownItems(): ITableDropdown[] {
    return buildCrudDropdownItems<ICoach>(
      this.translate,
      this.perms,
      {
        onView: (row) => this.editCoach(row.id),
        onEdit: (row) => this.editCoach(row.id),
        onActivate: (row) => this.confirmRoleAction(row.id, ActionType.Activate),
        onDeactivate: (row) => this.confirmRoleAction(row.id, ActionType.Deactivate),
      },
      { showView: false },
    );
  }

  ngOnInit() {
    this.getCoaches();
  }

  private buildTableColumns() {
    const t = (key: string) => this.translateService.instant(key);
    return [
      { field: 'id', header: t('table.id'), width: '120px', frozen: true },
      { field: 'fullName', header: t('table.name'), width: '200px' },
      { field: 'email', header: t('table.email'), width: '220px' },
      { field: 'bookingCount', header: t('table.bookingCount'), width: '200px' },
      { field: 'phone', header: t('table.phoneNumber'), width: '200px' },
      { field: 'genderName', header: t('common.gender'), width: '120px' },
      { field: 'statusName', header: t('table.status'), width: '150px', type: CellType.Badge, badgeConfig: { Activate: 'success', Deactivate: 'danger' } },
      { field: 'actions', header: '', width: '100px', type: CellType.Dropdown },
    ];
  }

  confirmRoleAction(roleId: number, actionType: ActionType) {
    const isDeactivate = actionType === ActionType.Deactivate;
    this.confirmationService.confirm({
      message: this.translate(
        isDeactivate ? 'messages.confirmDeactivate' : 'messages.confirmActivate',
      ),
      header: this.translate('common.confirm'),
      icon: 'pi pi-exclamation-triangle text-(--primary-500)!',
      acceptButtonStyleClass: isDeactivate ? 'p-button-danger' : undefined,
      accept: () => {
        this.administration
          .takeAction(roleId, actionType)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(() => {
            this.getCoaches();
          });
      },
    });
  }


  getCoaches() {
    this.administration
      .getAllCoaches({
        pageNo: this.currentPage(),
        pageSize: this.pageSize(),
        search: this.searchQuery(),
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res) => {
        const mapped = res.items.map((coach) => ({
          ...coach,
          email: coach.email ?? '-',
          phone: ltrIsolate(
            [coach.countryCode, coach.phoneNumber].filter(Boolean).join(' ') || '-',
          ),
        }));
        this._coaches.set(mapped);
        this.totalCount.set(res.totalCount);
        this.pageSize.set(res.pageSize);
        this.currentPage.set(res.currentPage);
      });
  }

  onSearchChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
    this.currentPage.set(1);
    this.getCoaches();
  }

  addCoach() {
    this.router.navigate(['/administration/coaches/add-coach']);
  }

  editCoach(id: number) {
    this.router.navigate(['/administration/coaches/edit-coach', id]);
  }

  onPageChange(event: { page: number } | number) {
    const page = typeof event === 'number' ? event : event.page + 1;
    if (page !== this.currentPage()) {
      this.currentPage.set(page);
      this.getCoaches();
    }
  }

  onRowsPerPageChanged(event: number) {
    if (event !== this.pageSize()) {
      this.pageSize.set(event);
      this.getCoaches();
    }
  }

  exportCoaches() {
    if (this.coaches().length === 0) {
      this.toastService.addToast(
        ToastType.Error,
        this.translate('common.error'),
        this.translate('uikit.table.noRecordsFound'),
      );
      return;
    }
    this.exportService
      .export('/OrganizationAuth/ExportCoach', 'coaches')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
  }
}
