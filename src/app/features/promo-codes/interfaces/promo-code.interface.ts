import { ActionType } from '../enums';

export interface IPromoCode {
  id: number;
  name: string;
  nameAr: string;
  promotionCode: string;
  ownerType: number;
  ownerTypeName: string;
  startDate: string;
  endDate: string;
  promotionType: number;
  promotionTypeName: string;
  fixedValue: number;
  percentage: number;
  maxAmount: number;
  isExpired: boolean;
  imageName: string;
  thumbnail: string;
  summary: string;
  summaryAr: string;
  description: string;
  descriptionAr: string;
  statusName: string;
  isActive: boolean;
}

export interface IPromoCodeAction {
  id: number;
  actionType: ActionType;
}
