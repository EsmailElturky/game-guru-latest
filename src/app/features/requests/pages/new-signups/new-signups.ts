import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, signal, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  CellType,
  InputTextComponent,
  ITableDropdown,
  TableComponent,
} from '@EsmailElturky/ui-kit';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { skip, take } from 'rxjs';
import { TranslationService } from 'src/app/core/services';
import { ltrIsolate, transformDate } from 'src/app/shared/functions';
import { OrganizationTransactionService } from '../../services/organization-transaction.service';
import { IOrganizationTransactionListItem } from '../../interfaces/organization-transaction.interface';
import { TransactionActionDialogs } from '../../components/transaction-action-dialogs/transaction-action-dialogs';
import { AppPage } from 'src/app/core/constants/app-pages';
import { buildCrudDropdownItems } from 'src/app/core/utils/build-crud-dropdown';
import { injectPagePermissions } from 'src/app/core/utils/inject-page-permissions';

type Row = IOrganizationTransactionListItem & {
  phoneDisplay: string;
  createdDateDisplay: string;
  activeStatus: 'Active' | 'Inactive';
};

@Component({
  selector: 'app-new-signups',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    InputTextComponent,
    TableComponent,
    TransactionActionDialogs,
  ],
  templateUrl: './new-signups.html',
  styleUrl: './new-signups.scss',
})
export class NewSignups {
  private readonly router = inject(Router);
  private readonly organizationTransaction = inject(OrganizationTransactionService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly translateService = inject(TranslateService);
  private readonly translationService = inject(TranslationService);

  readonly actionDialogs = viewChild.required(TransactionActionDialogs);

  translate = (key: string) => this.translateService.instant(key);
  readonly perms = injectPagePermissions(AppPage.NewSignup);

  searchQuery = signal('');
  rows = signal<Row[]>([]);
  totalCount = signal(0);
  pageSize = signal(10);
  currentPage = signal(1);
  tableColumns = signal<any[]>(this.buildTableColumns());
  tableDropdownItems = signal<ITableDropdown[]>(this.buildTableDropdownItems());

  constructor() {
    toObservable(this.translationService.onLangChange)
      .pipe(skip(1), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.tableColumns.set(this.buildTableColumns());
        this.tableDropdownItems.set(this.buildTableDropdownItems());
        this.loadList();
      });
  }

  ngOnInit(): void {
    this.loadList();
  }

  private buildTableColumns() {
    const t = (key: string) => this.translateService.instant(key);
    return [
      { field: 'id', header: t('table.id'), width: '100px', frozen: true },
      { field: 'name', header: t('table.name'), width: '200px' },
      { field: 'email', header: t('table.email'), width: '220px' },
      { field: 'phoneDisplay', header: t('table.phoneNumber'), width: '200px' },
      { field: 'cityName', header: t('profile.city'), width: '140px' },
      { field: 'address', header: t('profile.address'), width: '220px' },
      // {
      //   field: 'statusName',
      //   header: t('table.status'),
      //   width: '120px',
      //   type: CellType.Badge,
      //   badgeConfig: { Active: 'success', Inactive: 'secondary' },
      // },
      { field: 'createdDateDisplay', header: t('table.createdDate'), width: '200px' },
      { field: 'actions', header: '', width: '100px', type: CellType.Dropdown },
    ];
  }

  private buildTableDropdownItems(): ITableDropdown[] {
    return buildCrudDropdownItems<IOrganizationTransactionListItem>(this.translate, this.perms, {
      onView: (row) => this.viewTransaction(row.id),
      onApprove: (row) => this.actionDialogs().openApprove(row.id),
      onReject: (row) => this.actionDialogs().openDisapprove(row.id),
    });
  }

  loadList(): void {
    this.organizationTransaction
      .getWaitingApproval({
        pageNo: this.currentPage(),
        pageSize: this.pageSize(),
        search: this.searchQuery(),
      })
      .pipe(take(1))
      .subscribe((res) => {
        const mapped =
          res.items?.map((item) => ({
            ...item,
            phoneDisplay: ltrIsolate(
              [item.countryCode, item.phoneNumber].filter(Boolean).join(' '),
            ),
            createdDateDisplay: transformDate(item.createdDate),
            activeStatus: item.isActive ? ('Active' as const) : ('Inactive' as const),
          })) ?? [];
        this.rows.set(mapped);
        this.totalCount.set(res.totalCount);
        this.pageSize.set(res.pageSize);
        this.currentPage.set(res.currentPage);
      });
  }

  onSearchChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
    this.currentPage.set(1);
    this.loadList();
  }

  onPageChange(event: number): void {
    if (event !== this.currentPage()) {
      this.currentPage.set(event);
      this.loadList();
    }
  }

  onRowsPerPageChanged(event: number | unknown): void {
    const size = typeof event === 'number' ? event : Number(event);
    if (size !== this.pageSize()) {
      this.pageSize.set(size);
      this.currentPage.set(1);
      this.loadList();
    }
  }

  onSortChange(_event: unknown): void {}

  onSelectionChange(_event: unknown): void {}

  viewTransaction(organizationId: number): void {
    void this.router.navigate(['/requests/transaction', organizationId]);
  }

  onActionsDone(): void {
    this.loadList();
  }
}
