import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpMethod } from 'src/app/core/enums';
import { Xhr } from 'src/app/core/services';
import { IPaginationRequestBody } from 'src/app/shared/interfaces';
import { IBookingRefund, IBookingRefundListResponse } from '../interfaces/booking-refund.interface';

@Injectable({
  providedIn: 'root',
})
export class BookingRefundService {
  private xhr = inject(Xhr);

  getAll(body: IPaginationRequestBody): Observable<IBookingRefundListResponse> {
    return this.xhr.call<IBookingRefundListResponse>({
      method: HttpMethod.POST,
      url: 'BookingRefund/GetAll',
      body,
    });
  }

  getById(id: string): Observable<IBookingRefund> {
    return this.xhr.call<IBookingRefund>({
      method: HttpMethod.GET,
      url: `BookingRefund/${id}`,
    });
  }
}
