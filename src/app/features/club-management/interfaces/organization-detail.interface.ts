export interface IOrganizationSportRef {
  id: number;
  name: string;
}

export interface IOrganizationAttachmentRef {
  fileSize: number;
  fileSizeName: string;
  attachmentName: string;
  thumbnail: string;
}

/** GET `Organization/{id}` */
export interface IOrganizationDetail {
  id: number;
  name: string;
  nameAr: string;
  email: string;
  countryCode: string | null;
  phoneNumber: string;
  latitude: number;
  longitude: number;
  address: string;
  logoName: string | null;
  logoThumbnail: string;
  coverName: string | null;
  coverThumbnail: string;
  resgistrationName: string;
  registrationNumber: string;
  tradeMarkName: string;
  taxNumber: string;
  urlMap: string;
  description: string;
  descriptionAr: string;
  about: string;
  aboutAr: string;
  cityId: number | null;
  cityName: string | null;
  sports: IOrganizationSportRef[];
  attachments: IOrganizationAttachmentRef[];
}
