export interface IDashboardRequest {
  dateFrom: string;
  dateTo: string;
}

export interface IDashboardCards {
  totalUsersLoggedIn: number;
  totalActiveOrganizations: number;
  totalNewRequests: number;
  totalBookings: number;
  totalUpcomingBookings: number;
  totalCancelledBookings: number;
  totalCompletedBookingAmount: number;
  totalMonthlyFixedAmount: number;
  totalYearlyFixedAmount: number;
  totalMonthlyFixedPercentage: number;
  totalYearlyFixedPercentage: number;
}

export interface IDashboardBookingAnalytics {
  totalUpcomingBookings: number;
  totalCompletedBookings: number;
  totalCancelledBookings: number;
}

export interface IDashboardResponse {
  cards: IDashboardCards;
  bookingAnalytics: IDashboardBookingAnalytics;
}
