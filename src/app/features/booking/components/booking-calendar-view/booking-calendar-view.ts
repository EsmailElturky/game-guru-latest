import { CommonModule } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  computed,
  input,
  output,
  ViewChild,
  afterNextRender,
  inject,
  effect,
  signal,
} from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CalendarEvent, CalenderComponent } from '@EsmailElturky/ui-kit';
import { BookingService } from '../../services';
import { BookingStatus, IBookingCalendarResponse } from '../../interfaces';
import { transformDate } from 'src/app/shared/functions';
import { EventDetailsDialog } from 'src/app/shared/components';
import { toSignal } from '@angular/core/rxjs-interop';
@Component({
  selector: 'app-booking-calendar-view',
  standalone: true,
  imports: [CommonModule, TranslateModule, CalenderComponent, EventDetailsDialog],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './booking-calendar-view.html',
  styleUrl: './booking-calendar-view.scss',
})
export class BookingCalendarView {
  private bookingService = inject(BookingService);
  @ViewChild('demoCalendar') demoCalendar!: CalenderComponent;
  @ViewChild('eventDetailsDialog') eventDetailsDialog!: EventDetailsDialog;
  private translate = inject(TranslateService);

  searchQuery = input('');
  selectedOrganization = input<number | null>(null);
  dateFrom = signal('');
  dateTo = signal('');

  bookings = signal<any>([]);

  lang = toSignal(this.translate.onLangChange);

  buttonText = computed<Record<string, string> | undefined>(() => {
    const lang = this.lang()?.lang;
    return {
      today: this.translate.instant('uikit.calendar.today'),
      month: this.translate.instant('uikit.calendar.month'),
      week: this.translate.instant('uikit.calendar.week'),
      day: this.translate.instant('uikit.calendar.day'),
      list: this.translate.instant('uikit.calendar.list'),
      prev: this.translate.instant('uikit.calendar.prev'),
      next: this.translate.instant('uikit.calendar.next'),
    };
  });

  toggleView = output<void>();
  calendarEvents = computed<CalendarEvent[]>(() =>
    this.bookings().map((b: IBookingCalendarResponse) => ({
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

  private getStatusColor(status: BookingStatus): string {
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

  constructor() {
    afterNextRender(() => {
      this.demoCalendar?.updateSize();
    });
    effect(() => {
      if (this.searchQuery() || this.selectedOrganization() || this.dateFrom() || this.dateTo()) {
        this.getBookings();
      }
    });
  }

  getBookings() {
    this.bookingService
      .getBookingCalendar({
        search: this.searchQuery(),
        organizationId: this.selectedOrganization()!,
        dateFrom: this.dateFrom(),
        dateTo: this.dateTo(),
      })
      .subscribe((data) => {
        this.bookings.set(data);
      });
  }

  onVisibleRangeChange(event: any) {
    this.dateFrom.set(transformDate(event.dateFrom));
    this.dateTo.set(transformDate(event.dateTo));
  }

  onEventClick(event: any) {
    const bookingId = event.event.extendedProps.referenceNumber;
    const booking = this.bookings().find((b: IBookingCalendarResponse) => b.id === bookingId);
    if (booking) {
      this.eventDetailsDialog.show(booking);
    }
  }
}
