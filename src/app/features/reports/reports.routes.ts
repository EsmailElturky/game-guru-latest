import { Routes } from '@angular/router';
import { AppPage } from 'src/app/core/constants/app-pages';
import { pageRoute } from 'src/app/core/utils/route-permission.helpers';

export const reportsRoutes: Routes = [
  pageRoute({
    path: 'subscription-revenue',
    page: AppPage.SubscriptionRevenue,
    loadComponent: () =>
      import('./pages/subscription-revenue/subscription-revenue').then(
        (m) => m.SubscriptionRevenue,
      ),
  }),
  pageRoute({
    path: 'booking-revenue',
    page: AppPage.BookingRevenue,
    loadComponent: () =>
      import('./pages/booking-revenue/booking-revenue').then((m) => m.BookingRevenue),
  }),
  pageRoute({
    path: 'sports-revenue',
    page: AppPage.SportRevenue,
    loadComponent: () =>
      import('./pages/sports-revenue/sports-revenue').then((m) => m.SportsRevenue),
  }),
  pageRoute({
    path: 'organization-revenue',
    page: AppPage.OrganizationRevenue,
    loadComponent: () =>
      import('./pages/organization-revenue/organization-revenue').then(
        (m) => m.OrganizationRevenue,
      ),
  }),
  pageRoute({
    path: 'refund-report',
    page: AppPage.Refund,
    loadComponent: () =>
      import('./pages/refund-report/refund-report').then((m) => m.RefundReport),
  }),
  pageRoute({
    path: 'booking-report',
    page: AppPage.BookingRevenue,
    loadComponent: () =>
      import('./pages/booking-report/booking-report').then((m) => m.BookingReport),
  }),
];
