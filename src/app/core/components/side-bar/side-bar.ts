import {
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  model,
  output,
  signal,
} from '@angular/core';
import { AvatarModule } from 'primeng/avatar';
import { DrawerModule } from 'primeng/drawer';
import { ButtonModule } from 'primeng/button';
import { debounceTime, fromEvent } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SidebarMenuItems } from 'src/app/shared/components';
import { SidebarMenuItem } from 'src/app/shared/interfaces';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AppPage, Feature } from 'src/app/core/constants/app-pages';
import { PermissionService, TranslationService } from 'src/app/core/services';
import { Auth } from 'src/app/features/auth/services/auth';
import { environment } from 'src/environments/environment';
@Component({
  selector: 'app-side-bar',
  imports: [
    DrawerModule,
    ButtonModule,
    AvatarModule,
    SidebarMenuItems,
    RouterLink,
    TranslateModule,
  ],
  templateUrl: './side-bar.html',
  styleUrl: './side-bar.scss',
})
export class SideBar {
  private readonly router = inject(Router);
  private translateService = inject(TranslationService);
  private authService = inject(Auth);
  private permissionService = inject(PermissionService);
  visible = model(true);
  position = model<'left' | 'right'>('left');
  toggleSidebar = output<boolean>();
  imageUrl = environment.imageApi;

  user = this.authService.userData;
  language = this.translateService.currentLang;
  dismissible = signal(false);
  sideMenuItems = signal<SidebarMenuItem[]>([]);
  isAppAdmin = computed(() => this.authService.isAdminApp());

  private readonly MD_BREAKPOINT = 768;
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    effect(() => {
      if (this.visible()) {
        this.initiateSideMenuItems();
      }
    });

    effect(() => {
      if (this.permissionService.pagePermissions()?.length) {
        this.initiateSideMenuItems();
      }
    });
  }

  ngOnInit(): void {
    this.updateSidebarState();
    this.listenForResizeEvents();
    this.initiateSideMenuItems();
  }

  /**
   * Listen for window resize events and update the sidebar state accordingly.
   */
  private listenForResizeEvents(): void {
    fromEvent(window, 'resize')
      .pipe(
        debounceTime(10),
        takeUntilDestroyed(this.destroyRef), // Handles cleanup automatically
      )
      .subscribe(() => this.updateSidebarState());
  }

  /**
   * Update the state of the sidebar based on the screen size.
   * If the screen size is md or larger, the sidebar is visible and not dismissible.
   * If the screen size is smaller than md, the sidebar is hidden and dismissible.
   */
  private updateSidebarState(): void {
    const isMdOrLarger = window.innerWidth >= this.MD_BREAKPOINT;

    if (isMdOrLarger) {
      // md or larger: visible, not dismissible
      this.visible.set(true);
      this.dismissible.set(false);
      this.toggleSidebar.emit(true);
    } else {
      // smaller than md: hidden, dismissible
      this.visible.set(false);
      this.dismissible.set(true);
      this.toggleSidebar.emit(false);
    }
  }

  /**
   * Initialize the side menu items.
   */
  initiateSideMenuItems(): void {
    const systemConfigItems: SidebarMenuItem[] = [
      {
        label: 'menu.generalConfigurations',
        route: '/system-configurations/general-configurations',
        visible: this.permissionService.canAccessPage(AppPage.GeneralConfigurations),
      },
      {
        label: 'menu.activities',
        route: '/system-configurations/sports',
        visible: this.permissionService.canAccessPage(AppPage.Sport),
      },
      {
        label: 'menu.intro',
        route: '/system-configurations/intro',
        visible: this.permissionService.canAccessPage(AppPage.Intro),
      },
      {
        label: 'menu.sliders',
        route: '/system-configurations/sliders',
        visible: this.permissionService.canAccessPage(AppPage.Slider),
      },
      {
        label: 'menu.cities',
        route: '/system-configurations/cities',
        visible: this.permissionService.canAccessPage(AppPage.City),
      },
      {
        label: 'menu.faq',
        route: '/system-configurations/faq',
        visible: this.permissionService.canAccessPage(AppPage.FAQ),
      },
      {
        label: 'menu.cancelPolicy',
        route: '/system-configurations/cancel-policy',
        visible: this.permissionService.canAccessPage(AppPage.CancelPolicy),
      },
      {
        label: 'menu.privacyPolicy',
        route: '/system-configurations/privacy-policy',
        visible: this.permissionService.canAccessPage(AppPage.PrivacyPolicy),
      },
      {
        label: 'menu.termsAndConditions',
        route: '/system-configurations/terms-and-conditions',
        visible: this.permissionService.canAccessPage(AppPage.TermsConditions),
      },
    ];

    const administrationItems: SidebarMenuItem[] = [
      {
        label: 'menu.users',
        route: '/administration/users',
        visible: this.permissionService.canAccessPage(AppPage.User),
      },
      {
        label: 'menu.coaches',
        route: '/administration/coaches',
        visible: this.permissionService.canAccessPage(AppPage.Coach),
      },
      {
        label: 'menu.roles',
        route: '/administration/roles',
        visible: this.permissionService.canAccessPage(AppPage.Role),
      },
    ];

    const clubManagementItems: SidebarMenuItem[] = [
      {
        label: 'menu.organizations',
        route: '/club-management/organizations',
        visible: this.permissionService.canAccessPage(AppPage.Organization),
      },
      {
        label: 'menu.facilities',
        route: '/club-management/facilities',
        visible: this.permissionService.canAccessPage(AppPage.Facility),
      },
    ];

    const requestsItems: SidebarMenuItem[] = [
      {
        label: 'menu.newSignups',
        route: '/requests/new-signups',
        visible: this.permissionService.canAccessPage(AppPage.NewSignup),
      },
      {
        label: 'menu.cancelSubscription',
        route: '/requests/cancel-subscription',
        visible: this.permissionService.canAccessPage(AppPage.CancelSubscription),
      },
    ];

    const reportsItems: SidebarMenuItem[] = [
      // Dummy (mock-data) reports hidden until backed by real APIs:
      // {
      //   label: 'menu.subscriptionRevenue',
      //   route: '/reports/subscription-revenue',
      //   visible: this.permissionService.canAccessPage(AppPage.SubscriptionRevenue),
      // },
      // {
      //   label: 'menu.bookingRevenue',
      //   route: '/reports/booking-revenue',
      //   visible: this.permissionService.canAccessPage(AppPage.BookingRevenue),
      // },
      // {
      //   label: 'menu.activitiesRevenue',
      //   route: '/reports/sports-revenue',
      //   visible: this.permissionService.canAccessPage(AppPage.SportRevenue),
      // },
      // {
      //   label: 'menu.organizationRevenue',
      //   route: '/reports/organization-revenue',
      //   visible: this.permissionService.canAccessPage(AppPage.OrganizationRevenue),
      // },
      {
        label: 'menu.bookingReport',
        route: '/reports/booking-report',
        visible: this.permissionService.canAccessPage(AppPage.BookingRevenue),
      },
    ];

    const hasVisibleChild = (items: SidebarMenuItem[]) => items.some((item) => item.visible);

    this.sideMenuItems.set([
      {
        label: 'menu.dashboard',
        icon: 'icon-guru',
        route: '/dashboard',
        visible: this.permissionService.canAccessFeature(Feature.Dashboard),
      },
      {
        label: 'menu.systemConfigurations',
        icon: 'icon-config-1',
        visible: hasVisibleChild(systemConfigItems),
        expanded: this.isExpanded('system-configurations'),
        items: systemConfigItems,
      },
      {
        label: 'menu.administration',
        icon: 'icon-adminstration',
        visible: hasVisibleChild(administrationItems),
        expanded: this.isExpanded('administration'),
        items: administrationItems,
      },
      {
        label: 'menu.venueManagement',
        icon: 'icon-club',
        visible: hasVisibleChild(clubManagementItems),
        expanded: this.isExpanded('club-management'),
        items: clubManagementItems,
      },
      {
        label: 'menu.requests',
        icon: 'icon-booking',
        visible: hasVisibleChild(requestsItems),
        expanded: this.isExpanded('requests'),
        items: requestsItems,
      },
      {
        label: 'menu.booking',
        icon: 'icon-booking',
        route: '/booking',
        visible: this.permissionService.canAccessPage(AppPage.Booking),
      },
      {
        label: 'menu.promoCodes',
        icon: 'icon-promo',
        route: '/promo-codes',
        visible: this.permissionService.canAccessPage(AppPage.PromoCodes),
      },
      {
        label: 'menu.customers',
        icon: 'icon-customers',
        route: '/customers',
        visible: this.permissionService.canAccessPage(AppPage.Customer),
      },
      {
        label: 'menu.refunds',
        icon: 'icon-refund',
        route: '/refunds',
        visible: this.permissionService.canAccessPage(AppPage.Refund),
      },
      {
        label: 'menu.reports',
        icon: 'icon-reports',
        visible: hasVisibleChild(reportsItems),
        expanded: this.isExpanded('reports'),
        items: reportsItems,
      },
    ]);
  }

  /**
   * Check if the route is expanded.
   * @param route The route to check.
   * @returns True if the route is expanded, false otherwise.
   */
  isExpanded(route: string): boolean {
    return this.router.url.split('/')[1] === route;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
