export interface ISportList {
  id: string;
  name: string;
  nameAr: string;
  sportType: string;
  statusName: string;
  image?: string;
  isActive: boolean;
}

export interface ISportCreate {
  Name: string;
  NameAr: string;
  SportType: number;
  ImageFile: File | string | null; // ✅ allow all cases
}

export interface ISportById {
  id: string;
  name: string;
  nameAr: string;
  sportType: number;
  sportTypeName: string;
  imageName: string;
  thumbnail: string;
  statusName: string;
  isActive: boolean;
}
