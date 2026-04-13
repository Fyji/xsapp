"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { BRAND, AVAILABILITY_CONFIG, URGENCY_CONFIG } from "@/lib/constants"
import Link from "next/link"
import AppShell from "@/components/app-shell"
import { Bell, Check, X, Save } from "lucide-react"

export default function MyProfile() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [availStatus, setAvailStatus] = useState("available")
  const [dailyNote, setDailyNote] = useState("")
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
    if (status === "authenticated") {
      const userId = (session?.user as any)?.id
      if (userId) {
        fetch(`/api/profile/${userId}`)
          .then((r) => r.json())
          .then((data) => {
            setProfile(data)
            setAvailStatus(data.availability || "available")
            setDailyNote(data.dailyNote || "")
          })
      }
    }
  }, [status, session, router])

  const saveStatus = async () => {
    setSaving(true)
    await fetch("/api/availability", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: availStatus, dailyNote }),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (!profile) {
    return (
      <AppShell>
        <div className="p-8 animate-pulse space-y-4">
          <div className="h-16 w-16 bg-gray-100 rounded-full" />
          <div className="h-6 w-40 bg-gray-100 rounded" />
        </div>
      </AppShell>
    )
  }

  const daysUntil = (d: string) => d ? Math.ceil((new Date(d).getTime() - Date.now()) / 86400000) : null

  return (
    <AppShell>
      <div className="p-6 lg:p-8 max-w-[800px]">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold" style={{ backgroundColor: BRAND.primaryColor }}>
            {profile.fullName.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{profile.fullName}</h1>
            <p className="text-sm text-gray-400">{profile.email}</p>
          </div>
        </div>

        {/* Status Update */}
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">סטטוס יומי</h2>
          <div className="border border-gray-200 rounded-lg bg-white p-4 space-y-4">
            <div className="flex flex-wrap gap-2">
              {Object.entries(AVAILABILITY_CONFIG).map(([key, config]) => (
                <button
                  key={key}
                  onClick={() => setAvailStatus(key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border transition ${
                    availStatus === key
                      ? "border-transparent text-white"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                  style={availStatus === key ? { backgroundColor: config.color } : {}}
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: availStatus === key ? "#fff" : config.color }} />
                  {config.label}
                </button>
              ))}
            </div>
            <div>
              <label className="block text-[11px] text-gray-400 mb-1">פנייה יומית</label>
              <input
                type="text"
                value={dailyNote}
                onChange={(e) => setDailyNote(e.target.value)}
                placeholder="למשל: 'היום אני ב-Zoom עד 14:00'"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-300"
              />
            </div>
            <button
              onClick={saveStatus}
              disabled={saving}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition ${
                saved
                  ? "bg-green-500 text-white"
                  : "text-white"
              }`}
              style={!saved ? { backgroundColor: BRAND.primaryColor } : {}}
            >
              {saved ? <><Check size={14} /> נשמר</> : saving ? "שומר..." : <><Save size={14} /> שמירה</>}
            </button>
          </div>
        </section>

        {/* Pending Requests */}
        {profile.pendingRequests?.length > 0 && (
          <section className="mb-8">
            <h2 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-1.5">
              <Bell size={14} style={{ color: BRAND.primaryColor }} /> בקשות ממתינות
            </h2>
            <div className="border border-gray-200 rounded-lg bg-white divide-y divide-gray-100">
              {profile.pendingRequests.map((hr: any) => (
                <div key={hr.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {hr.fromUser.fullName}
                    </p>
                    <p className="text-[11px] text-gray-400">{hr.type === "call" ? "בקשת פגישה" : "הרמת יד"}</p>
                  </div>
                  <button
                    onClick={async () => {
                      await fetch("/api/hand-raise", {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ id: hr.id, status: "done" }),
                      })
                      setProfile((p: any) => ({
                        ...p,
                        pendingRequests: p.pendingRequests.filter((r: any) => r.id !== hr.id),
                      }))
                    }}
                    className="px-3 py-1 text-xs rounded-md bg-green-50 text-green-600 hover:bg-green-100 transition"
                  >
                    <Check size={12} className="inline -mt-0.5" /> טופל
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* My Projects */}
        <section>
          <h2 className="text-sm font-semibold text-gray-900 mb-3">הפרויקטים שלי</h2>
          {profile.projects.length === 0 ? (
            <p className="text-sm text-gray-400">אין פרויקטים פעילים</p>
          ) : (
            <div className="border border-gray-200 rounded-lg bg-white divide-y divide-gray-100">
              {profile.projects.map((p: any) => {
                const urg = URGENCY_CONFIG[p.urgency as keyof typeof URGENCY_CONFIG]
                const days = p.nextDeadline ? daysUntil(p.nextDeadline) : null
                return (
                  <Link key={p.id} href={`/projects/${p.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800">{p.name}</p>
                    </div>
                    {urg && (
                      <span className="inline-flex items-center gap-1 text-[11px]">
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: urg.color }} />
                        <span style={{ color: urg.color }}>{urg.label}</span>
                      </span>
                    )}
                    {days !== null && (
                      <span className={`text-[11px] font-medium ${days <= 3 ? "text-pink-600" : "text-gray-400"}`}>
                        {days} ימים
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>
          )}
        </section>
      </div>
    </AppShell>
  )
}
