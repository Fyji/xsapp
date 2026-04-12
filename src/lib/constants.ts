export const BRAND = {
  name: "XS Studio",
  primaryColor: "#E5007D",
  primaryDark: "#C40069",
  primaryLight: "#FFE6F0",
  dark: "#1A1A2E",
  darkSecondary: "#2D2D44",
  gray: "#6B7280",
  grayLight: "#F3F4F6",
  white: "#FFFFFF",
  logoUrl: "https://static.wixstatic.com/media/ebc72a_12bdde215cf644988798562b3612cdf6~mv2.gif",
}

export const AVAILABILITY_CONFIG = {
  available: { label: "פנוי", color: "#22C55E", icon: "🟢" },
  busy: { label: "עסוק", color: "#EAB308", icon: "🟡" },
  unavailable: { label: "לא פנוי", color: "#EF4444", icon: "🔴" },
  not_working: { label: "לא עובד", color: "#9CA3AF", icon: "⚪" },
  offsite: { label: "מחוץ לסטודיו", color: "#3B82F6", icon: "🔵" },
} as const

export const URGENCY_CONFIG = {
  urgent_important: { label: "דחוף חשוב", color: "#EF4444", bg: "#FEE2E2", icon: "🔴" },
  urgent_not_important: { label: "דחוף לא חשוב", color: "#F97316", bg: "#FFEDD5", icon: "🟠" },
  not_urgent_important: { label: "לא דחוף חשוב", color: "#EAB308", bg: "#FEF9C3", icon: "🟡" },
  not_urgent_not_important: { label: "לא דחוף לא חשוב", color: "#22C55E", bg: "#DCFCE7", icon: "🟢" },
} as const

export const EVENT_TYPE_CONFIG = {
  final_submission: { label: "הגשה סופית", color: "#EF4444" },
  interim_submission: { label: "הגשת ביניים", color: "#F97316" },
  internal_meeting: { label: "פגישה פנימית", color: "#3B82F6" },
  external_meeting: { label: "פגישה חיצונית", color: "#8B5CF6" },
} as const
