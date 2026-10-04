export type MembershipType = {
  id: number;
  actionType?: number;
  name?: string;
  fixedValue: number;
  percentage: number;
};

export type RefundPolicy = {
  id: number;
  policyType?: number;
  policyTypeName?: string;
  policyPercentage: number;
};

export interface IConfiguration {
  paymentSetting: {
    taxPercentage: number;
    gatewayPercentage: number;
  };
  pointSetting: {
    referralValue: number;
    bookingValue: number;
  };
  refundPolicies: RefundPolicy[];
  membershipTypes: MembershipType[];
}
