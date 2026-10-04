import { CommonModule } from '@angular/common';
import { Component, computed, DestroyRef, effect, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { TranslateModule } from '@ngx-translate/core';
import {
  ButtonComponent,
  DatePickerComponent,
  FileInputComponent,
  InputNumberComponent,
  InputPasswordComponent,
  InputTextComponent,
  MapInputComponent,
  MobileInputComponent,
  MultiSelectComponent,
  RadioButtonComponent,
  SelectComponent,
  TextAreaComponent,
  ToastService,
  ToastType,
} from '@EsmailElturky/ui-kit';
import { map } from 'rxjs';
import { TranslationService } from 'src/app/core/services';
import { environment } from 'src/environments/environment';
import { LookupsEnum } from 'src/app/shared/enums';
import { extractCode, extractNumber, toFormData, transformDate } from 'src/app/shared/functions';
import { Lookups } from 'src/app/shared/services';
import { ClubManagementService } from '../../services';
import { IOrganizationDetail } from '../../interfaces';
import { MEMBERSHIP_TYPES_REQUIRING_PERCENTAGE } from 'src/app/features/requests/constants/membership-type.constants';

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

function passwordsMatch(): ValidatorFn {
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
  if (Array.isArray(value)) {
    for (const item of value) {
      if (item instanceof File) return item;
    }
  }
  return null;
}

function filesFromControl(value: unknown): File[] {
  if (!value) return [];
  if (value instanceof File) return [value];
  if (Array.isArray(value)) {
    return value.filter((item): item is File => item instanceof File);
  }
  return [];
}

function formatPhoneForInput(
  countryCode: string | null | undefined,
  phoneNumber: string | null | undefined,
): string {
  if (!phoneNumber) return '';
  const raw = String(countryCode ?? '').trim();
  const code = raw ? (raw.startsWith('+') ? raw : `+${raw}`) : '+966';
  return `(${code})${String(phoneNumber).replace(/\s/g, '')}`;
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

@Component({
  selector: 'app-add-organization',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    ReactiveFormsModule,
    InputTextComponent,
    InputPasswordComponent,
    FileInputComponent,
    ButtonComponent,
    MobileInputComponent,
    SelectComponent,
    MultiSelectComponent,
    MapInputComponent,
    DatePickerComponent,
    TextAreaComponent,
    InputNumberComponent,
    RadioButtonComponent,
  ],
  templateUrl: './add-organization.html',
  styleUrl: './add-organization.scss',
})
export class AddOrganization {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private clubManagement = inject(ClubManagementService);
  private lookups = inject(Lookups);
  private destroyRef = inject(DestroyRef);
  private toast = inject(ToastService);
  private translate = inject(TranslationService);

  readonly imageApi = environment.imageApi;

  organizationId = signal<string | null>(null);
  routeParams = toSignal(this.route.paramMap);
  isEdit = computed(() => !!this.organizationId());
  saving = signal(false);
  loading = signal(false);

  organizationForm = new FormGroup({
    nameEn: new FormControl('', Validators.required),
    nameAr: new FormControl('', Validators.required),
    email: new FormControl('', [Validators.required, Validators.email]),
    phone: new FormControl('', Validators.required),
    cityId: new FormControl<number | null>(null, Validators.required),
    mapLocation: new FormControl<unknown>(null, Validators.required),
    description: new FormControl(''),
    descriptionAr: new FormControl(''),
    about: new FormControl(''),
    aboutAr: new FormControl(''),
    logo: new FormControl<unknown>(null, [Validators.required, requiredFileValue()]),
    cover: new FormControl<unknown>(null, [Validators.required, requiredFileValue()]),
    sports: new FormControl<number[]>([], [Validators.required, nonEmptyIdsValidator()]),
    attachments: new FormControl<File[]>([]),
    membershipTypeId: new FormControl<number | null>(null, Validators.required),
    fixedValue: new FormControl<number | null>(null, Validators.required),
    percentage: new FormControl<number | null>(0),
    user: new FormGroup(
      {
        email: new FormControl('', [Validators.required, Validators.email]),
        password: new FormControl('', [Validators.required, Validators.minLength(8)]),
        confirmPassword: new FormControl('', Validators.required),
        fullName: new FormControl('', Validators.required),
        phone: new FormControl('', Validators.required),
        dateOfBirth: new FormControl<string | Date | null>(null),
        address: new FormControl(''),
        imageProfile: new FormControl<unknown>(null, [Validators.required, requiredFileValue()]),
        gender: new FormControl<number | null>(null, Validators.required),
      },
      { validators: passwordsMatch() },
    ),
  });

  get userGroup(): FormGroup {
    return this.organizationForm.get('user') as FormGroup;
  }

  fileValidation = {
    maxFileSize: 5 * 1024 * 1024,
    allowedFileTypes: ['image/jpeg', 'image/png'],
  };

  cityOptions = toSignal(
    this.lookups
      .getLookup(LookupsEnum.GetCity)
      .pipe(map((rows) => rows.map((r: { id: number; name: string }) => ({ label: r.name, value: Number(r.id) })))),
    { initialValue: [] as { label: string; value: number }[] },
  );

  sportOptions = toSignal(
    this.lookups
      .getLookup(LookupsEnum.GetSport)
      .pipe(map((rows) => rows.map((r: { id: number; name: string }) => ({ label: r.name, value: Number(r.id) })))),
    { initialValue: [] as { label: string; value: number }[] },
  );

  membershipOptions = toSignal(
    this.lookups
      .getLookup(LookupsEnum.GetMembershipType)
      .pipe(map((rows) => rows.map((r: { id: number; name: string }) => ({ label: r.name, value: Number(r.id) })))),
    { initialValue: [] as { label: string; value: number }[] },
  );

  genderOptions = toSignal(
    this.lookups
      .getLookup(LookupsEnum.GetGenderType)
      .pipe(map((rows) => rows.map((r: { id: number; name: string }) => ({ label: r.name, value: Number(r.id) })))),
    { initialValue: [] as { label: string; value: number }[] },
  );

  phoneCountryCodeOptions = toSignal(this.lookups.getLookup(LookupsEnum.GetCountryCode), {
    initialValue: [] as { label: string; value: { code: string; flag: string; regex: string } }[],
  });

  requiresMembershipPercentage = computed(() => {
    const id = this.organizationForm.get('membershipTypeId')?.value;
    return id != null && MEMBERSHIP_TYPES_REQUIRING_PERCENTAGE.includes(Number(id));
  });

  maxDate = new Date();

  constructor() {
    effect(() => {
      const id = this.routeParams()?.get('id') ?? null;
      this.organizationId.set(id);
      if (id) {
        this.applyEditModeValidators();
        this.loadOrganization(Number(id));
      } else {
        this.applyAddModeValidators();
      }
    });

    this.organizationForm
      .get('membershipTypeId')
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((membershipId) => {
        const percentageCtrl = this.organizationForm.get('percentage');
        if (membershipId != null && MEMBERSHIP_TYPES_REQUIRING_PERCENTAGE.includes(Number(membershipId))) {
          percentageCtrl?.setValidators([Validators.required]);
        } else {
          percentageCtrl?.clearValidators();
          percentageCtrl?.setValue(0);
        }
        percentageCtrl?.updateValueAndValidity({ emitEvent: false });
      });
  }

  private applyAddModeValidators(): void {
    this.organizationForm.get('logo')?.setValidators([Validators.required, requiredFileValue()]);
    this.organizationForm.get('cover')?.setValidators([Validators.required, requiredFileValue()]);
    this.organizationForm.get('cityId')?.setValidators(Validators.required);
    this.organizationForm.get('membershipTypeId')?.setValidators(Validators.required);
    this.organizationForm.get('fixedValue')?.setValidators(Validators.required);
    this.userGroup.get('email')?.setValidators([Validators.required, Validators.email]);
    this.userGroup.get('password')?.setValidators([Validators.required, Validators.minLength(8)]);
    this.userGroup.get('confirmPassword')?.setValidators(Validators.required);
    this.userGroup.get('fullName')?.setValidators(Validators.required);
    this.userGroup.get('phone')?.setValidators(Validators.required);
    this.userGroup.get('imageProfile')?.setValidators([Validators.required, requiredFileValue()]);
    this.userGroup.get('gender')?.setValidators(Validators.required);
    this.organizationForm.updateValueAndValidity({ emitEvent: false });
  }

  private applyEditModeValidators(): void {
    this.organizationForm.get('logo')?.clearValidators();
    this.organizationForm.get('cover')?.clearValidators();
    this.organizationForm.get('cityId')?.clearValidators();
    this.organizationForm.get('membershipTypeId')?.clearValidators();
    this.organizationForm.get('fixedValue')?.clearValidators();
    this.userGroup.get('email')?.clearValidators();
    this.userGroup.get('password')?.clearValidators();
    this.userGroup.get('confirmPassword')?.clearValidators();
    this.userGroup.get('fullName')?.clearValidators();
    this.userGroup.get('phone')?.clearValidators();
    this.userGroup.get('imageProfile')?.clearValidators();
    this.userGroup.get('gender')?.clearValidators();
    this.organizationForm.updateValueAndValidity({ emitEvent: false });
  }

  private loadOrganization(id: number): void {
    this.loading.set(true);
    this.clubManagement
      .getOrganizationById(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.patchFormFromDetail(data);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  private patchFormFromDetail(data: IOrganizationDetail): void {
    this.organizationForm.patchValue({
      nameEn: data.name,
      nameAr: data.nameAr,
      email: data.email,
      phone: formatPhoneForInput(data.countryCode, data.phoneNumber),
      cityId: data.cityId,
      mapLocation: {
        address: data.address,
        latitude: data.latitude,
        longitude: data.longitude,
        urlMap: data.urlMap,
      },
      description: data.description ?? '',
      descriptionAr: data.descriptionAr ?? '',
      about: data.about ?? '',
      aboutAr: data.aboutAr ?? '',
      sports: data.sports?.map((s) => s.id) ?? [],
      logo: data.logoName ? `${this.imageApi}/${data.logoName}` : null,
      cover: data.coverName ? `${this.imageApi}/${data.coverName}` : null,
      attachments: [],
    });
  }

  save() {
    this.organizationForm.markAllAsTouched();
    if (this.organizationForm.invalid) {
      return;
    }

    this.saving.set(true);

    const onSuccess = () => {
      this.saving.set(false);
      this.toast.addToast(
        ToastType.Success,
        this.translate.instant('common.success'),
        this.translate.instant('messages.saveSuccess'),
      );
      this.router.navigate(['/club-management/organizations']);
    };

    const onError = () => this.saving.set(false);

    if (this.isEdit()) {
      this.clubManagement
        .editOrganizationProfile(this.buildEditProfileFormData())
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({ next: onSuccess, error: onError });
    } else {
      this.clubManagement
        .addClub(this.buildAddClubFormData())
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({ next: onSuccess, error: onError });
    }
  }

  private buildEditProfileFormData(): FormData {
    const v = this.organizationForm.getRawValue();
    const map = parseMapLocation(v.mapLocation);
    const logoFile = firstFileFromControl(v.logo);
    const coverFile = firstFileFromControl(v.cover);
    const newAttachments = filesFromControl(v.attachments);

    const payload: Record<string, unknown> = {
      Id: Number(this.organizationId()),
      Name: v.nameEn,
      NameAr: v.nameAr,
      Email: v.email,
      CountryCode: extractCode(v.phone as string),
      PhoneNumber: extractNumber(v.phone as string),
      Latitude: map.latitude,
      Longitude: map.longitude,
      Address: map.address || (typeof v.mapLocation === 'string' ? v.mapLocation : ''),
      UrlMap: map.urlMap,
      Description: v.description ?? '',
      DescriptionAr: v.descriptionAr ?? '',
      About: v.about ?? '',
      AboutAr: v.aboutAr ?? '',
      Sports: (v.sports ?? []).map((id) => Number(id)),
    };

    if (v.cityId != null) {
      payload['CityId'] = Number(v.cityId);
    }
    if (logoFile) {
      payload['LogoFile'] = logoFile;
    }
    if (coverFile) {
      payload['CoverProfile'] = coverFile;
    }
    if (newAttachments.length) {
      payload['Attachments'] = newAttachments;
    }

    return toFormData(payload, { nestedObjects: 'dot' });
  }

  private buildAddClubFormData(): FormData {
    const v = this.organizationForm.getRawValue();
    const user = v.user!;
    const map = parseMapLocation(v.mapLocation);

    const logoFile = firstFileFromControl(v.logo);
    const coverFile = firstFileFromControl(v.cover);
    const imageProfileFile = firstFileFromControl(user.imageProfile);

    const dobRaw = user.dateOfBirth;
    const dateOfBirth =
      dobRaw instanceof Date
        ? transformDate(dobRaw.toISOString())
        : dobRaw
          ? transformDate(String(dobRaw))
          : '';

    const payload: Record<string, unknown> = {
      Name: v.nameEn,
      NameAr: v.nameAr,
      Email: v.email,
      CountryCode: extractCode(v.phone as string),
      PhoneNumber: extractNumber(v.phone as string),
      CityId: Number(v.cityId),
      Latitude: map.latitude,
      Longitude: map.longitude,
      Address: map.address || (typeof v.mapLocation === 'string' ? v.mapLocation : ''),
      UrlMap: map.urlMap,
      Description: v.description ?? '',
      DescriptionAr: v.descriptionAr ?? '',
      Sports: (v.sports ?? []).map((id) => Number(id)),
      User: {
        Email: user.email,
        Password: user.password,
        ConfirmPassword: user.confirmPassword,
        FullName: user.fullName,
        CountryCode: extractCode(user.phone as string),
        PhoneNumber: extractNumber(user.phone as string),
        DateOfBirth: dateOfBirth,
        Address: user.address ?? '',
        Gender: user.gender,
        ...(imageProfileFile ? { ImageProfile: imageProfileFile } : {}),
      },
      MembershipType: {
        MembershipTypeId: Number(v.membershipTypeId),
        FixedValue: Number(v.fixedValue),
        Percentage: Number(v.percentage ?? 0),
      },
    };

    if (logoFile) payload['LogoFile'] = logoFile;
    if (coverFile) payload['CoverFile'] = coverFile;

    return toFormData(payload, { nestedObjects: 'dot' });
  }

  cancel() {
    this.router.navigate(['/club-management/organizations']);
  }
}
