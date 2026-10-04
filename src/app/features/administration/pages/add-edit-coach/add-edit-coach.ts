import { Component, DestroyRef, effect, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import {
  ButtonComponent,
  FileInputComponent,
  InputPasswordComponent,
  InputTextComponent,
  RadioButtonComponent,
  MobileInputComponent,
  DatePickerComponent,
} from '@EsmailElturky/ui-kit';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { AdministrationService } from '../../services';
import { Lookups } from 'src/app/shared/services';
import { LookupsEnum } from 'src/app/shared/enums';
import { map } from 'rxjs';
import { extractCode, extractNumber, toFormData, transformDate } from 'src/app/shared/functions';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-add-edit-coach',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    InputTextComponent,
    InputPasswordComponent,
    FileInputComponent,
    ButtonComponent,
    RadioButtonComponent,
    MobileInputComponent,
    DatePickerComponent,
  ],
  templateUrl: './add-edit-coach.html',
  styleUrl: './add-edit-coach.scss',
})
export class AddEditCoach {
  private administration = inject(AdministrationService);
  private lookups = inject(Lookups);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  id = signal<number | null>(null);
  routeParams = toSignal(this.route.paramMap);
  maxDate = new Date();
  imageApi = environment.imageApi;

  coachForm = new FormGroup({
    email: new FormControl('', [Validators.email]),
    password: new FormControl(''),
    confirmPassword: new FormControl(''),
    fullName: new FormControl('', Validators.required),
    phone: new FormControl('', Validators.required),
    dateOfBirth: new FormControl('', Validators.required),
    address: new FormControl('', Validators.required),
    gender: new FormControl<number | null>(null, Validators.required),
    attachment: new FormControl<string | File | null>(null),
  });

  genderOptions = toSignal(
    this.lookups.getLookup(LookupsEnum.GetGenderType).pipe(
      map((genders: { id: string; name: string }[]) =>
        genders.map((g) => ({
          label: g.name,
          value: Number(g.id),
        })),
      ),
    ),
    { initialValue: [] },
  );

  phoneCountryCodeOptions = toSignal(this.lookups.getLookup(LookupsEnum.GetCountryCode), {
    initialValue: [],
  });

  fileValidation = {
    maxFileSize: 5 * 1024 * 1024,
    allowedFileTypes: ['image/jpeg', 'image/png'],
  };

  constructor() {
    effect(() => {
      const idParam = this.routeParams()?.get('id');
      const parsed = idParam != null && idParam !== '' ? Number(idParam) : null;
      this.id.set(Number.isFinite(parsed as number) ? (parsed as number) : null);

      if (this.id()) {
        this.coachForm.controls.password.clearValidators();
        this.coachForm.controls.confirmPassword.clearValidators();
        this.getCoach();
      } else {
        this.coachForm.controls.password.setValidators([
          Validators.required,
          Validators.minLength(8),
        ]);
        this.coachForm.controls.confirmPassword.setValidators([Validators.required]);
      }
      this.coachForm.controls.password.updateValueAndValidity();
      this.coachForm.controls.confirmPassword.updateValueAndValidity();
    });
  }

  getCoach() {
    const coachId = this.id();
    if (coachId == null) {
      return;
    }
    this.administration
      .getCoachById(coachId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((coach) => {
        const code = coach.countryCode ?? '+966';
        const phone = coach.phoneNumber ? `(${code})${coach.phoneNumber}` : '';
        this.coachForm.patchValue({
          email: coach.email ?? '',
          fullName: coach.fullName,
          dateOfBirth: new Date(coach.dateOfBirth) as unknown as string,
          address: coach.address ?? '',
          gender: coach.gender,
          phone: `(${coach.countryCode})${coach.phoneNumber}`,
          attachment: coach.imageName ? `${this.imageApi}/${coach.imageName}` : '',
        });
      });
  }

  save() {
    if (this.coachForm.invalid) {
      this.coachForm.markAllAsTouched();
      return;
    }
    const formValue = this.coachForm.getRawValue();
    let body: any = {
      email: formValue.email!,
      fullName: formValue.fullName!,
      countryCode: extractCode(formValue.phone as string),
      phoneNumber: extractNumber(formValue.phone as string),
      dateOfBirth: transformDate(formValue.dateOfBirth as unknown as string),
      address: formValue.address!,
      gender: formValue.gender!,
      attachment: formValue.attachment!,
    };
    if (formValue.password) {
      body.password = formValue.password!;
      body.confirmPassword = formValue.confirmPassword!;
    }
    if (this.id()) {
      body.id = this.id()!;
    }
    const formData = toFormData(body);
    if (this.id()) {
      this.administration
        .updateCoach(formData)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => {
          this.router.navigate(['/administration/coaches']);
        });
    } else {
      this.administration
        .addCoach(formData)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => {
          this.router.navigate(['/administration/coaches']);
        });
    }
  }

  cancel() {
    this.router.navigate(['/administration/coaches']);
  }
}
