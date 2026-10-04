import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import type {
  TapCardRenderOptions,
  TapCardSdkConfig,
  TapCardSdkGlobal,
} from '../interfaces/tap-card-sdk.types';

@Injectable({
  providedIn: 'root',
})
export class TapCardSdkService {
  private scriptLoadPromise?: Promise<TapCardSdkGlobal>;
  private unmountCard?: () => void;

  /**
   * Load the Tap Card SDK script from the environment configuration.
   * @returns A promise that resolves to the Tap Card SDK global object.
   */
  loadSdk(): Promise<TapCardSdkGlobal> {
    if (window.CardSDK) {
      return Promise.resolve(window.CardSDK);
    }
    if (!this.scriptLoadPromise) {
      const url = environment.tapPayment.cardSdkScriptUrl;
      this.scriptLoadPromise = new Promise((resolve, reject) => {
        const existing = document.querySelector(`script[src="${url}"]`);
        if (existing) {
          existing.addEventListener('load', () => {
            if (window.CardSDK) resolve(window.CardSDK);
            else reject(new Error('Tap Card SDK unavailable after load'));
          });
          existing.addEventListener('error', () => reject(new Error('Tap Card SDK script failed')));
          return;
        }
        const script = document.createElement('script');
        script.src = url;
        script.async = true;
        script.onload = () => {
          if (window.CardSDK) resolve(window.CardSDK);
          else reject(new Error('Tap Card SDK unavailable after load'));
        };
        script.onerror = () => reject(new Error('Tap Card SDK script failed'));
        document.head.appendChild(script);
      });
    }
    return this.scriptLoadPromise;
  }

  /**
   * Render the Tap Card SDK subscription card.
   * @param options - The options for the Tap Card SDK subscription card.
   * @returns A promise that resolves to the function to unmount the Tap Card SDK subscription card.
   */
  async renderSubscriptionCard(options: TapCardRenderOptions): Promise<() => void> {
    const sdk = await this.loadSdk();
    this.unmount();

    const { Theme, Currencies, Direction, Edges, Locale } = sdk;
    const isAr = options.locale === 'ar';
    const locale = isAr ? Locale.AR : Locale.EN;
    const direction = isAr ? Direction.RTL : Direction.LTR;
    const currency =
      (Currencies[options.currency.toUpperCase()] as string | undefined) ??
      options.currency.toUpperCase();

    const nameParts = (options.customerName ?? 'Customer User').trim().split(/\s+/).filter(Boolean);
    const first = nameParts[0] ?? 'Customer';
    const last = nameParts.length > 1 ? (nameParts[nameParts.length - 1] ?? 'User') : first;
    const middle =
      nameParts.length > 2 ? nameParts.slice(1, -1).join(' ') : '';

    const config: TapCardSdkConfig = {
      publicKey: options.publicKey,
      transaction: {
        amount: options.amount,
        currency,
      },
      customer: {
        name: [{ lang: locale, first, last, middle }],
        nameOnCard: `${first} ${last}`.trim(),
        editable: true,
        contact: {
          email: options.customerEmail,
          phone: {
            countryCode: options.phoneCountryCode ?? '966',
            number: options.phoneNumber ?? '500000000',
          },
        },
      },
      acceptance: {
        supportedBrands: ['AMERICAN_EXPRESS', 'VISA', 'MASTERCARD', 'MADA'],
        supportedCards: ['CREDIT', 'DEBIT'],
      },
      fields: { cardHolder: true },
      addons: {
        displayPaymentBrands: true,
        loader: true,
        saveCard: false,
      },
      interface: {
        locale,
        theme: Theme.LIGHT,
        edges: Edges.CURVED,
        direction,
      },
      onReady: options.onReady,
      onValidInput: options.onValidInput,
      onInvalidInput: options.onInvalidInput,
      onError: options.onError,
      onSuccess: options.onSuccess,
    };

    const merchantId = options.merchantId?.trim();
    if (merchantId) {
      config.merchant = { id: merchantId };
    }

    const container = document.getElementById(options.containerId);
    if (!container) {
      throw new Error(`Tap card container #${options.containerId} not found`);
    }
    container.replaceChildren();

    const { unmount } = sdk.renderTapCard(options.containerId, config);
    this.unmountCard = () => {
      unmount();
      container.replaceChildren();
    };
    return this.unmountCard;
  }

  /**
   * Tokenize the card.
   */
  tokenize(): void {
    window.CardSDK?.tokenize();
  }

  /**
   * Unmount the Tap Card SDK subscription card.
   */
  unmount(): void {
    this.unmountCard?.();
    this.unmountCard = undefined;
  }
}
