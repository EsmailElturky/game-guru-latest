export interface ISport {
  id: number;
  name: string;
  sportType: number;
  sportTypeName: string;
  imageName: string;
  thumbnail: string;
}

export interface IOrganization {
  id: number;
  name: string;
  address: string;
  logoName: string | null;
  coverName: string | null;
  logoThumbnail: string;
  coverThumbnail: string;
  description: string;
  minAmount: number;
  maxAmount: number;
  about: string | null;
  countryCode: string | null;
  phoneNumber: string;
  facilityCount: number;
  subscriptionEndDate: string;
  statusName?: string | null;
  isActive: boolean;
  latitude: number;
  longitude: number;
  genderType: number;
  genderTypeName: string;
  sports: ISport[];
}

export interface IOrganizationPaginatedRequest {
  pageNo: number;
  pageSize: number;
  search: string;
}

export interface IOrganizationPaginatedResponse {
  items: IOrganization[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}
