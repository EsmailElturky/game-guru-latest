import { Routes } from '@angular/router';
import { AppPage } from 'src/app/core/constants/app-pages';
import {
  addPageRoute,
  editPageRoute,
  pageRoute,
  viewPageRoute,
} from 'src/app/core/utils/route-permission.helpers';

export const customersRoutes: Routes = [
  pageRoute({
    path: '',
    page: AppPage.Customer,
    loadComponent: () => import('./pages/customers/customers').then((m) => m.Customers),
  }),
  addPageRoute({
    path: 'add-customer',
    page: AppPage.Customer,
    loadComponent: () => import('./pages/add-customer/add-customer').then((m) => m.AddCustomer),
  }),
  editPageRoute({
    path: 'edit-customer/:id',
    page: AppPage.Customer,
    loadComponent: () => import('./pages/add-customer/add-customer').then((m) => m.AddCustomer),
  }),
  viewPageRoute({
    path: 'view-customer/:id',
    page: AppPage.Customer,
    loadComponent: () => import('./pages/view-customer/view-customer').then((m) => m.ViewCustomer),
  }),
];
