/** Derive active flag from API status label when `isActive` is not provided. */
export function isActiveFromStatusName(statusName?: string | null): boolean {
  if (statusName == null || String(statusName).trim() === '') return true;
  return !['Deactivate', 'Inactive'].includes(statusName);
}
