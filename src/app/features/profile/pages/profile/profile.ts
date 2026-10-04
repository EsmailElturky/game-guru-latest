import { Component, computed, DestroyRef, inject, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { TabsModule } from 'primeng/tabs';
import { UserProfileComponent } from '../../components/user-profile/user-profile.component';
import { ChangePasswordComponent } from '../../components/change-password/change-password.component';
import { Requests } from '../../components/requests/requests';
import { NotificationComponent } from '../../components/notification/notification.component';
import { Courts } from '../../components/courts/courts';
import { Subscribtions } from '../../components/subscribtions/subscribtions';
import { Organization } from '../../components/organization/organization';
import { ButtonComponent } from '@EsmailElturky/ui-kit';
import { ManagerNotifications } from '../../components/manager-notifications/manager-notifications';
import { BookingSlots } from '../../components/booking-slots/booking-slots';
import { Auth } from 'src/app/features/auth/services/auth';
import { UploadLogoDialog } from '../../components/upload-logo-dialog/upload-logo-dialog';
import { environment } from 'src/environments/environment';
import { PROFILE_TAB } from '../../profile-tab.constants';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    TranslateModule,
    TabsModule,
    UserProfileComponent,
    ChangePasswordComponent,
    Requests,
    NotificationComponent,
    Courts,
    Subscribtions,
    Organization,
    ButtonComponent,
    ManagerNotifications,
    BookingSlots,
    UploadLogoDialog,
  ],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile {
  authService = inject(Auth);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  uploadLogoDialog = viewChild(UploadLogoDialog);
  imageApi = environment.imageApi;

  /** Selected tab id (string) — synced with `?tab=` query param. */
  activeTab = signal<string>(PROFILE_TAB.userProfile);

  adminTabs = signal([
    { label: 'profile.userProfile', value: PROFILE_TAB.userProfile },
    { label: 'profile.changePassword', value: PROFILE_TAB.changePassword },
    { label: 'profile.managerNotifications', value: PROFILE_TAB.managerNotifications },
  ]);
  venueTabs = signal([
    { label: 'profile.userProfile', value: PROFILE_TAB.userProfile },
    { label: 'profile.changePassword', value: PROFILE_TAB.changePassword },
    { label: 'profile.organization', value: PROFILE_TAB.organization },
    { label: 'profile.subscriptions', value: PROFILE_TAB.subscriptions },
    { label: 'profile.courts', value: PROFILE_TAB.courts },
    { label: 'profile.requests', value: PROFILE_TAB.requests },
    { label: 'profile.notification', value: PROFILE_TAB.notification },
    { label: 'profile.bookingSlots', value: PROFILE_TAB.bookingSlots },
  ]);

  tabs = computed(() => (this.authService.isAdminApp() ? this.adminTabs() : this.venueTabs()));

  constructor() {
    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const tab = params.get('tab');
      if (tab != null && this.isValidTab(tab)) {
        this.activeTab.set(tab);
      }
    });
  }

  private isValidTab(tab: string): boolean {
    const allowed = this.authService.isAdminApp()
      ? new Set<string>([
          PROFILE_TAB.userProfile,
          PROFILE_TAB.changePassword,
          PROFILE_TAB.managerNotifications,
        ])
      : new Set<string>([
          PROFILE_TAB.userProfile,
          PROFILE_TAB.changePassword,
          PROFILE_TAB.organization,
          PROFILE_TAB.subscriptions,
          PROFILE_TAB.courts,
          PROFILE_TAB.requests,
          PROFILE_TAB.notification,
          PROFILE_TAB.bookingSlots,
        ]);
    return allowed.has(tab);
  }

  onTabChange(value: string | number | undefined) {
    if (value == null) {
      return;
    }
    const v = String(value);
    this.activeTab.set(v);
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab: v },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  openUploadLogoDialog() {
    this.uploadLogoDialog()?.show();
  }

  onLogoUploadSuccess() {
    // Optionally refresh profile data if needed
  }
}
