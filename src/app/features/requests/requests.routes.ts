import { Routes } from '@angular/router';
import { AppPage } from 'src/app/core/constants/app-pages';
import { pageRoute, viewPageRoute } from 'src/app/core/utils/route-permission.helpers';

export const requestsRoutes: Routes = [
  { path: '', redirectTo: 'new-signups', pathMatch: 'full' },
  pageRoute({
    path: 'new-signups',
    page: AppPage.NewSignup,
    loadComponent: () =>
      import('./pages/new-signups/new-signups').then((m) => m.NewSignups),
  }),
  pageRoute({
    path: 'cancel-subscription',
    page: AppPage.CancelSubscription,
    loadComponent: () =>
      import('./pages/cancel-subscription/cancel-subscription').then(
        (m) => m.CancelSubscription,
      ),
  }),
  viewPageRoute({
    path: 'transaction/:organizationId',
    page: AppPage.NewSignup,
    loadComponent: () =>
      import('./pages/organization-transaction-detail/organization-transaction-detail').then(
        (m) => m.OrganizationTransactionDetail,
      ),
  }),
];
