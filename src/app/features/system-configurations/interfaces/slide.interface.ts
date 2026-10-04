export interface ISlideList {
  id: number;
  title: string;
  imageName: string;
  statusName?: string | null;
  isActive: boolean;
}

export interface ISlideById {
  id: number;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  url: string;
  imageName: string;
  thumbnail: string;
}

export interface ISlideCreate {
  ImageFile: File | string | null;
  Url: string;
  DescriptionAr: string;
  Description: string;
  TitleAr: string;
  Title: string;
}
