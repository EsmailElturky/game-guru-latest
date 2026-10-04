import { computed, inject, Injectable, signal } from '@angular/core';
import { tap } from 'rxjs';
import { HttpMethod } from 'src/app/core/enums';
import {
  LoginRequest,
  LoginResponse,
  IRegisterClubResponseValue,
  IVerifyOtpRequest,
} from '../interfaces';
import { LocalStorage, Xhr } from 'src/app/core/services';
import { environment } from 'src/environments/environment';
import { Roles, UserStatus } from '../enums';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private readonly xhr = inject(Xhr);
  private readonly localStorage = inject(LocalStorage);

  private readonly _userData = signal<LoginResponse | null>(this.loadUserData());

  readonly userData = this._userData.asReadonly();
  readonly isAdminApp = computed(() => this.userData()?.isAdminApp);
  readonly isAuthenticated = () =>
    !!this.localStorage.getItem(environment.tokenPropertyName) &&
    !!this.localStorage.getItem(environment.userDataPropertyName);

  login(body: LoginRequest, role: string) {
    return this.xhr
      .call<LoginResponse>({
        method: HttpMethod.POST,
        url: role === 'admin' ? 'AdminAuth/Login' : 'OrganizationAuth/Login',
        body,
        params: {
          skipAuth: true,
          skipLoading: true,
        },
        skipIsSuccessCheck: true,
      })
      .pipe(
        tap((data) => {
          if (
            data &&
            !(
              role === Roles.ClubAdmin &&
              [UserStatus.PENDING_PAYMENT, UserStatus.VerifyOTP].includes(
                data.organizationStatus as number,
              )
            )
          )
            this.saveUserData(data);
        }),
      );
  }

  forgotPassword(email: string, role: string) {
    return this.xhr.call<any>({
      method: HttpMethod.POST,
      url: role === 'admin' ? 'AdminAuth/ForgotPassword' : 'OrganizationAuth/ForgotPassword',
      body: { email },
      params: { skipAuth: true },
    });
  }

  sendOtp(email: string, role: string) {
    return this.xhr.call<any>({
      method: HttpMethod.POST,
      url: role === 'admin' ? 'AdminAuth/SendOtp' : 'OrganizationAuth/SendOtp',
      body: { email },
      params: { skipAuth: true },
    });
  }

  verifyForgotPassword(email: string, otp: string, role: string) {
    return this.xhr.call<any>({
      method: HttpMethod.POST,
      url:
        role === 'admin'
          ? 'AdminAuth/VerifyForgotPassword'
          : 'OrganizationAuth/VerifyForgotPassword',
      body: { email, otp },
      params: { skipAuth: true },
    });
  }

  resetPassword(id: number, body: any, role: string) {
    return this.xhr.call<any>({
      method: HttpMethod.POST,
      url: role === 'admin' ? 'AdminAuth/ResetPassword' : 'OrganizationAuth/ResetPassword',
      body: { id, ...body },
      params: { skipAuth: true },
    });
  }

  registerClub(body: FormData) {
    return this.xhr.call<IRegisterClubResponseValue>({
      method: HttpMethod.POST,
      url: 'OrganizationAuth/RegisterClub',
      body,
      params: { skipAuth: true, skipLoading: true },
    });
  }

  verifyClubOtp(body: IVerifyOtpRequest) {
    return this.xhr.call<LoginResponse>({
      method: HttpMethod.POST,
      url: 'OrganizationAuth/VerifyOtp',
      body,
      params: { skipAuth: true, skipLoading: true },
    });
  }

  getUserData(): LoginResponse {
    return this._userData()!;
  }

  logout(): void {
    this._userData.set(null);
    this.localStorage.removeItem(environment.tokenPropertyName);
    this.localStorage.removeItem(environment.userDataPropertyName);
  }

  convertTokenJWT(token = this.localStorage.getItem(environment.tokenPropertyName) as string) {
    if (token) {
      if (!token.split('.')[1]) return null;

      let base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'),
        jsonPayload = decodeURIComponent(
          atob(base64)
            .split('')
            .map((c) => {
              return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            })
            .join(''),
        );

      return JSON.parse(jsonPayload);
    }

    return null;
  }

  private saveUserData(data: LoginResponse): void {
    this._userData.set(data);
    this.localStorage.setItem(
      environment.tokenPropertyName,
      data.accessToken || data.tokenInfo?.accessToken || '',
    );
    this.localStorage.setItem(environment.userDataPropertyName, JSON.stringify(data));
  }

  private loadUserData() {
    const raw = this.localStorage.getItem(environment.userDataPropertyName);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  organizationPayment(body: { userId: number; amount: number }) {
    return this.xhr.call<any>({
      method: HttpMethod.POST,
      url: 'Organization/Payment',
      body,
      params: { skipAuth: true, skipLoading: true },
    });
  }

  // OrganizationAuth/EditFirebaseTokenByUser
  editFirebaseTokenByUser(body: { userId: number; token: string }) {
    return this.xhr.call<any>({
      method: HttpMethod.PUT,
      url: 'OrganizationAuth/EditFirebaseTokenByUser',
      body,
      params: { skipAuth: true, skipLoading: true },
    });
  }

  /** Registers FCM token for the logged-in organization user (authenticated request). */
  registerFirebaseMessagingToken(token: string) {
    const userId = this._userData()?.id;
    if (!userId) {
      throw new Error('No logged-in user');
    }
    const url = this.isAdminApp() ? 'AdminAuth/EditFirebaseToken' : 'OrganizationAuth/EditFirebaseTokenByUser';
    return this.xhr.call<unknown>({
      method: HttpMethod.PUT,
      url,
      body: { userId, token },
      params: { skipLoading: true },
    });
  }
}
