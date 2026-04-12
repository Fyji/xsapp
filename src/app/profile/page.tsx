"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { BRAND, AVAILABILITY_CONFIG, URGENCY_CONFIG } from "@/lib/constants"
import Link from "next/link"

export default function MyProfile() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [availStatus, setAvailStatus] = useState("available")
  const [dailyNote, setDailyNote] = useState("")
  const [saving, setSaving] = useState(false)

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
  }

  if (!profile) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: BRAND.grayLight }}>
      <p className="text-gray-400">טוען...</p>
    </div>
  )

  const daysUntil = (d: string) => d ? Math.ceil((new Date(d).getTime() - Date.now()) / 86400000) : null

  return (
    <div className="min-h-screen" style={{ background: BRAND.grayLight }}>
      {/* Header */}
      <header className="sticky top-0 z-50 shadow-md" style={{ background: BRAND.dark }}>
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src={BRAND.logoUrl} alt="XS" className="h-8" />
            <span className="text-white font-bold">XSAPP</span>
          </Link>
          <span className="text-white text-sm">הפרופיל שלי</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-4 mb-6">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold"
              style={{ backgroundColor: BRAND.primaryColor }}
            >
              {profile.fullName.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">{profile.fullName}</h1>
              <p className="text-sm text-gray-500">{profile.title || profile.role}</p>
            </div>
          </div>

          {/* Availability Update */}
          <div className="border-t pt-4">
            <h2 className="font-bold text-gray-700 mb-3">סטטוס יומי</h2>
            <div className="flex flex-wrap gap-2 mb-4">
              {Object.entries(AVAILABILITY_CONFIG).map(([key, config]) => (
                <button
                  key={key}
                  onClick={() => setAvailStatus(key)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition border-2 ${
                    availStatus === key ? "border-current text-white" : "border-gray-200 text-gray-600"
                  }`}
                  style={availStatus === key ? { backgroundColor: config.color, borderColor: config.color } : {}}
                >
                  {config.icon} {config.label}
                </button>
              ))}
            </div>

            <textarea
              value={dailyNote}
              onChange={(e) => setDailyNote(e.target.value)}
              placeholder="על מה אתה עובד היום?"
              className="w-full p-3 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2"
              style={{ focusRingColor: BRAND.primaryColor } as any}
              rows={3}
            />

            <button
              onClick={saveStatus}
              disabled={saving}
              className="mt-3 px-6 py-2 rounded-xl text-white font-medium text-sm disabled:opacity-50"
              style={{ backgroundColor: BRAND.primaryColor }}
            >
              {saving ? "שומר..." : "שמור סטטוס"}
            </button>
          </div>
        </div>

        {/* My Projects */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-bold text-gray-700 mb-3">הפרויקטים שלי</h2>
          {profile.projects.length === 0 ? (
            <p className="text-gray-400 text-sm">אין פרויקטים פעילים</p>
          ) : (
            <div className="space-y-3">
              {profile.projects.map((p: any) => {
                const urg = URGENCY_CONFIG[p.urgency as keyof typeof URGENCY_CONFIG]
                const days = p.nextDeadline ? daysUntil(p.nextDeadline) : null
                return (
                  <Link
                    key={p.id}
                    href={`/projects/${p.id}`}
                    className="block p-4 rounded-xl border border-gray-100 hover:shadow-sm transition"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-800">{p.name}</p>
                        <p className="text-xs text-gray-400">{p.roleInProject}</p>
                      </div>
                      <div className="text-left">
                        {urg && (
                          <span
                            className="inline-block px-2 py-0.5 rounded-full text-xs font-medium"
                            style={{ backgroundColor: urg.bg, color: urg.color }}
                          >
                            {urg.label}
                          </span>
                        )}
                        {days !== null && (
                          <p className="text-xs text-gray-500 mt-1">
                            {p.nextDeadlineTitle} — {days} ימים
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        {/* Pending Hand Raises */}
        {profile.pendingHandRaises.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="font-bold text-gray-700 mb-3">🔔 בקשות ממתינות</h2>
            <div className="space-y-2">
              {profile.pendingHandRaises.map((hr: any) => (
                <div key={hr.id} className="flex items-center justify-between p-3 rounded-xl bg-pink-50 border border-pink-100">
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {hr.type === "hand" ? "✋" : "📞"} {hr.from.fullName}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(hr.createdAt).toLocaleDateString("he-IL")}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={async () => {
                        await fetch("/api/hand-raise", {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ id: hr.id, status: "done" }),
                        })
                        setProfile((prev: any) => ({
                          ...prev,
                          pendingHandRaises: prev.pendingHandRaises.filter((h: any) => h.id !== hr.id),
                        }))
                      }}
                      className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-medium"
                    >
                      ✅ טופל
                    </button>
                    <button
                      onClick={async () => {
                        await fetch("/api/hand-raise", {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ id: hr.id, status: "dismissed" }),
                        })
                        setProfile((prev: any) => ({
                          ...prev,
                          pendingHandRaises: prev.pendingHandRaises.filter((h: any) => h.id !== hr.id),
                        }))
                      }}
                      className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium"
                    >
                      ❌
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
