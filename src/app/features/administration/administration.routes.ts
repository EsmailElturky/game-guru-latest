import { Routes } from '@angular/router';
import { AppPage } from 'src/app/core/constants/app-pages';
import {
  addPageRoute,
  editPageRoute,
  pageRoute,
  viewPageRoute,
} from 'src/app/core/utils/route-permission.helpers';

export const administrationRoutes: Routes = [
  pageRoute({
    path: '',
    page: AppPage.User,
    loadComponent: () => import('./pages/users/users').then((m) => m.Users),
  }),
  pageRoute({
    path: 'users',
    page: AppPage.User,
    loadComponent: () => import('./pages/users/users').then((m) => m.Users),
  }),
  addPageRoute({
    path: 'users/add-user',
    page: AppPage.User,
    loadComponent: () => import('./pages/add-edit-user/add-edit-user').then((m) => m.AddEditUser),
  }),
  editPageRoute({
    path: 'users/edit-user/:id',
    page: AppPage.User,
    loadComponent: () => import('./pages/add-edit-user/add-edit-user').then((m) => m.AddEditUser),
  }),
  viewPageRoute({
    path: 'users/view-user/:id',
    page: AppPage.User,
    loadComponent: () => import('./pages/view-user/view-user').then((m) => m.ViewUser),
  }),
  pageRoute({
    path: 'roles',
    page: AppPage.Role,
    loadComponent: () => import('./pages/roles/roles').then((m) => m.Roles),
  }),
  addPageRoute({
    path: 'roles/add-new-role',
    page: AppPage.Role,
    loadComponent: () => import('./pages/add-new-role/add-new-role').then((m) => m.AddNewRole),
  }),
  editPageRoute({
    path: 'roles/edit-role/:id',
    page: AppPage.Role,
    loadComponent: () => import('./pages/add-new-role/add-new-role').then((m) => m.AddNewRole),
  }),
  viewPageRoute({
    path: 'roles/view-role/:id',
    page: AppPage.Role,
    loadComponent: () => import('./pages/view-role/view-role').then((m) => m.ViewRole),
  }),
  pageRoute({
    path: 'coaches',
    page: AppPage.Coach,
    loadComponent: () => import('./pages/coaches/coaches').then((m) => m.Coaches),
  }),
  addPageRoute({
    path: 'coaches/add-coach',
    page: AppPage.Coach,
    loadComponent: () =>
      import('./pages/add-edit-coach/add-edit-coach').then((m) => m.AddEditCoach),
  }),
  editPageRoute({
    path: 'coaches/edit-coach/:id',
    page: AppPage.Coach,
    loadComponent: () =>
      import('./pages/add-edit-coach/add-edit-coach').then((m) => m.AddEditCoach),
  }),
  pageRoute({
    path: 'audits',
    page: AppPage.User,
    loadComponent: () => import('./pages/audits/audits').then((m) => m.Audits),
  }),
];
