import { Component, computed, inject, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  ButtonComponent,
  InputTextComponent,
  SelectButtonComponent,
  SelectComponent,
  TextAreaComponent,
} from '@EsmailElturky/ui-kit';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-add-notification-dialog',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    ReactiveFormsModule,
    SelectButtonComponent,
    SelectComponent,
    InputTextComponent,
    TextAreaComponent,
    ButtonComponent,
    DialogModule,
  ],
  templateUrl: './add-notification-dialog.html',
  styleUrl: './add-notification-dialog.scss',
})
export class AddNotificationDialog {
  private translate = inject(TranslateService);

  visible = signal(false);
  onClose = output<void>();
  onSave = output<any>();

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
    titleEn: new FormControl('', Validators.required),
    titleAr: new FormControl('', Validators.required),
    descriptionEn: new FormControl('', Validators.required),
    descriptionAr: new FormControl('', Validators.required),
  });

  show() {
    this.visible.set(true);
  }

  hide() {
    this.visible.set(false);
    this.onClose.emit();
  }

  onUserTypeChange(event: any) {
    this.userType.set(event);
  }

  save() {
    if (this.notificationForm.valid) {
      this.onSave.emit(this.notificationForm.value);
      this.hide();
    } else {
      this.notificationForm.markAllAsTouched();
    }
  }
}
