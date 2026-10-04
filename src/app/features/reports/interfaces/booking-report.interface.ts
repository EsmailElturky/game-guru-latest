export interface IBookingReportCards {
  totalBookingsCount: number;
  totalBookingsCompletedCount: number;
  totalBookingsCancelledCount: number;
  totalBookingIncomeCount: number;
  totalClubsAmount: number;
  totalTaxAmount: number;
  totalRevenueCount: number;
  totalRevenuePercentage: number;
  totalRevenueFixedAmount: number;
  totalSubscriptionRevenueCount: number;
  totalPromotionsCount: number;
}

export interface IBookingReportRow {
  id: number;
  organizationId: number;
  organizationName: string;
  sportName: string;
  bookingDate: string;
  bookingAmount: number;
  status: number;
  statusName: string;
  /** Derived (client-side) display value. */
  dateDisplay?: string;
}

export interface IBookingReportRequest {
  pageNo: number;
  pageSize: number;
  search: string;
  organizationId: number;
}
