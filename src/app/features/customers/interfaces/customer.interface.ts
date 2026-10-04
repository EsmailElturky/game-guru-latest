export interface IEndUser {
  id: number;
  fullName: string;
  email: string | null;
  phoneNumber: string;
  dateOfBirth: string | null;
  address: string | null;
  imageName: string | null;
  thumbnail: string | null;
  gender: number | null;
  status: number;
  genderName: string | null;
  count: number | null;
  cityId: number;
}

/** Row shape for the customers table (API fields + display helpers). */
export interface ICustomerTableRow {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  dateOfBirthDisplay: string;
  statusName: string;
  status: number;
  isActive: boolean;
}
