"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { BRAND, AVAILABILITY_CONFIG, URGENCY_CONFIG, EVENT_TYPE_CONFIG } from "@/lib/constants"
import Link from "next/link"
import AppShell from "@/components/app-shell"
import {
  FolderOpen, Calendar, AlertCircle, Users, Check, ArrowLeft, Clock
} from "lucide-react"

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
  completedAt?: string
  project: { id: string; name: string }
}

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [events, setEvents] = useState<TimelineEvent[]>([])
  const [unstaffedCount, setUnstaffedCount] = useState(0)
  const [projectCount, setProjectCount] = useState(0)

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
  }, [status, router])

  useEffect(() => {
    if (status !== "authenticated") return
    fetch("/api/employees").then((r) => r.json()).then(setEmployees)
    fetch("/api/timeline").then((r) => r.json()).then((data) => {
      const upcoming = data.filter((e: any) => new Date(e.date) >= new Date()).slice(0, 8)
      setEvents(upcoming)
    })
    fetch("/api/unstaffed").then((r) => r.json()).then((data) => setUnstaffedCount(data.length))
    fetch("/api/projects").then((r) => r.json()).then((data) => setProjectCount(data.length))
  }, [status])

  if (status === "loading") {
    return (
      <AppShell>
        <div className="p-8 space-y-6 animate-pulse">
          <div className="h-8 w-48 bg-gray-100 rounded-lg" />
          <div className="grid grid-cols-4 gap-4">
            {[1,2,3,4].map(i => <div key={i} className="h-20 bg-gray-50 rounded-lg" />)}
          </div>
          <div className="h-64 bg-gray-50 rounded-lg" />
        </div>
      </AppShell>
    )
  }

  if (!session) return null

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return "בוקר טוב"
    if (h < 17) return "צהריים טובים"
    return "ערב טוב"
  }

  const markComplete = async (eventId: string) => {
    await fetch("/api/events/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventId }),
    })
    setEvents((prev) => prev.map((e) => e.id === eventId ? { ...e, completedAt: new Date().toISOString() } : e))
  }

  const formatDate = (d: string) => new Date(d).toLocaleDateString("he-IL", { day: "numeric", month: "short" })
  const daysUntil = (d: string) => Math.ceil((new Date(d).getTime() - Date.now()) / 86400000)

  const kpis = [
    { label: "פרויקטים פעילים", value: projectCount, icon: FolderOpen, color: BRAND.primaryColor },
    { label: "הגשות השבוע", value: events.filter(e => daysUntil(e.date) <= 7 && !e.completedAt).length, icon: Calendar, color: "#F97316" },
    { label: "ללא איוש", value: unstaffedCount, icon: AlertCircle, color: unstaffedCount > 0 ? "#EF4444" : "#22C55E" },
    { label: "צוות", value: employees.length, icon: Users, color: "#3B82F6" },
  ]

  return (
    <AppShell>
      <div className="p-6 lg:p-8 max-w-[1100px]">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            {greeting()}, {session.user?.name?.split(" ")[0]}
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            {new Date().toLocaleDateString("he-IL", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          {kpis.map((kpi) => {
            const Icon = kpi.icon
            return (
              <div key={kpi.label} className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 bg-white">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: kpi.color + "15" }}>
                  <Icon size={18} style={{ color: kpi.color }} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 leading-none">{kpi.value}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">{kpi.label}</p>
                </div>
              </div>
            )
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Upcoming Deadlines — Table */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-900">הגשות קרובות</h2>
              <Link href="/timeline" className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 transition">
                כל הלו״ז <ArrowLeft size={12} />
              </Link>
            </div>
            <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
              {/* Table header */}
              <div className="grid grid-cols-[1fr_auto_auto_44px] gap-3 px-4 py-2.5 bg-gray-50 border-b border-gray-200 text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                <span>פרויקט</span>
                <span className="w-20 text-center">תאריך</span>
                <span className="w-16 text-center">ימים</span>
                <span />
              </div>
              {events.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <Calendar size={24} className="mx-auto text-gray-200 mb-2" />
                  <p className="text-sm text-gray-400">אין הגשות קרובות</p>
                </div>
              ) : (
                events.map((ev) => {
                  const isCompleted = !!ev.completedAt
                  const typeConfig = EVENT_TYPE_CONFIG[ev.type as keyof typeof EVENT_TYPE_CONFIG]
                  const days = daysUntil(ev.date)
                  return (
                    <div
                      key={ev.id}
                      className={`grid grid-cols-[1fr_auto_auto_44px] gap-3 px-4 py-3 border-b border-gray-100 last:border-0 items-center transition-colors ${
                        isCompleted ? "bg-green-50/50" : "hover:bg-gray-50"
                      }`}
                    >
                      <Link href={`/projects/${ev.project.id}`} className="min-w-0">
                        <p className={`text-sm font-medium truncate ${isCompleted ? "text-gray-400 line-through" : "text-gray-800"}`}>
                          {ev.project.name}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {typeConfig && (
                            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: typeConfig.color }} />
                          )}
                          <p className={`text-[11px] truncate ${isCompleted ? "text-gray-300" : "text-gray-400"}`}>{ev.title}</p>
                        </div>
                      </Link>
                      <span className={`w-20 text-center text-xs ${isCompleted ? "text-gray-300" : "text-gray-500"}`}>
                        {formatDate(ev.date)}
                      </span>
                      <span className={`w-16 text-center text-xs font-medium ${
                        isCompleted ? "text-green-500" : days <= 2 ? "text-red-500" : days <= 7 ? "text-orange-500" : "text-gray-400"
                      }`}>
                        {isCompleted ? "הוגש ✓" : days === 0 ? "היום" : days === 1 ? "מחר" : `${days} ימים`}
                      </span>
                      <button
                        onClick={() => !isCompleted && markComplete(ev.id)}
                        disabled={isCompleted}
                        className={`w-7 h-7 rounded-md border flex items-center justify-center transition-all ${
                          isCompleted
                            ? "bg-green-500 border-green-500 text-white"
                            : "border-gray-300 text-transparent hover:border-pink-400 hover:text-pink-400"
                        }`}
                      >
                        <Check size={13} />
                      </button>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* Team — Compact */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-900">צוות הסטודיו</h2>
              <span className="text-[11px] text-gray-400">{employees.length} עובדים</span>
            </div>
            <div className="border border-gray-200 rounded-lg bg-white divide-y divide-gray-100">
              {employees.map((emp) => {
                const avail = AVAILABILITY_CONFIG[emp.availability as keyof typeof AVAILABILITY_CONFIG] || AVAILABILITY_CONFIG.available
                return (
                  <Link
                    key={emp.id}
                    href={`/profile/${emp.id}`}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="relative">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold" style={{ backgroundColor: BRAND.primaryColor }}>
                        {emp.fullName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </div>
                      <span
                        className="absolute -bottom-0.5 -left-0.5 w-3 h-3 rounded-full border-2 border-white"
                        style={{ backgroundColor: avail.color }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{emp.fullName}</p>
                      <p className="text-[11px] text-gray-400">{emp.activeProjectCount} פרויקטים</p>
                    </div>
                    <span className="text-[11px] px-2 py-0.5 rounded-full" style={{ backgroundColor: avail.bg, color: avail.color }}>
                      {avail.label}
                    </span>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
