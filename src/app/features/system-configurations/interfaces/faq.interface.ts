export interface IFaqList {
  id: number;
  title: string;
  description: string;
  imageName: string;
  thumbnail?: string;
  statusName?: string;
  isActive: boolean;
}

export interface IFaqById {
  id: number;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  imageName: string;
  thumbnail?: string;
  statusName?: string;
}

export interface IFaqCreate {
  ImageFile: File | string | null;
  TitleAr: string;
  Title: string;
  Description: string;
  DescriptionAr: string;
}
