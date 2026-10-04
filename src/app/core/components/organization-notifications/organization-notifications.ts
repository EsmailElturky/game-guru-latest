import { CommonModule } from '@angular/common';

import {
  Component,
  computed,
  DestroyRef,
  ElementRef,
  HostListener,
  inject,
  NgZone,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { TranslateModule } from '@ngx-translate/core';

import { ProgressSpinnerModule } from 'primeng/progressspinner';

import { ToastService, ToastType } from '@EsmailElturky/ui-kit';

import type { MessagePayload } from 'firebase/messaging';

import { finalize } from 'rxjs';

import { NotificationDetailDialog } from '../notification-detail-dialog/notification-detail-dialog';

import type { FcmPushPayload } from 'src/app/core/interfaces/fcm-push.interface';

import { IOrganizationNotification } from 'src/app/core/interfaces/organization-notification.interface';

import { OrganizationNotificationService } from 'src/app/core/services/organization-notification/organization-notification.service';

import { Auth } from 'src/app/features/auth/services/auth';

import { FirebaseService } from 'src/app/shared/services';

const PAGE_SIZE = 10;

const SCROLL_LOAD_THRESHOLD_PX = 48;

@Component({
  selector: 'app-organization-notifications',

  standalone: true,

  imports: [CommonModule, TranslateModule, ProgressSpinnerModule, NotificationDetailDialog],

  templateUrl: './organization-notifications.html',

  styleUrl: './organization-notifications.scss',
})
export class OrganizationNotifications implements OnInit {
  private readonly notificationService = inject(OrganizationNotificationService);

  private readonly destroyRef = inject(DestroyRef);

  private readonly elementRef = inject(ElementRef<HTMLElement>);

  private readonly firebaseService = inject(FirebaseService);

  private readonly authService = inject(Auth);

  private readonly toast = inject(ToastService);

  private readonly ngZone = inject(NgZone);

  @ViewChild(NotificationDetailDialog) detailDialog!: NotificationDetailDialog;

  readonly panelOpen = signal(false);

  readonly notifications = signal<IOrganizationNotification[]>([]);

  readonly totalCount = signal(0);

  readonly pageNo = signal(0);

  readonly loading = signal(false);

  readonly loadingMore = signal(false);

  readonly selectedNotification = signal<IOrganizationNotification | null>(null);

  private pushListenerReady = false;

  private readonly fcmForegroundHandler = (payload: MessagePayload) => {
    this.ngZone.run(() => this.handleFcmPush(this.messagePayloadToPush(payload)));
  };

  private swMessageHandler: ((event: MessageEvent) => void) | null = null;

  readonly unreadCount = computed(
    () => this.notifications().filter((notification) => !notification.isRead).length,
  );

  readonly hasMore = computed(() => this.notifications().length < this.totalCount());

  readonly badgeLabel = computed(() => {
    const count = this.unreadCount();

    if (count <= 0) {
      return '';
    }

    return count > 99 ? '99+' : String(count);
  });

  ngOnInit(): void {
    this.loadPage(0, false);

    void this.setupPushListener();

    this.destroyRef.onDestroy(() => {
      this.firebaseService.unsubscribeForegroundMessages(this.fcmForegroundHandler);

      if (this.swMessageHandler && 'serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('message', this.swMessageHandler);

        this.swMessageHandler = null;
      }

      this.pushListenerReady = false;
    });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.panelOpen()) {
      return;
    }

    const target = event.target as Node;

    if (!this.elementRef.nativeElement.contains(target)) {
      this.panelOpen.set(false);
    }
  }

  togglePanel(event: MouseEvent): void {
    event.stopPropagation();

    const next = !this.panelOpen();

    this.panelOpen.set(next);

    if (next) {
      this.loadPage(0, false);
    }
  }

  onListScroll(event: Event): void {
    const element = event.target as HTMLElement;

    const nearBottom =
      element.scrollTop + element.clientHeight >= element.scrollHeight - SCROLL_LOAD_THRESHOLD_PX;

    if (nearBottom) {
      this.loadMore();
    }
  }

  loadMore(): void {
    if (this.loading() || this.loadingMore() || !this.hasMore()) {
      return;
    }

    this.loadPage(this.pageNo() + 1, true);
  }

  openNotification(notification: IOrganizationNotification, event: MouseEvent): void {
    event.stopPropagation();

    this.selectedNotification.set(notification);

    this.detailDialog?.show();

    if (!notification.isRead) {
      this.markAsRead(notification);
    }
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleString();
  }

  private async setupPushListener(): Promise<void> {
    if (this.pushListenerReady || !this.authService.isAuthenticated()) {
      return;
    }

    try {
      await this.firebaseService.subscribeForegroundMessages(this.fcmForegroundHandler);

      if ('serviceWorker' in navigator) {
        this.swMessageHandler = (event: MessageEvent) => {
          if (event.data?.type !== 'FCM_PUSH') {
            return;
          }

          this.ngZone.run(() => this.handleFcmPush(event.data.payload as FcmPushPayload));
        };

        navigator.serviceWorker.addEventListener('message', this.swMessageHandler);
      }

      this.pushListenerReady = true;

      const token = await this.firebaseService.getMessagingToken();

      this.authService

        .registerFirebaseMessagingToken(token)

        .pipe(takeUntilDestroyed(this.destroyRef))

        .subscribe({
          error: (err) => console.warn('FCM token registration failed:', err),
        });
    } catch (error) {
      console.warn('Organization notification push setup failed:', error);
    }
  }

  private messagePayloadToPush(payload: MessagePayload): FcmPushPayload {
    return {
      notification: payload.notification,

      data: payload.data ? { ...payload.data } : undefined,
    };
  }

  private handleFcmPush(payload: FcmPushPayload): void {
    const type = payload.data?.['type'];

    if (type !== 'notification') {
      return;
    }

    const title = payload.notification?.title?.trim() ?? '';

    const body = payload.notification?.body?.trim() ?? '';

    if (!title && !body) {
      return;
    }

    this.toast.addToast(ToastType.Info, title || body, title ? body : '');

    this.loadPage(0, false);
  }

  private loadPage(pageNo: number, append: boolean): void {
    if (append) {
      this.loadingMore.set(true);
    } else {
      this.loading.set(true);
    }

    this.notificationService

      .getAll(pageNo, PAGE_SIZE)

      .pipe(
        takeUntilDestroyed(this.destroyRef),

        finalize(() => {
          this.loading.set(false);

          this.loadingMore.set(false);
        }),
      )

      .subscribe({
        next: (response) => {
          const items = response.items ?? [];

          this.totalCount.set(response.totalCount ?? items.length);

          this.pageNo.set(pageNo);

          this.notifications.update((current) => {
            if (!append) {
              return items;
            }

            const existingIds = new Set(current.map((n) => n.id));

            const newItems = items.filter((item) => !existingIds.has(item.id));

            return [...current, ...newItems];
          });
        },
      });
  }

  private markAsRead(notification: IOrganizationNotification): void {
    this.notificationService

      .markAsRead(notification.id)

      .pipe(takeUntilDestroyed(this.destroyRef))

      .subscribe({
        next: () => {
          this.notifications.update((items) =>
            items.map((item) =>
              item.id === notification.id
                ? { ...item, isRead: true, readDate: new Date().toISOString() }
                : item,
            ),
          );

          this.selectedNotification.update((current) =>
            current?.id === notification.id
              ? { ...current, isRead: true, readDate: new Date().toISOString() }
              : current,
          );
        },
      });
  }
}
