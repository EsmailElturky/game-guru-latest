import { IPagePermission } from 'src/app/features/administration/interfaces';

export interface LoginResponse {
  id: number;
  fullName: string;
  logoName?: string;
  gender: number;
  groupRoleId: number;
  imageName: string;
  isAdmin: boolean;
  isAdminApp?: boolean;
  phoneNumber: string;
  countryCode: string;
  roles: IPagePermission[];
  thumbnail: string;
  accessToken: string;
  refreshToken: string;
  tokenInfo?: any;
  /** When `1`, club account must complete subscription payment (Tap hosted checkout). */
  userStatus?: number;
  organizationStatus?: number;
  paymentAmount?: number;
  organizationId?: number;
  username?: string;
}
