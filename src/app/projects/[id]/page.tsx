"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import { BRAND, URGENCY_CONFIG, EVENT_TYPE_CONFIG } from "@/lib/constants"
import Link from "next/link"
import AppShell from "@/components/app-shell"
import { Check, Undo2, AlertTriangle, ArrowRight, UserCircle, Clock, Tag, Users as UsersIcon } from "lucide-react"

export default function ProjectDetail() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const projectId = params.id as string
  const [project, setProject] = useState<any>(null)

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
    if (status === "authenticated" && projectId) {
      fetch(`/api/projects/${projectId}`).then((r) => r.json()).then(setProject)
    }
  }, [status, projectId, router])

  const markComplete = async (eventId: string) => {
    await fetch("/api/events/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventId }),
    })
    setProject((prev: any) => ({
      ...prev,
      events: prev.events.map((e: any) =>
        e.id === eventId ? { ...e, completedAt: new Date().toISOString(), completedBy: { fullName: session?.user?.name } } : e
      ),
    }))
  }

  const undoComplete = async (eventId: string) => {
    await fetch(`/api/events/complete?eventId=${eventId}`, { method: "DELETE" })
    setProject((prev: any) => ({
      ...prev,
      events: prev.events.map((e: any) =>
        e.id === eventId ? { ...e, completedAt: null, completedBy: null } : e
      ),
    }))
  }

  if (!project) {
    return (
      <AppShell>
        <div className="p-8 animate-pulse space-y-4">
          <div className="h-6 w-32 bg-gray-100 rounded" />
          <div className="h-10 w-64 bg-gray-100 rounded" />
          <div className="h-40 bg-gray-50 rounded-lg" />
        </div>
      </AppShell>
    )
  }

  const urg = URGENCY_CONFIG[project.urgency as keyof typeof URGENCY_CONFIG]

  return (
    <AppShell>
      <div className="p-6 lg:p-8 max-w-[900px]">
        {/* Breadcrumb */}
        <Link href="/projects" className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 mb-4 transition">
          <ArrowRight size={12} /> חזרה לפרויקטים
        </Link>

        {/* Title + Urgency */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
            {urg && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium" style={{ backgroundColor: urg.bg, color: urg.color }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: urg.color }} />
                {urg.label}
              </span>
            )}
          </div>
          {project.description && <p className="text-sm text-gray-500 mt-1">{project.description}</p>}
        </div>

        {/* Properties Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-6 mb-8 pb-6 border-b border-gray-200">
          <div>
            <p className="text-[11px] text-gray-400 mb-0.5">לקוח</p>
            <p className="text-sm font-medium text-gray-700">{project.clientName || "—"}</p>
          </div>
          <div>
            <p className="text-[11px] text-gray-400 mb-0.5">ראש צוות</p>
            <Link href={`/profile/${project.teamLead.id}`} className="text-sm font-medium hover:underline" style={{ color: BRAND.primaryColor }}>
              {project.teamLead.fullName}
            </Link>
          </div>
          <div>
            <p className="text-[11px] text-gray-400 mb-0.5">חברי צוות</p>
            <p className="text-sm font-medium text-gray-700">{project.members.length}</p>
          </div>
        </div>

        {/* Team */}
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-1.5">
            <UsersIcon size={14} className="text-gray-400" /> צוות
          </h2>
          <div className="flex flex-wrap gap-2">
            {project.members.map((m: any) => (
              <Link
                key={m.id}
                href={`/profile/${m.user.id}`}
                className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-gray-200 hover:border-pink-300 transition text-sm"
              >
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold" style={{ backgroundColor: BRAND.primaryColor }}>
                  {m.user.fullName.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                </div>
                <span className="text-gray-700 font-medium">{m.user.fullName}</span>
                {m.roleInProject && <span className="text-[11px] text-gray-400">· {m.roleInProject}</span>}
              </Link>
            ))}
          </div>
        </section>

        {/* Timeline Events */}
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-1.5">
            <Clock size={14} className="text-gray-400" /> לוח זמנים
          </h2>
          {project.events.length === 0 ? (
            <p className="text-sm text-gray-400">אין אירועים</p>
          ) : (
            <div className="border border-gray-200 rounded-lg overflow-hidden bg-white divide-y divide-gray-100">
              {project.events.map((ev: any) => {
                const config = EVENT_TYPE_CONFIG[ev.type as keyof typeof EVENT_TYPE_CONFIG]
                const isPast = new Date(ev.date) < new Date()
                const isCompleted = !!ev.completedAt

                return (
                  <div
                    key={ev.id}
                    className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                      isCompleted ? "bg-green-50/50" : isPast ? "opacity-40" : "hover:bg-gray-50"
                    }`}
                  >
                    <button
                      onClick={() => isCompleted ? undoComplete(ev.id) : markComplete(ev.id)}
                      className={`shrink-0 w-6 h-6 rounded-md border flex items-center justify-center transition-all ${
                        isCompleted
                          ? "bg-green-500 border-green-500 text-white hover:bg-green-400"
                          : "border-gray-300 text-transparent hover:border-pink-400 hover:text-pink-400"
                      }`}
                    >
                      <Check size={12} />
                    </button>
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: isCompleted ? "#22C55E" : config?.color || "#999" }} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${isCompleted ? "text-gray-400 line-through" : "text-gray-800"}`}>
                        {ev.title}
                      </p>
                      <p className={`text-[11px] truncate ${isCompleted ? "text-gray-300" : "text-gray-400"}`}>
                        {config?.label}
                        {isCompleted && ev.completedBy && ` · הוגש ע"י ${ev.completedBy.fullName}`}
                      </p>
                    </div>
                    <span className={`text-xs shrink-0 ${isCompleted ? "text-green-500" : "text-gray-500"}`}>
                      {isCompleted ? "הוגש" : new Date(ev.date).toLocaleDateString("he-IL", { day: "numeric", month: "short" })}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        {/* Tasks */}
        <section>
          <h2 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-1.5">
            <Tag size={14} className="text-gray-400" /> משימות
          </h2>
          {project.tasks.length === 0 ? (
            <p className="text-sm text-gray-400">אין משימות</p>
          ) : (
            <div className="border border-gray-200 rounded-lg overflow-hidden bg-white divide-y divide-gray-100">
              {project.tasks.map((t: any) => {
                const tUrg = URGENCY_CONFIG[t.urgency as keyof typeof URGENCY_CONFIG]
                return (
                  <div key={t.id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800">{t.title}</p>
                      {t.description && <p className="text-[11px] text-gray-400 mt-0.5 truncate">{t.description}</p>}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {tUrg && (
                        <span className="inline-flex items-center gap-1 text-[11px]">
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: tUrg.color }} />
                          <span style={{ color: tUrg.color }}>{tUrg.label}</span>
                        </span>
                      )}
                      {t.assignedTo ? (
                        <span className="text-[11px] text-gray-500 px-2 py-0.5 bg-gray-50 rounded-md">{t.assignedTo.fullName}</span>
                      ) : (
                        <span className="text-[11px] text-orange-500 flex items-center gap-0.5">
                          <AlertTriangle size={10} /> ללא איוש
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      </div>
    </AppShell>
  )
}
