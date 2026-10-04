import { Routes } from '@angular/router';
import { dashboardRoutes } from './features/dashboard/dashboard.routes';
import { systemConfigurationsRoutes } from './features/system-configurations/system-configurations.routes';
import { administrationRoutes } from './features/administration/administration.routes';
import { clubManagementRoutes } from './features/club-management/club-management.routes';
import { bookingRoutes } from './features/booking/booking.routes';
import { promoCodesRoutes } from './features/promo-codes/promo-codes.routes';
import { customersRoutes } from './features/customers/customers.routes';
import { refundsRoutes } from './features/refunds/refunds.routes';
import { reportsRoutes } from './features/reports/reports.routes';
import { profileRoutes } from './features/profile/profile.routes';
import { authRoutes } from './features/auth/auth.routes';
import { requestsRoutes } from './features/requests/requests.routes';
import { authGuard } from './core/guards/auth-guard';
import { guestAuthGuard } from './core/guards/guest-auth-guard';
import { featureGuardGuard } from './core/guards/feature-guard-guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'auth',
    pathMatch: 'full',
  },
  {
    path: 'auth',
    canActivate: [guestAuthGuard],
    children: authRoutes,
  },
  {
    path: '',
    loadComponent: () => import('./core/components/layout/layout').then((m) => m.Layout),
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        children: dashboardRoutes,
      },
      {
        path: 'system-configurations',
        children: systemConfigurationsRoutes,
        canActivate: [featureGuardGuard],
      },
      {
        path: 'administration',
        children: administrationRoutes,
        canActivate: [featureGuardGuard],
      },
      {
        path: 'club-management',
        children: clubManagementRoutes,
        canActivate: [featureGuardGuard],
      },
      {
        path: 'requests',
        loadComponent: () =>
          import('./features/requests/pages/requests-layout/requests-layout').then(
            (m) => m.RequestsLayout,
          ),
        children: requestsRoutes,
        canActivate: [featureGuardGuard],
      },
      {
        path: 'booking',
        children: bookingRoutes,
        canActivate: [featureGuardGuard],
      },
      {
        path: 'promo-codes',
        children: promoCodesRoutes,
        canActivate: [featureGuardGuard],
      },
      {
        path: 'customers',
        children: customersRoutes,
        canActivate: [featureGuardGuard],
      },
      {
        path: 'refunds',
        children: refundsRoutes,
        canActivate: [featureGuardGuard],
      },
      {
        path: 'reports',
        children: reportsRoutes,
        canActivate: [featureGuardGuard],
      },
      {
        path: 'profile',
        children: profileRoutes,
        canActivate: [featureGuardGuard],
      },
    ],
    canActivate: [authGuard],
  },
];
