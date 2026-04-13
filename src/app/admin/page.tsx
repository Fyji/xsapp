"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { BRAND, AVAILABILITY_CONFIG, URGENCY_CONFIG } from "@/lib/constants"
import Link from "next/link"
import Navbar from "@/components/navbar"

const ROLE_LABELS: Record<string, string> = {
  admin: "מנהל",
  team_lead: "ראש צוות",
  employee: "עובד",
}

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [tab, setTab] = useState<"overview" | "users" | "projects">("overview")
  const [stats, setStats] = useState<any>(null)
  const [users, setUsers] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [showNewUser, setShowNewUser] = useState(false)
  const [newUser, setNewUser] = useState({ email: "", fullName: "", password: "", role: "employee", title: "", phone: "" })
  const [saving, setSaving] = useState(false)
  const [editingUser, setEditingUser] = useState<any>(null)

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
    if (status === "authenticated") {
      if ((session?.user as any)?.role !== "admin") {
        router.push("/")
        return
      }
      loadData()
    }
  }, [status, session, router])

  const loadData = () => {
    fetch("/api/admin/stats").then((r) => r.json()).then(setStats)
    fetch("/api/admin/users").then((r) => r.json()).then(setUsers)
    fetch("/api/admin/projects").then((r) => r.json()).then(setProjects)
  }

  const createUser = async () => {
    if (!newUser.email || !newUser.fullName || !newUser.password) return
    setSaving(true)
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newUser),
    })
    if (res.ok) {
      setShowNewUser(false)
      setNewUser({ email: "", fullName: "", password: "", role: "employee", title: "", phone: "" })
      loadData()
    } else {
      const err = await res.json()
      alert(err.error || "שגיאה ביצירת משתמש")
    }
    setSaving(false)
  }

  const deleteUser = async (id: string, name: string) => {
    if (!confirm(`למחוק את ${name}? הפעולה בלתי הפיכה`)) return
    await fetch(`/api/admin/users?id=${id}`, { method: "DELETE" })
    loadData()
  }

  const updateUser = async () => {
    if (!editingUser) return
    setSaving(true)
    await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editingUser),
    })
    setEditingUser(null)
    setSaving(false)
    loadData()
  }

  const updateProject = async (id: string, data: any) => {
    await fetch("/api/admin/projects", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...data }),
    })
    loadData()
  }

  const deleteProject = async (id: string, name: string) => {
    if (!confirm(`למחוק את הפרויקט "${name}"? כל המשימות והאירועים יימחקו`)) return
    await fetch(`/api/admin/projects?id=${id}`, { method: "DELETE" })
    loadData()
  }

  if (!session || (session.user as any)?.role !== "admin") return null

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Tabs */}
      <div className="max-w-6xl mx-auto px-4 pt-4">
        <div className="flex gap-1 bg-white rounded-xl p-1 shadow-sm border border-gray-100 w-fit">
          {[
            { key: "overview", label: "סקירה כללית" },
            { key: "users", label: "ניהול עובדים" },
            { key: "projects", label: "ניהול פרויקטים" },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                tab === t.key ? "text-white" : "text-gray-500 hover:text-gray-800"
              }`}
              style={tab === t.key ? { backgroundColor: BRAND.primaryColor } : {}}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">

        {/* OVERVIEW TAB */}
        {tab === "overview" && stats && (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "עובדים", value: stats.totalUsers, icon: "👥", color: BRAND.primaryColor },
                { label: "פרויקטים פעילים", value: stats.activeProjects, icon: "📁", color: "#3B82F6" },
                { label: "משימות ללא איוש", value: stats.openTasks, icon: "🚨", color: "#EF4444" },
                { label: "בקשות ממתינות", value: stats.pendingHandRaises, icon: "✋", color: "#F59E0B" },
              ].map((kpi) => (
                <div key={kpi.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                  <p className="text-2xl mb-1">{kpi.icon}</p>
                  <p className="text-3xl font-bold" style={{ color: kpi.color }}>{kpi.value}</p>
                  <p className="text-sm text-gray-500">{kpi.label}</p>
                </div>
              ))}
            </div>

            {/* Availability Summary */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="font-bold text-gray-700 mb-4">זמינות הצוות היום</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:flex md:flex-wrap gap-3">
                {Object.entries(AVAILABILITY_CONFIG).map(([key, config]) => {
                  const count = stats.availabilitySummary[key] || 0
                  return (
                    <div key={key} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50">
                      <span className="text-lg">{config.icon}</span>
                      <span className="text-xl font-bold" style={{ color: config.color }}>{count}</span>
                      <span className="text-xs sm:text-sm text-gray-500">{config.label}</span>
                    </div>
                  )
                })}
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50">
                  <span className="text-lg">❓</span>
                  <span className="text-xl font-bold text-gray-400">{stats.availabilitySummary.no_update || 0}</span>
                  <span className="text-xs sm:text-sm text-gray-500">לא עדכנו</span>
                </div>
              </div>
            </div>

            {/* Upcoming Events */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="font-bold text-gray-700 mb-4">אירועים ב-14 הימים הקרובים</h2>
              {stats.upcomingEvents.length === 0 ? (
                <p className="text-gray-400 text-sm">אין אירועים</p>
              ) : (
                <div className="space-y-2">
                  {stats.upcomingEvents.map((ev: any) => (
                    <div key={ev.id} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50">
                      <div>
                        <p className="text-sm font-medium text-gray-800">{ev.title}</p>
                        <p className="text-xs text-gray-400">{ev.projectName}</p>
                      </div>
                      <p className="text-sm text-gray-600">{new Date(ev.date).toLocaleDateString("he-IL")}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* USERS TAB */}
        {tab === "users" && (
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold" style={{ color: BRAND.dark }}>ניהול עובדים ({users.length})</h2>
              <button
                onClick={() => setShowNewUser(true)}
                className="px-4 py-2 rounded-xl text-white text-sm font-medium"
                style={{ backgroundColor: BRAND.primaryColor }}
              >
                + עובד חדש
              </button>
            </div>

            {/* New User Form */}
            {showNewUser && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border-2" style={{ borderColor: BRAND.primaryColor }}>
                <h3 className="font-bold text-gray-700 mb-4">יצירת עובד חדש</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">שם מלא *</label>
                    <input value={newUser.fullName} onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">אימייל *</label>
                    <input type="email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm" dir="ltr" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">סיסמה *</label>
                    <input type="password" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm" dir="ltr" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">תפקיד</label>
                    <select value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm">
                      <option value="employee">עובד</option>
                      <option value="team_lead">ראש צוות</option>
                      <option value="admin">מנהל</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">כותרת</label>
                    <input value={newUser.title} onChange={(e) => setNewUser({ ...newUser, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm" placeholder="אדריכל / מעצבת פנים" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">טלפון</label>
                    <input value={newUser.phone} onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm" dir="ltr" />
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <button onClick={createUser} disabled={saving}
                    className="px-6 py-2 rounded-xl text-white text-sm font-medium disabled:opacity-50"
                    style={{ backgroundColor: BRAND.primaryColor }}>
                    {saving ? "יוצר..." : "צור עובד"}
                  </button>
                  <button onClick={() => setShowNewUser(false)}
                    className="px-6 py-2 rounded-xl text-gray-600 text-sm border border-gray-200">ביטול</button>
                </div>
              </div>
            )}

            {/* Edit User Modal */}
            {editingUser && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border-2 border-blue-300">
                <h3 className="font-bold text-gray-700 mb-4">עריכת עובד: {editingUser.fullName}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">שם מלא</label>
                    <input value={editingUser.fullName} onChange={(e) => setEditingUser({ ...editingUser, fullName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">אימייל</label>
                    <input value={editingUser.email} onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm" dir="ltr" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">תפקיד</label>
                    <select value={editingUser.role} onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm">
                      <option value="employee">עובד</option>
                      <option value="team_lead">ראש צוות</option>
                      <option value="admin">מנהל</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">כותרת</label>
                    <input value={editingUser.title || ""} onChange={(e) => setEditingUser({ ...editingUser, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">טלפון</label>
                    <input value={editingUser.phone || ""} onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm" dir="ltr" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">סיסמה חדשה (ריק = ללא שינוי)</label>
                    <input type="password" value={editingUser.password || ""} onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm" dir="ltr" />
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <button onClick={updateUser} disabled={saving}
                    className="px-6 py-2 rounded-xl text-white text-sm font-medium disabled:opacity-50"
                    style={{ backgroundColor: BRAND.primaryColor }}>
                    {saving ? "שומר..." : "שמור שינויים"}
                  </button>
                  <button onClick={() => setEditingUser(null)}
                    className="px-6 py-2 rounded-xl text-gray-600 text-sm border border-gray-200">ביטול</button>
                </div>
              </div>
            )}

            {/* Users — Desktop table */}
            <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="text-right px-4 py-3 font-medium text-gray-600">שם</th>
                      <th className="text-right px-4 py-3 font-medium text-gray-600">אימייל</th>
                      <th className="text-right px-4 py-3 font-medium text-gray-600">תפקיד</th>
                      <th className="text-right px-4 py-3 font-medium text-gray-600">כותרת</th>
                      <th className="text-right px-4 py-3 font-medium text-gray-600">פרויקטים</th>
                      <th className="text-right px-4 py-3 font-medium text-gray-600">פעולות</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-800">{u.fullName}</td>
                        <td className="px-4 py-3 text-gray-500" dir="ltr">{u.email}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            u.role === "admin" ? "bg-purple-100 text-purple-700" :
                            u.role === "team_lead" ? "bg-blue-100 text-blue-700" :
                            "bg-gray-100 text-gray-600"
                          }`}>
                            {ROLE_LABELS[u.role]}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-500">{u.title || "—"}</td>
                        <td className="px-4 py-3 text-gray-500">{u.activeProjects}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button onClick={() => setEditingUser(u)}
                              className="text-xs px-2 py-1 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200">✏️ ערוך</button>
                            <button onClick={() => deleteUser(u.id, u.fullName)}
                              className="text-xs px-2 py-1 rounded-lg bg-red-50 text-red-500 hover:bg-red-100">🗑️ מחק</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Users — Mobile cards */}
            <div className="md:hidden space-y-3">
              {users.map((u) => (
                <div key={u.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-bold text-gray-800">{u.fullName}</p>
                      <p className="text-xs text-gray-400" dir="ltr">{u.email}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      u.role === "admin" ? "bg-purple-100 text-purple-700" :
                      u.role === "team_lead" ? "bg-blue-100 text-blue-700" :
                      "bg-gray-100 text-gray-600"
                    }`}>
                      {ROLE_LABELS[u.role]}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                    {u.title && <span>{u.title}</span>}
                    <span>{u.activeProjects} פרויקטים</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setEditingUser(u)}
                      className="flex-1 text-xs px-2 py-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200">✏️ ערוך</button>
                    <button onClick={() => deleteUser(u.id, u.fullName)}
                      className="flex-1 text-xs px-2 py-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100">🗑️ מחק</button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* PROJECTS TAB */}
        {tab === "projects" && (
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold" style={{ color: BRAND.dark }}>ניהול פרויקטים ({projects.length})</h2>
              <Link href="/projects/new" className="px-4 py-2 rounded-xl text-white text-sm font-medium"
                style={{ backgroundColor: BRAND.primaryColor }}>+ פרויקט חדש</Link>
            </div>

            <div className="space-y-3">
              {projects.map((p) => {
                const urg = URGENCY_CONFIG[p.urgency as keyof typeof URGENCY_CONFIG]
                return (
                  <div key={p.id} className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-100">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className="font-bold text-gray-800">{p.name}</h3>
                          {urg && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium"
                              style={{ backgroundColor: urg.bg, color: urg.color }}>{urg.label}</span>
                          )}
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            p.status === "active" ? "bg-green-100 text-green-700" :
                            p.status === "on_hold" ? "bg-yellow-100 text-yellow-700" :
                            p.status === "completed" ? "bg-gray-100 text-gray-600" :
                            "bg-red-50 text-red-500"
                          }`}>
                            {p.status === "active" ? "פעיל" : p.status === "on_hold" ? "מושהה" : p.status === "completed" ? "הושלם" : "ארכיון"}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">
                          ראש צוות: {p.teamLead?.fullName} · {p.memberCount} חברי צוות · {p.totalTasks} משימות ({p.openTasks} פתוחות)
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <select
                          value={p.status}
                          onChange={(e) => updateProject(p.id, { status: e.target.value })}
                          className="text-xs px-2 py-1.5 rounded-lg border border-gray-200"
                        >
                          <option value="active">פעיל</option>
                          <option value="on_hold">מושהה</option>
                          <option value="completed">הושלם</option>
                          <option value="archived">ארכיון</option>
                        </select>
                        <select
                          value={p.urgency}
                          onChange={(e) => updateProject(p.id, { urgency: e.target.value })}
                          className="text-xs px-2 py-1.5 rounded-lg border border-gray-200"
                        >
                          {Object.entries(URGENCY_CONFIG).map(([key, config]) => (
                            <option key={key} value={key}>{config.icon} {config.label}</option>
                          ))}
                        </select>
                        <Link href={`/projects/${p.id}`}
                          className="text-xs px-2 py-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200">👁️</Link>
                        <button onClick={() => deleteProject(p.id, p.name)}
                          className="text-xs px-2 py-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100">🗑️</button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
