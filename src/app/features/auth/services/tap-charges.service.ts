import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import type {
  PaymentConfigResponse,
  PaymentRequestResponse,
  PaymentTokenRequest,
} from '../interfaces/tap-charge.types';
import { Xhr } from 'src/app/core/services';
import { HttpMethod } from 'src/app/core/enums';
@Injectable({
  providedIn: 'root',
})
export class TapChargesService {
  private readonly xhr = inject(Xhr);

  sendPaymentRequest(body: PaymentTokenRequest): Observable<PaymentRequestResponse> {
    return this.xhr.call<PaymentRequestResponse>({
      method: HttpMethod.POST,
      url: `Organization/Payment`,
      body,
      params: {
        skipAuth: true,
        skipLoading: true,
      },
    });
  }

  getPaymentConfig(): Observable<PaymentConfigResponse> {
    //skip auth and loading
    return this.xhr.call<PaymentConfigResponse>({
      method: HttpMethod.GET,
      url: `PaymentConfig/GetConfig`,
      params: {
        skipAuth: true,
        skipLoading: true,
      },
    });
  }
}
