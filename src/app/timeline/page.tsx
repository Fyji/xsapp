"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { BRAND, EVENT_TYPE_CONFIG } from "@/lib/constants"
import Link from "next/link"
import AppShell from "@/components/app-shell"
import { Package, ClipboardList, Users, Handshake, ChevronRight, ChevronLeft } from "lucide-react"

const HEBREW_DAYS = ["א׳", "ב׳", "ג׳", "ד׳", "ה׳", "ו׳", "ש׳"]
const HEBREW_MONTHS = [
  "ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני",
  "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר",
]

const TYPE_ICONS: Record<string, any> = {
  final_submission: Package,
  interim_submission: ClipboardList,
  internal_meeting: Users,
  external_meeting: Handshake,
}

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

  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startDayOfWeek = firstDay.getDay()
  const daysInMonth = lastDay.getDate()

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1))
  const goToday = () => {
    setCurrentMonth(new Date())
    setSelectedDate(new Date().toISOString().split("T")[0])
  }

  const eventsByDate: Record<string, any[]> = {}
  events.forEach((ev) => {
    const d = new Date(ev.date).toISOString().split("T")[0]
    if (!eventsByDate[d]) eventsByDate[d] = []
    eventsByDate[d].push(ev)
  })

  const today = new Date().toISOString().split("T")[0]

  const calendarCells: (number | null)[] = []
  for (let i = 0; i < startDayOfWeek; i++) calendarCells.push(null)
  for (let d = 1; d <= daysInMonth; d++) calendarCells.push(d)
  while (calendarCells.length % 7 !== 0) calendarCells.push(null)

  const getDateStr = (day: number) => `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`

  const selectedEvents = selectedDate ? eventsByDate[selectedDate] || [] : []

  // Agenda: all future events this month
  const monthEvents = events
    .filter((e) => {
      const d = new Date(e.date)
      return d.getMonth() === month && d.getFullYear() === year && d >= new Date(new Date().setHours(0,0,0,0))
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  return (
    <AppShell>
      <div className="p-6 lg:p-8 max-w-[1100px]">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900">לוח זמנים</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              {HEBREW_MONTHS[month]} {year}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={goToday} className="px-3 py-1.5 text-xs rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 transition">
              היום
            </button>
            <button onClick={nextMonth} className="p-1.5 rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 transition">
              <ChevronRight size={16} />
            </button>
            <button onClick={prevMonth} className="p-1.5 rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 transition">
              <ChevronLeft size={16} />
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mb-4">
          {Object.entries(EVENT_TYPE_CONFIG).map(([key, config]) => (
            <div key={key} className="flex items-center gap-1.5 text-[11px] text-gray-500">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: config.color }} />
              {config.label}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-3">
            <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
              {/* Day headers */}
              <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
                {HEBREW_DAYS.map((d) => (
                  <div key={d} className="py-2 text-center text-[11px] font-medium text-gray-400">{d}</div>
                ))}
              </div>

              {/* Cells */}
              <div className="grid grid-cols-7">
                {calendarCells.map((day, i) => {
                  if (day === null) return <div key={i} className="min-h-[64px] border-b border-l border-gray-100" />

                  const dateStr = getDateStr(day)
                  const dayEvents = eventsByDate[dateStr] || []
                  const isToday = dateStr === today
                  const isSelected = dateStr === selectedDate
                  const isFriSat = (i % 7) === 5 || (i % 7) === 6

                  return (
                    <button
                      key={i}
                      onClick={() => setSelectedDate(dateStr === selectedDate ? null : dateStr)}
                      className={`min-h-[64px] p-1.5 border-b border-l border-gray-100 text-right transition-colors relative ${
                        isSelected ? "bg-pink-50" : "hover:bg-gray-50"
                      } ${isFriSat ? "bg-gray-50/50" : ""}`}
                    >
                      <span className={`text-xs font-medium inline-flex items-center justify-center ${
                        isToday ? "w-6 h-6 rounded-full text-white" : isFriSat ? "text-gray-400" : "text-gray-700"
                      }`}
                        style={isToday ? { backgroundColor: BRAND.primaryColor } : {}}
                      >
                        {day}
                      </span>
                      {dayEvents.length > 0 && (
                        <div className="flex gap-0.5 mt-1 justify-center flex-wrap">
                          {dayEvents.slice(0, 4).map((ev: any, j: number) => {
                            const config = EVENT_TYPE_CONFIG[ev.type as keyof typeof EVENT_TYPE_CONFIG]
                            return <span key={j} className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: config?.color || "#999" }} />
                          })}
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Selected date detail */}
            {selectedDate && (
              <div className="mt-4 border border-gray-200 rounded-lg bg-white p-4">
                <h3 className="text-sm font-semibold text-gray-800 mb-3">
                  {new Date(selectedDate + "T00:00:00").toLocaleDateString("he-IL", { weekday: "long", day: "numeric", month: "long" })}
                </h3>
                {selectedEvents.length === 0 ? (
                  <p className="text-sm text-gray-400">אין אירועים</p>
                ) : (
                  <div className="space-y-2">
                    {selectedEvents.map((ev: any) => {
                      const config = EVENT_TYPE_CONFIG[ev.type as keyof typeof EVENT_TYPE_CONFIG]
                      const Icon = TYPE_ICONS[ev.type] || Package
                      return (
                        <Link
                          key={ev.id}
                          href={`/projects/${ev.project.id}`}
                          className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition"
                        >
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                            style={{ backgroundColor: config?.bg || "#F3F4F6" }}>
                            <Icon size={14} style={{ color: config?.color || "#999" }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 truncate">{ev.title}</p>
                            <p className="text-[11px] text-gray-400 truncate">{ev.project.name}</p>
                          </div>
                          <span className="text-[11px] px-2 py-0.5 rounded-md shrink-0" style={{ backgroundColor: config?.bg, color: config?.color }}>
                            {config?.label}
                          </span>
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Agenda sidebar */}
          <div className="lg:col-span-2">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">הבא בתור</h2>
            <div className="border border-gray-200 rounded-lg bg-white divide-y divide-gray-100">
              {monthEvents.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <p className="text-sm text-gray-400">אין אירועים קרובים</p>
                </div>
              ) : (
                monthEvents.slice(0, 10).map((ev: any) => {
                  const config = EVENT_TYPE_CONFIG[ev.type as keyof typeof EVENT_TYPE_CONFIG]
                  const d = new Date(ev.date)
                  const daysLeft = Math.ceil((d.getTime() - Date.now()) / 86400000)
                  const Icon = TYPE_ICONS[ev.type] || Package

                  return (
                    <Link
                      key={ev.id}
                      href={`/projects/${ev.project.id}`}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-lg flex flex-col items-center justify-center shrink-0 border border-gray-200">
                        <span className="text-sm font-bold text-gray-900 leading-none">{d.getDate()}</span>
                        <span className="text-[9px] text-gray-400">{HEBREW_MONTHS[d.getMonth()].slice(0, 3)}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{ev.title}</p>
                        <p className="text-[11px] text-gray-400 truncate">{ev.project.name}</p>
                      </div>
                      <span className={`text-[11px] font-medium shrink-0 ${
                        daysLeft <= 3 ? "text-pink-600" : "text-gray-400"
                      }`}>
                        {daysLeft === 0 ? "היום" : daysLeft === 1 ? "מחר" : `${daysLeft}d`}
                      </span>
                    </Link>
                  )
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
