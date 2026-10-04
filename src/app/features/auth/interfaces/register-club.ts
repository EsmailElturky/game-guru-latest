export interface IRegisterClubUser {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  countryCode: string;
  phoneNumber: string;
  dateOfBirth: string;
  address: string;
  imageProfile: string;
  gender: number;
}

export interface IRegisterClubFacility {
  name: string;
  nameAr: string;
  width: number;
  height: number;
  sports: number[];
}

export interface IRegisterClubRequest {
  name: string;
  nameAr: string;
  email: string;
  countryCode: string;
  phoneNumber: string;
  cityId: number;
  latitude: number;
  longitude: number;
  address: string;
  urlMap: string;
  description: string;
  descriptionAr: string;
  logoFile: string;
  coverFile: string;
  resgistrationName: string;
  registrationNumber: string;
  tradeMarkName: string;
  taxNumber: string;
  genderType: number;
  sports: number[];
  user: IRegisterClubUser;
  facilities: IRegisterClubFacility[];
}

export interface IRegisterClubResponseValue {
  userId: number;
  email: string;
  countryCode: string;
  phoneNumber: string;
}

export interface IVerifyOtpRequest {
  email: string;
  otp: string;
}
