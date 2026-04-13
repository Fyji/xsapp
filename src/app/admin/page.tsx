"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { BRAND, AVAILABILITY_CONFIG, URGENCY_CONFIG } from "@/lib/constants"
import Link from "next/link"
import AppShell from "@/components/app-shell"
import { Users, FolderOpen, AlertTriangle, Bell, Pencil, Trash2, Eye, Plus, Search } from "lucide-react"

const ROLE_LABELS: Record<string, string> = { admin: "מנהל", team_lead: "ראש צוות", employee: "עובד" }

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
  const [searchUsers, setSearchUsers] = useState("")

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
    if (status === "authenticated") {
      if ((session?.user as any)?.role !== "admin") { router.push("/"); return }
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
    const res = await fetch("/api/admin/users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newUser) })
    if (res.ok) { setShowNewUser(false); setNewUser({ email: "", fullName: "", password: "", role: "employee", title: "", phone: "" }); loadData() }
    else { const err = await res.json(); alert(err.error || "שגיאה") }
    setSaving(false)
  }

  const deleteUser = async (id: string, name: string) => {
    if (!confirm(`למחוק את ${name}?`)) return
    await fetch(`/api/admin/users?id=${id}`, { method: "DELETE" }); loadData()
  }

  const updateUser = async () => {
    if (!editingUser) return
    setSaving(true)
    await fetch("/api/admin/users", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(editingUser) })
    setEditingUser(null); setSaving(false); loadData()
  }

  const updateProject = async (id: string, data: any) => {
    await fetch("/api/admin/projects", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, ...data }) })
    loadData()
  }

  const deleteProject = async (id: string, name: string) => {
    if (!confirm(`למחוק "${name}"?`)) return
    await fetch(`/api/admin/projects?id=${id}`, { method: "DELETE" }); loadData()
  }

  if (!session || (session.user as any)?.role !== "admin") return null

  const filteredUsers = users.filter((u) => !searchUsers || u.fullName.includes(searchUsers) || u.email.includes(searchUsers))

  const inputCls = "w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-300"

  return (
    <AppShell>
      <div className="p-6 lg:p-8 max-w-[1100px]">
        <h1 className="text-xl font-bold text-gray-900 mb-6">ניהול</h1>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-gray-200 mb-6">
          {[
            { key: "overview", label: "סקירה" },
            { key: "users", label: "עובדים" },
            { key: "projects", label: "פרויקטים" },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key as any)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition ${
                tab === t.key
                  ? "border-pink-600 text-pink-700"
                  : "border-transparent text-gray-400 hover:text-gray-600"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* OVERVIEW */}
        {tab === "overview" && stats && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { label: "עובדים", value: stats.totalUsers, Icon: Users, color: BRAND.primaryColor },
                { label: "פרויקטים פעילים", value: stats.activeProjects, Icon: FolderOpen, color: "#3B82F6" },
                { label: "ללא איוש", value: stats.openTasks, Icon: AlertTriangle, color: "#EF4444" },
                { label: "בקשות ממתינות", value: stats.pendingHandRaises, Icon: Bell, color: "#F59E0B" },
              ].map((kpi) => (
                <div key={kpi.label} className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 bg-white">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: kpi.color + "15" }}>
                    <kpi.Icon size={18} style={{ color: kpi.color }} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 leading-none">{kpi.value}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">{kpi.label}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border border-gray-200 rounded-lg bg-white p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">זמינות היום</h3>
              <div className="flex flex-wrap gap-4">
                {Object.entries(AVAILABILITY_CONFIG).map(([key, config]) => (
                  <div key={key} className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: config.color }} />
                    <span className="text-lg font-bold" style={{ color: config.color }}>{stats.availabilitySummary[key] || 0}</span>
                    <span className="text-xs text-gray-400">{config.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg bg-white">
              <div className="px-4 py-3 border-b border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900">אירועים קרובים</h3>
              </div>
              {stats.upcomingEvents.length === 0 ? (
                <p className="px-4 py-6 text-center text-sm text-gray-400">אין אירועים</p>
              ) : (
                <div className="divide-y divide-gray-100">
                  {stats.upcomingEvents.map((ev: any) => (
                    <div key={ev.id} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50">
                      <div>
                        <p className="text-sm font-medium text-gray-800">{ev.title}</p>
                        <p className="text-[11px] text-gray-400">{ev.projectName}</p>
                      </div>
                      <span className="text-xs text-gray-500">{new Date(ev.date).toLocaleDateString("he-IL")}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* USERS */}
        {tab === "users" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-2 justify-between">
              <div className="relative max-w-xs w-full">
                <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text" placeholder="חיפוש עובד..." value={searchUsers} onChange={(e) => setSearchUsers(e.target.value)}
                  className="w-full pl-3 pr-9 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-200"
                />
              </div>
              <button onClick={() => setShowNewUser(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-white text-sm font-medium" style={{ backgroundColor: BRAND.primaryColor }}>
                <Plus size={15} /> עובד חדש
              </button>
            </div>

            {/* New/Edit User Form */}
            {(showNewUser || editingUser) && (
              <div className="border border-gray-200 rounded-lg bg-white p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">{editingUser ? `עריכה: ${editingUser.fullName}` : "עובד חדש"}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div><label className="block text-[11px] text-gray-400 mb-1">שם מלא *</label>
                    <input value={editingUser?.fullName ?? newUser.fullName} onChange={(e) => editingUser ? setEditingUser({ ...editingUser, fullName: e.target.value }) : setNewUser({ ...newUser, fullName: e.target.value })} className={inputCls} /></div>
                  <div><label className="block text-[11px] text-gray-400 mb-1">אימייל *</label>
                    <input type="email" dir="ltr" value={editingUser?.email ?? newUser.email} onChange={(e) => editingUser ? setEditingUser({ ...editingUser, email: e.target.value }) : setNewUser({ ...newUser, email: e.target.value })} className={inputCls} /></div>
                  <div><label className="block text-[11px] text-gray-400 mb-1">{editingUser ? "סיסמה חדשה" : "סיסמה *"}</label>
                    <input type="password" dir="ltr" value={editingUser?.password ?? newUser.password} onChange={(e) => editingUser ? setEditingUser({ ...editingUser, password: e.target.value }) : setNewUser({ ...newUser, password: e.target.value })} className={inputCls} /></div>
                  <div><label className="block text-[11px] text-gray-400 mb-1">תפקיד</label>
                    <select value={editingUser?.role ?? newUser.role} onChange={(e) => editingUser ? setEditingUser({ ...editingUser, role: e.target.value }) : setNewUser({ ...newUser, role: e.target.value })} className={inputCls}>
                      <option value="employee">עובד</option><option value="team_lead">ראש צוות</option><option value="admin">מנהל</option>
                    </select></div>
                  <div><label className="block text-[11px] text-gray-400 mb-1">כותרת</label>
                    <input value={editingUser?.title ?? newUser.title} onChange={(e) => editingUser ? setEditingUser({ ...editingUser, title: e.target.value }) : setNewUser({ ...newUser, title: e.target.value })} className={inputCls} placeholder="אדריכל / מעצבת פנים" /></div>
                  <div><label className="block text-[11px] text-gray-400 mb-1">טלפון</label>
                    <input dir="ltr" value={editingUser?.phone ?? newUser.phone} onChange={(e) => editingUser ? setEditingUser({ ...editingUser, phone: e.target.value }) : setNewUser({ ...newUser, phone: e.target.value })} className={inputCls} /></div>
                </div>
                <div className="flex gap-2 mt-4">
                  <button onClick={editingUser ? updateUser : createUser} disabled={saving} className="px-5 py-2 rounded-lg text-white text-sm font-medium" style={{ backgroundColor: BRAND.primaryColor }}>
                    {saving ? "שומר..." : editingUser ? "שמור" : "צור"}
                  </button>
                  <button onClick={() => { setShowNewUser(false); setEditingUser(null) }} className="px-5 py-2 rounded-lg text-sm text-gray-500 border border-gray-200">ביטול</button>
                </div>
              </div>
            )}

            {/* Users table */}
            <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
              <div className="hidden sm:grid grid-cols-[1fr_140px_80px_80px_100px] gap-3 px-4 py-2.5 bg-gray-50 border-b border-gray-200 text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                <span>שם</span><span>אימייל</span><span>תפקיד</span><span>פרויקטים</span><span>פעולות</span>
              </div>
              {filteredUsers.map((u) => (
                <div key={u.id} className="sm:grid sm:grid-cols-[1fr_140px_80px_80px_100px] gap-3 px-4 py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 items-center">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{u.fullName}</p>
                    <p className="text-[11px] text-gray-400 sm:hidden" dir="ltr">{u.email}</p>
                  </div>
                  <p className="text-xs text-gray-500 hidden sm:block truncate" dir="ltr">{u.email}</p>
                  <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium w-fit ${
                    u.role === "admin" ? "bg-purple-50 text-purple-600" : u.role === "team_lead" ? "bg-blue-50 text-blue-600" : "bg-gray-100 text-gray-500"
                  }`}>{ROLE_LABELS[u.role]}</span>
                  <span className="text-xs text-gray-500 hidden sm:block">{u.activeProjects}</span>
                  <div className="flex gap-1.5 mt-2 sm:mt-0">
                    <button onClick={() => setEditingUser(u)} className="text-[11px] px-2 py-1 rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200"><Pencil size={11} /></button>
                    <button onClick={() => deleteUser(u.id, u.fullName)} className="text-[11px] px-2 py-1 rounded-md bg-red-50 text-red-500 hover:bg-red-100"><Trash2 size={11} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PROJECTS */}
        {tab === "projects" && (
          <div className="space-y-4">
            <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
              <div className="hidden sm:grid grid-cols-[1fr_100px_100px_80px_80px_80px] gap-3 px-4 py-2.5 bg-gray-50 border-b border-gray-200 text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                <span>פרויקט</span><span>ראש צוות</span><span>סטטוס</span><span>דחיפות</span><span>משימות</span><span>פעולות</span>
              </div>
              {projects.map((p) => {
                const urg = URGENCY_CONFIG[p.urgency as keyof typeof URGENCY_CONFIG]
                return (
                  <div key={p.id} className="sm:grid sm:grid-cols-[1fr_100px_100px_80px_80px_80px] gap-3 px-4 py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 items-center">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{p.name}</p>
                      {p.clientName && <p className="text-[11px] text-gray-400 truncate">{p.clientName}</p>}
                    </div>
                    <p className="text-xs text-gray-500 hidden sm:block truncate">{p.teamLead?.fullName}</p>
                    <select value={p.status} onChange={(e) => updateProject(p.id, { status: e.target.value })} className="text-[11px] px-1.5 py-1 rounded border border-gray-200 bg-white hidden sm:block">
                      <option value="active">פעיל</option><option value="on_hold">מושהה</option><option value="completed">הושלם</option><option value="archived">ארכיון</option>
                    </select>
                    <div className="hidden sm:block">
                      {urg && <span className="flex items-center gap-1 text-[11px]"><span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: urg.color }} /><span style={{ color: urg.color }}>{urg.label.split(" ")[0]}</span></span>}
                    </div>
                    <span className="text-xs text-gray-500 hidden sm:block">{p.openTasks}/{p.totalTasks}</span>
                    <div className="flex gap-1.5 mt-2 sm:mt-0">
                      <Link href={`/projects/${p.id}`} className="text-[11px] px-2 py-1 rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200"><Eye size={11} /></Link>
                      <button onClick={() => deleteProject(p.id, p.name)} className="text-[11px] px-2 py-1 rounded-md bg-red-50 text-red-500 hover:bg-red-100"><Trash2 size={11} /></button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  )
}
