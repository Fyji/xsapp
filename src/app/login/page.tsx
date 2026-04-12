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
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md mx-4">
        <div className="text-center mb-8">
          <img
            src={BRAND.logoUrl}
            alt="XS Studio"
            className="h-20 mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold" style={{ color: BRAND.dark }}>XSAPP</h1>
          <p className="text-gray-400 mt-1">מערכת ניהול סטודיו</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100" dir="rtl">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">אימייל</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent text-left"
                style={{ focusRingColor: BRAND.primaryColor } as any}
                placeholder="your@email.com"
                dir="ltr"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">סיסמה</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent"
                placeholder="••••••••"
                dir="ltr"
                required
              />
            </div>
          </div>

          {error && (
            <p className="text-red-500 text-sm mt-3 text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 py-3 rounded-xl text-white font-semibold text-lg transition-all disabled:opacity-50"
            style={{ backgroundColor: BRAND.primaryColor }}
          >
            {loading ? "מתחבר..." : "התחברות"}
          </button>
        </form>

        <p className="text-center text-gray-300 text-sm mt-6">
          XS Studio © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  )
}
