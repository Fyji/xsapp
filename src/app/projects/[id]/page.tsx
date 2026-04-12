"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import { BRAND, URGENCY_CONFIG, EVENT_TYPE_CONFIG } from "@/lib/constants"
import Link from "next/link"

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

  if (!project) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: BRAND.grayLight }}>
      <p className="text-gray-400">טוען...</p>
    </div>
  )

  const urg = URGENCY_CONFIG[project.urgency as keyof typeof URGENCY_CONFIG]

  return (
    <div className="min-h-screen" style={{ background: BRAND.grayLight }}>
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/projects" className="flex items-center gap-2">
            <img src={BRAND.logoUrl} alt="XS" className="h-8" />
            <span className="font-bold" style={{ color: BRAND.dark }}>XSAPP</span>
          </Link>
          <button onClick={() => router.back()} className="text-gray-500 text-sm hover:text-gray-800">→ חזרה</button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Project Header */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{project.name}</h1>
              {project.clientName && <p className="text-gray-500">לקוח: {project.clientName}</p>}
            </div>
            {urg && (
              <span className="px-3 py-1 rounded-full text-sm font-medium" style={{ backgroundColor: urg.bg, color: urg.color }}>
                {urg.label}
              </span>
            )}
          </div>
          {project.description && <p className="text-gray-600 text-sm mb-4">{project.description}</p>}
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>ראש צוות: <Link href={`/profile/${project.teamLead.id}`} className="font-medium" style={{ color: BRAND.primaryColor }}>{project.teamLead.fullName}</Link></span>
            <span>·</span>
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
                return (
                  <div key={ev.id} className={`flex items-center gap-3 p-3 rounded-xl ${isPast ? "opacity-50" : ""}`}>
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: config?.color || "#999" }} />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">{ev.title}</p>
                      <p className="text-xs text-gray-400">{config?.label}</p>
                    </div>
                    <p className="text-sm text-gray-600">{new Date(ev.date).toLocaleDateString("he-IL")}</p>
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
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-gray-800">{t.title}</p>
                        {t.description && <p className="text-xs text-gray-500 mt-1">{t.description}</p>}
                      </div>
                      <div className="text-left">
                        {tUrg && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: tUrg.bg, color: tUrg.color }}>
                            {tUrg.label}
                          </span>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          {t.assignedTo ? `משוייך: ${t.assignedTo.fullName}` : "⚠️ ללא איוש"}
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
