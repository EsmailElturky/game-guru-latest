import {
  Component,
  signal,
  computed,
  ViewChild,
  afterNextRender,
  inject,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonComponent, CalenderComponent, CalendarEvent } from '@EsmailElturky/ui-kit';
import { AddSlot } from '../add-slot/add-slot';
import { BookingService } from '../../../booking/services';
import { IBookingCalendarResponse } from '../../../booking/interfaces';
import { mapSlotCalendarListToBookingCalendar } from '../../../booking/utils/map-booking-slot-calendar';
import { transformDate } from 'src/app/shared/functions';
import { Auth } from 'src/app/features/auth/services/auth';
import { EventDetailsDialog } from 'src/app/shared/components';

@Component({
  selector: 'app-booking-slots',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    ButtonComponent,
    CalenderComponent,
    AddSlot,
    EventDetailsDialog,
  ],
  templateUrl: './booking-slots.html',
  styleUrl: './booking-slots.scss',
})
export class BookingSlots {
  private bookingService = inject(BookingService);
  private auth = inject(Auth);

  @ViewChild('demoCalendar') demoCalendar!: CalenderComponent;
  @ViewChild('eventDetailsDialog') eventDetailsDialog!: EventDetailsDialog;

  isAddingSlot = signal(false);
  bookings = signal<IBookingCalendarResponse[]>([]);

  dateFrom = signal('');
  dateTo = signal('');

  organizationId = computed(() => {
    const payload = this.auth.convertTokenJWT();
    return payload ? Number(payload.organizationId) : null;
  });

  events = computed<CalendarEvent[]>(() =>
    this.bookings().map((b) => ({
      title: `${b.organizationName} - ${b.sportName}`,
      start: b.bookingDate,
      end: b.endTime,
      backgroundColor: this.getStatusColor(b.statusName),
      borderColor: this.getStatusColor(b.statusName),
      extendedProps: {
        status: b.statusName,
        referenceNumber: b.id,
      },
      textColor: '#ffffff',
    })),
  );

  constructor() {
    afterNextRender(() => {
      this.demoCalendar?.updateSize();
    });

    effect(() => {
      const orgId = this.organizationId();
      if (orgId && this.dateFrom() && this.dateTo()) {
        this.getBookings();
      }
    });
  }

  getBookings() {
    this.bookingService
      .getBookingSlotCalendar({
        search: '',
        organizationId: this.organizationId()!,
        dateFrom: this.dateFrom(),
        dateTo: this.dateTo(),
      })
      .subscribe((data) => {
        this.bookings.set(mapSlotCalendarListToBookingCalendar(data));
      });
  }

  onVisibleRangeChange(event: any) {
    this.dateFrom.set(transformDate(event.dateFrom));
    this.dateTo.set(transformDate(event.dateTo));
  }

  onEventClick(event: any) {
    const bookingId = event.event.extendedProps.referenceNumber;
    const booking = this.bookings().find((b) => b.id === bookingId);
    if (booking) {
      this.eventDetailsDialog.show(booking);
    }
  }

  toggleAddSlot() {
    this.isAddingSlot.set(!this.isAddingSlot());
  }

  private getStatusColor(status: string): string {
    switch (status) {
      case 'Ended':
        return '#10b981';
      case 'Canceled':
        return '#ef4444';
      case 'Completed':
        return '#f59e0b';
      case 'Pending':
        return '#3b82f6';
      default:
        return '#3b82f6';
    }
  }
}
