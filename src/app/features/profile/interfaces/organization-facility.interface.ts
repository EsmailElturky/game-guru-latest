import type { IPaginationResponse } from 'src/app/shared/interfaces';
import { ActionType } from '../../promo-codes/enums';

export type IOrganizationFacilityListResponse = IPaginationResponse<IOrganizationFacilityListItem>;

export interface IOrganizationFacilityListItem {
  id: number;
  organizationId: number;
  organizationName?: string | null;
  organizationLogoName?: string | null;
  organizationCoverName?: string | null;
  organizationLogoThumbnail?: string | null;
  organizationCoverThumbnail?: string | null;
  name: string;
  nameAr?: string | null;
  description?: string | null;
  width?: number;
  height?: number;
  isActive: boolean;
  statusName?: string | null;
  bookingSlots?: unknown;
  images?: unknown[];
}

export interface IOrganizationFacilityDetail {
  id: number;
  organizationId: number;
  organizationName?: string | null;
  name: string;
  nameAr?: string | null;
  description?: string | null;
  descriptionAr?: string | null;
  width: number;
  height: number;
  sports: { id: number; name: string }[];
  attachments?: any[];
}

export interface IOrganizationFacilityAction {
  id: number;
  actionType: ActionType;
}
