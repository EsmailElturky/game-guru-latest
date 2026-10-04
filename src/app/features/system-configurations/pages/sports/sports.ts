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
import { ConfigurationsService } from '../../services';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { ISportList } from '../../interfaces';
import { TranslationService } from 'src/app/core/services';
import { skip } from 'rxjs';
import { ConfirmationService } from 'primeng/api';
import { ActionType } from 'src/app/features/promo-codes/enums';
import { ExportService } from 'src/app/shared/services';
import { AppPage } from 'src/app/core/constants/app-pages';
import { buildCrudDropdownItems } from 'src/app/core/utils/build-crud-dropdown';
import { injectPagePermissions } from 'src/app/core/utils/inject-page-permissions';

@Component({
  selector: 'app-sports',
  standalone: true,
  imports: [TranslateModule, InputTextComponent, ButtonComponent, CommonModule, TableComponent],
  templateUrl: './sports.html',
  styleUrl: './sports.scss',
})
export class Sports {
  private router = inject(Router);
  private configurations = inject(ConfigurationsService);
  private destroyRef = inject(DestroyRef);
  private translateService = inject(TranslateService);
  private translationService = inject(TranslationService);
  private confirmationService = inject(ConfirmationService);
  private exportService = inject(ExportService);
  private toastService = inject(ToastService);
  translate = (key: string) => this.translateService.instant(key);
  readonly perms = injectPagePermissions(AppPage.Sport);

  searchQuery = signal('');

  private _sports = signal<ISportList[]>([]);
  sports = this._sports.asReadonly();

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
        this.getSports();
        this.tableColumns.set(this.buildTableColumns());
        this.tableDropdownItems.set(this.buildTableDropdownItems());
      });
  }

  private buildTableDropdownItems(): ITableDropdown[] {
    return buildCrudDropdownItems<ISportList>(this.translate, this.perms, {
      onView: (row) => this.viewSport(row.id),
      onEdit: (row) => this.editSport(row.id),
      onDelete: (row) => this.deleteSport(row.id),
      onActivate: (row) => this.activateSport(row.id),
      onDeactivate: (row) => this.deactivateSport(row.id),
    });
  }

  ngOnInit() {
    this.getSports();
  }

  private buildTableColumns() {
    const t = (key: string) => this.translateService.instant(key);
    return [
      { field: 'id', header: t('table.id'), width: '180px', frozen: true },
      { field: 'name', header: t('table.sportName'), width: '220px' },
      { field: 'sportTypeName', header: t('table.sportType'), width: '220px' },
      {
        field: 'statusName',
        header: t('table.status'),
        width: '150px',
        type: CellType.Badge,
        badgeConfig: { Active: 'success', Inactive: 'danger' },
      },
      { field: 'actions', header: '', width: '100px', type: CellType.Dropdown },
    ];
  }

  getSports() {
    this.configurations
      .getSports({
        pageNo: this.currentPage(),
        pageSize: this.pageSize(),
        search: this.searchQuery(),
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res) => {
        this._sports.set(res.items);
        this.totalCount.set(res.totalCount);
        this.pageSize.set(res.pageSize);
        this.currentPage.set(res.currentPage);
      });
  }

  onSearchChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
    this.currentPage.set(1);
    this.getSports();
  }

  addSport() {
    this.router.navigate(['/system-configurations/sports/add-sport']);
  }

  exportSports() {
    if (this.sports().length === 0) {
      this.toastService.addToast(
        ToastType.Error,
        this.translate('common.error'),
        this.translate('uikit.table.noRecordsFound'),
      );
      return;
    }
    this.exportService.export('Sport/Export', 'sports').pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
  }

  viewSport(sportId: string) {
    this.router.navigate(['/system-configurations/sports/view-sport', sportId]);
  }

  editSport(sportId: string) {
    this.router.navigate(['/system-configurations/sports/edit-sport', sportId]);
  }

  deleteSport(sportId: string) {
    this.confirmationService.confirm({
      message: this.translate('messages.confirmDelete'),
      header: this.translate('common.confirm'),
      icon: 'pi pi-exclamation-triangle text-(--primary-500)!',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.configurations
          .deleteSport(sportId)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(() => {
            this.getSports();
          });
      },
    });
  }

  activateSport(sportId: string) {
    this.confirmationService.confirm({
      message: this.translate('messages.confirmActivate'),
      header: this.translate('common.confirm'),
      icon: 'pi pi-exclamation-triangle text-(--primary-500)!',
      accept: () => {
        this.configurations
          .sportAction(sportId, ActionType.Activate)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(() => {
            this.getSports();
          });
      },
    });
  }

  deactivateSport(sportId: string) {
    this.confirmationService.confirm({
      message: this.translate('messages.confirmDeactivate'),
      header: this.translate('common.confirm'),
      icon: 'pi pi-exclamation-triangle text-(--primary-500)!',
      accept: () => {
        this.configurations
          .sportAction(sportId, ActionType.Deactivate)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(() => {
            this.getSports();
          });
      },
    });
  }

  onPageChange(event: any) {
    if (event != this.currentPage()) {
      this.currentPage.set(event);
      this.getSports();
    }
  }
}
