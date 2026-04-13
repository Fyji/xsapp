"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import { BRAND, AVAILABILITY_CONFIG, URGENCY_CONFIG } from "@/lib/constants"
import Link from "next/link"
import AppShell from "@/components/app-shell"
import { Phone as PhoneIcon, ArrowRight } from "lucide-react"

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

  const avail = AVAILABILITY_CONFIG[profile.availability as keyof typeof AVAILABILITY_CONFIG] || AVAILABILITY_CONFIG.available
  const daysUntil = (d: string) => d ? Math.ceil((new Date(d).getTime() - Date.now()) / 86400000) : null

  return (
    <AppShell>
      <div className="p-6 lg:p-8 max-w-[800px]">
        <Link href="/" className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 mb-4 transition">
          <ArrowRight size={12} /> חזרה
        </Link>

        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative">
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold" style={{ backgroundColor: BRAND.primaryColor }}>
              {profile.fullName.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
            </div>
            <span className="absolute -bottom-0.5 -left-0.5 w-4 h-4 rounded-full border-2 border-white" style={{ backgroundColor: avail.color }} />
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900">{profile.fullName}</h1>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: avail.bg, color: avail.color }}>
                {avail.label}
              </span>
            </div>
          </div>
        </div>

        {profile.dailyNote && (
          <div className="border border-gray-200 rounded-lg bg-gray-50 px-4 py-3 mb-6">
            <p className="text-[11px] text-gray-400 mb-0.5">פנייה יומית</p>
            <p className="text-sm text-gray-700">{profile.dailyNote}</p>
          </div>
        )}

        {/* Meeting request */}
        <button
          onClick={requestMeeting}
          disabled={sending || sent}
          className="w-full py-3 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2 mb-8"
          style={sent
            ? { backgroundColor: "#DCFCE7", color: "#16A34A" }
            : { backgroundColor: BRAND.primaryColor, color: "#fff" }
          }
        >
          {sent ? "בקשת פגישה נשלחה ✓" : sending ? "שולח..." : <><PhoneIcon size={15} /> בקשת פגישה</>}
        </button>

        {profile.phone && (
          <a href={`tel:${profile.phone}`} className="flex items-center justify-center gap-1.5 text-xs text-gray-400 -mt-5 mb-8 hover:text-gray-600">
            <PhoneIcon size={11} /> {profile.phone}
          </a>
        )}

        {/* Projects */}
        <section>
          <h2 className="text-sm font-semibold text-gray-900 mb-3">פרויקטים פעילים</h2>
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
