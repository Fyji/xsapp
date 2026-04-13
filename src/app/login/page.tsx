"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { BRAND } from "@/lib/constants"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    })

    if (result?.error) {
      setError("אימייל או סיסמה שגויים")
      setLoading(false)
    } else {
      router.push("/")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white" dir="rtl">
      <div className="w-full max-w-sm mx-4">
        <div className="text-center mb-10">
          <img
            src={BRAND.logoUrl}
            alt="XS Studio"
            className="h-16 mx-auto mb-4"
          />
          <h1 className="text-xl font-bold text-gray-900">XSAPP</h1>
          <p className="text-sm text-gray-400 mt-1">מערכת ניהול סטודיו</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-1.5">אימייל</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-300 transition"
              placeholder="your@email.com"
              dir="ltr"
              required
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-1.5">סיסמה</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-300 transition"
              placeholder="••••••••"
              dir="ltr"
              required
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg text-white font-medium text-sm transition-all disabled:opacity-50 hover:opacity-90"
            style={{ backgroundColor: BRAND.primaryColor }}
          >
            {loading ? "מתחבר..." : "התחברות"}
          </button>
        </form>

        <p className="text-center text-gray-300 text-xs mt-8">
          XS Studio © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  )
}
