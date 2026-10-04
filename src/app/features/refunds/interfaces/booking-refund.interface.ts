export interface IBookingRefund {
  id: number;
  refundByName: string;
  reason: string | null;
  countryCode: string;
  phoneNumber: string;
  refundDate: string;
  bookingDate: string;
  status: number;
  statusName: string;
}

export interface IBookingRefundListResponse {
  items: IBookingRefund[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export interface IBookingRefundTableRow extends IBookingRefund {
  phoneDisplay: string;
  refundDateDisplay: string;
}
