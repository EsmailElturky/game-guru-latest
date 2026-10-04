import { inject, Injectable } from '@angular/core';
import { HttpMethod } from 'src/app/core/enums';
import { Xhr } from 'src/app/core/services';
import { IPaginationResponse } from 'src/app/shared/interfaces';
import {
  IBookingReportCards,
  IBookingReportRequest,
  IBookingReportRow,
} from '../interfaces';

@Injectable({
  providedIn: 'root',
})
export class BookingReportService {
  private readonly xhr = inject(Xhr);

  getCards(organizationId: number) {
    return this.xhr.call<IBookingReportCards>({
      url: `BookingReport/GetCard/${organizationId}`,
      method: HttpMethod.GET,
    });
  }

  getReport(body: IBookingReportRequest) {
    return this.xhr.call<IPaginationResponse<IBookingReportRow>>({
      url: 'BookingReport/GetReport',
      method: HttpMethod.POST,
      body,
    });
  }
}
