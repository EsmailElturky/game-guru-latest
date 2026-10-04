import { Injectable } from '@angular/core';
import { FirebaseApp, getApp, getApps, initializeApp } from 'firebase/app';
import {
  addDoc,
  collection,
  doc,
  DocumentData,
  Firestore,
  getDoc,
  getDocs,
  getFirestore,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  deleteDoc,
  type DocumentReference,
  type QueryConstraint,
} from 'firebase/firestore';
import {
  getMessaging,
  getToken,
  isSupported,
  onMessage,
  type MessagePayload,
  type Messaging,
} from 'firebase/messaging';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import type {
  FirebaseDocument,
  FirebaseListenOptions,
  FirebaseWriteData,
} from '../../interfaces/firebase.types';

const FCM_SW_PATH = '/firebase-messaging-sw.js';

@Injectable({
  providedIn: 'root',
})
export class FirebaseService {
  private app: FirebaseApp | null = null;
  private firestore: Firestore | null = null;
  private messaging: Messaging | null = null;
  private messagingToken: string | null = null;
  private serviceWorkerRegistration: ServiceWorkerRegistration | null = null;
  private foregroundUnsubscribe: (() => void) | null = null;
  private readonly foregroundHandlers = new Set<(payload: MessagePayload) => void>();

  /** Lazily initializes the Firebase app and Firestore instance. */
  private ensureFirestore(): Firestore {
    if (this.firestore) {
      return this.firestore;
    }

    if (getApps().length) {
      this.app = getApp();
    } else {
      this.app = initializeApp(environment.firebaseConfig);
    }

    this.firestore = getFirestore(this.app);
    return this.firestore;
  }

  getApp(): FirebaseApp {
    this.ensureFirestore();
    return this.app!;
  }

  getFirestore(): Firestore {
    return this.ensureFirestore();
  }

  /** Whether this browser supports FCM. */
  async isMessagingSupported(): Promise<boolean> {
    return typeof window !== 'undefined' && (await isSupported());
  }

  /**
   * Requests notification permission, registers the messaging service worker,
   * and returns the FCM device token (cached after first success).
   */
  async getMessagingToken(forceRefresh = false): Promise<string> {
    if (this.messagingToken && !forceRefresh) {
      return this.messagingToken;
    }

    if (!(await this.isMessagingSupported())) {
      throw new Error('Firebase Cloud Messaging is not supported in this browser.');
    }

    const vapidKey = environment.firebaseConfig.vapidKey?.trim();
    if (!vapidKey) {
      throw new Error(
        'Firebase VAPID key is missing. Set environment.firebaseConfig.vapidKey (Firebase Console → Cloud Messaging → Web Push certificates).',
      );
    }

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      throw new Error('Notification permission was not granted.');
    }

    const messaging = await this.ensureMessaging();
    const registration = await this.ensureMessagingServiceWorker();

    const token = await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration: registration,
    });

    if (!token) {
      throw new Error('Could not obtain FCM token.');
    }

    this.messagingToken = token;
    return token;
  }

  /** Clears the cached FCM token (e.g. on logout). */
  clearMessagingToken(): void {
    this.messagingToken = null;
  }

  /**
   * Handles push messages while the app is in the foreground (tab focused).
   * Registers at most one handler; call `unsubscribeForegroundMessages` to remove it.
   */
  async subscribeForegroundMessages(
    handler: (payload: MessagePayload) => void,
  ): Promise<void> {
    this.foregroundHandlers.add(handler);
    await this.ensureForegroundListener();
  }

  unsubscribeForegroundMessages(handler?: (payload: MessagePayload) => void): void {
    if (handler) {
      this.foregroundHandlers.delete(handler);
    } else {
      this.foregroundHandlers.clear();
    }
    if (this.foregroundHandlers.size === 0) {
      this.foregroundUnsubscribe?.();
      this.foregroundUnsubscribe = null;
    }
  }

  private async ensureForegroundListener(): Promise<void> {
    if (this.foregroundUnsubscribe) {
      return;
    }
    const messaging = await this.ensureMessaging();
    this.foregroundUnsubscribe = onMessage(messaging, (payload) => {
      for (const handler of this.foregroundHandlers) {
        handler(payload);
      }
    });
  }

  /** Normalizes FCM payload: backend should send a `data` map (works in foreground + background). */
  getMessageData(payload: MessagePayload): Record<string, string> {
    const data = payload.data ?? {};
    if (Object.keys(data).length > 0) {
      return { ...data };
    }
    const notification = payload.notification;
    if (!notification) {
      return {};
    }
    return {
      status: (notification as { status?: string }).status ?? '',
      message: notification.body ?? notification.title ?? '',
    };
  }

  private async ensureMessaging(): Promise<Messaging> {
    if (this.messaging) {
      return this.messaging;
    }
    this.messaging = getMessaging(this.getApp());
    return this.messaging;
  }

  private async ensureMessagingServiceWorker(): Promise<ServiceWorkerRegistration> {
    if (this.serviceWorkerRegistration) {
      return this.serviceWorkerRegistration;
    }

    if (!('serviceWorker' in navigator)) {
      throw new Error('Service workers are not supported in this browser.');
    }

    this.serviceWorkerRegistration = await navigator.serviceWorker.register(FCM_SW_PATH);
    return this.serviceWorkerRegistration;
  }
}
