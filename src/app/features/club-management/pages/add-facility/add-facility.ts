import { CommonModule } from '@angular/common';
import { Component, DestroyRef, effect, inject, signal } from '@angular/core';
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
import { map } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import {
  ButtonComponent,
  FileInputComponent,
  InputNumberComponent,
  InputTextComponent,
  MultiSelectComponent,
  SelectComponent,
  TextAreaComponent,
} from '@EsmailElturky/ui-kit';
import { environment } from 'src/environments/environment';
import { IFileValidation } from 'src/app/shared/interfaces';
import { LookupsEnum } from 'src/app/shared/enums';
import { toFormData } from 'src/app/shared/functions';
import { Lookups } from 'src/app/shared/services';
import { OrganizationFacilityService } from 'src/app/features/profile/services/organization-facility.service';

function sportIdsRequired(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const v = control.value;
    return Array.isArray(v) && v.length > 0 ? null : { sportIdsRequired: true };
  };
}

function filesFromControl(value: unknown): File[] {
  if (!value) return [];
  if (value instanceof File) return [value];
  if (Array.isArray(value)) {
    return value.filter((item): item is File => item instanceof File);
  }
  return [];
}

@Component({
  selector: 'app-add-facility',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    InputTextComponent,
    InputNumberComponent,
    MultiSelectComponent,
    SelectComponent,
    FileInputComponent,
    TextAreaComponent,
    ButtonComponent,
  ],
  templateUrl: './add-facility.html',
  styleUrl: './add-facility.scss',
})
export class AddFacility {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  private facilityService = inject(OrganizationFacilityService);
  private lookups = inject(Lookups);

  facilityId = signal<string | null>(null);
  isEdit = signal(false);
  saving = signal(false);
  routeParams = toSignal(this.route.paramMap);
  private lastLoadedId: string | null = null;

  fileValidation: IFileValidation = {
    maxFileSize: 5 * 1024 * 1024,
    allowedFileTypes: ['image/jpeg', 'image/png'],
    maxFiles: 5,
  };

  organizationOptions = toSignal(
    this.lookups
      .getLookup(LookupsEnum.GetOrganization)
      .pipe(
        map((items: { id: string; name: string }[]) =>
          items.map((i) => ({ label: i.name, value: i.id })),
        ),
      ),
    { initialValue: [] as { label: string; value: string }[] },
  );

  sportOptions = toSignal(
    this.lookups
      .getLookup(LookupsEnum.GetSport)
      .pipe(
        map((items: { id: string; name: string }[]) =>
          items.map((i) => ({ label: i.name, value: i.id })),
        ),
      ),
    { initialValue: [] as { label: string; value: string }[] },
  );

  facilityForm = new FormGroup({
    organizationId: new FormControl<string | null>(null, Validators.required),
    name: new FormControl('', Validators.required),
    nameAr: new FormControl('', Validators.required),
    description: new FormControl(''),
    descriptionAr: new FormControl(''),
    width: new FormControl<number | null>(null, Validators.required),
    height: new FormControl<number | null>(null, Validators.required),
    sports: new FormControl<string[]>([], sportIdsRequired()),
    attachments: new FormControl<(File | string)[]>([]),
  });

  constructor() {
    effect(() => {
      const idParam = this.routeParams()?.get('id') ?? null;
      this.facilityId.set(idParam);
      this.isEdit.set(!!idParam);

      if (!idParam) {
        this.lastLoadedId = null;
        this.facilityForm.reset({
          organizationId: null,
          name: '',
          nameAr: '',
          description: '',
          descriptionAr: '',
          width: null,
          height: null,
          sports: [],
          attachments: [],
        });
        return;
      }

      const numericId = Number(idParam);
      if (!Number.isFinite(numericId)) {
        return;
      }

      if (this.lastLoadedId === idParam) {
        return;
      }
      this.lastLoadedId = idParam;
      this.loadFacility(numericId);
    });
  }

  private loadFacility(id: number) {
    this.facilityService
      .getById(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data) => {
        this.facilityForm.patchValue({
          organizationId: String(data.organizationId),
          name: data.name ?? '',
          nameAr: data.nameAr ?? '',
          description: data.description ?? '',
          descriptionAr: data.descriptionAr ?? '',
          width: data.width ?? null,
          height: data.height ?? null,
          sports: data.sports?.map((s) => String(s.id)) ?? [],
          attachments:
            data.attachments
              ?.map((a: { attachmentName?: string; fileName?: string; thumbnail?: string }) => {
                const name = a?.attachmentName ?? a?.fileName ?? a?.thumbnail;
                return name ? `${environment.imageApi}/${name}` : null;
              })
              .filter((x): x is string => !!x) ?? [],
        });
      });
  }

  save() {
    if (this.facilityForm.invalid) {
      this.facilityForm.markAllAsTouched();
      return;
    }

    const v = this.facilityForm.getRawValue();
    const payload: Record<string, unknown> = {
      OrganizationId: Number(v.organizationId),
      Name: v.name,
      NameAr: v.nameAr,
      Description: v.description ?? '',
      DescriptionAr: v.descriptionAr ?? '',
      Width: v.width,
      Height: v.height,
      Sports: (v.sports ?? []).map((id) => Number(id)),
      Attachments: filesFromControl(v.attachments),
    };

    if (this.isEdit()) {
      payload['Id'] = Number(this.facilityId());
    }

    this.saving.set(true);
    const formData = toFormData(payload);
    const request = this.isEdit()
      ? this.facilityService.edit(formData)
      : this.facilityService.add(formData);

    request.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.saving.set(false);
        this.router.navigate(['/club-management/facilities']);
      },
      error: () => this.saving.set(false),
    });
  }

  cancel() {
    this.router.navigate(['/club-management/facilities']);
  }
}
