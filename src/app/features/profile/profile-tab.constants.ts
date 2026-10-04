/** PrimeNG `p-tabs` values — must match `profile.ts` tab definitions. */
export const PROFILE_TAB = {
  userProfile: '0',
  changePassword: '1',
  organization: '2',
  subscriptions: '3',
  courts: '4',
  requests: '5',
  notification: '6',
  managerNotifications: '7',
  bookingSlots: '8',
} as const;

export type ProfileTabId = (typeof PROFILE_TAB)[keyof typeof PROFILE_TAB];

/** Use when navigating back to `/profile` from a nested profile route so the correct tab opens. */
export function profileReturnQuery(tab: keyof typeof PROFILE_TAB) {
  return { queryParams: { tab: PROFILE_TAB[tab] } };
}
