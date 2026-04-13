export const BRAND = {
  name: "XS Studio",
  primaryColor: "#E5007D",
  primaryDark: "#C40069",
  primaryLight: "#FFE6F0",
  primaryHover: "#D10070",
  dark: "#1A1A2E",
  darkSecondary: "#2D2D44",
  gray: "#6B7280",
  grayLight: "#F9FAFB",
  white: "#FFFFFF",
  border: "#E5E7EB",
  borderLight: "#F3F4F6",
  logoUrl: "https://static.wixstatic.com/media/ebc72a_12bdde215cf644988798562b3612cdf6~mv2.gif",
}

export const AVAILABILITY_CONFIG = {
  available: { label: "פנוי", color: "#22C55E", bg: "#DCFCE7" },
  busy: { label: "עסוק", color: "#EAB308", bg: "#FEF9C3" },
  unavailable: { label: "לא פנוי", color: "#EF4444", bg: "#FEE2E2" },
  not_working: { label: "לא עובד", color: "#9CA3AF", bg: "#F3F4F6" },
  offsite: { label: "מחוץ לסטודיו", color: "#3B82F6", bg: "#DBEAFE" },
} as const

export const URGENCY_CONFIG = {
  urgent_important: { label: "דחוף חשוב", color: "#EF4444", bg: "#FEE2E2" },
  urgent_not_important: { label: "דחוף לא חשוב", color: "#F97316", bg: "#FFEDD5" },
  not_urgent_important: { label: "לא דחוף חשוב", color: "#EAB308", bg: "#FEF9C3" },
  not_urgent_not_important: { label: "לא דחוף לא חשוב", color: "#22C55E", bg: "#DCFCE7" },
} as const

export const EVENT_TYPE_CONFIG = {
  final_submission: { label: "הגשה סופית", color: "#E5007D", bg: "#FFE6F0" },
  interim_submission: { label: "הגשת ביניים", color: "#F97316", bg: "#FFEDD5" },
  internal_meeting: { label: "פגישה פנימית", color: "#3B82F6", bg: "#DBEAFE" },
  external_meeting: { label: "פגישה חיצונית", color: "#8B5CF6", bg: "#EDE9FE" },
} as const
