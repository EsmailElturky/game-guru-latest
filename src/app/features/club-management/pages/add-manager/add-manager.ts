import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  ButtonComponent,
  FileInputComponent,
  InputPasswordComponent,
  InputTextComponent,
  MobileInputComponent,
  RadioButtonComponent,
} from '@EsmailElturky/ui-kit';

@Component({
  selector: 'app-add-manager',
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
  ],
  templateUrl: './add-manager.html',
  styleUrl: './add-manager.scss',
})
export class AddManager {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private translate = inject(TranslateService);

  isEdit = signal(false);
  routeParams = toSignal(this.route.paramMap);

  managerForm = new FormGroup({
    userName: new FormControl('', Validators.required),
    fullName: new FormControl('', Validators.required),
    email: new FormControl('', [Validators.required, Validators.email]),
    phone: new FormControl('', Validators.required),
    dob: new FormControl('', Validators.required),
    address: new FormControl('', Validators.required),
    password: new FormControl('', [Validators.required, Validators.minLength(8)]),
    confirmPassword: new FormControl('', Validators.required),
    gender: new FormControl('male', Validators.required),
    profileImage: new FormControl<File[]>([]),
  });

  phoneCountryCodeOptions = [
    {
      label: '+966',
      value: {
        code: '+966',
        flag: 'https://flagpedia.net/data/flags/w580/sa.webp',
        regex: '^[2-9][0-9]{9}$',
      },
    },
    {
      label: '+1',
      value: {
        code: '+1',
        flag: 'https://flagpedia.net/data/flags/w580/ax.webp',
        regex: '^[2-9][0-9]{9}$',
      },
    },
    {
      label: '+91',
      value: {
        code: '+91',
        flag: 'https://flagpedia.net/data/flags/w580/al.webp',
        regex: '^[2-9][0-9]{9}$',
      },
    },
    {
      label: '+2',
      value: {
        code: '+2',
        flag: 'https://flagpedia.net/data/flags/w580/eg.webp',
        regex: '^01[0125][0-9]{8}$',
      },
    },
  ];

  genderOptions = computed(() => [
    { label: this.translate.instant('common.male'), value: 'male' },
    { label: this.translate.instant('common.female'), value: 'female' },
  ]);

  fileValidation = {
    maxFileSize: 5 * 1024 * 1024,
    allowedFileTypes: ['image/jpeg', 'image/png'],
  };

  constructor() {
    effect(() => {
      const id = this.routeParams()?.get('id');
      this.isEdit.set(!!id);

      const pwd = this.managerForm.controls.password;
      const cpwd = this.managerForm.controls.confirmPassword;
      if (!id) {
        pwd.setValidators([Validators.required, Validators.minLength(8)]);
        cpwd.setValidators([Validators.required]);
      } else {
        pwd.clearValidators();
        cpwd.clearValidators();
      }
      pwd.updateValueAndValidity({ emitEvent: false });
      cpwd.updateValueAndValidity({ emitEvent: false });
    });
  }

  save() {
    if (this.managerForm.valid) {
      console.log('Form Submitted', this.managerForm.value);
    } else {
      this.managerForm.markAllAsTouched();
    }
  }

  cancel() {
    this.router.navigate(['/club-management/managers']);
  }
}
