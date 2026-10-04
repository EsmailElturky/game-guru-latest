import { Component, inject, signal, computed, effect, OnDestroy, DestroyRef } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { TranslateModule } from '@ngx-translate/core';
import {
  InputTextComponent,
  InputPasswordComponent,
  ButtonComponent,
  MobileInputComponent,
  FileInputComponent,
  MultiSelectComponent,
  SelectComponent,
  OtpComponent,
  MapInputComponent,
  DatePickerComponent,
  TextAreaComponent,
  InputNumberComponent,
} from '@EsmailElturky/ui-kit';
import {
  AbstractControl,
  FormArray,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { TranslationService } from 'src/app/core/services';
import { CommonModule } from '@angular/common';
import { Rtl } from 'src/app/shared/directives';
import { Auth } from '../../services/auth';
import { Lookups } from 'src/app/shared/services';
import { LookupsEnum } from 'src/app/shared/enums';
import { ConfigurationsService } from 'src/app/features/system-configurations/services/configurations/configurations';
import { map } from 'rxjs';
import { extractCode, extractNumber, transformDate, toFormData } from 'src/app/shared/functions';

function nonEmptyIdsValidator(): ValidatorFn {
  return (c: AbstractControl): ValidationErrors | null => {
    const v = c.value;
    if (!Array.isArray(v) || v.length === 0) return { required: true };
    return null;
  };
}

function requiredFileValue(): ValidatorFn {
  return (c: AbstractControl): ValidationErrors | null => {
    const v = c.value;
    if (v == null) return { required: true };
    if (typeof v === 'string' && v.trim() === '') return { required: true };
    if (Array.isArray(v) && v.length === 0) return { required: true };
    return null;
  };
}

function managerPasswordsMatch(): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const g = group as FormGroup;
    const p = g.get('password')?.value as string | undefined;
    const cp = g.get('confirmPassword')?.value as string | undefined;
    if (p && cp && p !== cp) return { passwordMismatch: true };
    return null;
  };
}

function firstFileFromControl(value: unknown): File | null {
  if (!value) return null;
  if (value instanceof File) return value;
  if (Array.isArray(value) && value[0] instanceof File) return value[0] as File;
  return null;
}

function parseMapLocation(value: unknown): {
  address: string;
  latitude: number;
  longitude: number;
  urlMap: string;
} {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const o = value as Record<string, unknown>;
    const lat = Number(o['latitude'] ?? o['lat'] ?? 0);
    const lng = Number(o['longitude'] ?? o['lng'] ?? 0);
    return {
      address: String(o['address'] ?? o['formattedAddress'] ?? ''),
      latitude: Number.isFinite(lat) ? lat : 0,
      longitude: Number.isFinite(lng) ? lng : 0,
      urlMap: String(o['urlMap'] ?? o['url'] ?? o['mapUrl'] ?? ''),
    };
  }
  if (typeof value === 'string') {
    return { address: value, latitude: 0, longitude: 0, urlMap: '' };
  }
  return { address: '', latitude: 0, longitude: 0, urlMap: '' };
}

function maskEmail(email: string): string {
  const at = email.indexOf('@');
  if (at <= 1) return email;
  const local = email.slice(0, at);
  const domain = email.slice(at);
  const visible = Math.min(3, local.length);
  return `${local.slice(0, visible)}****${domain}`;
}

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    InputTextComponent,
    InputPasswordComponent,
    ButtonComponent,
    MobileInputComponent,
    FileInputComponent,
    MultiSelectComponent,
    SelectComponent,
    OtpComponent,
    ReactiveFormsModule,
    Rtl,
    MapInputComponent,
    DatePickerComponent,
    TextAreaComponent,
    InputNumberComponent,
  ],
  templateUrl: './signup.html',
  styleUrl: './signup.scss',
})
export class Signup implements OnDestroy {
  private translateService = inject(TranslationService);
  private router = inject(Router);
  private auth = inject(Auth);
  private lookups = inject(Lookups);
  private configurations = inject(ConfigurationsService);
  private destroyRef = inject(DestroyRef);

  language = this.translateService.currentLang;
  currentStep = signal(1);
  readonly lastStep = 4;

  /** Resend code countdown in seconds (e.g. 120 = 2:00). */
  resendCountdown = signal(0);
  private resendInterval: ReturnType<typeof setInterval> | null = null;
  private timerStartedForOtpStep = false;
  private readonly RESEND_COOLDOWN_SECONDS = 120;

  registeredEmail = signal('');
  isRegistering = signal(false);
  isVerifying = signal(false);
  maxDate = new Date();

  canResend = computed(() => this.resendCountdown() === 0);
  resendTimerFormatted = computed(() => {
    const s = this.resendCountdown();
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  });

  maskedRegisteredEmail = computed(() => maskEmail(this.registeredEmail()));

  signupForm = new FormGroup({
    clubInfo: new FormGroup({
      name: new FormControl('', Validators.required),
      nameAr: new FormControl('', Validators.required),
      phone: new FormControl('', Validators.required),
      email: new FormControl('', [Validators.required, Validators.email]),
      cityId: new FormControl<number | null>(null, Validators.required),
      mapLocation: new FormControl<unknown>(null, Validators.required),
      description: new FormControl('', Validators.required),
      descriptionAr: new FormControl('', Validators.required),
      logo: new FormControl<unknown>(null, [Validators.required, requiredFileValue()]),
      cover: new FormControl<unknown>(null, [Validators.required, requiredFileValue()]),
      resgistrationName: new FormControl('', Validators.required),
      registrationNumber: new FormControl('', Validators.required),
      tradeMarkName: new FormControl('', Validators.required),
      taxNumber: new FormControl('', Validators.required),
      genderType: new FormControl<number | null>(null, Validators.required),
      venueSports: new FormControl<number[]>([], [Validators.required, nonEmptyIdsValidator()]),
    }),
    managerInfo: new FormGroup(
      {
        email: new FormControl('', [Validators.required, Validators.email]),
        password: new FormControl('', [Validators.required, Validators.minLength(8)]),
        confirmPassword: new FormControl('', Validators.required),
        fullName: new FormControl('', Validators.required),
        phone: new FormControl('', Validators.required),
        dateOfBirth: new FormControl<string | Date | null>(null, Validators.required),
        address: new FormControl('', Validators.required),
        imageProfile: new FormControl<unknown>(null, [Validators.required, requiredFileValue()]),
        gender: new FormControl<number | null>(null, Validators.required),
      },
      { validators: managerPasswordsMatch() },
    ),
    facilities: new FormArray<FormGroup>([] as FormGroup[]),
    verification: new FormGroup({
      otp: new FormControl('', [Validators.required, Validators.minLength(4)]),
    }),
  });

  /** Single-facility entry (step 3); saved rows live in `signupForm` facilities array. */
  facilityDraftForm = new FormGroup({
    name: new FormControl('', Validators.required),
    nameAr: new FormControl('', Validators.required),
    width: new FormControl<number | null>(null, Validators.required),
    height: new FormControl<number | null>(null, Validators.required),
    sports: new FormControl<number[]>([], [Validators.required, nonEmptyIdsValidator()]),
  });

  /** Index of the facility being edited, or null when adding a new one. */
  editingFacilityIndex = signal<number | null>(null);

  get clubInfo(): FormGroup {
    return this.signupForm.get('clubInfo') as FormGroup;
  }

  get managerInfo(): FormGroup {
    return this.signupForm.get('managerInfo') as FormGroup;
  }

  get facilities(): FormArray<FormGroup> {
    return this.signupForm.get('facilities') as FormArray<FormGroup>;
  }

  cityOptions = toSignal(
    this.lookups
      .getLookupPublic(LookupsEnum.GetCity)
      .pipe(map((rows) => rows.map((r: any) => ({ label: r.name, value: Number(r.id) })))),
  );
  sportOptions = toSignal(
    this.lookups
      .getLookupPublic(LookupsEnum.GetSport)
      .pipe(map((rows) => rows.map((r: any) => ({ label: r.name, value: Number(r.id) })))),
  );
  orgGenderOptions = toSignal(
    this.lookups
      .getLookupPublic(LookupsEnum.GetOrganizationGenderType)
      .pipe(map((rows) => rows.map((r: any) => ({ label: r.name, value: Number(r.id) })))),
  );
  userGenderOptions = toSignal(
    this.lookups
      .getLookupPublic(LookupsEnum.GetGenderType)
      .pipe(map((rows) => rows.map((r: any) => ({ label: r.name, value: Number(r.id) })))),
  );

  phoneCountryCodeOptions = toSignal(this.lookups.getLookupPublic(LookupsEnum.GetCountryCode), {
    initialValue: [] as { label: string; value: { code: string; flag: string; regex: string } }[],
  });

  fileValidation = {
    maxFileSize: 5 * 1024 * 1024,
    allowedFileTypes: ['image/jpeg', 'image/png'],
  };

  constructor() {
    effect(() => {
      if (this.currentStep() === this.lastStep) {
        if (!this.timerStartedForOtpStep) {
          this.resendCountdown.set(this.RESEND_COOLDOWN_SECONDS);
          this.timerStartedForOtpStep = true;
        }
        if (!this.resendInterval) {
          this.startResendTimer();
        }
      } else {
        this.clearResendTimer();
        this.timerStartedForOtpStep = false;
      }
    });
  }

  private startResendTimer() {
    this.clearResendTimer();
    this.resendInterval = setInterval(() => {
      const next = this.resendCountdown() - 1;
      this.resendCountdown.set(Math.max(0, next));
      if (next <= 0) {
        this.clearResendTimer();
      }
    }, 1000);
  }

  private clearResendTimer() {
    if (this.resendInterval) {
      clearInterval(this.resendInterval);
      this.resendInterval = null;
    }
  }

  resendCode() {
    if (!this.canResend()) return;
    const email = this.registeredEmail();
    if (!email) return;
    this.resendCountdown.set(this.RESEND_COOLDOWN_SECONDS);
    this.startResendTimer();
    this.auth.sendOtp(email, 'organization').pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
  }

  ngOnDestroy() {
    this.clearResendTimer();
  }

  private createFacilityGroupFromValues(v: {
    name: string;
    nameAr: string;
    width: number | null;
    height: number | null;
    sports: number[];
  }): FormGroup {
    return new FormGroup({
      name: new FormControl(v.name, Validators.required),
      nameAr: new FormControl(v.nameAr, Validators.required),
      width: new FormControl(v.width, Validators.required),
      height: new FormControl(v.height, Validators.required),
      sports: new FormControl(v.sports, [Validators.required, nonEmptyIdsValidator()]),
    });
  }

  addOrUpdateFacilityFromDraft() {
    this.facilityDraftForm.markAllAsTouched();
    if (this.facilityDraftForm.invalid) return;
    const v = this.facilityDraftForm.getRawValue() as {
      name: string;
      nameAr: string;
      width: number | null;
      height: number | null;
      sports: number[];
    };
    const row = this.createFacilityGroupFromValues(v);
    const idx = this.editingFacilityIndex();
    if (idx !== null) {
      this.facilities.setControl(idx, row);
      this.editingFacilityIndex.set(null);
    } else {
      this.facilities.push(row);
    }
    this.resetFacilityDraft();
  }

  resetFacilityDraft() {
    this.facilityDraftForm.reset({
      name: '',
      nameAr: '',
      width: null,
      height: null,
      sports: [],
    });
    this.facilityDraftForm.markAsUntouched();
  }

  beginEditFacility(index: number) {
    const fg = this.facilities.at(index) as FormGroup;
    this.facilityDraftForm.patchValue(fg.getRawValue());
    this.editingFacilityIndex.set(index);
  }

  deleteFacility(index: number) {
    const editIdx = this.editingFacilityIndex();
    if (editIdx === index) {
      this.editingFacilityIndex.set(null);
      this.resetFacilityDraft();
    } else if (editIdx !== null && index < editIdx) {
      this.editingFacilityIndex.set(editIdx - 1);
    }
    this.facilities.removeAt(index);
  }

  cancelFacilityEdit() {
    this.editingFacilityIndex.set(null);
    this.resetFacilityDraft();
  }

  facilityRowValue(index: number): {
    name: string;
    nameAr: string;
    width: number | null;
    height: number | null;
    sports: number[];
  } {
    return (this.facilities.at(index) as FormGroup).getRawValue() as {
      name: string;
      nameAr: string;
      width: number | null;
      height: number | null;
      sports: number[];
    };
  }

  sportLabelsForIds(ids: number[] | null | undefined): string {
    const list = ids ?? [];
    const opts = this.sportOptions();
    return list
      .map((id) => opts.find((o: { value: number }) => o.value === id)?.label ?? String(id))
      .join(', ');
  }

  private markCurrentStepTouched(): void {
    const step = this.currentStep();
    if (step === 1) {
      this.clubInfo.markAllAsTouched();
    } else if (step === 2) {
      this.managerInfo.markAllAsTouched();
    } else if (step === 3) {
      this.facilities.markAllAsTouched();
      this.facilities.controls.forEach((c) => c.markAllAsTouched());
    } else if (step === 4) {
      this.signupForm.get('verification')?.markAllAsTouched();
    }
  }

  private isCurrentStepValid(): boolean {
    const step = this.currentStep();
    if (step === 1) return this.clubInfo.valid;
    if (step === 2) return this.managerInfo.valid;
    if (step === 3) return this.facilities.valid && this.facilities.length > 0;
    if (step === 4) return !!this.signupForm.get('verification')?.valid;
    return false;
  }

  nextStep() {
    this.markCurrentStepTouched();
    if (!this.isCurrentStepValid()) return;

    if (this.currentStep() === 3) {
      this.registerClubAndGoToOtp();
      return;
    }

    if (this.currentStep() < this.lastStep - 1) {
      this.currentStep.update((s) => s + 1);
    }
  }

  private registerClubAndGoToOtp() {
    if (this.isRegistering()) return;
    this.isRegistering.set(true);
    const formData = this.buildRegisterClubFormData();
    this.auth
      .registerClub(formData)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.registeredEmail.set(res?.email ?? '');
          this.isRegistering.set(false);
          this.currentStep.set(this.lastStep);
        },
        error: () => {
          this.isRegistering.set(false);
        },
      });
  }

  /**
   * Builds multipart body for RegisterClub. `User` is flattened to `User.Password`, `User.FullName`, …
   * via {@link toFormData} with `nestedObjects: 'dot'` (`User.*`, `Facilities[i].*`); files append as parts.
   */
  private buildRegisterClubFormData(): FormData {
    const club = this.clubInfo.getRawValue();
    const mgr = this.managerInfo.getRawValue();
    const map = parseMapLocation(club.mapLocation);

    const logoFile = firstFileFromControl(club.logo);
    const coverFile = firstFileFromControl(club.cover);
    const imageProfileFile = firstFileFromControl(mgr.imageProfile);

    const dobRaw = mgr.dateOfBirth;
    const dobStr =
      dobRaw instanceof Date ? transformDate(dobRaw.toISOString()) : transformDate(String(dobRaw));

    const userNested = {
      Email: mgr.email,
      Password: mgr.password,
      ConfirmPassword: mgr.confirmPassword,
      FullName: mgr.fullName,
      CountryCode: extractCode(mgr.phone as string),
      PhoneNumber: extractNumber(mgr.phone as string),
      DateOfBirth: dobStr,
      Address: mgr.address,
      Gender: mgr.gender,
    };

    const facilityRows = this.facilities.controls.map((g) => {
      const v = g.getRawValue() as {
        name: string;
        nameAr: string;
        width: number | null;
        height: number | null;
        sports: number[];
      };
      return {
        Name: v.name,
        NameAr: v.nameAr,
        Width: Number(v.width),
        Height: Number(v.height),
        Sports: (v.sports ?? []).map((id: unknown) => Number(id)),
      };
    });

    const payload: Record<string, unknown> = {
      name: club.name,
      nameAr: club.nameAr,
      email: club.email,
      countryCode: extractCode(club.phone as string),
      phoneNumber: extractNumber(club.phone as string),
      cityId: Number(club.cityId),
      latitude: map.latitude,
      longitude: map.longitude,
      address: map.address || (typeof club.mapLocation === 'string' ? club.mapLocation : ''),
      urlMap: map.urlMap,
      description: club.description,
      descriptionAr: club.descriptionAr,
      resgistrationName: club.resgistrationName,
      registrationNumber: club.registrationNumber,
      tradeMarkName: club.tradeMarkName,
      taxNumber: club.taxNumber,
      genderType: club.genderType,
      sports: (club.venueSports ?? []).map((id: unknown) => Number(id)),
      User: userNested,
      Facilities: facilityRows,
    };

    if (logoFile) payload['logoFile'] = logoFile;
    if (coverFile) payload['coverFile'] = coverFile;
    if (imageProfileFile) payload['imageProfile'] = imageProfileFile;

    return toFormData(payload, { nestedObjects: 'dot' });
  }

  prevStep() {
    if (this.currentStep() > 1) {
      this.currentStep.update((s) => s - 1);
    }
  }

  goToStep(step: number) {
    if (step >= 1 && step < this.currentStep()) {
      this.currentStep.set(step);
    }
  }

  verifyOtp() {
    const vg = this.signupForm.get('verification') as FormGroup;
    vg.markAllAsTouched();
    if (vg.invalid || this.isVerifying()) return;
    const email = this.registeredEmail();
    const otp = vg.get('otp')?.value as string;
    if (!email || !otp) return;
    this.isVerifying.set(true);
    this.auth
      .verifyClubOtp({ email, otp })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isVerifying.set(false);
          this.router.navigate(['/auth/thank-you']);
        },
        error: () => {
          this.isVerifying.set(false);
        },
      });
  }

  login() {
    this.router.navigate(['/auth/login']);
  }

  toggleLanguage() {
    this.translateService.changeLanguage(this.language() === 'ar' ? 'en' : 'ar');
  }
}
