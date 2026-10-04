import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonComponent, InputTextComponent, SelectComponent } from '@EsmailElturky/ui-kit';
import { BookingCalendarView } from '../../components/booking-calendar-view/booking-calendar-view';
import { BookingListView } from '../../components/booking-list-view/booking-list-view';
import { RouterLink } from '@angular/router';
import { Auth } from 'src/app/features/auth/services/auth';
import { toSignal } from '@angular/core/rxjs-interop';
import { Lookups } from 'src/app/shared/services';
import { LookupsEnum } from 'src/app/shared/enums';
import { ILookup } from 'src/app/shared/interfaces';
import { AppPage } from 'src/app/core/constants/app-pages';
import { injectPagePermissions } from 'src/app/core/utils/inject-page-permissions';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    InputTextComponent,
    SelectComponent,
    ButtonComponent,
    BookingListView,
    BookingCalendarView,
    RouterLink,
  ],
  templateUrl: './booking.html',
  styleUrl: './booking.scss',
})
export class Booking {
  public authService = inject(Auth);
  private readonly lookupsService = inject(Lookups);
  readonly perms = injectPagePermissions(AppPage.Booking);

  viewMode = signal<'list' | 'calendar'>('list');
  searchQuery = signal('');
  selectedOrganization = signal<number | null>(null);
  organizationOptions = toSignal(this.lookupsService.getLookup(LookupsEnum.GetOrganization), {
    initialValue: [] as ILookup[],
  });

  onSearchChange(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchQuery.set(value);
  }

  onOrganizationChange(value: any) {
    this.selectedOrganization.set(value ?? null);
  }

  toggleView() {
    this.viewMode.set(this.viewMode() === 'list' ? 'calendar' : 'list');
  }

  exportBookings() {
    console.log('export bookings');
  }
  clearSearch() {
    this.searchQuery.set('');
    this.selectedOrganization.set(null);
  }
}
