export interface IIntroList {
  id: number;
  title: string;
  imageName: string;
  thumbnail?: string;
  statusName?: string | null;
  isActive: boolean;
}

export interface IIntroById {
  id: number;
  title: string;
  titleAr: string;
  imageName: string;
  thumbnail?: string;
}

export interface IIntroCreate {
  ImageFile: File | string | null;
  TitleAr: string;
  Title: string;
}
