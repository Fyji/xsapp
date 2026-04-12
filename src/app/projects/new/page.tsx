"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { BRAND, URGENCY_CONFIG } from "@/lib/constants"
import Link from "next/link"

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

  return (
    <div className="min-h-screen" style={{ background: BRAND.grayLight }}>
      <header className="sticky top-0 z-50 shadow-md" style={{ background: BRAND.dark }}>
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/projects" className="flex items-center gap-2">
            <img src={BRAND.logoUrl} alt="XS" className="h-8" />
            <span className="text-white font-bold">XSAPP</span>
          </Link>
          <span className="text-white text-sm">פרויקט חדש</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
          <h1 className="text-xl font-bold text-gray-800">יצירת פרויקט חדש</h1>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">שם הפרויקט *</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">שם הלקוח</label>
            <input
              value={form.clientName}
              onChange={(e) => setForm({ ...form, clientName: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">תיאור</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2"
              rows={4}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">רמת דחיפות</label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(URGENCY_CONFIG).map(([key, config]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setForm({ ...form, urgency: key })}
                  className={`p-3 rounded-xl text-sm font-medium border-2 transition ${
                    form.urgency === key ? "border-current" : "border-gray-200"
                  }`}
                  style={form.urgency === key ? { backgroundColor: config.bg, color: config.color, borderColor: config.color } : {}}
                >
                  {config.icon} {config.label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={saving || !form.name}
            className="w-full py-3 rounded-xl text-white font-semibold disabled:opacity-50"
            style={{ backgroundColor: BRAND.primaryColor }}
          >
            {saving ? "יוצר..." : "צור פרויקט"}
          </button>
        </form>
      </main>
    </div>
  )
}
