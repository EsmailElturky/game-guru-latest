import {
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  Injector,
  NgZone,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { afterNextRender } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import {
  InputTextComponent,
  InputPasswordComponent,
  ButtonComponent,
  ToastService,
  ToastType,
  RadioButtonComponent,
  OtpComponent,
  MobileInputComponent,
} from '@EsmailElturky/ui-kit';
import {
  FormGroup,
  FormControl,
  Validators,
  ɵInternalFormsSharedModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { TranslationService } from 'src/app/core/services';
import type {
  PaymentPushData,
  PaymentTokenRequest,
} from 'src/app/features/auth/interfaces/tap-charge.types';
import { Auth } from '../../services/auth';
import { LoginRequest, LoginResponse, TapCardTokenResult } from '../../interfaces';
import { environment } from 'src/environments/environment';
import { Roles, UserStatus } from '../../enums';
import { SubscriptionPaymentMethod } from 'src/app/core/enums';
import { FirebaseService, Lookups } from 'src/app/shared/services';
import { extractCode, extractNumber, maskEmail } from 'src/app/shared/functions';
import { finalize } from 'rxjs';
import { TapApplePaySdkService, TapCardSdkService, TapChargesService } from '../../services';
import { MessagePayload } from 'firebase/messaging';

@Component({
  selector: 'app-login',
  imports: [
    TranslateModule,
    InputTextComponent,
    InputPasswordComponent,
    ButtonComponent,
    ɵInternalFormsSharedModule,
    ReactiveFormsModule,
    RadioButtonComponent,
    OtpComponent,
    MobileInputComponent,
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login implements OnDestroy {
  private translateService = inject(TranslationService);
  private router = inject(Router);
  private toast = inject(ToastService);
  private authService = inject(Auth);
  private tapCharges = inject(TapChargesService);
  private tapCardSdk = inject(TapCardSdkService);
  private tapApplePaySdk = inject(TapApplePaySdkService);
  private destroyRef = inject(DestroyRef);
  private injector = inject(Injector);
  private ngZone = inject(NgZone);
  private firebaseService = inject(FirebaseService);
  readonly cardSdkContainerId = environment.tapPayment.cardSdkContainerId;
  readonly applePayContainerId = environment.tapPayment.applePay.containerId;
  readonly SubscriptionPaymentMethod = SubscriptionPaymentMethod;
  private route = inject(ActivatedRoute);

  language = this.translateService.currentLang;

  readonly subscriptionGate = signal(false);
  readonly pendingPayCredentials = signal<{
    email: string;
    password: string;
    role: string;
    userId: number;
    amount: number;
  } | null>(null);
  subscriptionAmount = signal(0);
  readonly subscriptionCurrency = signal('SAR');
  readonly paying = signal(false);
  readonly otpStep = signal(false);
  readonly isVerifyingOtp = signal(false);

  readonly tapCardLoading = signal(false);
  readonly tapCardReady = signal(false);
  readonly applePayLoading = signal(false);
  readonly applePayReady = signal(false);

  readonly selectedPaymentMethod = signal<SubscriptionPaymentMethod>(
    SubscriptionPaymentMethod.Card,
  );

  readonly publicKey = signal(environment.tapPayment.publicKey);
  readonly merchantId = signal(environment.tapPayment.merchantId);

  /** Resend OTP countdown (seconds), aligned with signup step 4. */
  resendCountdown = signal(0);
  private resendInterval: ReturnType<typeof setInterval> | null = null;
  private readonly RESEND_COUNTDOWN_SECONDS = 120;
  private paymentPushListenerReady = false;
  private swPaymentMessageHandler: ((event: MessageEvent) => void) | null = null;
  private readonly paymentFcmHandler = (payload: MessagePayload) => {
    this.ngZone.run(() => this.handlePaymentPush(payload as any));
  };

  otpForm = new FormGroup({
    otp: new FormControl('', [Validators.required, Validators.minLength(4)]),
  });

  stcPayForm = new FormGroup({
    phone: new FormControl('', Validators.required),
  });

  paymentMethodOptions = signal([
    {
      label: this.translateService.instant('subscriptionPayment.methodCard'),
      value: SubscriptionPaymentMethod.Card,
    },
    // {
    //   label: this.translateService.instant('subscriptionPayment.methodApplePay'),
    //   value: SubscriptionPaymentMethod.ApplePay,
    // },
    // {
    //   label: this.translateService.instant('subscriptionPayment.methodStcPay'),
    //   value: SubscriptionPaymentMethod.StcPay,
    // },
  ]);

  // phoneCountryCodeOptions = toSignal(this.lookups.getLookupPublic(LookupsEnum.GetCountryCode), {
  //   initialValue: [] as { label: string; value: { code: string; flag: string; regex: string } }[],
  // });
  phoneCountryCodeOptions = signal(
    [] as { label: string; value: { code: string; flag: string; regex: string } }[],
  );

  readonly canResendOtp = computed(() => this.resendCountdown() === 0);
  readonly resendTimerFormatted = computed(() => {
    const s = this.resendCountdown();
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  });

  readonly maskedPendingEmail = computed(() =>
    maskEmail(this.pendingPayCredentials()?.email ?? ''),
  );

  loginForm = new FormGroup({
    email: new FormControl({ value: '', disabled: false }, [Validators.required, Validators.email]),
    username: new FormControl({ value: '', disabled: true }, Validators.required),
    password: new FormControl('', Validators.required),
    role: new FormControl('clubAdmin', Validators.required),
  });

  roleOptions = signal([
    { label: this.translateService.instant('auth.appAdmin'), value: 'admin' },
    { label: this.translateService.instant('auth.clubAdmin'), value: 'clubAdmin' },
  ]);

  constructor() {
    this.getPaymentConfig();
    effect((onCleanup) => {
      if (!this.subscriptionGate()) {
        this.destroyAllPaymentMethods();
        return;
      }

      const method = this.selectedPaymentMethod();
      onCleanup(() => this.destroyAllPaymentMethods());

      afterNextRender(
        () => {
          if (!this.subscriptionGate() || this.selectedPaymentMethod() !== method) {
            return;
          }
          void this.activatePaymentMethod(method);
        },
        { injector: this.injector },
      );
    });
    void this.prefetchFcmToken();
  }

  getPaymentConfig(): void {
    this.tapCharges.getPaymentConfig().subscribe({
      next: (res) => {
        this.publicKey.set(res.publicKey);
        this.merchantId.set(res?.merchantId ?? '');
      },
    });
  }

  onRoleChange(role: 'admin' | 'clubAdmin') {
    if (role === 'admin') {
      this.loginForm.get('username')?.enable();
      this.loginForm.get('email')?.reset();
      this.loginForm.get('email')?.disable();
    } else {
      this.loginForm.get('username')?.reset();
      this.loginForm.get('username')?.disable();
      this.loginForm.get('email')?.enable();
    }
  }

  login() {
    if (this.loginForm.valid) {
      const body = this.loginForm.value;
      const role = body.role;
      delete body.role;
      this.authService.login(body as LoginRequest, role as string).subscribe({
        next: (res) => {
          if (role === Roles.ClubAdmin && res.organizationStatus === UserStatus.VerifyOTP) {
            this.setPendingPayCredentials(res);
            this.otpForm.reset({ otp: '' });
            this.otpStep.set(true);
            void this.prefetchFcmToken();
            this.startOtpResendCountdown();
          } else if (
            role === Roles.ClubAdmin &&
            res.organizationStatus === UserStatus.PENDING_PAYMENT
          ) {
            this.setPendingPayCredentials(res);
            this.subscriptionGate.set(true);
            void this.prefetchFcmToken();
          } else {
            this.router.navigate(['/dashboard']);
          }
        },
        error: (error) => {
          this.toast.addToast(
            ToastType.Error,
            this.translateService.instant('errors.errorOccurred'),
            error.message,
          );
        },
      });
    }
  }

  setPendingPayCredentials(res: LoginResponse): void {
    this.subscriptionAmount.set(res?.paymentAmount ?? 100);
    const email = this.loginForm.get('email')?.value as string;
    const password = this.loginForm.get('password')?.value as string;
    this.pendingPayCredentials.set({
      email,
      password,
      role: Roles.ClubAdmin,
      userId: res?.id ?? 0,
      amount: this.subscriptionAmount(),
    });
  }

  verifyLoginOtp(): void {
    const pending = this.pendingPayCredentials();
    if (!pending || this.isVerifyingOtp()) {
      return;
    }
    this.otpForm.markAllAsTouched();
    if (this.otpForm.invalid) {
      return;
    }
    const otp = this.otpForm.get('otp')?.value as string;
    this.isVerifyingOtp.set(true);
    this.authService
      .verifyClubOtp({ email: pending.email, otp })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res: LoginResponse) => {
          this.isVerifyingOtp.set(false);
          this.setPendingPayCredentials(res);
          this.otpStep.set(false);
          this.clearOtpResendTimer();
          this.subscriptionGate.set(true);
        },
        error: () => {
          this.isVerifyingOtp.set(false);
        },
      });
  }

  resendLoginOtp(): void {
    if (!this.canResendOtp()) {
      return;
    }
    const pending = this.pendingPayCredentials();
    if (!pending?.email) {
      return;
    }
    this.startOtpResendCountdown();
    this.authService
      .sendOtp(pending.email, Roles.ClubAdmin)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
  }

  backFromOtp(): void {
    this.otpStep.set(false);
    this.otpForm.reset({ otp: '' });
    this.pendingPayCredentials.set(null);
    this.clearOtpResendTimer();
    this.resendCountdown.set(0);
  }

  backFromSubscriptionPayment(): void {
    this.authService.logout();
    this.subscriptionGate.set(false);
    this.pendingPayCredentials.set(null);
    this.subscriptionAmount.set(0);
    this.paying.set(false);
    this.selectedPaymentMethod.set(SubscriptionPaymentMethod.Card);
    this.stcPayForm.reset({ phone: '' });
    this.destroyAllPaymentMethods();
  }

  onPaymentMethodChange(method: SubscriptionPaymentMethod): void {
    if (this.selectedPaymentMethod() === method) {
      return;
    }
    this.selectedPaymentMethod.set(method);
    this.paying.set(false);
  }

  private async activatePaymentMethod(method: SubscriptionPaymentMethod): Promise<void> {
    if (method === SubscriptionPaymentMethod.Card) {
      await this.mountTapCardSdk();
    } else if (method === SubscriptionPaymentMethod.ApplePay) {
      await this.mountApplePayButton();
    }
  }

  private destroyAllPaymentMethods(): void {
    this.destroyTapCardSdk();
    this.destroyApplePayButton();
  }

  private async mountTapCardSdk(): Promise<void> {
    if (!this.publicKey()) {
      this.toast.addToast(
        ToastType.Error,
        this.translateService.instant('errors.errorOccurred'),
        this.translateService.instant('subscriptionPayment.missingPublicKey'),
      );
      return;
    }

    const pending = this.pendingPayCredentials();
    const user = this.authService.getUserData();

    const container = document.getElementById(this.cardSdkContainerId);
    if (!container) {
      return;
    }

    this.tapCardLoading.set(true);
    this.tapCardReady.set(false);

    try {
      await this.tapCardSdk.renderSubscriptionCard({
        containerId: this.cardSdkContainerId,
        amount: this.subscriptionAmount(),
        currency: this.subscriptionCurrency(),
        locale: this.language() === 'ar' ? 'ar' : 'en',
        publicKey: this.publicKey(),
        merchantId: environment.tapPayment.merchantId,
        customerEmail: pending?.email,
        customerName: user?.fullName,
        phoneCountryCode: user?.countryCode,
        phoneNumber: user?.phoneNumber,
        onReady: () =>
          this.runInAngularZone(() => {
            this.tapCardLoading.set(false);
            this.tapCardReady.set(true);
          }),
        onError: () =>
          this.runInAngularZone(() => {
            this.paying.set(false);
          }),
        onSuccess: (token: TapCardTokenResult) =>
          this.runInAngularZone(() => {
            this.handlePaymentToken(token.id, token.card?.name ?? '');
          }),
      });
    } catch {
      this.tapCardLoading.set(false);
      this.toast.addToast(
        ToastType.Error,
        this.translateService.instant('errors.errorOccurred'),
        this.translateService.instant('subscriptionPayment.cardNotReady'),
      );
    }
  }

  private destroyTapCardSdk(): void {
    this.tapCardSdk.unmount();
    this.tapCardLoading.set(false);
    this.tapCardReady.set(false);
  }

  private destroyApplePayButton(): void {
    this.tapApplePaySdk.unmount();
    this.applePayLoading.set(false);
    this.applePayReady.set(false);
  }

  private async mountApplePayButton(): Promise<void> {
    if (!this.publicKey()) {
      this.toast.addToast(
        ToastType.Error,
        this.translateService.instant('errors.errorOccurred'),
        this.translateService.instant('subscriptionPayment.missingPublicKey'),
      );
      return;
    }
    if (!this.merchantId()) {
      this.toast.addToast(
        ToastType.Error,
        this.translateService.instant('errors.errorOccurred'),
        this.translateService.instant('subscriptionPayment.missingMerchantId'),
      );
      return;
    }

    const pending = this.pendingPayCredentials();
    const user = this.authService.getUserData();

    this.applePayLoading.set(true);
    this.applePayReady.set(false);

    try {
      await this.tapApplePaySdk.renderButton({
        containerId: this.applePayContainerId,
        publicKey: this.publicKey(),
        merchantId: this.merchantId(),
        merchantDomain: window.location.hostname,
        amount: this.subscriptionAmount(),
        currency: this.subscriptionCurrency(),
        locale: this.language() === 'ar' ? 'ar' : 'en',
        customerEmail: pending?.email,
        customerName: user?.fullName,
        phoneCountryCode: user?.countryCode,
        phoneNumber: user?.phoneNumber,
        onReady: () =>
          this.runInAngularZone(() => {
            this.applePayLoading.set(false);
            this.applePayReady.set(true);
          }),
        onCancel: () => this.runInAngularZone(() => this.paying.set(false)),
        onError: () =>
          this.runInAngularZone(() => {
            this.paying.set(false);
            this.applePayReady.set(false);
          }),
        onSuccess: (data) =>
          this.runInAngularZone(() => {
            this.paying.set(true);
            this.handlePaymentToken(data.id);
          }),
      });
    } catch {
      this.applePayLoading.set(false);
      this.toast.addToast(
        ToastType.Error,
        this.translateService.instant('errors.errorOccurred'),
        this.translateService.instant('subscriptionPayment.cardNotReady'),
      );
    }
  }

  private handlePaymentToken(tokenId: string | undefined, cardName?: string): void {
    const id = tokenId?.trim();
    if (!id) {
      this.paying.set(false);
      this.toast.addToast(
        ToastType.Error,
        this.translateService.instant('errors.errorOccurred'),
        this.translateService.instant('subscriptionPayment.tokenizeFailed'),
      );
      return;
    }
    let body: PaymentTokenRequest = {
      userId: this.pendingPayCredentials()?.userId ?? 0,
      email: this.pendingPayCredentials()?.email ?? '',
      paymentMethod: this.selectedPaymentMethod(),
      amount: this.subscriptionAmount(),
      tokenId: id,
      firstName: cardName ?? '',
      redirectUrl: `${window.location.href}?ref_guru_id=${this.pendingPayCredentials()?.userId}`,
    };
    void this.sendPaymentRequestAndListenForPaymentPush(body);
  }

  /**
   * 1) Register FCM listeners before payment (avoids missing a fast backend push).
   * 2) Get device token and send it to the API so the backend can target this browser.
   */
  private async prefetchFcmToken(): Promise<void> {
    const userId = this.route.snapshot.queryParams['ref_guru_id'] ?? this.pendingPayCredentials()?.userId;
    if (!userId) {
      return;
    }

    try {
      await this.ensurePaymentPushListener();
      const token = await this.firebaseService.getMessagingToken();
      this.authService.editFirebaseTokenByUser({ userId, token }).subscribe();
    } catch (error) {
      console.warn('FCM setup failed:', error);
      this.toast.addToast(
        ToastType.Error,
        this.translateService.instant('errors.errorOccurred'),
        this.translateService.instant('subscriptionPayment.notificationsRequired'),
      );
      this.paying.set(false);
    }
  }

  /** Foreground (tab open) + service-worker relay (tab in background). */
  private async ensurePaymentPushListener(): Promise<void> {
    if (this.paymentPushListenerReady) {
      return;
    }

    await this.firebaseService.subscribeForegroundMessages(this.paymentFcmHandler);

    if ('serviceWorker' in navigator) {
      this.swPaymentMessageHandler = (event: MessageEvent) => {
        if (event.data?.type !== 'FCM_PAYMENT_PUSH') {
          return;
        }
        this.ngZone.run(() => this.handlePaymentPush(event.data.data as PaymentPushData));
      };
      navigator.serviceWorker.addEventListener('message', this.swPaymentMessageHandler);
    }

    this.paymentPushListenerReady = true;
  }

  private sendPaymentRequestAndListenForPaymentPush(body: PaymentTokenRequest): void {
    this.tapCharges
      .sendPaymentRequest(body)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.paying.set(false)),
      )
      .subscribe({
        next: (res) => {
          if (res.transactionUrl) {
            window.location.href = res.transactionUrl;
          }
        },
        error: () => {
          this.toast.addToast(
            ToastType.Error,
            this.translateService.instant('errors.errorOccurred'),
            this.translateService.instant('subscriptionPayment.redirectFailed'),
          );
        },
      });
  }

  private handlePaymentPush(data: PaymentPushData): void {
    if (!data.data.isPaid) {
      this.toast.addToast(
        ToastType.Error,
        this.translateService.instant('errors.errorOccurred'),
        this.translateService.instant('subscriptionPayment.paymentFailed'),
      );
    } else {
      this.toast.addToast(
        ToastType.Success,
        data.notification?.title ??
          this.translateService.instant('subscriptionPayment.paymentSuccessful'),
        data.notification?.body ??
          this.translateService.instant('subscriptionPayment.paymentSuccessful'),
      );
      this.backToLogin();
    }
  }

  paySubscription(): void {
    if (!this.pendingPayCredentials() || this.paying()) {
      return;
    }

    const method = this.selectedPaymentMethod();
    if (method === SubscriptionPaymentMethod.Card) {
      if (!this.tapCardReady()) {
        this.toast.addToast(
          ToastType.Error,
          this.translateService.instant('errors.errorOccurred'),
          this.translateService.instant('subscriptionPayment.cardNotReady'),
        );
        return;
      }
      this.paying.set(true);
      this.tapCardSdk.tokenize();
      return;
    }

    if (method === SubscriptionPaymentMethod.StcPay) {
      this.stcPayForm.markAllAsTouched();
      if (this.stcPayForm.invalid) {
        return;
      }
      const phone = this.stcPayForm.get('phone')?.value as string;
      if (!phone) {
        this.toast.addToast(
          ToastType.Error,
          this.translateService.instant('errors.errorOccurred'),
          this.translateService.instant('subscriptionPayment.cardInvalid'),
        );
        return;
      }
      this.paying.set(true);
      const body: PaymentTokenRequest = {
        userId: this.pendingPayCredentials()?.userId ?? 0,
        email: this.pendingPayCredentials()?.email ?? '',
        paymentMethod: this.selectedPaymentMethod(),
        amount: this.subscriptionAmount(),
        countryCode: extractCode(phone),
        phoneNumber: extractNumber(phone),
        firstName: '',
        redirectUrl: `${window.location.href}?ref_guru_id=${this.pendingPayCredentials()?.userId}`,
      };
      void this.sendPaymentRequestAndListenForPaymentPush(body);
    }
  }

  backToLogin(): void {
    this.destroyAllPaymentMethods();
    this.paying.set(false);
    this.subscriptionGate.set(false);
    this.pendingPayCredentials.set(null);
    this.subscriptionAmount.set(0);
    this.selectedPaymentMethod.set(SubscriptionPaymentMethod.Card);
    this.stcPayForm.reset({ phone: '' });
    this.otpStep.set(false);
    this.otpForm.reset({ otp: '' });
    this.clearOtpResendTimer();
    this.resendCountdown.set(0);
  }

  /** SDK callbacks run outside Angular zone; re-enter so signals update the template. */
  private runInAngularZone(fn: () => void): void {
    this.ngZone.run(fn);
  }

  private startOtpResendCountdown(): void {
    this.clearOtpResendTimer();
    this.resendCountdown.set(this.RESEND_COUNTDOWN_SECONDS);
    this.resendInterval = setInterval(() => {
      const next = this.resendCountdown() - 1;
      this.resendCountdown.set(Math.max(0, next));
      if (next <= 0) {
        this.clearOtpResendTimer();
      }
    }, 1000);
  }

  private clearOtpResendTimer(): void {
    if (this.resendInterval) {
      clearInterval(this.resendInterval);
      this.resendInterval = null;
    }
  }

  goToForgotPassword() {
    this.router.navigate(['/auth/forget-password'], {
      queryParams: { role: this.loginForm.get('role')?.value },
    });
  }

  goToSignup() {
    this.router.navigate(['/auth/signup']);
  }

  goToTerms() {
    this.router.navigate(['/auth/terms']);
  }

  toggleLanguage() {
    this.translateService.changeLanguage(this.language() === 'ar' ? 'en' : 'ar');
  }

  ngOnDestroy(): void {
    this.clearOtpResendTimer();
    this.destroyAllPaymentMethods();
    this.firebaseService.unsubscribeForegroundMessages(this.paymentFcmHandler);
    if (this.swPaymentMessageHandler && 'serviceWorker' in navigator) {
      navigator.serviceWorker.removeEventListener('message', this.swPaymentMessageHandler);
      this.swPaymentMessageHandler = null;
    }
    this.paymentPushListenerReady = false;
  }
}
