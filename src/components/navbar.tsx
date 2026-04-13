"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { BRAND } from "@/lib/constants"

const NAV_ITEMS = [
  { href: "/", label: "בית" },
  { href: "/projects", label: "פרויקטים" },
  { href: "/timeline", label: "לו״ז" },
  { href: "/unstaffed", label: "ללא איוש" },
]

export default function Navbar() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const isAdmin = (session?.user as any)?.role === "admin"
  const userId = (session?.user as any)?.id

  const allItems = [
    ...NAV_ITEMS,
    ...(userId ? [{ href: `/profile/${userId}`, label: "פרופיל" }] : []),
    ...(isAdmin ? [{ href: "/admin", label: "⚙️ ניהול" }] : []),
  ]

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/"
    return pathname.startsWith(href)
  }

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <img src={BRAND.logoUrl} alt="XS" className="h-9" />
          <span className="font-bold text-lg hidden sm:inline" style={{ color: BRAND.dark }}>XSAPP</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {allItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                isActive(item.href)
                  ? "text-white"
                  : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
              }`}
              style={isActive(item.href) ? { backgroundColor: BRAND.primaryColor } : {}}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Mobile hamburger */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden flex flex-col gap-1.5 p-2"
          aria-label="תפריט"
        >
          <span className={`block w-6 h-0.5 bg-gray-600 transition-transform ${open ? "rotate-45 translate-y-2" : ""}`} />
          <span className={`block w-6 h-0.5 bg-gray-600 transition-opacity ${open ? "opacity-0" : ""}`} />
          <span className={`block w-6 h-0.5 bg-gray-600 transition-transform ${open ? "-rotate-45 -translate-y-2" : ""}`} />
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-gray-100 bg-white">
          <nav className="max-w-6xl mx-auto px-4 py-2 flex flex-col">
            {allItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`px-3 py-3 rounded-lg text-sm font-medium transition border-b border-gray-50 last:border-0 ${
                  isActive(item.href)
                    ? "text-white"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
                style={isActive(item.href) ? { backgroundColor: BRAND.primaryColor } : {}}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  )
}
