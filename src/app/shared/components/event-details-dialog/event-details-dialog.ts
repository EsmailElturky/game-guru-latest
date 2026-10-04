import { Component, signal, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { IBookingCalendarResponse } from '../../../features/booking/interfaces';

@Component({
  selector: 'app-event-details-dialog',
  standalone: true,
  imports: [CommonModule, DialogModule, TranslateModule],
  templateUrl: './event-details-dialog.html',
  styleUrl: './event-details-dialog.scss',
})
export class EventDetailsDialog {
  visible = signal(false);
  eventData = signal<IBookingCalendarResponse | null>(null);

  show(data: IBookingCalendarResponse) {
    this.eventData.set(data);
    this.visible.set(true);
  }

  hide() {
    this.visible.set(false);
  }

  getStatusColor(status: string): string {
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
