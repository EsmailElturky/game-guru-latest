import { Component, DestroyRef, inject, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { BreadcrumbComponent, ButtonComponent } from '@EsmailElturky/ui-kit';
import { OrganizationNotifications } from '../organization-notifications/organization-notifications';
import { TranslateService } from '@ngx-translate/core';
import { MenuItem } from 'primeng/api';
import { TranslationService } from '../../services';
import { filter } from 'rxjs';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-nav-bar',
  imports: [BreadcrumbComponent, ButtonComponent, OrganizationNotifications],
  templateUrl: './nav-bar.html',
  styleUrl: './nav-bar.scss',
})
export class NavBar {
  private router = inject(Router);
  private translate = inject(TranslateService);
  private translateService = inject(TranslationService);
  private destroyRef = inject(DestroyRef);

  items = signal<MenuItem[]>([]);
  language = this.translateService.currentLang;

  constructor() {
    toObservable(this.translateService.onLangChange)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.items.update((items) => {
          return items.map((item) => {
            return {
              ...item,
              label: this.translate.instant(item['labelKey']),
            };
          });
        });
      });
  }

  ngOnInit() {
    this.getRoutesFromUrl(this.router.url);
    this.router.events
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        filter((event) => event instanceof NavigationEnd),
      )
      .subscribe((event) => {
        this.getRoutesFromUrl(event.url);
      });
  }

  getRoutesFromUrl(url: string) {
    const routes = url.split('/').filter((item) => item !== '' && !Number.isInteger(+item));
    const items: MenuItem[] = [];
    routes.forEach((route, index) => {
      if (index > 0) {
        items.push({
          label: this.translate.instant(`navigation.${route}`),
          labelKey: `navigation.${route}`,
          routerLink: `${routes[0]}/${route}`,
        });
      }
    });
    this.items.set(items);
  }

  toggleLanguage() {
    this.translateService.changeLanguage(this.language() === 'ar' ? 'en' : 'ar');
  }
}
