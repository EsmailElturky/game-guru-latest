import { Routes } from '@angular/router';
import { AppPage } from 'src/app/core/constants/app-pages';
import {
  addPageRoute,
  editPageRoute,
  pageRoute,
  viewPageRoute,
} from 'src/app/core/utils/route-permission.helpers';

export const systemConfigurationsRoutes: Routes = [
  {
    path: '',
    redirectTo: 'general-configurations',
    pathMatch: 'full',
  },
  editPageRoute({
    path: 'general-configurations',
    page: AppPage.GeneralConfigurations,
    loadComponent: () =>
      import('./pages/general-configurations/general-configurations').then(
        (m) => m.GeneralConfigurations,
      ),
  }),
  pageRoute({
    path: 'cities',
    page: AppPage.City,
    loadComponent: () => import('./pages/cities/cities').then((m) => m.Cities),
  }),
  addPageRoute({
    path: 'cities/add-city',
    page: AppPage.City,
    loadComponent: () => import('./pages/add-city/add-city').then((m) => m.AddCity),
  }),
  editPageRoute({
    path: 'cities/edit-city/:id',
    page: AppPage.City,
    loadComponent: () => import('./pages/add-city/add-city').then((m) => m.AddCity),
  }),
  viewPageRoute({
    path: 'cities/view-city/:id',
    page: AppPage.City,
    loadComponent: () => import('./pages/view-city/view-city').then((m) => m.ViewCity),
  }),
  pageRoute({
    path: 'sports',
    page: AppPage.Sport,
    loadComponent: () => import('./pages/sports/sports').then((m) => m.Sports),
  }),
  addPageRoute({
    path: 'sports/add-sport',
    page: AppPage.Sport,
    loadComponent: () => import('./pages/add-sport/add-sport').then((m) => m.AddSport),
  }),
  editPageRoute({
    path: 'sports/edit-sport/:id',
    page: AppPage.Sport,
    loadComponent: () => import('./pages/add-sport/add-sport').then((m) => m.AddSport),
  }),
  viewPageRoute({
    path: 'sports/view-sport/:id',
    page: AppPage.Sport,
    loadComponent: () => import('./pages/view-sport/view-sport').then((m) => m.ViewSport),
  }),
  pageRoute({
    path: 'sliders',
    page: AppPage.Slider,
    loadComponent: () => import('./pages/slides/slides').then((m) => m.Slides),
  }),
  addPageRoute({
    path: 'sliders/add-slider',
    page: AppPage.Slider,
    loadComponent: () =>
      import('./pages/add-edit-slide/add-edit-slide').then((m) => m.AddEditSlide),
  }),
  editPageRoute({
    path: 'sliders/edit-slider/:id',
    page: AppPage.Slider,
    loadComponent: () =>
      import('./pages/add-edit-slide/add-edit-slide').then((m) => m.AddEditSlide),
  }),
  viewPageRoute({
    path: 'sliders/view-slider/:id',
    page: AppPage.Slider,
    loadComponent: () => import('./pages/view-slider/view-slider').then((m) => m.ViewSlider),
  }),
  pageRoute({
    path: 'intro',
    page: AppPage.Intro,
    loadComponent: () => import('./pages/intro/intro').then((m) => m.Intro),
  }),
  addPageRoute({
    path: 'intro/add-intro',
    page: AppPage.Intro,
    loadComponent: () =>
      import('./pages/add-edit-intro/add-edit-intro').then((m) => m.AddEditIntro),
  }),
  editPageRoute({
    path: 'intro/edit-intro/:id',
    page: AppPage.Intro,
    loadComponent: () =>
      import('./pages/add-edit-intro/add-edit-intro').then((m) => m.AddEditIntro),
  }),
  viewPageRoute({
    path: 'intro/view-intro/:id',
    page: AppPage.Intro,
    loadComponent: () => import('./pages/view-intro/view-intro').then((m) => m.ViewIntro),
  }),
  pageRoute({
    path: 'faq',
    page: AppPage.FAQ,
    loadComponent: () => import('./pages/faq/faq').then((m) => m.Faq),
  }),
  addPageRoute({
    path: 'faq/add-faq',
    page: AppPage.FAQ,
    loadComponent: () => import('./pages/add-edit-faq/add-edit-faq').then((m) => m.AddEditFaq),
  }),
  editPageRoute({
    path: 'faq/edit-faq/:id',
    page: AppPage.FAQ,
    loadComponent: () => import('./pages/add-edit-faq/add-edit-faq').then((m) => m.AddEditFaq),
  }),
  viewPageRoute({
    path: 'faq/view-faq/:id',
    page: AppPage.FAQ,
    loadComponent: () => import('./pages/view-faq/view-faq').then((m) => m.ViewFaq),
  }),
  editPageRoute({
    path: 'cancel-policy',
    page: AppPage.CancelPolicy,
    loadComponent: () =>
      import('./pages/edit-cancel-policy/edit-cancel-policy').then((m) => m.EditCancelPolicy),
  }),
  editPageRoute({
    path: 'privacy-policy',
    page: AppPage.PrivacyPolicy,
    loadComponent: () =>
      import('./pages/edit-privacy-policy/edit-privacy-policy').then((m) => m.EditPrivacyPolicy),
  }),
  editPageRoute({
    path: 'usage-agreement',
    page: AppPage.PrivacyPolicy,
    loadComponent: () =>
      import('./pages/edit-usage-agreement/edit-usage-agreement').then((m) => m.EditUsageAgreement),
  }),
  editPageRoute({
    path: 'terms-and-conditions',
    page: AppPage.TermsConditions,
    loadComponent: () =>
      import('./pages/edit-terms-and-conditions/edit-terms-and-conditions').then(
        (m) => m.EditTermsAndConditions,
      ),
  }),
];
