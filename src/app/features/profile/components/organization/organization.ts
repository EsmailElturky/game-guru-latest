import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  ButtonComponent,
  InputChipsComponent,
  InputTextComponent,
} from '@EsmailElturky/ui-kit';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-organization',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    InputTextComponent,
    InputChipsComponent,
    ButtonComponent,
  ],
  templateUrl: './organization.html',
  styleUrl: './organization.scss',
})
export class Organization {
  organizationForm = new FormGroup({
    nameEn: new FormControl('', Validators.required),
    nameAr: new FormControl('', Validators.required),
    email: new FormControl('', [Validators.required, Validators.email]),
    phone: new FormControl('', Validators.required),
    address: new FormControl('', Validators.required),
    mapUrl: new FormControl(''),
    registrationName: new FormControl('', Validators.required),
    registrationNumber: new FormControl('', Validators.required),
    city: new FormControl('', Validators.required),
    tradeMarkName: new FormControl(''),
    tradeMarkNumber: new FormControl(''),
    sport: new FormControl<string[]>([]),
  });

  sportOptions = signal([
    { label: 'Padel', value: 'padel' },
    { label: 'Football', value: 'football' },
    { label: 'Tennis', value: 'tennis' },
  ]);

  save() {
    if (this.organizationForm.valid) {
      console.log('Form Submitted', this.organizationForm.value);
    } else {
      this.organizationForm.markAllAsTouched();
    }
  }
}
