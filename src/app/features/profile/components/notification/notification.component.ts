import { Component, computed, inject, signal } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  ButtonComponent,
  InputTextComponent,
  SelectButtonComponent,
  SelectComponent,
  TextAreaComponent,
} from '@EsmailElturky/ui-kit';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [
    TranslateModule,
    ReactiveFormsModule,
    SelectButtonComponent,
    SelectComponent,
    InputTextComponent,
    TextAreaComponent,
    ButtonComponent,
  ],
  templateUrl: './notification.component.html',
  styleUrl: './notification.component.scss',
})
export class NotificationComponent {
  private translate = inject(TranslateService);

  userType = signal<'all' | 'specific'>('all');

  userTypeOptions = computed(() => [
    { label: this.translate.instant('profile.allUsers'), value: 'all' },
    { label: this.translate.instant('profile.specificUsers'), value: 'specific' },
  ]);

  users = [
    { name: 'User 1', id: 1 },
    { name: 'User 2', id: 2 },
    { name: 'User 3', id: 3 },
  ];

  notificationForm = new FormGroup({
    userType: new FormControl('all'),
    selectedUsers: new FormControl([]),
    nameEn: new FormControl('', Validators.required),
    nameAr: new FormControl('', Validators.required),
    descriptionEn: new FormControl('', Validators.required),
    descriptionAr: new FormControl('', Validators.required),
  });

  onUserTypeChange(event: any) {    
    this.userType.set(event);
  }

  save() {
    if (this.notificationForm.valid) {
      console.log(this.notificationForm.value);
    }
  }
}
