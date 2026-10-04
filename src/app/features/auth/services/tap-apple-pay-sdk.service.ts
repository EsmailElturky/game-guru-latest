import { Injectable } from '@angular/core';
import { TapApplePayRenderOptions, TapApplePaySdkGlobal, TapApplePayTokenResult } from '../interfaces';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TapApplePaySdkService {
  private scriptLoadPromise?: Promise<TapApplePaySdkGlobal>;
  private cssLoaded = false;
  private mountedContainerId?: string;

  loadSdk(): Promise<TapApplePaySdkGlobal> {
    this.loadStylesheet();
    if (window.TapApplepaySDK) {
      return Promise.resolve(window.TapApplepaySDK);
    }
    if (!this.scriptLoadPromise) {
      const url = environment.tapPayment.applePay.scriptUrl;
      this.scriptLoadPromise = new Promise((resolve, reject) => {
        const existing = document.querySelector(`script[src="${url}"]`);
        if (existing) {
          existing.addEventListener('load', () => {
            if (window.TapApplepaySDK) resolve(window.TapApplepaySDK);
            else reject(new Error('Tap Apple Pay SDK unavailable after load'));
          });
          return;
        }
        const script = document.createElement('script');
        script.src = url;
        script.async = true;
        script.onload = () => {
          if (window.TapApplepaySDK) resolve(window.TapApplepaySDK);
          else reject(new Error('Tap Apple Pay SDK unavailable after load'));
        };
        script.onerror = () => reject(new Error('Tap Apple Pay SDK script failed'));
        document.head.appendChild(script);
      });
    }
    return this.scriptLoadPromise;
  }

  async renderButton(options: TapApplePayRenderOptions): Promise<void> {
    const sdk = await this.loadSdk();
    this.unmount();

    const nameParts = (options.customerName ?? 'Customer User').trim().split(/\s+/).filter(Boolean);
    const first = nameParts[0] ?? 'Customer';
    const last = nameParts.length > 1 ? (nameParts[nameParts.length - 1] ?? 'User') : first;
    const middle = nameParts.length > 2 ? nameParts.slice(1, -1).join(' ') : '';
    const locale = options.locale === 'ar' ? 'ar' : 'en';

    const config: Record<string, unknown> = {
      debug: false,
      scope: 'TapToken',
      publicKey: options.publicKey,
      environment: options.environment ?? environment.tapPayment.applePay.environment,
      merchant: {
        domain: options.merchantDomain,
        id: options.merchantId,
      },
      acceptance: {
        supportedBrands: ['mada', 'masterCard', 'visa'],
      },
      features: {
        supportsCouponCode: false,
      },
      transaction: {
        currency: options.currency,
        amount: String(options.amount),
      },
      customer: {
        name: [{ locale, first, last, middle }],
        contact: {
          email: options.customerEmail,
          phone: {
            number: options.phoneNumber ?? '500000000',
            countryCode: options.phoneCountryCode ?? '+966',
          },
        },
      },
      interface: {
        locale,
        theme: 'light',
        type: 'pay',
        edges: 'curved',
      },
      onReady: options.onReady,
      onCancel: options.onCancel,
      onError: options.onError,
      onSuccess: (data: TapApplePayTokenResult) => options.onSuccess?.(data),
    };

    sdk.render(config, options.containerId);
    this.mountedContainerId = options.containerId;
  }

  unmount(): void {
    window.TapApplepaySDK?.abortApplePaySession?.();
    if (this.mountedContainerId) {
      const el = document.getElementById(this.mountedContainerId);
      if (el) {
        el.innerHTML = '';
      }
      this.mountedContainerId = undefined;
    }
  }

  private loadStylesheet(): void {
    if (this.cssLoaded) {
      return;
    }
    const href = environment.tapPayment.applePay.cssUrl;
    if (document.querySelector(`link[href="${href}"]`)) {
      this.cssLoaded = true;
      return;
    }
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
    this.cssLoaded = true;
  }
}
