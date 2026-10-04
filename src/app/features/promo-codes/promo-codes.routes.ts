import { Routes } from '@angular/router';
import { AppPage } from 'src/app/core/constants/app-pages';
import {
  addPageRoute,
  editPageRoute,
  pageRoute,
  viewPageRoute,
} from 'src/app/core/utils/route-permission.helpers';

export const promoCodesRoutes: Routes = [
  pageRoute({
    path: '',
    page: AppPage.PromoCodes,
    loadComponent: () => import('./pages/promo-codes/promo-codes').then((m) => m.PromoCodes),
  }),
  addPageRoute({
    path: 'add-promo-code',
    page: AppPage.PromoCodes,
    loadComponent: () =>
      import('./pages/add-promo-code/add-promo-code').then((m) => m.AddPromoCode),
  }),
  editPageRoute({
    path: 'edit-promo-code/:id',
    page: AppPage.PromoCodes,
    loadComponent: () =>
      import('./pages/add-promo-code/add-promo-code').then((m) => m.AddPromoCode),
  }),
  viewPageRoute({
    path: 'view-promo-code/:id',
    page: AppPage.PromoCodes,
    loadComponent: () =>
      import('./pages/view-promo-code/view-promo-code').then((m) => m.ViewPromoCode),
  }),
];
