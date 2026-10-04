import { Component, inject, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ButtonComponent, FileInputComponent } from '@EsmailElturky/ui-kit';
import { DialogModule } from 'primeng/dialog';
import { ProfileService } from '../../services/profile.service';
import { ToastService } from 'src/app/shared/services';
import { ToastType } from 'src/app/shared/enums';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { toFormData } from 'src/app/shared/functions';

@Component({
  selector: 'app-upload-logo-dialog',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    FileInputComponent,
    ButtonComponent,
    DialogModule,
    ReactiveFormsModule,
  ],
  templateUrl: './upload-logo-dialog.html',
  styleUrl: './upload-logo-dialog.scss',
})
export class UploadLogoDialog {
  private profileService = inject(ProfileService);
  private toastService = inject(ToastService);
  private translate = inject(TranslateService);

  visible = signal(false);
  loading = signal(false);
  logoForm = new FormGroup({
    Attachment: new FormControl<File | null>(null, Validators.required),
  });

  fileValidation = {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedFileTypes: ['image/jpeg', 'image/png', 'image/svg+xml'],
  };

  show() {
    this.visible.set(true);
  }

  hide() {
    this.visible.set(false);
  }

  save() {
    if (this.logoForm.valid) {
      this.loading.set(true);
      const formData = toFormData(this.logoForm.value);

      this.profileService.uploadLogo(formData).subscribe({
        next: () => {},
        error: () => {
          this.loading.set(false);
        },
        complete: () => {
          this.toastService.addToast(
            ToastType.Success,
            this.translate.instant('common.success'),
            this.translate.instant('messages.updateSuccess'),
          );
          this.loading.set(false);
          this.hide();
        },
      });
    }
  }
}
