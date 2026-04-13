"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { BRAND, AVAILABILITY_CONFIG, URGENCY_CONFIG } from "@/lib/constants"
import Link from "next/link"
import Navbar from "@/components/navbar"
import { Calendar, AlertTriangle, Bell, CheckCircle2, Check } from "lucide-react"

interface Employee {
  id: string
  fullName: string
  title: string | null
  availability: string
  dailyNote: string
  activeProjectCount: number
  pendingHandRaises: number
}

interface TimelineEvent {
  id: string
  title: string
  type: string
  date: string
  project: { id: string; name: string }
}

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [events, setEvents] = useState<TimelineEvent[]>([])
  const [unstaffedCount, setUnstaffedCount] = useState(0)

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
  }, [status, router])

  useEffect(() => {
    if (status !== "authenticated") return
    fetch("/api/employees").then((r) => r.json()).then(setEmployees)
    fetch("/api/timeline").then((r) => r.json()).then((data) => {
      const upcoming = data.filter((e: any) => new Date(e.date) >= new Date()).slice(0, 5)
      setEvents(upcoming)
    })
    fetch("/api/unstaffed").then((r) => r.json()).then((data) => setUnstaffedCount(data.length))
  }, [status])

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse text-gray-400 text-xl">טוען...</div>
      </div>
    )
  }

  if (!session) return null

  const formatDate = (d: string) => new Date(d).toLocaleDateString("he-IL", { day: "numeric", month: "short" })
  const daysUntil = (d: string) => Math.ceil((new Date(d).getTime() - Date.now()) / 86400000)

  const markComplete = async (eventId: string) => {
    await fetch("/api/events/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventId }),
    })
    setEvents((prev) => prev.map((e) => e.id === eventId ? { ...e, completedAt: new Date().toISOString() } : e))
  }

  return (
    <div className="min-h-screen" style={{ background: BRAND.grayLight }}>
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Welcome */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h1 className="text-xl sm:text-2xl font-bold" style={{ color: BRAND.dark }}>
            שלום, {session.user?.name}
          </h1>
          <Link
            href="/profile"
            className="px-4 py-2 rounded-xl text-white text-sm font-medium text-center"
            style={{ backgroundColor: BRAND.primaryColor }}
          >
            עדכון סטטוס יומי
          </Link>
        </div>

        {/* Alerts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Upcoming Deadlines */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h2 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
              <Calendar size={18} style={{ color: BRAND.primaryColor }} />
              הגשות קרובות
            </h2>
            {events.length === 0 ? (
              <p className="text-gray-400 text-sm">אין הגשות בשבוע הקרוב</p>
            ) : (
              <div className="space-y-2">
                {events.map((ev) => {
                  const isCompleted = !!(ev as any).completedAt
                  return (
                    <div key={ev.id} className={`flex items-center gap-2 py-2 px-3 rounded-lg transition ${isCompleted ? "bg-green-50" : "hover:bg-gray-50"}`}>
                      <button
                        onClick={(e) => { e.preventDefault(); if (!isCompleted) markComplete(ev.id) }}
                        className={`shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center transition ${
                          isCompleted
                            ? "bg-green-500 border-green-500 text-white"
                            : "border-gray-300 hover:border-pink-400 text-transparent hover:text-pink-300"
                        }`}
                        title={isCompleted ? "הוגש" : "סמן כהוגש"}
                      >
                        <Check size={14} />
                      </button>
                      <Link href={`/projects/${ev.project.id}`} className="flex-1 flex items-center justify-between min-w-0">
                        <div className="min-w-0">
                          <p className={`text-sm font-medium truncate ${isCompleted ? "text-gray-400 line-through" : "text-gray-800"}`}>{ev.project.name}</p>
                          <p className={`text-xs truncate ${isCompleted ? "text-gray-300" : "text-gray-500"}`}>{ev.title}</p>
                        </div>
                        <div className="text-left shrink-0 mr-2">
                          {isCompleted ? (
                            <p className="text-xs text-green-600 font-medium">הוגש</p>
                          ) : (
                            <>
                              <p className="text-sm font-semibold" style={{ color: daysUntil(ev.date) <= 2 ? "#EF4444" : BRAND.primaryColor }}>
                                {formatDate(ev.date)}
                              </p>
                              <p className="text-xs text-gray-400">{daysUntil(ev.date)} ימים</p>
                            </>
                          )}
                        </div>
                      </Link>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Unstaffed */}
          <Link href="/unstaffed" className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition">
            <h2 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
              <AlertTriangle size={18} className="text-red-500" />
              משימות ללא איוש
            </h2>
            <p className="text-4xl font-bold" style={{ color: unstaffedCount > 0 ? BRAND.primaryColor : "#22C55E" }}>
              {unstaffedCount}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {unstaffedCount > 0 ? "לחצו כאן כדי לראות ולהתנדב" : (
                <span className="flex items-center gap-1"><CheckCircle2 size={14} className="text-green-500" /> הכל מאויש</span>
              )}
            </p>
          </Link>
        </div>

        {/* Employee Grid */}
        <div>
          <h2 className="text-lg font-bold text-gray-800 mb-3">צוות הסטודיו</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {employees.map((emp) => {
              const avail = AVAILABILITY_CONFIG[emp.availability as keyof typeof AVAILABILITY_CONFIG] || AVAILABILITY_CONFIG.available
              return (
                <Link
                  key={emp.id}
                  href={`/profile/${emp.id}`}
                  className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md hover:border-pink-200 transition text-center group"
                >
                  <div className="w-14 h-14 mx-auto rounded-full flex items-center justify-center text-white text-xl font-bold mb-2 relative"
                    style={{ backgroundColor: BRAND.primaryColor }}>
                    {emp.fullName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    <span
                      className="absolute -bottom-0.5 -left-0.5 w-4 h-4 rounded-full border-2 border-white"
                      style={{ backgroundColor: avail.color }}
                    />
                  </div>
                  <p className="font-semibold text-sm text-gray-800 truncate">{emp.fullName}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{avail.label}</p>
                  <p className="text-xs mt-1" style={{ color: BRAND.primaryColor }}>
                    {emp.activeProjectCount} פרויקטים
                  </p>
                  {emp.pendingHandRaises > 0 && (
                    <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded-full">
                      <Bell size={10} /> {emp.pendingHandRaises}
                    </span>
                  )}
                  {emp.dailyNote && (
                    <p className="text-xs text-gray-400 mt-1 truncate">{emp.dailyNote}</p>
                  )}
                </Link>
              )
            })}
          </div>
        </div>
      </main>
    </div>
  )
}
