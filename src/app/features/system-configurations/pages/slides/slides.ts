import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  ButtonComponent,
  CellType,
  InputTextComponent,
  ITableDropdown,
  TableComponent,
} from '@EsmailElturky/ui-kit';
import { ConfigurationsService } from '../../services';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { ISlideList } from '../../interfaces';
import { TranslationService } from 'src/app/core/services';
import { skip } from 'rxjs';
import { ConfirmationService } from 'primeng/api';
import { environment } from 'src/environments/environment';
import { ActionType } from 'src/app/features/promo-codes/enums';
import { isActiveFromStatusName } from 'src/app/shared/functions';
import { AppPage } from 'src/app/core/constants/app-pages';
import { buildCrudDropdownItems } from 'src/app/core/utils/build-crud-dropdown';
import { injectPagePermissions } from 'src/app/core/utils/inject-page-permissions';

@Component({
  selector: 'app-slides',
  standalone: true,
  imports: [TranslateModule, InputTextComponent, ButtonComponent, CommonModule, TableComponent],
  templateUrl: './slides.html',
  styleUrl: './slides.scss',
})
export class Slides implements OnInit {
  private router = inject(Router);
  private configurations = inject(ConfigurationsService);
  private destroyRef = inject(DestroyRef);
  private translateService = inject(TranslateService);
  private translationService = inject(TranslationService);
  private confirmationService = inject(ConfirmationService);

  translate = (key: string) => this.translateService.instant(key);
  readonly perms = injectPagePermissions(AppPage.Slider);

  searchQuery = signal('');

  private _slides = signal<ISlideList[]>([]);
  slides = this._slides.asReadonly();

  tableColumns = signal<any>(this.buildTableColumns());

  tableDropdownItems = signal<ITableDropdown[]>([]);

  constructor() {
    this.tableDropdownItems.set(this.buildTableDropdownItems());
    toObservable(this.translationService.onLangChange)
      .pipe(skip(1), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.getSlides();
        this.tableColumns.set(this.buildTableColumns());
        this.tableDropdownItems.set(this.buildTableDropdownItems());
      });
  }

  ngOnInit() {
    this.getSlides();
  }

  private buildTableColumns() {
    const t = (key: string) => this.translateService.instant(key);
    return [
      { field: 'id', header: t('table.id'), width: '100px', frozen: true },
      {
        field: 'imageName',
        header: t('table.image'),
        width: '150px',
        type: CellType.Image,
      },
      { field: 'title', header: t('table.title'), width: '250px' },
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
    return buildCrudDropdownItems<ISlideList>(this.translate, this.perms, {
      onView: (row) => this.viewSlide(row.id),
      onEdit: (row) => this.editSlide(row.id),
      onDelete: (row) => this.deleteSlide(row.id),
      onActivate: (row) => this.confirmSlideAction(row.id, ActionType.Activate),
      onDeactivate: (row) => this.confirmSlideAction(row.id, ActionType.Deactivate),
    });
  }

  getSlides() {
    this.configurations
      .getSlides()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((slides) => {
        const slidesWithImageUrl = slides.map((slide) => ({
          ...slide,
          imageName: `${environment.imageApi}/${slide.imageName}`,
          isActive: slide.isActive ?? isActiveFromStatusName(slide.statusName),
        }));
        this._slides.set(slidesWithImageUrl);
      });
  }

  onSearchChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
    // Add filtering logic if needed, or re-fetch from API if it supports search
  }

  addSlide() {
    this.router.navigate(['/system-configurations/sliders/add-slider']);
  }

  viewSlide(id: number) {
    this.router.navigate(['/system-configurations/sliders/view-slider', id]);
  }

  editSlide(id: number) {
    this.router.navigate(['/system-configurations/sliders/edit-slider', id]);
  }

  deleteSlide(id: number) {
    this.confirmationService.confirm({
      message: this.translate('messages.confirmDelete'),
      header: this.translate('common.confirm'),
      icon: 'pi pi-exclamation-triangle text-(--primary-500)!',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.configurations
          .deleteSlide(id)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(() => {
            this.getSlides();
          });
      },
    });
  }

  confirmSlideAction(id: number, actionType: ActionType) {
    const isDeactivate = actionType === ActionType.Deactivate;
    this.confirmationService.confirm({
      message: this.translate(
        isDeactivate ? 'messages.confirmDeactivate' : 'messages.confirmActivate',
      ),
      header: this.translate('common.confirm'),
      icon: 'pi pi-exclamation-triangle text-(--primary-500)!',
      acceptButtonStyleClass: isDeactivate ? 'p-button-danger' : undefined,
      accept: () => {
        this.configurations
          .slideAction(id, actionType)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(() => {
            this.getSlides();
          });
      },
    });
  }
}
