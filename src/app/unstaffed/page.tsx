"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { BRAND, URGENCY_CONFIG } from "@/lib/constants"
import Link from "next/link"

export default function UnstaffedPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [tasks, setTasks] = useState<any[]>([])
  const [claiming, setClaiming] = useState<string | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
    if (status === "authenticated") {
      fetch("/api/unstaffed").then((r) => r.json()).then(setTasks)
    }
  }, [status, router])

  const claimTask = async (taskId: string) => {
    setClaiming(taskId)
    await fetch("/api/unstaffed", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskId }),
    })
    setTasks((prev) => prev.filter((t) => t.id !== taskId))
    setClaiming(null)
  }

  if (!session) return null

  return (
    <div className="min-h-screen" style={{ background: BRAND.grayLight }}>
      <header className="sticky top-0 z-50 shadow-md" style={{ background: BRAND.dark }}>
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src={BRAND.logoUrl} alt="XS" className="h-8" />
            <span className="text-white font-bold">XSAPP</span>
          </Link>
          <span className="text-white text-sm">משימות ללא איוש</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        <h1 className="text-2xl font-bold" style={{ color: BRAND.dark }}>
          🚨 משימות ללא איוש ({tasks.length})
        </h1>

        {tasks.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
            <p className="text-4xl mb-2">🎉</p>
            <p className="text-gray-500">הכל מאויש! אין משימות פתוחות</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.map((t) => {
              const urg = URGENCY_CONFIG[t.urgency as keyof typeof URGENCY_CONFIG]
              const daysLeft = t.deadline ? Math.ceil((new Date(t.deadline).getTime() - Date.now()) / 86400000) : null

              return (
                <div key={t.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <Link href={`/projects/${t.project.id}`} className="text-sm text-gray-400 hover:underline">
                        🏗️ {t.project.name}
                      </Link>
                      <h3 className="font-bold text-gray-800 text-lg">{t.title}</h3>
                    </div>
                    {urg && (
                      <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: urg.bg, color: urg.color }}>
                        {urg.label}
                      </span>
                    )}
                  </div>

                  {t.description && <p className="text-sm text-gray-600 mb-3">{t.description}</p>}

                  <div className="flex items-center justify-between mb-4 text-sm text-gray-500">
                    <span>
                      ראש צוות:{" "}
                      <Link href={`/profile/${t.project.teamLead.id}`} className="font-medium" style={{ color: BRAND.primaryColor }}>
                        {t.project.teamLead.fullName}
                      </Link>
                      {t.project.teamLead.phone && <span className="mr-1">📞</span>}
                    </span>
                    {daysLeft !== null && (
                      <span className={daysLeft <= 3 ? "text-red-500 font-medium" : ""}>
                        {daysLeft} ימים להגשה
                      </span>
                    )}
                  </div>

                  {t.requiredSkills?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {t.requiredSkills.map((s: string) => (
                        <span key={s} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">{s}</span>
                      ))}
                    </div>
                  )}

                  <button
                    onClick={() => claimTask(t.id)}
                    disabled={claiming === t.id}
                    className="w-full py-3 rounded-xl text-white font-semibold text-sm transition disabled:opacity-50"
                    style={{ backgroundColor: BRAND.primaryColor }}
                  >
                    {claiming === t.id ? "משייך..." : "🙋 אני רוצה לקחת את זה"}
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
