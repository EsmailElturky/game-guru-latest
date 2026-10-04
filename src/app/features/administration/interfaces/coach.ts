import { IPaginationRequestBody } from 'src/app/shared/interfaces';

export interface ICoach {
  id: number;
  fullName: string;
  email: string | null;
  phoneNumber: string;
  dateOfBirth: string;
  lastLogInDate: string | null;
  address: string | null;
  imageName: string | null;
  thumbnail: string;
  gender: number;
  genderName: string;
  countryCode?: string | null;
  phone?: string;
  isActive: boolean;
}

export type ICoachPaginatedRequest = IPaginationRequestBody;
