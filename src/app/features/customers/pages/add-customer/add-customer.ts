import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  ButtonComponent,
  DatePickerComponent,
  InputPasswordComponent,
  InputTextComponent,
  MobileInputComponent,
  RadioButtonComponent,
} from '@EsmailElturky/ui-kit';

@Component({
  selector: 'app-add-customer',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    InputTextComponent,
    InputPasswordComponent,
    MobileInputComponent,
    RadioButtonComponent,
    DatePickerComponent,
    ButtonComponent,
  ],
  templateUrl: './add-customer.html',
  styleUrl: './add-customer.scss',
})
export class AddCustomer {
  private translate = inject(TranslateService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  isEdit = signal(false);
  routeParams = toSignal(this.route.paramMap);

  customerForm = new FormGroup({
    userName: new FormControl('', Validators.required),
    email: new FormControl('', [Validators.required, Validators.email]),
    phone: new FormControl('', Validators.required),
    address: new FormControl('', Validators.required),
    password: new FormControl('', [Validators.required, Validators.minLength(8)]),
    confirmPassword: new FormControl('', Validators.required),
    dob: new FormControl('', Validators.required),
    gender: new FormControl('male', Validators.required),
  });

  genderOptions = computed(() => [
    { label: this.translate.instant('common.male'), value: 'male' },
    { label: this.translate.instant('common.female'), value: 'female' },
  ]);

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

  constructor() {
    effect(() => {
      const id = this.routeParams()?.get('id');
      this.isEdit.set(!!id);

      const pwd = this.customerForm.controls.password;
      const cpwd = this.customerForm.controls.confirmPassword;
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
    if (this.customerForm.valid) {
      console.log(this.customerForm.value);
    } else {
      this.customerForm.markAllAsTouched();
    }
  }

  cancel() {
    this.router.navigate(['/customers']);
  }
}
