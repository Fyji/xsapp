"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import { BRAND, AVAILABILITY_CONFIG, URGENCY_CONFIG } from "@/lib/constants"
import Link from "next/link"
import Navbar from "@/components/navbar"
import { Phone as PhoneIcon } from "lucide-react"

export default function EmployeeProfile() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const userId = params.id as string
  const [profile, setProfile] = useState<any>(null)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
    if (status === "authenticated" && userId) {
      if ((session?.user as any)?.id === userId) {
        router.push("/profile")
        return
      }
      fetch(`/api/profile/${userId}`).then((r) => r.json()).then(setProfile)
    }
  }, [status, userId, session, router])

  const requestMeeting = async () => {
    setSending(true)
    await fetch("/api/hand-raise", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ toUserId: userId, type: "call" }),
    })
    setSending(false)
    setSent(true)
  }

  if (!profile) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: BRAND.grayLight }}>
      <p className="text-gray-400">טוען...</p>
    </div>
  )

  const avail = AVAILABILITY_CONFIG[profile.availability as keyof typeof AVAILABILITY_CONFIG] || AVAILABILITY_CONFIG.available
  const daysUntil = (d: string) => d ? Math.ceil((new Date(d).getTime() - Date.now()) / 86400000) : null

  return (
    <div className="min-h-screen" style={{ background: BRAND.grayLight }}>
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="relative">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center text-white text-3xl font-bold"
                style={{ backgroundColor: BRAND.primaryColor }}
              >
                {profile.fullName.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
              </div>
              <span
                className="absolute -bottom-1 -left-1 w-5 h-5 rounded-full border-2 border-white"
                style={{ backgroundColor: avail.color }}
              />
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-gray-800">{profile.fullName}</h1>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: avail.color }} />
                <span className="text-sm text-gray-600">{avail.label}</span>
              </div>
            </div>
          </div>

          {profile.dailyNote && (
            <div className="bg-gray-50 rounded-xl p-3 mb-4">
              <p className="text-xs text-gray-400 mb-1">פנייה יומית</p>
              <p className="text-sm text-gray-700">{profile.dailyNote}</p>
            </div>
          )}

          {/* Meeting request button */}
          <button
            onClick={requestMeeting}
            disabled={sending || sent}
            className="w-full py-3 rounded-xl font-medium transition disabled:opacity-50 flex items-center justify-center gap-2"
            style={sent ? { backgroundColor: "#DCFCE7", color: "#16A34A" } : { backgroundColor: BRAND.primaryColor, color: "#fff" }}
          >
            {sent ? (
              "בקשת פגישה נשלחה"
            ) : sending ? (
              "שולח..."
            ) : (
              <><PhoneIcon size={16} /> בקשת פגישה</>
            )}
          </button>

          {profile.phone && (
            <a href={`tel:${profile.phone}`} className="flex items-center justify-center gap-1.5 text-sm text-gray-400 mt-3 hover:text-gray-600">
              <PhoneIcon size={13} /> {profile.phone}
            </a>
          )}
        </div>

        {/* Projects */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-bold text-gray-700 mb-3">פרויקטים פעילים</h2>
          {profile.projects.length === 0 ? (
            <p className="text-gray-400 text-sm">אין פרויקטים פעילים</p>
          ) : (
            <div className="space-y-3">
              {profile.projects.map((p: any) => {
                const urg = URGENCY_CONFIG[p.urgency as keyof typeof URGENCY_CONFIG]
                const days = p.nextDeadline ? daysUntil(p.nextDeadline) : null
                return (
                  <Link key={p.id} href={`/projects/${p.id}`} className="block p-4 rounded-xl border border-gray-100 hover:shadow-sm transition">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-800">{p.name}</p>
                      </div>
                      <div className="text-left">
                        {urg && (
                          <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium"
                            style={{ backgroundColor: urg.bg, color: urg.color }}>
                            {urg.label}
                          </span>
                        )}
                        {days !== null && (
                          <p className="text-xs text-gray-500 mt-1">{days} ימים להגשה</p>
                        )}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
