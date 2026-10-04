import { Routes } from '@angular/router';
export const dashboardRoutes: Routes = [
    {
    path: '',
    loadComponent: () => import('./pages/dashboard/dashboard').then((m) => m.Dashboard),
  },
];
