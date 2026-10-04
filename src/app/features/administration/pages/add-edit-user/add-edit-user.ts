import { Component, DestroyRef, effect, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  ButtonComponent,
  FileInputComponent,
  InputPasswordComponent,
  InputTextComponent,
  RadioButtonComponent,
  MobileInputComponent,
  SelectComponent,
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
import { ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-add-edit-user',
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
    SelectComponent,
    DatePickerComponent,
  ],
  templateUrl: './add-edit-user.html',
  styleUrl: './add-edit-user.scss',
})
export class AddEditUser {
  private administration = inject(AdministrationService);
  private lookups = inject(Lookups);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  private confirmationService = inject(ConfirmationService);
  private translate = inject(TranslateService);

  id = signal<string | null>(null);
  routeParams = toSignal(this.route.paramMap);
  maxDate = new Date(new Date().setDate(new Date().getDate() - 1));
  imageApi = environment.imageApi;
  private lastLoadedId: string | null = null;

  userForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    username: new FormControl('', Validators.required),
    password: new FormControl(''),
    confirmPassword: new FormControl(''),
    fullName: new FormControl('', Validators.required),
    phone: new FormControl('', Validators.required),
    dateOfBirth: new FormControl('', Validators.required),
    address: new FormControl('', Validators.required),
    gender: new FormControl<number | null>(null, Validators.required),
    groupRoleId: new FormControl<number | null>(null, Validators.required),
    isAdmin: new FormControl(true),
    attachment: new FormControl<string>(''),
  });

  rolesOptions = toSignal(
    this.administration.getRoles().pipe(
      map((roles) =>
        roles.map((r) => ({
          label: r.name,
          value: r.id,
        })),
      ),
    ),
    { initialValue: [] },
  );

  genderOptions = toSignal(
    this.lookups.getLookup(LookupsEnum.GetGenderType).pipe(
      map((genders: any[]) =>
        genders.map((g) => ({
          label: g.name,
          value: g.id,
        })),
      ),
    ),
    { initialValue: [] },
  );

  fileValidation = {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedFileTypes: ['image/jpeg', 'image/png'],
  };

  phoneCountryCodeOptions = toSignal(this.lookups.getLookup(LookupsEnum.GetCountryCode), {
    initialValue: [],
  });

  constructor() {
    this.setEffects();
  }

  setEffects() {
    effect(() => {
      const id = this.routeParams()?.get('id') ?? null;
      this.id.set(id);

      if (id) {
        this.userForm.controls.password.clearValidators();
        this.userForm.controls.confirmPassword.clearValidators();
        if (this.lastLoadedId !== id) {
          this.lastLoadedId = id;
          this.getUser();
        }
      } else {
        this.lastLoadedId = null;
        this.userForm.controls.password.setValidators([
          Validators.required,
          Validators.minLength(8),
        ]);
        this.userForm.controls.confirmPassword.setValidators([Validators.required]);
        this.userForm.reset({
          email: '',
          username: '',
          password: '',
          confirmPassword: '',
          fullName: '',
          phone: '',
          dateOfBirth: '',
          address: '',
          gender: null,
          groupRoleId: null,
          isAdmin: true,
          attachment: '',
        });
      }
      this.userForm.controls.password.updateValueAndValidity();
      this.userForm.controls.confirmPassword.updateValueAndValidity();
    });
  }

  getUser() {
    this.administration
      .getUserById(this.id()!)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((user) => {
        this.userForm.patchValue({
          email: user.email,
          username: user.username,
          fullName: user.fullName,
          dateOfBirth: new Date(user.dateOfBirth) as any,
          address: user.address,
          gender: user.gender,
          groupRoleId: user.groupRoleId,
          isAdmin: user.isAdmin,
          phone: `(${user.countryCode})${user.phoneNumber}`,
          attachment: `${this.imageApi}/${user.imageName}`,
        });
      });
  }

  save() {
    if (this.userForm.valid) {
      const formValue = this.userForm.getRawValue();
      const payload = {
        email: formValue.email!,
        username: formValue.username!,
        fullName: formValue.fullName!,
        countryCode: extractCode(formValue.phone as any),
        phoneNumber: extractNumber(formValue.phone as any),
        dateOfBirth: transformDate(formValue.dateOfBirth!),
        address: formValue.address!,
        gender: formValue.gender!,
        groupRoleId: formValue.groupRoleId!,
        isAdmin: formValue.isAdmin!,
        password: formValue.password!,
        confirmPassword: formValue.confirmPassword!,
        attachment: formValue.attachment!,
      };
      const formData = toFormData(payload);

      if (!this.id()) {
        this.administration
          .addUser(formData)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(() => {
            this.router.navigate(['/administration/users']);
          });
      } else {
        formData.append('id', this.id()!);
        // if there is password display confirmation modal that says password changed and user will be logged out
        if (formValue.password) {
          this.confirmationService.confirm({
            message: this.translate.instant('messages.confirmPasswordChanged'),
            accept: () => {
              this.administration
                .addUser(formData)
                .pipe(takeUntilDestroyed(this.destroyRef))
                .subscribe(() => {
                  this.router.navigate(['/administration/users']);
                });
            },
          });
        } else {
          this.administration
            .updateUser(formData)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => {
              this.router.navigate(['/administration/users']);
            });
        }
      }
    } else {
      this.userForm.markAllAsTouched();
    }
  }

  cancel() {
    this.router.navigate(['/administration/users']);
  }
}
