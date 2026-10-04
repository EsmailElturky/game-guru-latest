import { Routes } from '@angular/router';
import { AppPage } from 'src/app/core/constants/app-pages';
import {
  addPageRoute,
  pageRoute,
  viewPageRoute,
} from 'src/app/core/utils/route-permission.helpers';

export const bookingRoutes: Routes = [
  pageRoute({
    path: '',
    page: AppPage.Booking,
    loadComponent: () => import('./pages/booking/booking').then((m) => m.Booking),
  }),
  addPageRoute({
    path: 'add-new-booking',
    page: AppPage.Booking,
    loadComponent: () =>
      import('./components/add-new-booking/add-new-booking').then((m) => m.AddNewBooking),
  }),
  viewPageRoute({
    path: 'view-booking/:id',
    page: AppPage.Booking,
    loadComponent: () => import('./pages/view-booking/view-booking').then((m) => m.ViewBooking),
  }),
];
