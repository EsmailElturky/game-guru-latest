import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpMethod } from 'src/app/core/enums';
import { Xhr } from 'src/app/core/services';
import { IPaginationRequestBody, IPaginationResponse } from 'src/app/shared/interfaces';
import { IPromoCode, IPromoCodeAction } from '../interfaces/promo-code.interface';

@Injectable({
  providedIn: 'root',
})
export class PromoCodeService {
  private xhr = inject(Xhr);

  getAll(body: IPaginationRequestBody): Observable<IPaginationResponse<IPromoCode>> {
    return this.xhr.call<IPaginationResponse<IPromoCode>>({
      method: HttpMethod.POST,
      url: 'BookingPromotion/GetAll',
      body,
    });
  }

  getById(id: string): Observable<IPromoCode> {
    return this.xhr.call<IPromoCode>({
      method: HttpMethod.GET,
      url: `BookingPromotion/${id}`,
    });
  }

  add(body: FormData): Observable<void> {
    return this.xhr.call<void>({
      method: HttpMethod.POST,
      url: 'BookingPromotion/Add',
      body,
    });
  }

  edit(body: FormData): Observable<void> {
    return this.xhr.call<void>({
      method: HttpMethod.PUT,
      url: 'BookingPromotion/Edit',
      body,
    });
  }

  delete(id: string): Observable<void> {
    return this.xhr.call<void>({
      method: HttpMethod.DELETE,
      url: `BookingPromotion/${id}`,
    });
  }

  activate(id: string): Observable<void> {
    return this.xhr.call<void>({
      method: HttpMethod.PUT,
      url: `BookingPromotion/Activate/${id}`,
    });
  }

  action(body: IPromoCodeAction): Observable<void> {
    return this.xhr.call<void>({
      method: HttpMethod.POST,
      url: `BookingPromotion/ActionType`,
      body,
    });
  }
}
