"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { BRAND, URGENCY_CONFIG } from "@/lib/constants"
import Link from "next/link"
import AppShell from "@/components/app-shell"
import { Plus, Search, FolderOpen } from "lucide-react"

export default function ProjectsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [projects, setProjects] = useState<any[]>([])
  const [search, setSearch] = useState("")
  const [filterUrgency, setFilterUrgency] = useState<string>("")

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
    if (status === "authenticated") {
      fetch("/api/projects").then((r) => r.json()).then(setProjects)
    }
  }, [status, router])

  if (!session) return null

  const role = (session.user as any)?.role

  const filtered = projects.filter((p) => {
    if (search && !p.name.includes(search) && !p.clientName?.includes(search)) return false
    if (filterUrgency && p.urgency !== filterUrgency) return false
    return true
  })

  return (
    <AppShell>
      <div className="p-6 lg:p-8 max-w-[1100px]">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900">פרויקטים</h1>
            <p className="text-sm text-gray-400 mt-0.5">{projects.length} פרויקטים פעילים</p>
          </div>
          {(role === "team_lead" || role === "admin") && (
            <Link
              href="/projects/new"
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-white text-sm font-medium transition-colors"
              style={{ backgroundColor: BRAND.primaryColor }}
            >
              <Plus size={15} /> פרויקט חדש
            </Link>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-2 mb-4">
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="חיפוש פרויקט..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-3 pr-9 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-300 transition"
            />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            <button
              onClick={() => setFilterUrgency("")}
              className={`px-3 py-1.5 text-xs rounded-md border transition ${
                !filterUrgency ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
              }`}
            >
              הכל
            </button>
            {Object.entries(URGENCY_CONFIG).map(([key, config]) => (
              <button
                key={key}
                onClick={() => setFilterUrgency(filterUrgency === key ? "" : key)}
                className={`px-3 py-1.5 text-xs rounded-md border transition ${
                  filterUrgency === key
                    ? "text-white border-transparent"
                    : "bg-white border-gray-200 hover:border-gray-300"
                }`}
                style={filterUrgency === key ? { backgroundColor: config.color, color: "#fff" } : { color: config.color }}
              >
                {config.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
          {/* Table header */}
          <div className="hidden sm:grid grid-cols-[1fr_120px_120px_100px_100px] gap-3 px-4 py-2.5 bg-gray-50 border-b border-gray-200 text-[11px] font-medium text-gray-400 uppercase tracking-wider">
            <span>שם פרויקט</span>
            <span>ראש צוות</span>
            <span>דחיפות</span>
            <span>הגשה הבאה</span>
            <span className="text-center">משימות</span>
          </div>

          {filtered.length === 0 ? (
            <div className="px-4 py-12 text-center">
              <FolderOpen size={28} className="mx-auto text-gray-200 mb-2" />
              <p className="text-sm text-gray-400">
                {search || filterUrgency ? "לא נמצאו פרויקטים" : "אין פרויקטים"}
              </p>
            </div>
          ) : (
            filtered.map((p) => {
              const urg = URGENCY_CONFIG[p.urgency as keyof typeof URGENCY_CONFIG]
              const nextEvent = p.events?.find((e: any) => new Date(e.date) >= new Date())
              const openTasks = p.tasks?.filter((t: any) => t.status === "open" && !t.assignedToId).length || 0

              return (
                <Link
                  key={p.id}
                  href={`/projects/${p.id}`}
                  className="block sm:grid sm:grid-cols-[1fr_120px_120px_100px_100px] gap-3 px-4 py-3.5 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors items-center"
                >
                  {/* Project name + client */}
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                    {p.clientName && <p className="text-[11px] text-gray-400 truncate mt-0.5">{p.clientName}</p>}
                  </div>

                  {/* Team lead */}
                  <p className="text-xs text-gray-500 truncate hidden sm:block">{p.teamLead?.fullName}</p>

                  {/* Urgency */}
                  <div className="hidden sm:block">
                    {urg && (
                      <span className="inline-flex items-center gap-1.5 text-xs">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: urg.color }} />
                        <span style={{ color: urg.color }}>{urg.label}</span>
                      </span>
                    )}
                  </div>

                  {/* Next event */}
                  <div className="hidden sm:block">
                    {nextEvent ? (
                      <span className="text-xs text-gray-500">
                        {new Date(nextEvent.date).toLocaleDateString("he-IL", { day: "numeric", month: "short" })}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-300">—</span>
                    )}
                  </div>

                  {/* Open tasks */}
                  <div className="hidden sm:block text-center">
                    {openTasks > 0 ? (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-500 font-medium">{openTasks}</span>
                    ) : (
                      <span className="text-xs text-gray-300">0</span>
                    )}
                  </div>

                  {/* Mobile: meta line */}
                  <div className="flex items-center gap-3 mt-2 sm:hidden text-[11px] text-gray-400">
                    {urg && (
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: urg.color }} />
                        {urg.label}
                      </span>
                    )}
                    <span>{p.teamLead?.fullName}</span>
                    {openTasks > 0 && <span className="text-red-500">{openTasks} פתוחות</span>}
                  </div>
                </Link>
              )
            })
          )}
        </div>
      </div>
    </AppShell>
  )
}
