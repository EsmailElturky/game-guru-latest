export interface IBookingList {
  id: number;
  isAssignCoach: boolean;
  organizationId: number;
  username: string;
  countryCode: string;
  phoneNumber: string;
  organizationName: string;
  status: number;
  statusName: string;
  duration: number;
  bookingDate: string;
  startTime: string;
  endTime: string;
}

export interface IBookingListRequest {
  pageNo: number;
  pageSize: number;
  search: string;
  organizationId: number;
}

export interface IBookingCalendarRequest {
  search: string;
  organizationId: number;
  dateFrom: string;
  dateTo: string;
}

export type BookingStatus = 'Ended' | 'Completed' | 'Canceled' | 'Pending';

export interface IBookingCalendarResponse {
  id: number;
  sportName: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  bookingAmount: number;
  organizationName: string;
  duration: number;
  status: number;
  statusName: BookingStatus;
  facilityName: string;
  coachId: number;
  coachName: string;
  isAssignCoach: boolean;
  isActive: boolean;
  createdDate: string;
}

export interface IBookingSlotCalendarResponse {
  id: number;
  bookingDate: string;
  bookingFees: number;
  endTime: string;
  facilityId: number;
  facilityName: string;
  genderType: number;
  genderTypeName: string;
  isActive: boolean;
  organizationId: number;
  organizationName: string;
  sportType: number;
  sportTypeName: string;
  startTime: string;
  statusName: string;
}

export interface IBookingFinancial {
  paymentType: number;
  paymentTypeName: string;
  bookingFees: number;
  totalBeforeVat: number;
  discountValue: number;
  totalAfterDiscount: number;
  vatValue: number;
  vatPercentage: number;
  paymentFeesPercentage: number;
  paymentFeesValue: number;
  total: number;
}

export interface IBookingComment {
  id?: number;
  text?: string;
  fileName?: string;
  comment?: string;
  createdDate?: string;
  [key: string]: unknown;
}

/** GET `Booking/{id}` */
export interface IBookingDetail {
  id: number;
  organizationId: number;
  organizationName: string | null;
  facilityName?: string | null;
  coachName?: string | null;
  coachId?: number | null;
  fullName: string | null;
  countryCode?: string | null;
  phoneNumber: string | null;
  userId: number;
  sportId: number;
  sportName: string | null;
  description: string | null;
  descriptionAr: string | null;
  status: number;
  statusName: string | null;
  qrCode?: string | null;
  duration: number;
  startTime: string;
  endTime: string;
  bookingAmount: number;
  isPaid: boolean;
  bookingType: number;
  bookingTypeName: string | null;
  sportType?: number;
  sportTypeName?: string | null;
  genderType?: number;
  genderTypeName?: string | null;
  isActive?: boolean;
  ownerPromotionCode?: string | null;
  promotionCode?: string | null;
  createdDate?: string | null;
  financial?: IBookingFinancial | null;
  comments?: IBookingComment[];
}
