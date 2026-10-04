import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  InputPasswordComponent,
  ButtonComponent,
  OtpComponent,
  InputTextComponent,
} from '@EsmailElturky/ui-kit';
import {
  FormGroup,
  FormControl,
  Validators,
  ReactiveFormsModule,
  ValidationErrors,
} from '@angular/forms';
import { NgClass } from '@angular/common';
import { Auth } from '../../services/auth';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService, ToastType } from '@EsmailElturky/ui-kit';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslationService } from 'src/app/core/services';

@Component({
  selector: 'app-forget-password',
  imports: [
    TranslateModule,
    InputPasswordComponent,
    ButtonComponent,
    ReactiveFormsModule,
    OtpComponent,
    NgClass,
    InputTextComponent,
  ],
  templateUrl: './forget-password.html',
  styleUrl: './forget-password.scss',
})
export class ForgetPassword implements OnDestroy {
  private translationService = inject(TranslationService);
  private translateService = inject(TranslateService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private authService = inject(Auth);
  private toast = inject(ToastService);

  translate = (key: string) => this.translateService.instant(key);
  language = this.translationService.currentLang;

  step = signal<'otp' | 'password' | 'email'>('email');
  email = '';
  role = 'clubAdmin';
  resetId: number | null = null;
  timerValue = signal<number>(119); // 1:59 in seconds
  timerDisplay = signal<string>('01:59');
  private timerInterval: any;

  otpForm = new FormGroup({
    otp: new FormControl('', [Validators.required, Validators.minLength(4)]),
  });

  emailForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
  });

  resetPasswordForm = new FormGroup(
    {
      password: new FormControl('', [Validators.required, Validators.minLength(8)]),
      confirmPassword: new FormControl('', [Validators.required]),
    },
    { validators: this.passwordMatchValidator },
  );

  constructor() {
    this.route.queryParams.pipe(takeUntilDestroyed()).subscribe((params) => {
      if (params['role']) {
        this.role = params['role'];
      }
    });
  }

  ngOnDestroy() {
    this.stopTimer();
  }

  startTimer() {
    this.stopTimer();
    this.timerInterval = setInterval(() => {
      if (this.timerValue() > 0) {
        this.timerValue.update((value) => value - 1);
        this.updateTimerDisplay();
      } else {
        this.stopTimer();
      }
    }, 1000);
  }

  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  updateTimerDisplay() {
    const minutes = Math.floor(this.timerValue() / 60);
    const seconds = this.timerValue() % 60;
    this.timerDisplay.set(
      `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`,
    );
  }

  resendCode() {
    if (this.timerValue() === 0) {
      this.authService.sendOtp(this.email, this.role).subscribe(() => {
        this.timerValue.set(119);
        this.startTimer();
        this.toast.addToast(
          ToastType.Success,
          this.translate('common.success'),
          this.translate('auth.verificationCodeSent'),
        );
      });
    }
  }

  verifyOtp() {
    if (this.otpForm.valid) {
      const otp = this.otpForm.get('otp')?.value;
      this.authService
        .verifyForgotPassword(this.email, otp as string, this.role)
        .subscribe((res: any) => {
          this.resetId = res?.userId;
          this.step.set('password');
          this.stopTimer();
        });
    }
  }

  sendCode() {
    if (this.emailForm.valid) {
      const email = this.emailForm.get('email')?.value as string;
      this.authService.forgotPassword(email, this.role).subscribe(() => {
        this.email = email;
        this.step.set('otp');
        this.timerValue.set(119);
        this.startTimer();
      });
    }
  }

  passwordMatchValidator(form: any): ValidationErrors | null {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
    } else if (confirmPassword) {
      confirmPassword.setErrors(null);
    }
    return null;
  }

  confirm() {
    if (this.resetPasswordForm.valid && this.resetId !== null) {
      const body = {
        newPassword: this.resetPasswordForm.get('password')?.value,
        confirmNewPassword: this.resetPasswordForm.get('confirmPassword')?.value,
      };
      this.authService.resetPassword(this.resetId, body, this.role).subscribe(() => {
        this.toast.addToast(
          ToastType.Success,
          this.translate('common.success'),
          this.translate('profile.passwordChangedSuccessfully'),
        );
        this.router.navigate(['/auth/login']);
      });
    }
  }

  goBack() {
    if (this.step() === 'password') {
      this.resetPasswordForm.reset();
      this.otpForm.reset();
      this.step.set('otp');
      this.startTimer();
    } else {
      this.router.navigate(['/auth/login']);
    }
  }
}
