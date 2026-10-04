/** Top-level menu features (parent sidebar sections). */
export enum Feature {
  Dashboard = 'Dashboard',
  SystemConfiguration = 'SystemConfiguration',
  Administration = 'Administration',
  ClubManagement = 'ClubManagement',
  Requests = 'Requests',
  Booking = 'Booking',
  PromoCodes = 'PromoCodes',
  Customers = 'Customers',
  Refunds = 'Refunds',
  Reports = 'Reports',
  Profile = 'Profile',
}

/**
 * Page identifiers — values match backend `pageKey` from `game_guru_user.roles`.
 */
export enum AppPage {
  GeneralConfigurations = 'GeneralConfiguration',
  Sport = 'Sport',
  Intro = 'Intro',
  Slider = 'Slider',
  City = 'City',
  FAQ = 'FAQ',
  CancelPolicy = 'CancelPolicy',
  PrivacyPolicy = 'PrivacyPolicy',
  TermsConditions = 'TermsCondition',
  User = 'User',
  Coach = 'Coach',
  Role = 'Role',
  Organization = 'Organization',
  Facility = 'Facility',
  NewSignup = 'NewSignup',
  CancelSubscription = 'CancelSubscription',
  Booking = 'Booking',
  PromoCodes = 'PromoCodes',
  Customer = 'Customer',
  Refund = 'Refund',
  SubscriptionRevenue = 'SubscriptionRevenue',
  BookingRevenue = 'BookingRevenue',
  SportRevenue = 'SportRevenue',
  OrganizationRevenue = 'OrganizationRevenue',
  Attachments = 'Attachment',
  Subscription = 'Subscription',
}

export interface IFeature {
  feature: Feature;
  pages: AppPage[];
}

/** Feature → child pages (matches sidebar structure). */
export const FEATURE_PAGES: Record<Feature, AppPage[]> = {
  [Feature.Dashboard]: [],
  [Feature.SystemConfiguration]: [
    AppPage.GeneralConfigurations,
    AppPage.Sport,
    AppPage.Intro,
    AppPage.Slider,
    AppPage.City,
    AppPage.FAQ,
    AppPage.CancelPolicy,
    AppPage.PrivacyPolicy,
    AppPage.TermsConditions,
  ],
  [Feature.Administration]: [AppPage.User, AppPage.Coach, AppPage.Role],
  [Feature.ClubManagement]: [AppPage.Organization, AppPage.Facility],
  [Feature.Requests]: [AppPage.NewSignup, AppPage.CancelSubscription],
  [Feature.Booking]: [AppPage.Booking],
  [Feature.PromoCodes]: [AppPage.PromoCodes],
  [Feature.Customers]: [AppPage.Customer],
  [Feature.Refunds]: [AppPage.Refund],
  [Feature.Reports]: [
    AppPage.SubscriptionRevenue,
    AppPage.BookingRevenue,
    AppPage.SportRevenue,
    AppPage.OrganizationRevenue,
  ],
  [Feature.Profile]: [],
};

export const MENU_FEATURES: IFeature[] = Object.entries(FEATURE_PAGES).map(
  ([feature, pages]) => ({
    feature: feature as Feature,
    pages,
  }),
);

/** Maps route prefix to parent feature (for sidebar sections). */
export const ROUTE_PREFIX_TO_FEATURE: Record<string, Feature> = {
  dashboard: Feature.Dashboard,
  'system-configurations': Feature.SystemConfiguration,
  administration: Feature.Administration,
  'club-management': Feature.ClubManagement,
  requests: Feature.Requests,
  booking: Feature.Booking,
  'promo-codes': Feature.PromoCodes,
  customers: Feature.Customers,
  refunds: Feature.Refunds,
  reports: Feature.Reports,
  profile: Feature.Profile,
};
