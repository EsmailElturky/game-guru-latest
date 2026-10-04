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
  TextAreaComponent,
} from '@EsmailElturky/ui-kit';
import { CommonModule } from '@angular/common';
import { environment } from 'src/environments/environment';
import { IFileValidation } from 'src/app/shared/interfaces';
import { OrganizationFacilityService } from '../../services/organization-facility.service';
import { LocalStorage } from 'src/app/core/services';
import { Lookups } from 'src/app/shared/services';
import { LookupsEnum } from 'src/app/shared/enums';
import { toFormData } from 'src/app/shared/functions';
import { profileReturnQuery } from '../../profile-tab.constants';

function sportIdsRequired(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const v = control.value;
    return Array.isArray(v) && v.length > 0 ? null : { sportIdsRequired: true };
  };
}

@Component({
  selector: 'app-add-edit-court',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    InputTextComponent,
    TextAreaComponent,
    ButtonComponent,
    InputNumberComponent,
    MultiSelectComponent,
    FileInputComponent,
  ],
  templateUrl: './add-edit-court.html',
  styleUrl: './add-edit-court.scss',
})
export class AddEditCourt {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  private organizationFacilityService = inject(OrganizationFacilityService);
  private localStorage = inject(LocalStorage);
  private lookups = inject(Lookups);

  courtId = signal<string | null>(null);
  isEdit = signal(false);
  routeParams = toSignal(this.route.paramMap);
  saving = signal(false);
  private lastLoadedId: string | null = null;

  fileValidation: IFileValidation = {
    maxFileSize: 5 * 1024 * 1024,
    allowedFileTypes: ['image/jpeg', 'image/png'],
    maxFiles: 5,
  };

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

  courtForm = new FormGroup({
    name: new FormControl('', Validators.required),
    nameAr: new FormControl('', Validators.required),
    description: new FormControl(''),
    descriptionAr: new FormControl(''),
    Sports: new FormControl<string[]>([], sportIdsRequired()),
    width: new FormControl<number | null>(null, Validators.required),
    height: new FormControl<number | null>(null, Validators.required),
    Attachments: new FormControl<(File | string)[]>([]),
  });

  constructor() {
    effect(() => {
      const idParam = this.routeParams()?.get('id') ?? null;
      this.courtId.set(idParam);
      this.isEdit.set(!!idParam);

      if (!idParam) {
        this.lastLoadedId = null;
        this.courtForm.reset({
          name: '',
          nameAr: '',
          description: '',
          descriptionAr: '',
          Sports: [],
          width: null,
          height: null,
          Attachments: [],
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
    this.organizationFacilityService
      .getById(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data) => {
        this.courtForm.patchValue({
          name: data.name ?? '',
          nameAr: data.nameAr ?? '',
          description: data.description ?? '',
          descriptionAr: data.descriptionAr ?? '',
          Sports: data.sports?.map((s) => String(s.id)) ?? [],
          width: data.width ?? null,
          height: data.height ?? null,
          Attachments:
            data.attachments
              ?.map((a: { attachmentName?: string; fileName?: string }) => {
                const name = a?.attachmentName ?? a?.fileName;
                return name ? `${environment.imageApi}/${name}` : null;
              })
              .filter((x): x is string => !!x) ?? [],
        });
      });
  }

  save() {
    if (this.courtForm.invalid) {
      this.courtForm.markAllAsTouched();
      return;
    }

    let bodyData: Record<string, unknown> = { ...this.courtForm.getRawValue() };
    bodyData['organizationId'] = JSON.parse(
      this.localStorage.getItem('game_guru_user') ?? '{}',
    ).organizationId;

    if (this.isEdit()) {
      bodyData['id'] = Number(this.courtId());
    }

    this.saving.set(true);
    const formData = toFormData(bodyData);
    const request = this.isEdit()
      ? this.organizationFacilityService.edit(formData)
      : this.organizationFacilityService.add(formData);

    request.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.saving.set(false);
        this.router.navigate(['/profile'], profileReturnQuery('courts'));
      },
      error: () => this.saving.set(false),
    });
  }

  cancel() {
    this.router.navigate(['/profile'], profileReturnQuery('courts'));
  }
}
