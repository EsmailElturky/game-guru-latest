import { SubscriptionPaymentMethod } from "../../../core/enums/subscription-payment-method.enum";


export interface PaymentTokenRequest {
  userId: number;
  email: string;
  paymentMethod: SubscriptionPaymentMethod;
  amount: number;
  firstName?: string;
  countryCode?: string;
  phoneNumber?: string;
  tokenId?: string;
  redirectUrl?: string;
}

export interface PaymentRequestResponse {
  userId: number;
  status: string;
  transactionUrl: string;
  paymentStatus: number;
  paymentStatusName: string;
}

export interface PaymentConfigResponse {
  publicKey: string;
  merchantId?: string;
}


export interface PaymentPushData {
  from: string;
  messageId: string;
  notification: {
    title: string;
    body: string;
  };
  data: {
    type: string;
    isPaid: string;
  };
}
