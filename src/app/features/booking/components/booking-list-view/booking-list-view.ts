import { Observable, of, skip } from 'rxjs';
import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  ButtonComponent,
  CellType,
  ITableDropdown,
  SelectComponent,
  TableComponent,
  TextAreaComponent,
} from '@EsmailElturky/ui-kit';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { IBookingList } from '../../interfaces';
import { BookingService } from '../../services';
import { ltrIsolate, transformDate } from 'src/app/shared/functions/utils';
import { ConfirmationService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { Lookups } from 'src/app/shared/services';
import { CascadeLookupsEnum, LookupsEnum } from 'src/app/shared/enums';
import { ILookup } from 'src/app/shared/interfaces';
import { Auth } from 'src/app/features/auth/services/auth';

@Component({
  selector: 'app-booking-list-view',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    TableComponent,
    DialogModule,
    ReactiveFormsModule,
    SelectComponent,
    TextAreaComponent,
    ButtonComponent,
  ],
  templateUrl: './booking-list-view.html',
  styleUrl: './booking-list-view.scss',
})
export class BookingListView {
  private translateService = inject(TranslateService);
  private destroyRef = inject(DestroyRef);
  private bookingService = inject(BookingService);
  private confirmationService = inject(ConfirmationService);
  private lookupsService = inject(Lookups);
  private authService = inject(Auth);
  private router = inject(Router);

  translate = (key: string) => this.translateService.instant(key);
  isAppAdmin = this.authService.isAdminApp;

  searchQuery = input<string>();
  selectedOrganization = input<number>();
  toggleView = output<void>();

  currentPage = signal<number>(1);
  pageSize = signal<number>(10);

  tableData = signal<IBookingList[]>([]);

  tableColumns = signal<any>(this.buildTableColumns());

  totalCount = signal<number>(0);

  tableDropdownItems = signal<ITableDropdown[]>([]);

  bookingActionDialogMode = signal<'assign' | 'cancel' | null>(null);
  pendingBooking = signal<IBookingList | null>(null);
  coachOptions = signal<ILookup[]>([]);
  actionDialogSubmitting = signal(false);

  assignCoachForm = new FormGroup({
    coachId: new FormControl<string | null>(null, Validators.required),
  });

  cancelBookingForm = new FormGroup({
    reason: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  constructor() {
    this.rebuildDropdownItems();

    this.translateService.onLangChange
      .pipe(skip(1), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.getBookingsList();
        this.tableColumns.set(this.buildTableColumns());
        this.rebuildDropdownItems();
      });

    effect(() => {
      if (
        this.currentPage() ||
        this.pageSize() ||
        this.searchQuery() ||
        this.selectedOrganization()
      ) {
        this.getBookingsList();
      }
    });
  }

  bookingActionDialogVisible(): boolean {
    return this.bookingActionDialogMode() !== null;
  }

  onBookingActionDialogVisibleChange(visible: boolean) {
    if (!visible) {
      this.closeBookingActionDialog();
    }
  }

  private rebuildDropdownItems() {
    if (this.isAppAdmin()!) {
      return;
    }
    const t = (key: string) => this.translateService.instant(key);
    this.tableDropdownItems.set([
      // {
      //   label: t('common.delete'),
      //   icon: 'pi pi-trash text-(--primary-500)!',
      //   command: (e: { rowData: IBookingList }) => this.onDelete(e.rowData),
      // },
      {
        label: t('booking.complete'),
        icon: 'pi pi-user-plus text-(--primary-500)!',
        command: (e: { rowData: IBookingList }) => this.onComplete(e.rowData),
        condition: (rowData: IBookingList) => rowData.status === 2 && rowData.isAssignCoach,
      },
      {
        label: t('booking.assignCoach'),
        icon: 'pi pi-user-plus text-(--primary-500)!',
        command: (e: { rowData: IBookingList }) => this.openAssignCoachDialog(e.rowData),
        condition: (rowData: IBookingList) =>[1, 2].includes(rowData.status),
      },
      {
        label: t('common.cancel'),
        icon: 'pi pi-times text-(--primary-500)!',
        command: (e: { rowData: IBookingList }) => this.openCancelBookingDialog(e.rowData),
        condition: (rowData: IBookingList) => rowData.status === 2,
      },
    ]);
  }

  getBookingsList() {
    this.bookingService
      .getBookingsList({
        pageNo: this.currentPage()!,
        pageSize: this.pageSize()!,
        search: this.searchQuery()!,
        organizationId: this.selectedOrganization()!,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res) => {
        this.totalCount.set(res.totalCount);
        const data = res?.items?.map((item) => {
          return {
            ...item,
            dateDisplay: transformDate(item.bookingDate),
            phoneNumber: ltrIsolate([item.countryCode, item.phoneNumber].filter(Boolean).join(' ')),
            courtName: '-',
          };
        });
        this.tableData.set(data);
      });
  }

  buildTableColumns() {
    const t = (key: string) => this.translateService.instant(key);
    return [
      {
        field: 'id',
        header: t('table.referenceNumber'),
        width: '180px',
        frozen: true,
      },
      { field: 'username', header: t('table.userName'), width: '180px' },
      { field: 'phoneNumber', header: t('table.phoneNumber'), width: '180px' },
      { field: 'organizationName', header: t('table.organization'), width: '180px' },
      { field: 'facilityName', header: t('table.courtName'), width: '180px' },
      { field: 'dateDisplay', header: t('table.date'), width: '220px' },
      { field: 'coachName', header: t('table.coach'), width: '180px' },
      {
        field: 'statusName',
        header: t('table.status'),
        width: '170px',
        type: CellType.Badge,
        badgeConfig: {
          Completed: 'success',
          Cancelled: 'danger',
          Ready: 'secondary',
          Upcoming: 'warning',
        },
      },
      { field: 'actions', header: '', width: '100px', type: CellType.Dropdown },
    ];
  }

  requestToggleView() {
    this.toggleView.emit();
  }

  onSelectionChange(event: unknown) {
    console.log(event);
  }

  onPageChange(pageNo: number) {
    if (pageNo != this.currentPage()) {
      this.currentPage.set(pageNo);
    }
  }

  onSortChange(event: unknown) {
    console.log(event);
  }

  onRowsPerPageChanged(pageSize: unknown) {
    if (pageSize != this.pageSize()) {
      this.pageSize.set(pageSize as number);
    }
  }

  onRowClick(row: unknown) {
    const booking = row as IBookingList;
    if (booking?.id != null) {
      this.router.navigate(['/booking/view-booking', booking.id]);
    }
  }

  private openAssignCoachDialog(rowData: IBookingList) {
    this.lookupsService
      .getCascadeLookups(CascadeLookupsEnum.GetCoach, rowData.id!)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res) => {
        this.coachOptions.set(res);
      });
    this.pendingBooking.set(rowData);
    this.assignCoachForm.reset();
    this.bookingActionDialogMode.set('assign');
  }

  private openCancelBookingDialog(rowData: IBookingList) {
    this.pendingBooking.set(rowData);
    this.cancelBookingForm.reset({ reason: '' });
    this.bookingActionDialogMode.set('cancel');
  }

  closeBookingActionDialog() {
    this.bookingActionDialogMode.set(null);
    this.pendingBooking.set(null);
    this.assignCoachForm.reset();
    this.cancelBookingForm.reset({ reason: '' });
    this.actionDialogSubmitting.set(false);
  }

  submitAssignCoach() {
    if (this.assignCoachForm.invalid) {
      this.assignCoachForm.markAllAsTouched();
      return;
    }
    const booking = this.pendingBooking();
    const coachIdRaw = this.assignCoachForm.value.coachId;
    if (!booking || coachIdRaw == null) {
      return;
    }
    const coachId = Number(coachIdRaw);
    this.actionDialogSubmitting.set(true);
    this.bookingService
      .assignCoach(booking.id, coachId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.closeBookingActionDialog();
          this.getBookingsList();
        },
        error: () => {
          this.actionDialogSubmitting.set(false);
        },
      });
  }

  submitCancelBooking() {
    if (this.cancelBookingForm.invalid) {
      this.cancelBookingForm.markAllAsTouched();
      return;
    }
    const booking = this.pendingBooking();
    const reason = this.cancelBookingForm.value.reason?.trim();
    if (!booking || !reason) {
      return;
    }
    this.actionDialogSubmitting.set(true);
    this.bookingService
      .cancelBooking({ bookingId: booking.id, reason: reason })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.closeBookingActionDialog();
          this.getBookingsList();
        },
        error: () => {
          this.actionDialogSubmitting.set(false);
        },
      });
  }

  private onComplete(rowData: IBookingList) {
    this.confirmationService.confirm({
      message: this.translate('messages.confirmComplete'),
      header: this.translate('common.confirm'),
      icon: 'pi pi-exclamation-triangle text-(--primary-500)!',
      acceptButtonStyleClass: 'p-button-success',
      accept: () => {
        this.bookingService
          .completeBooking(rowData.id)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(() => {
            this.getBookingsList();
          });
      },
    });
  }
}
