import { Routes } from '@angular/router';
import { AppPage } from 'src/app/core/constants/app-pages';
import { pageRoute, viewPageRoute } from 'src/app/core/utils/route-permission.helpers';

export const refundsRoutes: Routes = [
  pageRoute({
    path: '',
    page: AppPage.Refund,
    loadComponent: () => import('./pages/refunds/refunds').then((m) => m.Refunds),
  }),
  pageRoute({
    path: 'all-refunds',
    page: AppPage.Refund,
    loadComponent: () => import('./pages/refunds/refunds').then((m) => m.Refunds),
  }),
  viewPageRoute({
    path: 'all-refunds/view-refund/:id',
    page: AppPage.Refund,
    loadComponent: () => import('./pages/view-refund/view-refund').then((m) => m.ViewRefund),
  }),
];
