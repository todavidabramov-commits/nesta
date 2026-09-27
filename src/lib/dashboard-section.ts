export const DASHBOARD_SECTIONS = [
  'overview',
  'favorites',
  'savedSearches',
  'viewings',
  'messages',
  'profile',
] as const

export type DashboardSectionId = (typeof DASHBOARD_SECTIONS)[number]

export function isDashboardSectionId(value: string | undefined): value is DashboardSectionId {
  return DASHBOARD_SECTIONS.some((id) => id === value)
}
