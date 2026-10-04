import { Component, inject } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonComponent, InputPasswordComponent } from '@EsmailElturky/ui-kit';
import { ProfileService } from '../../services/profile.service';
import { ToastService } from 'src/app/shared/services';
import { ToastType } from 'src/app/shared/enums';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [TranslateModule, ReactiveFormsModule, InputPasswordComponent, ButtonComponent],
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.scss',
})
export class ChangePasswordComponent {
  private profileService = inject(ProfileService);
  private toastService = inject(ToastService);
  private translate = inject(TranslateService);

  form = new FormGroup({
    currentPassword: new FormControl('', Validators.required),
    newPassword: new FormControl('', [Validators.required, Validators.minLength(8)]),
    confirmPassword: new FormControl('', Validators.required),
  });

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { currentPassword, newPassword, confirmPassword } = this.form.value;
    if (newPassword !== confirmPassword) {
      this.form.controls['confirmPassword'].setErrors({ passwordMismatch: true });
      return;
    }
    this.profileService
      .changePassword({
        currentPassword: currentPassword!,
        newPassword: newPassword!,
        confirmNewPassword: confirmPassword!,
      })
      .subscribe({
        next: () => {
          this.toastService.addToast(
            ToastType.Success,
            this.translate.instant('common.success'),
            this.translate.instant('profile.passwordChangedSuccessfully'),
          );
          this.form.reset();
        },
      });
  }
}
