import { inject, Injectable } from '@angular/core';
import { HttpMethod } from 'src/app/core/enums';
import { Xhr } from 'src/app/core/services';
import {
  IBookingList,
  IBookingListRequest,
  IBookingCalendarRequest,
  IBookingCalendarResponse,
  IBookingDetail,
  IBookingSlotCalendarResponse,
} from '../../interfaces';
import { IPaginationResponse } from 'src/app/shared/interfaces';
@Injectable({
  providedIn: 'root',
})
export class BookingService {
  private readonly xhr = inject(Xhr);

  getBookingsList(body: IBookingListRequest) {
    return this.xhr.call<IPaginationResponse<IBookingList>>({
      url: 'Booking/GetAll',
      method: HttpMethod.POST,
      body,
    });
  }

  deleteBooking(id: number) {
    return this.xhr.call<void>({
      url: `Booking/${id}`,
      method: HttpMethod.DELETE,
    });
  }

  cancelBooking(body: { bookingId: number; reason: string }) {
    return this.xhr.call<void>({
      url: `BookingTransaction/Cancelle`,
      method: HttpMethod.POST,
      body: body,
    });
  }

  assignCoach(bookingId: number, coachId: number) {
    return this.xhr.call<void>({
      url: 'Booking/AssignCoach',
      method: HttpMethod.POST,
      body: { bookingId, coachId },
    });
  }

  completeBooking(bookingId: number) {
    return this.xhr.call<void>({
      url: 'BookingTransaction/Complete',
      method: HttpMethod.POST,
      body: { bookingId },
    });
  }

  getBookingById(id: number) {
    return this.xhr.call<IBookingDetail>({
      url: `Booking/${id}`,
      method: HttpMethod.GET,
    });
  }

  getBookingCalendar(body: IBookingCalendarRequest) {
    return this.xhr.call<IBookingCalendarResponse[]>({
      url: 'Booking/GetAllCalendar',
      method: HttpMethod.POST,
      body,
    });
  }

  getBookingSlotCalendar(body: IBookingCalendarRequest) {
    return this.xhr.call<IBookingSlotCalendarResponse[]>({
      url: 'BookingSlot/GetAllCalendar',
      method: HttpMethod.POST,
      body,
    });
  }

  createBookingSlot(body: any) {
    return this.xhr.call<void>({
      url: 'BookingSlot',
      method: HttpMethod.POST,
      body,
    });
  }

  getSports() {
    return this.xhr.call<any[]>({
      url: 'Sport',
      method: HttpMethod.GET,
    });
  }
}
