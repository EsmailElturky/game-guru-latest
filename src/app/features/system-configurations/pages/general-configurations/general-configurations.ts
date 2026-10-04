import { Component, DestroyRef, effect, inject, OnInit, signal } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { TranslateModule } from '@ngx-translate/core';
import {
  ButtonComponent,
  InputNumberComponent,
  ToastService,
  ToastType,
} from '@EsmailElturky/ui-kit';
import { ConfigurationsService } from '../../services';
import { IConfiguration, MembershipType, RefundPolicy } from '../../interfaces';
import { TranslationService } from 'src/app/core/services';
import { skip } from 'rxjs';
import { AppPage } from 'src/app/core/constants/app-pages';
import { injectPagePermissions } from 'src/app/core/utils/inject-page-permissions';

@Component({
  selector: 'app-general-configurations',
  standalone: true,
  imports: [ReactiveFormsModule, TranslateModule, ButtonComponent, InputNumberComponent],
  templateUrl: './general-configurations.html',
  styleUrl: './general-configurations.scss',
})
export class GeneralConfigurations implements OnInit {
  private fb = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  private configurations = inject(ConfigurationsService);
  private toastService = inject(ToastService);
  private translate = inject(TranslationService);
  readonly perms = injectPagePermissions(AppPage.GeneralConfigurations);

  configForm = this.fb.group({
    paymentSetting: this.fb.group({
      taxPercentage: [0, Validators.required],
      gatewayPercentage: [0, Validators.required],
    }),
    pointSetting: this.fb.group({
      referralValue: [0, Validators.required],
      bookingValue: [0, Validators.required],
    }),
    refundPolicies: this.fb.array<FormGroup>([]),
    // membershipTypes: this.fb.array<FormGroup>([]),
  });

  get refundPolicies() {
    return this.configForm.get('refundPolicies') as FormArray<FormGroup>;
  }

  // get membershipTypes() {
  //   return this.configForm.get('membershipTypes') as FormArray<FormGroup>;
  // }

  constructor() {
    toObservable(this.translate.onLangChange)
      .pipe(skip(1), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.loadConfiguration();
      });
  }

  ngOnInit(): void {
    this.loadConfiguration();
  }

  loadConfiguration() {
    this.configurations
      .getConfiguration()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((config) => {
        this.configForm.patchValue({
          paymentSetting: config.paymentSetting,
          pointSetting: config.pointSetting,
        });

        this.refundPolicies.clear();
        config.refundPolicies.forEach((policy) => {
          this.refundPolicies.push(this.buildRefundGroup(policy));
        });

        // this.membershipTypes.clear();
        // config.membershipTypes.forEach((membership) => {
        //   this.membershipTypes.push(this.buildMembershipGroup(membership));
        // });
      });
  }

  private buildRefundGroup(policy: RefundPolicy): FormGroup {
    return this.fb.group({
      id: [policy.id],
      policyType: [policy.policyType],
      policyTypeName: [policy.policyTypeName],
      policyPercentage: [policy.policyPercentage, Validators.required],
    });
  }

  private buildMembershipGroup(membership: MembershipType): FormGroup {
    return this.fb.group({
      id: [membership.id],
      actionType: [membership.actionType],
      name: [membership.name],
      fixedValue: [membership.fixedValue, Validators.required],
      percentage: [membership.percentage, Validators.required],
    });
  }

  save() {
    if (this.configForm.valid) {
      const payload = this.configForm.getRawValue() as unknown as IConfiguration;
      const body = {
        ...payload,
        // membershipTypes: payload.membershipTypes.map((membership) => ({
        //   id: membership.id,
        //   fixedValue: membership.fixedValue,
        //   percentage: membership.percentage,
        // })),
        refundPolicies: payload.refundPolicies.map((policy) => ({
          id: policy.id,
          policyPercentage: policy.policyPercentage,
        })),
      };

      this.configurations
        .updateConfiguration(body)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => {
          this.toastService.addToast(
            ToastType.Success,
            this.translate.instant('generalConfigurations.updatedSuccessfully'),
            this.translate.instant('configuration.updatedSuccessfullyDescription'),
          );
        });
    } else {
      this.configForm.markAllAsTouched();
    }
  }
}
