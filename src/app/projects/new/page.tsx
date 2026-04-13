"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { BRAND, URGENCY_CONFIG } from "@/lib/constants"
import Link from "next/link"
import AppShell from "@/components/app-shell"
import { ArrowRight } from "lucide-react"

export default function NewProject() {
  const { data: session } = useSession()
  const router = useRouter()
  const [form, setForm] = useState({ name: "", clientName: "", description: "", urgency: "not_urgent_important" })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      const project = await res.json()
      router.push(`/projects/${project.id}`)
    } else {
      alert("שגיאה ביצירת הפרויקט")
      setSaving(false)
    }
  }

  const inputCls = "w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-300 transition"

  return (
    <AppShell>
      <div className="p-6 lg:p-8 max-w-[700px]">
        <Link href="/projects" className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 mb-4 transition">
          <ArrowRight size={12} /> חזרה לפרויקטים
        </Link>

        <h1 className="text-xl font-bold text-gray-900 mb-6">פרויקט חדש</h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-1.5">שם הפרויקט *</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} required />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-1.5">לקוח</label>
            <input value={form.clientName} onChange={(e) => setForm({ ...form, clientName: e.target.value })} className={inputCls} />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-1.5">תיאור</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={`${inputCls} resize-none`} rows={3} />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-1.5">דחיפות</label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(URGENCY_CONFIG).map(([key, config]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setForm({ ...form, urgency: key })}
                  className={`flex items-center gap-2 p-3 rounded-lg text-sm font-medium border transition ${
                    form.urgency === key ? "border-current" : "border-gray-200 hover:border-gray-300"
                  }`}
                  style={form.urgency === key ? { backgroundColor: config.bg, color: config.color, borderColor: config.color } : {}}
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: config.color }} />
                  {config.label}
                </button>
              ))}
            </div>
          </div>
          <button
            type="submit"
            disabled={saving || !form.name}
            className="w-full py-3 rounded-lg text-white font-medium text-sm transition disabled:opacity-50 hover:opacity-90"
            style={{ backgroundColor: BRAND.primaryColor }}
          >
            {saving ? "יוצר..." : "צור פרויקט"}
          </button>
        </form>
      </div>
    </AppShell>
  )
}
