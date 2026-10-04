import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, output, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { take } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  ButtonComponent,
  InputNumberComponent,
  SelectComponent,
  TextAreaComponent,
  ToastService,
  ToastType,
} from '@EsmailElturky/ui-kit';
import { DialogModule } from 'primeng/dialog';
import { Lookups } from 'src/app/shared/services';
import { LookupsEnum } from 'src/app/shared/enums';
import { OrganizationTransactionService } from '../../services/organization-transaction.service';
import { MEMBERSHIP_TYPES_REQUIRING_PERCENTAGE } from '../../constants/membership-type.constants';

@Component({
  selector: 'app-transaction-action-dialogs',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    ReactiveFormsModule,
    DialogModule,
    SelectComponent,
    InputNumberComponent,
    TextAreaComponent,
    ButtonComponent,
  ],
  templateUrl: './transaction-action-dialogs.html',
})
export class TransactionActionDialogs {
  private readonly organizationTransaction = inject(OrganizationTransactionService);
  private readonly lookups = inject(Lookups);
  private readonly destroyRef = inject(DestroyRef);
  private readonly translateService = inject(TranslateService);
  private readonly toast = inject(ToastService);

  /** Emitted after approve or disapprove succeeds. */
  actionCompleted = output<void>();

  approveVisible = signal(false);
  disapproveVisible = signal(false);
  pendingOrganizationId = signal<number | null>(null);
  submitting = signal(false);

  membershipOptions = signal<{ label: string; value: number }[]>([]);

  approveForm = new FormGroup({
    membershipTypeId: new FormControl<number | null>(null, Validators.required),
    fixedValue: new FormControl<number | null>(null, Validators.required),
    percentage: new FormControl<number | null>(0),
  });

  disapproveForm = new FormGroup({
    reason: new FormControl('', [Validators.required, Validators.maxLength(2000)]),
  });

  constructor() {
    this.lookups
      .getLookup(LookupsEnum.GetMembershipType)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res) => {
        const list = Array.isArray(res) ? res : [];
        this.membershipOptions.set(
          list.map((x: { id: number | string; name: string }) => ({
            label: x.name,
            value: Number(x.id),
          })),
        );
      });

    this.approveForm
      .get('membershipTypeId')
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((id) => this.applyPercentageRules(id));
  }

  translate = (key: string) => this.translateService.instant(key);

  requiresPercentage(): boolean {
    const id = this.approveForm.get('membershipTypeId')?.value;
    return id != null && MEMBERSHIP_TYPES_REQUIRING_PERCENTAGE.includes(Number(id));
  }

  onApproveVisibleChange(visible: boolean): void {
    this.approveVisible.set(visible);
    if (!visible) {
      this.pendingOrganizationId.set(null);
      this.approveForm.reset({
        membershipTypeId: null,
        fixedValue: null,
        percentage: 0,
      });
      this.applyPercentageRules(null);
    }
  }

  onDisapproveVisibleChange(visible: boolean): void {
    this.disapproveVisible.set(visible);
    if (!visible) {
      this.pendingOrganizationId.set(null);
      this.disapproveForm.reset({ reason: '' });
    }
  }

  openApprove(organizationId: number): void {
    this.pendingOrganizationId.set(organizationId);
    this.approveForm.reset({
      membershipTypeId: null,
      fixedValue: null,
      percentage: 0,
    });
    this.applyPercentageRules(null);
    this.approveVisible.set(true);
  }

  openDisapprove(organizationId: number): void {
    this.pendingOrganizationId.set(organizationId);
    this.disapproveForm.reset({ reason: '' });
    this.disapproveVisible.set(true);
  }

  dismissApprove(): void {
    this.approveVisible.set(false);
  }

  dismissDisapprove(): void {
    this.disapproveVisible.set(false);
  }

  submitApprove(): void {
    const pctCtrl = this.approveForm.get('percentage');
    if (this.requiresPercentage()) {
      pctCtrl?.setValidators([Validators.required]);
    } else {
      pctCtrl?.clearValidators();
    }
    pctCtrl?.updateValueAndValidity();

    if (this.approveForm.invalid) {
      this.approveForm.markAllAsTouched();
      return;
    }

    const orgId = this.pendingOrganizationId();
    if (orgId == null) return;

    const membershipTypeId = Number(this.approveForm.value.membershipTypeId);
    const fixedValue = Number(this.approveForm.value.fixedValue);
    const percentage = this.requiresPercentage() ? Number(this.approveForm.value.percentage) : 0;

    this.submitting.set(true);
    this.organizationTransaction
      .approve({
        membershipTypeId,
        fixedValue,
        percentage,
        organizationId: orgId,
      })
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.submitting.set(false);
          this.toast.addToast(
            ToastType.Success,
            this.translate('common.success'),
            this.translate('requests.approveSuccess'),
          );
          this.approveVisible.set(false);
          this.actionCompleted.emit();
        },
        error: () => {
          this.submitting.set(false);
        },
      });
  }

  submitDisapprove(): void {
    if (this.disapproveForm.invalid) {
      this.disapproveForm.markAllAsTouched();
      return;
    }
    const orgId = this.pendingOrganizationId();
    if (orgId == null) return;

    this.submitting.set(true);
    this.organizationTransaction
      .disapprove({
        organizationId: orgId,
        reason: (this.disapproveForm.value.reason ?? '').trim(),
      })
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.submitting.set(false);
          this.toast.addToast(
            ToastType.Success,
            this.translate('common.success'),
            this.translate('requests.disapproveSuccess'),
          );
          this.disapproveVisible.set(false);
          this.actionCompleted.emit();
        },
        error: () => {
          this.submitting.set(false);
        },
      });
  }

  private applyPercentageRules(membershipTypeId: number | null): void {
    const pct = this.approveForm.get('percentage');
    if (
      membershipTypeId != null &&
      MEMBERSHIP_TYPES_REQUIRING_PERCENTAGE.includes(Number(membershipTypeId))
    ) {
      pct?.setValidators([Validators.required]);
    } else {
      pct?.clearValidators();
      pct?.setValue(0, { emitEvent: false });
    }
    pct?.updateValueAndValidity({ emitEvent: false });
  }
}
