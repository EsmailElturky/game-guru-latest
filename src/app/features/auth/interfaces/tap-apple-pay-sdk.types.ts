export interface TapApplePayTokenResult {
  id: string;
  status?: string;
  object?: string;
}

export interface TapApplePayRenderOptions {
  containerId: string;
  publicKey: string;
  merchantId: string;
  merchantDomain: string;
  amount: number;
  currency: string;
  locale: 'ar' | 'en';
  customerEmail?: string;
  customerName?: string;
  phoneCountryCode?: string;
  phoneNumber?: string;
  environment?: 'development' | 'beta' | 'production';
  onReady?: () => void;
  onCancel?: () => void;
  onError?: (error: unknown) => void;
  onSuccess?: (data: TapApplePayTokenResult) => void;
}

export interface TapApplePaySdkGlobal {
  render: (config: Record<string, unknown>, containerId: string) => void;
  abortApplePaySession?: () => void;
}

declare global {
  interface Window {
    TapApplepaySDK?: TapApplePaySdkGlobal;
  }
}
