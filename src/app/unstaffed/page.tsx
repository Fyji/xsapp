"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { BRAND, URGENCY_CONFIG } from "@/lib/constants"
import Link from "next/link"
import AppShell from "@/components/app-shell"
import { AlertCircle, CheckCircle2 } from "lucide-react"

export default function UnstaffedPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [tasks, setTasks] = useState<any[]>([])

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
    if (status === "authenticated") {
      fetch("/api/unstaffed").then((r) => r.json()).then(setTasks)
    }
  }, [status, router])

  if (!session) return null

  return (
    <AppShell>
      <div className="p-6 lg:p-8 max-w-[900px]">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <AlertCircle size={20} className="text-red-500" />
            משימות ללא איוש
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">{tasks.length} משימות ממתינות</p>
        </div>

        {tasks.length === 0 ? (
          <div className="border border-gray-200 rounded-lg bg-white p-12 text-center">
            <CheckCircle2 size={32} className="mx-auto text-green-400 mb-3" />
            <p className="text-sm font-medium text-gray-800">הכל מאויש!</p>
            <p className="text-xs text-gray-400 mt-1">אין משימות פתוחות ברגע זה</p>
          </div>
        ) : (
          <div className="border border-gray-200 rounded-lg overflow-hidden bg-white divide-y divide-gray-100">
            {tasks.map((t: any) => {
              const urg = URGENCY_CONFIG[t.urgency as keyof typeof URGENCY_CONFIG]
              return (
                <Link
                  key={t.id}
                  href={`/projects/${t.projectId}`}
                  className="flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{t.title}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5 truncate">{t.project?.name}</p>
                  </div>
                  {urg && (
                    <span className="inline-flex items-center gap-1 text-[11px] shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: urg.color }} />
                      <span style={{ color: urg.color }}>{urg.label}</span>
                    </span>
                  )}
                  {t.deadline && (
                    <span className="text-[11px] text-gray-400 shrink-0">
                      {new Date(t.deadline).toLocaleDateString("he-IL", { day: "numeric", month: "short" })}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </AppShell>
  )
}
