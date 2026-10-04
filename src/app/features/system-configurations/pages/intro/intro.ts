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
import { IIntroList } from '../../interfaces';
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
  selector: 'app-intro',
  standalone: true,
  imports: [TranslateModule, InputTextComponent, ButtonComponent, CommonModule, TableComponent],
  templateUrl: './intro.html',
  styleUrl: './intro.scss',
})
export class Intro implements OnInit {
  private router = inject(Router);
  private configurations = inject(ConfigurationsService);
  private destroyRef = inject(DestroyRef);
  private translateService = inject(TranslateService);
  private translationService = inject(TranslationService);
  private confirmationService = inject(ConfirmationService);

  translate = (key: string) => this.translateService.instant(key);
  readonly perms = injectPagePermissions(AppPage.Intro);

  searchQuery = signal('');

  private _intros = signal<IIntroList[]>([]);
  intros = this._intros.asReadonly();

  tableColumns = signal<any>(this.buildTableColumns());

  tableDropdownItems = signal<ITableDropdown[]>([]);

  constructor() {
    this.tableDropdownItems.set(this.buildTableDropdownItems());
    toObservable(this.translationService.onLangChange)
      .pipe(skip(1), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.getIntros();
        this.tableColumns.set(this.buildTableColumns());
        this.tableDropdownItems.set(this.buildTableDropdownItems());
      });
  }

  ngOnInit() {
    this.getIntros();
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
    return buildCrudDropdownItems<IIntroList>(this.translate, this.perms, {
      onView: (row) => this.viewIntro(row.id),
      onEdit: (row) => this.editIntro(row.id),
      onDelete: (row) => this.deleteIntro(row.id),
      onActivate: (row) => this.confirmIntroAction(row.id, ActionType.Activate),
      onDeactivate: (row) => this.confirmIntroAction(row.id, ActionType.Deactivate),
    });
  }

  getIntros() {
    this.configurations
      .getIntros()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((intros) => {
        const introsWithMeta = intros.map((intro) => ({
          ...intro,
          imageName: `${environment.imageApi}/${intro.imageName}`,
          isActive: intro.isActive ?? isActiveFromStatusName(intro.statusName),
        }));
        this._intros.set(introsWithMeta);
      });
  }

  confirmIntroAction(id: number, actionType: ActionType) {
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
          .introAction(id, actionType)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(() => {
            this.getIntros();
          });
      },
    });
  }

  onSearchChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
  }

  addIntro() {
    this.router.navigate(['/system-configurations/intro/add-intro']);
  }

  viewIntro(id: number) {
    this.router.navigate(['/system-configurations/intro/view-intro', id]);
  }

  editIntro(id: number) {
    this.router.navigate(['/system-configurations/intro/edit-intro', id]);
  }

  deleteIntro(id: number) {
    this.confirmationService.confirm({
      message: this.translate('messages.confirmDelete'),
      header: this.translate('common.confirm'),
      icon: 'pi pi-exclamation-triangle text-(--primary-500)!',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.configurations
          .deleteIntro(id)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(() => {
            this.getIntros();
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
