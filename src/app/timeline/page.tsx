"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { BRAND } from "@/lib/constants"
import Link from "next/link"
import Navbar from "@/components/navbar"

const EVENT_COLORS = {
  final_submission: { bg: "#E5007D", text: "#fff", label: "הגשה סופית", dot: "#E5007D" },
  interim_submission: { bg: "#F472B6", text: "#fff", label: "הגשת ביניים", dot: "#F472B6" },
  internal_meeting: { bg: "#FBCFE8", text: "#831843", label: "פגישה פנימית", dot: "#F9A8D4" },
  external_meeting: { bg: "#FCE7F3", text: "#9D174D", label: "פגישה חיצונית", dot: "#FECDD3" },
} as const

const HEBREW_DAYS = ["א׳", "ב׳", "ג׳", "ד׳", "ה׳", "ו׳", "ש׳"]
const HEBREW_MONTHS = [
  "ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני",
  "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר",
]

export default function TimelinePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [events, setEvents] = useState<any[]>([])
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
    if (status === "authenticated") {
      fetch("/api/timeline").then((r) => r.json()).then(setEvents)
    }
  }, [status, router])

  if (!session) return null

  // Calendar helpers
  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startDayOfWeek = firstDay.getDay() // 0=Sun
  const daysInMonth = lastDay.getDate()

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1))
  const goToday = () => {
    setCurrentMonth(new Date())
    setSelectedDate(new Date().toISOString().split("T")[0])
  }

  // Map events to dates
  const eventsByDate: Record<string, any[]> = {}
  events.forEach((ev) => {
    const d = new Date(ev.date).toISOString().split("T")[0]
    if (!eventsByDate[d]) eventsByDate[d] = []
    eventsByDate[d].push(ev)
  })

  const today = new Date().toISOString().split("T")[0]

  // Build calendar grid
  const calendarCells: (number | null)[] = []
  for (let i = 0; i < startDayOfWeek; i++) calendarCells.push(null)
  for (let d = 1; d <= daysInMonth; d++) calendarCells.push(d)
  while (calendarCells.length % 7 !== 0) calendarCells.push(null)

  const getDateStr = (day: number) => {
    const m = String(month + 1).padStart(2, "0")
    const d = String(day).padStart(2, "0")
    return `${year}-${m}-${d}`
  }

  const selectedEvents = selectedDate ? eventsByDate[selectedDate] || [] : []

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-5">
        {/* Month nav */}
        <div className="flex items-center justify-between">
          <button onClick={prevMonth} className="px-3 py-2 rounded-xl bg-white border border-gray-100 text-gray-600 hover:bg-gray-50 shadow-sm text-sm">→</button>
          <div className="text-center">
            <h1 className="text-xl sm:text-2xl font-bold" style={{ color: BRAND.dark }}>
              {HEBREW_MONTHS[month]} {year}
            </h1>
            <button onClick={goToday} className="text-xs mt-0.5" style={{ color: BRAND.primaryColor }}>היום</button>
          </div>
          <button onClick={nextMonth} className="px-3 py-2 rounded-xl bg-white border border-gray-100 text-gray-600 hover:bg-gray-50 shadow-sm text-sm">←</button>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 justify-center">
          {Object.entries(EVENT_COLORS).map(([key, config]) => (
            <div key={key} className="flex items-center gap-1.5 text-xs text-gray-600">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: config.dot }} />
              {config.label}
            </div>
          ))}
        </div>

        {/* Calendar */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50">
            {HEBREW_DAYS.map((d) => (
              <div key={d} className="py-2 text-center text-xs font-medium text-gray-500">{d}</div>
            ))}
          </div>

          {/* Calendar cells */}
          <div className="grid grid-cols-7">
            {calendarCells.map((day, i) => {
              if (day === null) return <div key={i} className="min-h-[60px] sm:min-h-[80px] border-b border-l border-gray-50" />

              const dateStr = getDateStr(day)
              const dayEvents = eventsByDate[dateStr] || []
              const isToday = dateStr === today
              const isSelected = dateStr === selectedDate
              const isFriday = (i % 7) === 5
              const isSaturday = (i % 7) === 6

              return (
                <button
                  key={i}
                  onClick={() => setSelectedDate(dateStr === selectedDate ? null : dateStr)}
                  className={`min-h-[60px] sm:min-h-[80px] p-1 sm:p-2 border-b border-l border-gray-50 text-right transition relative
                    ${isSelected ? "bg-pink-50" : "hover:bg-gray-50"}
                    ${isFriday || isSaturday ? "bg-gray-25" : ""}
                  `}
                >
                  {/* Day number */}
                  <span className={`text-xs sm:text-sm font-medium inline-flex items-center justify-center
                    ${isToday ? "w-6 h-6 sm:w-7 sm:h-7 rounded-full text-white" : ""}
                    ${isToday ? "" : isFriday || isSaturday ? "text-gray-400" : "text-gray-700"}
                  `}
                    style={isToday ? { backgroundColor: BRAND.primaryColor } : {}}
                  >
                    {day}
                  </span>

                  {/* Event dots / mini-pills */}
                  {dayEvents.length > 0 && (
                    <div className="mt-0.5 space-y-0.5">
                      {dayEvents.slice(0, 3).map((ev: any, j: number) => {
                        const config = EVENT_COLORS[ev.type as keyof typeof EVENT_COLORS] || EVENT_COLORS.internal_meeting
                        return (
                          <div key={j} className="hidden sm:block truncate rounded px-1 py-0.5 text-[10px] leading-tight font-medium"
                            style={{ backgroundColor: config.bg, color: config.text }}>
                            {ev.title.length > 12 ? ev.title.slice(0, 12) + "…" : ev.title}
                          </div>
                        )
                      })}
                      {/* Mobile: just dots */}
                      <div className="flex gap-0.5 sm:hidden justify-center mt-1">
                        {dayEvents.slice(0, 4).map((ev: any, j: number) => {
                          const config = EVENT_COLORS[ev.type as keyof typeof EVENT_COLORS] || EVENT_COLORS.internal_meeting
                          return <div key={j} className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: config.dot }} />
                        })}
                      </div>
                      {dayEvents.length > 3 && (
                        <p className="hidden sm:block text-[10px] text-gray-400 pr-1">+{dayEvents.length - 3}</p>
                      )}
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Selected date detail */}
        {selectedDate && (
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h2 className="font-bold text-gray-800 mb-3">
              {new Date(selectedDate + "T00:00:00").toLocaleDateString("he-IL", { weekday: "long", day: "numeric", month: "long" })}
            </h2>
            {selectedEvents.length === 0 ? (
              <p className="text-gray-400 text-sm">אין אירועים ביום הזה</p>
            ) : (
              <div className="space-y-2">
                {selectedEvents.map((ev: any) => {
                  const config = EVENT_COLORS[ev.type as keyof typeof EVENT_COLORS] || EVENT_COLORS.internal_meeting
                  return (
                    <Link
                      key={ev.id}
                      href={`/projects/${ev.project.id}`}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition"
                    >
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0"
                        style={{ backgroundColor: config.bg, color: config.text }}>
                        {ev.type === "final_submission" ? "📦" : ev.type === "interim_submission" ? "📋" : ev.type === "internal_meeting" ? "👥" : "🤝"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 truncate">{ev.title}</p>
                        <p className="text-xs text-gray-400 truncate">{ev.project.name} · {config.label}</p>
                      </div>
                      <span className="text-xs px-2 py-1 rounded-full shrink-0"
                        style={{ backgroundColor: config.bg, color: config.text }}>
                        {config.label}
                      </span>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Upcoming list (always visible below calendar) */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 className="font-bold text-gray-800 mb-3">📋 הבא בתור</h2>
          {events.filter((e) => new Date(e.date) >= new Date()).length === 0 ? (
            <p className="text-gray-400 text-sm">אין אירועים קרובים</p>
          ) : (
            <div className="space-y-2">
              {events
                .filter((e) => new Date(e.date) >= new Date())
                .slice(0, 8)
                .map((ev: any) => {
                  const config = EVENT_COLORS[ev.type as keyof typeof EVENT_COLORS] || EVENT_COLORS.internal_meeting
                  const d = new Date(ev.date)
                  const daysLeft = Math.ceil((d.getTime() - Date.now()) / 86400000)
                  return (
                    <Link
                      key={ev.id}
                      href={`/projects/${ev.project.id}`}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition border border-gray-50"
                    >
                      {/* Date badge */}
                      <div className="w-12 h-12 rounded-xl flex flex-col items-center justify-center shrink-0"
                        style={{ backgroundColor: config.bg }}>
                        <span className="text-lg font-bold leading-none" style={{ color: config.text }}>{d.getDate()}</span>
                        <span className="text-[10px] leading-none mt-0.5" style={{ color: config.text }}>
                          {HEBREW_MONTHS[d.getMonth()].slice(0, 3)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 text-sm truncate">{ev.title}</p>
                        <p className="text-xs text-gray-400 truncate">{ev.project.name}</p>
                      </div>
                      <div className="text-left shrink-0">
                        <span className={`text-xs font-medium ${daysLeft <= 3 ? "text-pink-600" : "text-gray-400"}`}>
                          {daysLeft === 0 ? "היום" : daysLeft === 1 ? "מחר" : `${daysLeft} ימים`}
                        </span>
                      </div>
                    </Link>
                  )
                })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
