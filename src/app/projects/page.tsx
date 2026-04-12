"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { BRAND, URGENCY_CONFIG } from "@/lib/constants"
import Link from "next/link"

export default function ProjectsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [projects, setProjects] = useState<any[]>([])

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
    if (status === "authenticated") {
      fetch("/api/projects").then((r) => r.json()).then(setProjects)
    }
  }, [status, router])

  if (!session) return null

  const role = (session.user as any)?.role

  return (
    <div className="min-h-screen" style={{ background: BRAND.grayLight }}>
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src={BRAND.logoUrl} alt="XS" className="h-8" />
            <span className="font-bold" style={{ color: BRAND.dark }}>XSAPP</span>
          </Link>
          <span className="text-gray-600 text-sm">פרויקטים</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold" style={{ color: BRAND.dark }}>פרויקטים בתהליך</h1>
          {(role === "team_lead" || role === "admin") && (
            <Link
              href="/projects/new"
              className="px-4 py-2 rounded-xl text-white text-sm font-medium"
              style={{ backgroundColor: BRAND.primaryColor }}
            >
              + פרויקט חדש
            </Link>
          )}
        </div>

        <div className="space-y-3">
          {projects.map((p) => {
            const urg = URGENCY_CONFIG[p.urgency as keyof typeof URGENCY_CONFIG]
            const nextEvent = p.events?.find((e: any) => new Date(e.date) >= new Date())
            const openTasks = p.tasks?.filter((t: any) => t.status === "open" && !t.assignedToId).length || 0

            return (
              <Link
                key={p.id}
                href={`/projects/${p.id}`}
                className="block bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:border-pink-200 transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-gray-800 text-lg">{p.name}</h3>
                      {urg && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium"
                          style={{ backgroundColor: urg.bg, color: urg.color }}>
                          {urg.label}
                        </span>
                      )}
                    </div>
                    {p.clientName && <p className="text-sm text-gray-500">לקוח: {p.clientName}</p>}
                    <p className="text-sm text-gray-400 mt-1">
                      ראש צוות: {p.teamLead?.fullName} · {p.members?.length || 0} חברי צוות
                    </p>
                  </div>
                  <div className="text-left">
                    {nextEvent && (
                      <div>
                        <p className="text-xs text-gray-400">{nextEvent.title}</p>
                        <p className="text-sm font-semibold" style={{ color: BRAND.primaryColor }}>
                          {new Date(nextEvent.date).toLocaleDateString("he-IL")}
                        </p>
                      </div>
                    )}
                    {openTasks > 0 && (
                      <span className="inline-block mt-1 px-2 py-0.5 bg-red-50 text-red-500 text-xs rounded-full">
                        {openTasks} משימות פתוחות
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </main>
    </div>
  )
}
