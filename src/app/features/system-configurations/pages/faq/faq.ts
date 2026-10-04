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
import { IFaqList } from '../../interfaces';
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
  selector: 'app-faq',
  standalone: true,
  imports: [TranslateModule, InputTextComponent, ButtonComponent, CommonModule, TableComponent],
  templateUrl: './faq.html',
  styleUrl: './faq.scss',
})
export class Faq implements OnInit {
  private router = inject(Router);
  private configurations = inject(ConfigurationsService);
  private destroyRef = inject(DestroyRef);
  private translateService = inject(TranslateService);
  private translationService = inject(TranslationService);
  private confirmationService = inject(ConfirmationService);

  translate = (key: string) => this.translateService.instant(key);
  readonly perms = injectPagePermissions(AppPage.FAQ);

  searchQuery = signal('');

  private _faqs = signal<IFaqList[]>([]);
  faqs = this._faqs.asReadonly();

  tableColumns = signal<any>(this.buildTableColumns());

  tableDropdownItems = signal<ITableDropdown[]>([]);

  constructor() {
    this.tableDropdownItems.set(this.buildTableDropdownItems());
    toObservable(this.translationService.onLangChange)
      .pipe(skip(1), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.getFaqs();
        this.tableColumns.set(this.buildTableColumns());
        this.tableDropdownItems.set(this.buildTableDropdownItems());
      });
  }

  ngOnInit() {
    this.getFaqs();
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
        imageConfig: {
          basePath: environment.imageApi,
        },
      },
      { field: 'title', header: t('table.title'), width: '250px' },
      {
        field: 'description',
        header: t('table.description'),
        type: CellType.Tooltip,
        tooltipMaxLength: 30,
        width: '300px',
      },
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
    return buildCrudDropdownItems<IFaqList>(this.translate, this.perms, {
      onView: (row) => this.viewFaq(row.id),
      onEdit: (row) => this.editFaq(row.id),
      onDelete: (row) => this.deleteFaq(row.id),
      onActivate: (row) => this.confirmFaqAction(row.id, ActionType.Activate),
      onDeactivate: (row) => this.confirmFaqAction(row.id, ActionType.Deactivate),
    });
  }

  getFaqs() {
    this.configurations
      .getFaqs()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((faqs) => {
        const faqsWithMeta = faqs.map((faq) => ({
          ...faq,
          imageName: `${environment.imageApi}/${faq.imageName}`,
          isActive: faq.isActive ?? isActiveFromStatusName(faq.statusName),
        }));
        this._faqs.set(faqsWithMeta);
      });
  }

  onSearchChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
  }

  addFaq() {
    this.router.navigate(['/system-configurations/faq/add-faq']);
  }

  viewFaq(id: number) {
    this.router.navigate(['/system-configurations/faq/view-faq', id]);
  }

  editFaq(id: number) {
    this.router.navigate(['/system-configurations/faq/edit-faq', id]);
  }

  deleteFaq(id: number) {
    this.confirmationService.confirm({
      message: this.translate('messages.confirmDelete'),
      header: this.translate('common.confirm'),
      icon: 'pi pi-exclamation-triangle text-(--primary-500)!',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.configurations
          .deleteFaq(id)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(() => {
            this.getFaqs();
          });
      },
    });
  }

  confirmFaqAction(id: number, actionType: ActionType) {
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
          .faqAction(id, actionType)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(() => {
            this.getFaqs();
          });
      },
    });
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
