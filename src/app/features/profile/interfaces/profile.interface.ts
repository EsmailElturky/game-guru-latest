export interface IChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface IOrganizationMembership {
  id: number;
  membershipTypeName: string;
  fixedValue: number;
  percentage: number;
  days: number;
  isCurrent: boolean;
  createdDate: string;
  status: number;
  statusName: string;
}
