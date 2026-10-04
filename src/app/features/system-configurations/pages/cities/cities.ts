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
import { ICityList } from '../../interfaces';
import { ConfirmationService } from 'primeng/api';
import { TranslationService } from 'src/app/core/services';
import { skip } from 'rxjs';
import { ExportService } from 'src/app/shared/services';
import { AppPage } from 'src/app/core/constants/app-pages';
import { buildCrudDropdownItems } from 'src/app/core/utils/build-crud-dropdown';
import { injectPagePermissions } from 'src/app/core/utils/inject-page-permissions';

@Component({
  selector: 'app-cities',
  standalone: true,
  imports: [TranslateModule, InputTextComponent, ButtonComponent, CommonModule, TableComponent],
  templateUrl: './cities.html',
  styleUrl: './cities.scss',
})
export class Cities {
  private router = inject(Router);
  private configurations = inject(ConfigurationsService);
  private destroyRef = inject(DestroyRef);
  private translateService = inject(TranslateService);
  private translationService = inject(TranslationService);
  private confirmationService = inject(ConfirmationService);
  private exportService = inject(ExportService);
  private toastService = inject(ToastService);
  translate = (key: string) => this.translateService.instant(key);
  readonly perms = injectPagePermissions(AppPage.City);

  searchQuery = signal('');

  private _cities = signal<ICityList[]>([]);
  cities = this._cities.asReadonly();

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
        this.getCities();
        this.tableColumns.set(this.buildTableColumns());
        this.tableDropdownItems.set(this.buildTableDropdownItems());
      });
  }

  private buildTableDropdownItems(): ITableDropdown[] {
    return buildCrudDropdownItems<ICityList>(this.translate, this.perms, {
      onView: (row) => this.viewCity(row.id),
      onEdit: (row) => this.editCity(row.id),
      onDelete: (row) => this.deleteCity(row.id),
      onDeactivate: (row) => this.deactivateCity(row.id),
    });
  }

  ngOnInit() {
    this.getCities();
  }

  private buildTableColumns() {
    const t = (key: string) => this.translateService.instant(key);
    return [
      { field: 'id', header: t('table.id'), width: '180px', frozen: true },
      { field: 'name', header: t('table.cityName'), width: '240px' },
      { field: 'organizationCount', header: t('table.organizationCount'), width: '240px' },
      { field: 'facilityCount', header: t('table.facilityCount'), width: '240px' },
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

  getCities() {
    this.configurations
      .getCitiesPaginated({
        pageNo: this.currentPage(),
        pageSize: this.pageSize(),
        search: this.searchQuery(),
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res) => {
        this._cities.set(res.items);
        this.totalCount.set(res.totalCount);
        this.pageSize.set(res.pageSize);
        this.currentPage.set(res.currentPage);
      });
  }

  onSearchChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
    this.currentPage.set(1);
    this.getCities();
  }

  addCity() {
    this.router.navigate(['/system-configurations/cities/add-city']);
  }

  exportCities() {
    if (this.cities().length === 0) {
        this.toastService.addToast(
          ToastType.Error,
          this.translate('common.error'),
          this.translate('uikit.table.noRecordsFound'),
        );
        return;
      }
      this.exportService.export('City/Export', 'cities').pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
  }

  viewCity(cityId: string) {
    this.router.navigate(['/system-configurations/cities/view-city', cityId]);
  }

  editCity(cityId: string) {
    this.router.navigate(['/system-configurations/cities/edit-city', cityId]);
  }

  deleteCity(cityId: string) {
    this.confirmationService.confirm({
      message: this.translate('messages.confirmDelete'),
      header: this.translate('common.confirm'),
      icon: 'pi pi-exclamation-triangle text-(--primary-500)!',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.configurations
          .deleteCity(cityId)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(() => {
            this.getCities();
          });
      },
    });
  }

  deactivateCity(cityId: string) {
    this.confirmationService.confirm({
      message: this.translate('messages.confirmDeactivate'),
      header: this.translate('common.confirm'),
      icon: 'pi pi-exclamation-triangle text-(--primary-500)!',
      accept: () => {
        console.log('Deactivated city:', cityId);
        // Add actual deactivation logic here when available
      },
    });
  }

  onPageChange(event: any) {
    if (event != this.currentPage()) {
      this.currentPage.set(event);
      this.getCities();
    }
  }
}
