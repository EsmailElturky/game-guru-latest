import { IPaginationRequestBody } from 'src/app/shared/interfaces';

export interface IOrganizationTransactionListItem {
  id: number;
  name: string;
  email: string;
  countryCode: string;
  phoneNumber: string;
  address: string;
  logoName: string | null;
  coverName: string | null;
  logoThumbnail: string;
  coverThumbnail: string;
  cityName: string;
  isActive: boolean;
  createdDate: string;
}

export interface IOrganizationTransactionListResponse {
  items: IOrganizationTransactionListItem[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export interface IOrganizationTransactionApproveRequest {
  membershipTypeId: number;
  fixedValue: number;
  percentage: number;
  organizationId: number;
}

export interface IOrganizationTransactionDisapproveRequest {
  organizationId: number;
  reason: string;
}

export interface IOrganizationTransactionSport {
  id: number;
  name: string;
}

export interface IOrganizationTransactionDetail {
  id: number;
  name: string;
  nameAr?: string | null;
  email: string;
  countryCode: string | null;
  phoneNumber: string;
  latitude: number | null;
  longitude: number | null;
  address: string;
  logoName: string | null;
  thumbnail: string;
  resgistrationName?: string | null;
  registrationNumber?: string | null;
  tradeMarkName?: string | null;
  taxNumber?: string | null;
  urlMap?: string | null;
  description?: string | null;
  descriptionAr?: string | null;
  cityId: number;
  cityName: string;
  createdDate: string;
  isActive: boolean;
  sports: IOrganizationTransactionSport[];
}

export type IOrganizationTransactionListQuery = IPaginationRequestBody;
