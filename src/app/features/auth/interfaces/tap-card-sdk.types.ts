/** Tap Web Card SDK v2 — global loaded from CDN. */
export interface TapCardSdkGlobal {
  renderTapCard: (
    containerId: string,
    config: TapCardSdkConfig,
  ) => { unmount: () => void };
  tokenize: () => void;
  resetCardInputs: () => void;
  saveCard: () => void;
  updateCardConfiguration: (config: Partial<TapCardSdkConfig>) => void;
  updateTheme: (theme: string) => void;
  loadSavedCard: (cardId: string) => void;
  Theme: { LIGHT: string; DARK: string };
  Currencies: Record<string, string>;
  Direction: { LTR: string; RTL: string };
  Edges: { CURVED: string; STRAIGHT: string };
  Locale: { EN: string; AR: string };
}

export interface TapCardSdkConfig {
  publicKey: string;
  merchant?: { id: string };
  transaction: { amount: number; currency: string };
  customer?: TapCardSdkCustomer;
  acceptance?: {
    supportedBrands: string[];
    supportedCards: string | string[];
  };
  fields?: { cardHolder?: boolean };
  addons?: {
    displayPaymentBrands?: boolean;
    loader?: boolean;
    saveCard?: boolean;
  };
  interface?: {
    locale?: string;
    theme?: string;
    edges?: string;
    direction?: string;
  };
  onReady?: () => void;
  onFocus?: () => void;
  onBinIdentification?: (data: unknown) => void;
  onValidInput?: (data: unknown) => void;
  onInvalidInput?: (data: unknown) => void;
  onError?: (data: TapCardSdkError) => void;
  onSuccess?: (data: TapCardTokenResult) => void;
  onChangeSaveCardLater?: (isSaveCardSelected: boolean) => void;
}

export interface TapCardSdkCustomer {
  id?: string;
  name?: Array<{
    lang: string;
    first: string;
    last: string;
    middle?: string;
  }>;
  nameOnCard?: string;
  editable?: boolean;
  contact?: {
    email?: string;
    phone?: { countryCode: string; number: string };
  };
}

export interface TapCardSdkError {
  message?: string;
  description?: string;
  code?: string;
}

export interface TapCardTokenResult {
  id: string;
  status?: string;
  object?: string;
  card?: {
    brand?: string;
    last_four?: string;
    name?: string;
  };
}

export interface TapCardRenderOptions {
  containerId: string;
  amount: number;
  currency: string;
  locale: 'ar' | 'en';
  merchantId?: string;
  publicKey: string;
  customerEmail?: string;
  customerName?: string;
  phoneCountryCode?: string;
  phoneNumber?: string;
  onReady?: () => void;
  onValidInput?: (data: unknown) => void;
  onInvalidInput?: (data: unknown) => void;
  onError?: (error: TapCardSdkError) => void;
  onSuccess?: (token: TapCardTokenResult) => void;
}

declare global {
  interface Window {
    CardSDK?: TapCardSdkGlobal;
  }
}
