import { Routes } from '@angular/router';

export const profileRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/profile/profile').then((m) => m.Profile),
  },
  {
    path: 'add-court',
    loadComponent: () =>
      import('./components/add-edit-court/add-edit-court').then((m) => m.AddEditCourt),
  },
  {
    path: 'edit-court/:id',
    loadComponent: () =>
      import('./components/add-edit-court/add-edit-court').then((m) => m.AddEditCourt),
  },
  {
    path: 'view-court/:id',
    loadComponent: () => import('./components/view-court/view-court').then((m) => m.ViewCourt),
  },
];
