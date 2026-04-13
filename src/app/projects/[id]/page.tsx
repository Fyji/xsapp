"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import { BRAND, URGENCY_CONFIG, EVENT_TYPE_CONFIG } from "@/lib/constants"
import Link from "next/link"
import Navbar from "@/components/navbar"
import { Check, Undo2, AlertTriangle } from "lucide-react"

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

  if (!project) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: BRAND.grayLight }}>
      <p className="text-gray-400">טוען...</p>
    </div>
  )

  const urg = URGENCY_CONFIG[project.urgency as keyof typeof URGENCY_CONFIG]

  return (
    <div className="min-h-screen" style={{ background: BRAND.grayLight }}>
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Project Header */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800">{project.name}</h1>
              {project.clientName && <p className="text-gray-500">לקוח: {project.clientName}</p>}
            </div>
            {urg && (
              <span className="px-3 py-1 rounded-full text-sm font-medium w-fit" style={{ backgroundColor: urg.bg, color: urg.color }}>
                {urg.label}
              </span>
            )}
          </div>
          {project.description && <p className="text-gray-600 text-sm mb-4">{project.description}</p>}
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm text-gray-500">
            <span>ראש צוות: <Link href={`/profile/${project.teamLead.id}`} className="font-medium" style={{ color: BRAND.primaryColor }}>{project.teamLead.fullName}</Link></span>
            <span className="hidden sm:inline">·</span>
            <span>{project.members.length} חברי צוות</span>
          </div>
        </div>

        {/* Team */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-bold text-gray-700 mb-3">צוות</h2>
          <div className="flex flex-wrap gap-3">
            {project.members.map((m: any) => (
              <Link key={m.id} href={`/profile/${m.user.id}`}
                className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-100 hover:border-pink-200 transition">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: BRAND.primaryColor }}>
                  {m.user.fullName.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">{m.user.fullName}</p>
                  <p className="text-xs text-gray-400">{m.roleInProject}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Timeline Events */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-bold text-gray-700 mb-3">לוח זמנים</h2>
          {project.events.length === 0 ? (
            <p className="text-gray-400 text-sm">אין אירועים</p>
          ) : (
            <div className="space-y-3">
              {project.events.map((ev: any) => {
                const config = EVENT_TYPE_CONFIG[ev.type as keyof typeof EVENT_TYPE_CONFIG]
                const isPast = new Date(ev.date) < new Date()
                const isCompleted = !!ev.completedAt

                return (
                  <div key={ev.id} className={`flex items-center gap-3 p-3 rounded-xl transition ${isCompleted ? "bg-green-50" : isPast ? "opacity-50" : "hover:bg-gray-50"}`}>
                    {/* Complete toggle */}
                    <button
                      onClick={() => isCompleted ? undoComplete(ev.id) : markComplete(ev.id)}
                      className={`shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center transition ${
                        isCompleted
                          ? "bg-green-500 border-green-500 text-white hover:bg-green-400"
                          : "border-gray-300 hover:border-pink-400 text-transparent hover:text-pink-300"
                      }`}
                      title={isCompleted ? "בטל סימון" : "הוגש לפני המועד"}
                    >
                      {isCompleted ? <Check size={16} /> : <Check size={16} />}
                    </button>

                    {/* Event dot */}
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: isCompleted ? "#22C55E" : config?.color || "#999" }} />

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${isCompleted ? "text-gray-400 line-through" : "text-gray-800"}`}>
                        {ev.title}
                      </p>
                      <p className={`text-xs truncate ${isCompleted ? "text-gray-300" : "text-gray-400"}`}>
                        {config?.label}
                        {isCompleted && ev.completedBy && ` · הוגש ע"י ${ev.completedBy.fullName}`}
                      </p>
                    </div>

                    {/* Date / Status */}
                    <div className="text-left shrink-0">
                      {isCompleted ? (
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-green-600 font-medium">הוגש</span>
                          <button
                            onClick={() => undoComplete(ev.id)}
                            className="text-gray-300 hover:text-gray-500 transition"
                            title="בטל"
                          >
                            <Undo2 size={12} />
                          </button>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-600">{new Date(ev.date).toLocaleDateString("he-IL")}</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Tasks */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-bold text-gray-700 mb-3">משימות</h2>
          {project.tasks.length === 0 ? (
            <p className="text-gray-400 text-sm">אין משימות</p>
          ) : (
            <div className="space-y-3">
              {project.tasks.map((t: any) => {
                const tUrg = URGENCY_CONFIG[t.urgency as keyof typeof URGENCY_CONFIG]
                return (
                  <div key={t.id} className="p-4 rounded-xl border border-gray-100">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-medium text-gray-800">{t.title}</p>
                        {t.description && <p className="text-xs text-gray-500 mt-1">{t.description}</p>}
                      </div>
                      <div className="text-left sm:text-right shrink-0">
                        {tUrg && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: tUrg.bg, color: tUrg.color }}>
                            {tUrg.label}
                          </span>
                        )}
                        <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                          {t.assignedTo ? (
                            <span>משוייך: {t.assignedTo.fullName}</span>
                          ) : (
                            <span className="flex items-center gap-1 text-orange-500"><AlertTriangle size={11} /> ללא איוש</span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
