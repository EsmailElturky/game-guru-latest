import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { skip } from 'rxjs';
import { ConfirmationService } from 'primeng/api';
import {
  ButtonComponent,
  CellType,
  InputTextComponent,
  ITableDropdown,
  TableComponent,
  ToastService,
  ToastType,
} from '@EsmailElturky/ui-kit';
import { PromoCodeService } from '../../services/promo-code.service';
import { IPromoCode } from '../../interfaces/promo-code.interface';
import { ActionType } from '../../enums';
import { ExportService } from 'src/app/shared/services';
import { AppPage } from 'src/app/core/constants/app-pages';
import { buildCrudDropdownItems } from 'src/app/core/utils/build-crud-dropdown';
import { injectPagePermissions } from 'src/app/core/utils/inject-page-permissions';

@Component({
  selector: 'app-promo-codes',
  standalone: true,
  imports: [TranslateModule, InputTextComponent, ButtonComponent, CommonModule, TableComponent],
  templateUrl: './promo-codes.html',
  styleUrl: './promo-codes.scss',
})
export class PromoCodes {
  private router = inject(Router);
  private translateService = inject(TranslateService);
  private promoCodeService = inject(PromoCodeService);
  private destroyRef = inject(DestroyRef);
  private confirmationService = inject(ConfirmationService);
  private toastService = inject(ToastService);
  private exportService = inject(ExportService);
  translate = (key: string) => this.translateService.instant(key);
  readonly perms = injectPagePermissions(AppPage.PromoCodes);

  searchQuery = signal('');
  currentPage = signal(1);
  pageSize = signal(10);
  totalCount = signal(0);
  loading = signal(false);

  promoCodes = signal<IPromoCode[]>([]);

  tableColumns = signal<any>(this.buildTableColumns());

  tableDropdownItems = signal<ITableDropdown[]>([]);

  constructor() {
    this.tableDropdownItems.set(this.buildTableDropdownItems());
    this.translateService.onLangChange
      .pipe(skip(1), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.tableColumns.set(this.buildTableColumns());
        this.tableDropdownItems.set(this.buildTableDropdownItems());
      });
    this.getPromoCodes();
  }

  private buildTableColumns() {
    const t = (key: string) => this.translateService.instant(key);
    return [
      { field: 'id', header: t('table.id'), width: '140px', frozen: true },
      { field: 'promotionCode', header: t('table.promoCode'), width: '220px' },
      { field: 'name', header: t('table.names'), width: '220px' },
      { field: 'promotionTypeName', header: t('profile.promoType'), width: '220px' },
      { field: 'bookingCount', header: t('table.bookingCount'), width: '220px' },
      {
        field: 'statusName',
        header: t('table.status'),
        width: '150px',
        type: CellType.Badge,
        badgeConfig: { Active: 'success', Inactive: 'danger', Expired: 'danger' },
      },
      { field: 'actions', header: '', width: '100px', type: CellType.Dropdown },
    ];
  }

  private buildTableDropdownItems(): ITableDropdown[] {
    return buildCrudDropdownItems<IPromoCode>(this.translate, this.perms, {
      onView: (row) => this.viewPromoCode(String(row.id)),
      onEdit: (row) => this.editPromoCode(String(row.id)),
      onDelete: (row) => this.deletePromoCode(String(row.id)),
      onActivate: (row) => this.confirmPromoAction(+row.id, ActionType.Activate),
      onDeactivate: (row) => this.confirmPromoAction(+row.id, ActionType.Deactivate),
    });
  }

  getPromoCodes() {
    this.loading.set(true);
    this.promoCodeService
      .getAll({
        pageNo: this.currentPage(),
        pageSize: this.pageSize(),
        search: this.searchQuery(),
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.promoCodes.set(res.items);
          this.totalCount.set(res.totalCount);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  onSearchChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
    this.currentPage.set(1);
    this.getPromoCodes();
  }

  addPromoCode() {
    this.router.navigate(['/promo-codes/add-promo-code']);
  }

  exportPromoCodes() {
    if (this.promoCodes().length === 0) {
      this.toastService.addToast(
        ToastType.Error,
        this.translate('common.error'),
        this.translate('uikit.table.noRecordsFound'),
      );
      return;
    }
    this.exportService
      .export('BookingPromotion/Export', 'promo-codes')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
  }

  viewPromoCode(id: string) {
    this.router.navigate(['/promo-codes/view-promo-code', id]);
  }

  editPromoCode(id: string) {
    this.router.navigate(['/promo-codes/edit-promo-code', id]);
  }

  deletePromoCode(id: string) {
    this.promoCodeService
      .delete(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.getPromoCodes();
        },
      });
  }

  confirmPromoAction(id: number, actionType: ActionType) {
    const isDeactivate = actionType === ActionType.Deactivate;
    this.confirmationService.confirm({
      message: this.translate(
        isDeactivate ? 'messages.confirmDeactivate' : 'messages.confirmActivate',
      ),
      header: this.translate('common.confirm'),
      icon: 'pi pi-exclamation-triangle text-(--primary-500)!',
      acceptButtonStyleClass: isDeactivate ? 'p-button-danger' : undefined,
      accept: () => {
        this.promoCodeService
          .action({ id: +id, actionType })
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(() => this.getPromoCodes());
      },
    });
  }

  onSelectionChange(event: any) {
    console.log(event);
  }

  onPageChange(event: any) {
    if (event != this.currentPage()) {
      this.currentPage.set(event.page + 1);
      this.getPromoCodes();
    }
  }

  onRowsPerPageChanged(event: any) {
    if (event != this.pageSize()) {
      this.pageSize.set(event);
      this.getPromoCodes();
    }
  }

  onSortChange(event: any) {
    console.log(event);
  }
}
