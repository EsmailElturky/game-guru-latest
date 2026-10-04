export interface IUser {
  id?: string;
  email: string;
  username: string;
  fullName: string;
  countryCode: string | null;
  phoneNumber: string;
  dateOfBirth: string;
  address: string;
  gender: number;
  groupRoleId: number | null;
  isAdmin: boolean;
  statusName: string;
  isActive: boolean;
  roleName: string;
  phone?: string; // computed: countryCode + phoneNumber
  imageName?: string;
}

export interface IUserPaginatedRequest {
  pageNo: number;
  pageSize: number;
  search: string;
}

export interface IUserCreate {
  id?: string;
  email: string;
  username: string;
  password?: string;
  confirmPassword?: string;
  fullName: string;
  countryCode: string;
  phoneNumber: string;
  dateOfBirth: string;
  address: string;
  gender: number;
  groupRoleId: number;
  isAdmin: boolean;
}
