"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { BRAND, EVENT_TYPE_CONFIG } from "@/lib/constants"
import Link from "next/link"

export default function TimelinePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [events, setEvents] = useState<any[]>([])

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
    if (status === "authenticated") {
      fetch("/api/timeline").then((r) => r.json()).then(setEvents)
    }
  }, [status, router])

  if (!session) return null

  // Group events by date
  const grouped: Record<string, any[]> = {}
  events.forEach((ev) => {
    const dateStr = new Date(ev.date).toLocaleDateString("he-IL", { weekday: "long", day: "numeric", month: "long" })
    if (!grouped[dateStr]) grouped[dateStr] = []
    grouped[dateStr].push(ev)
  })

  return (
    <div className="min-h-screen" style={{ background: BRAND.grayLight }}>
      <header className="sticky top-0 z-50 shadow-md" style={{ background: BRAND.dark }}>
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src={BRAND.logoUrl} alt="XS" className="h-8" />
            <span className="text-white font-bold">XSAPP</span>
          </Link>
          <span className="text-white text-sm">לוח זמנים</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <h1 className="text-2xl font-bold" style={{ color: BRAND.dark }}>📅 לו״ז סטודיו</h1>

        {/* Legend */}
        <div className="flex flex-wrap gap-3">
          {Object.entries(EVENT_TYPE_CONFIG).map(([key, config]) => (
            <div key={key} className="flex items-center gap-1.5 text-xs text-gray-600">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: config.color }} />
              {config.label}
            </div>
          ))}
        </div>

        {Object.keys(grouped).length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
            <p className="text-gray-400">אין אירועים קרובים</p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(grouped).map(([date, dayEvents]) => {
              const isToday = new Date(dayEvents[0].date).toDateString() === new Date().toDateString()
              return (
                <div key={date}>
                  <h3 className={`text-sm font-bold mb-2 ${isToday ? "text-pink-600" : "text-gray-500"}`}>
                    {isToday ? "📍 היום — " : ""}{date}
                  </h3>
                  <div className="space-y-2">
                    {dayEvents.map((ev: any) => {
                      const config = EVENT_TYPE_CONFIG[ev.type as keyof typeof EVENT_TYPE_CONFIG]
                      return (
                        <Link
                          key={ev.id}
                          href={`/projects/${ev.project.id}`}
                          className="flex items-center gap-3 bg-white p-4 rounded-xl shadow-sm border-r-4 hover:shadow-md transition"
                          style={{ borderColor: config?.color || "#999" }}
                        >
                          <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold"
                            style={{ backgroundColor: config?.color || "#999" }}>
                            {ev.type === "final_submission" ? "📦" : ev.type === "interim_submission" ? "📋" : ev.type === "internal_meeting" ? "👥" : "🤝"}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-800">{ev.title}</p>
                            <p className="text-xs text-gray-400">{ev.project.name} · {config?.label}</p>
                          </div>
                          {ev.time && <span className="text-sm text-gray-500">{ev.time}</span>}
                        </Link>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
