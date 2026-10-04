import { Routes } from '@angular/router';
import { AppPage } from 'src/app/core/constants/app-pages';
import {
  addPageRoute,
  editPageRoute,
  pageRoute,
  viewPageRoute,
} from 'src/app/core/utils/route-permission.helpers';

export const clubManagementRoutes: Routes = [
  pageRoute({
    path: 'organizations',
    page: AppPage.Organization,
    loadComponent: () => import('./pages/organizations/organizations').then((m) => m.Organizations),
  }),
  addPageRoute({
    path: 'organizations/add-organization',
    page: AppPage.Organization,
    loadComponent: () =>
      import('./pages/add-organization/add-organization').then((m) => m.AddOrganization),
  }),
  editPageRoute({
    path: 'organizations/edit-organization/:id',
    page: AppPage.Organization,
    loadComponent: () =>
      import('./pages/add-organization/add-organization').then((m) => m.AddOrganization),
  }),
  viewPageRoute({
    path: 'organizations/view-organization/:id',
    page: AppPage.Organization,
    loadComponent: () =>
      import('./pages/view-organization/view-organization').then((m) => m.ViewOrganization),
  }),
  pageRoute({
    path: 'managers',
    page: AppPage.Organization,
    loadComponent: () => import('./pages/managers/managers').then((m) => m.Managers),
  }),
  addPageRoute({
    path: 'managers/add-manager',
    page: AppPage.Organization,
    loadComponent: () => import('./pages/add-manager/add-manager').then((m) => m.AddManager),
  }),
  editPageRoute({
    path: 'managers/edit-manager/:id',
    page: AppPage.Organization,
    loadComponent: () => import('./pages/add-manager/add-manager').then((m) => m.AddManager),
  }),
  viewPageRoute({
    path: 'managers/view-manager/:id',
    page: AppPage.Organization,
    loadComponent: () => import('./pages/view-manager/view-manager').then((m) => m.ViewManager),
  }),
  pageRoute({
    path: 'facilities',
    page: AppPage.Facility,
    loadComponent: () => import('./pages/facilities/facilities').then((m) => m.Facilities),
  }),
  addPageRoute({
    path: 'facilities/add-facility',
    page: AppPage.Facility,
    loadComponent: () => import('./pages/add-facility/add-facility').then((m) => m.AddFacility),
  }),
  editPageRoute({
    path: 'facilities/edit-facility/:id',
    page: AppPage.Facility,
    loadComponent: () => import('./pages/add-facility/add-facility').then((m) => m.AddFacility),
  }),
  viewPageRoute({
    path: 'facilities/view-facility/:id',
    page: AppPage.Facility,
    loadComponent: () => import('./pages/view-facility/view-facility').then((m) => m.ViewFacility),
  }),
];
