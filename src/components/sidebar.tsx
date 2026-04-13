"use client"

import { useState, useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { BRAND } from "@/lib/constants"
import {
  Home, FolderOpen, Calendar, AlertCircle, User, Settings,
  LogOut, Menu, X, ChevronLeft
} from "lucide-react"

const NAV_SECTIONS = [
  {
    title: "ניווט",
    items: [
      { href: "/", label: "דשבורד", icon: Home },
      { href: "/projects", label: "פרויקטים", icon: FolderOpen },
      { href: "/timeline", label: "לו״ז", icon: Calendar },
      { href: "/unstaffed", label: "ללא איוש", icon: AlertCircle },
    ],
  },
]

export default function Sidebar() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const isAdmin = (session?.user as any)?.role === "admin"
  const userId = (session?.user as any)?.id
  const userName = session?.user?.name || ""

  // Close mobile menu on route change
  useEffect(() => { setOpen(false) }, [pathname])

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false) }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [])

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/"
    return pathname.startsWith(href)
  }

  const sidebarWidth = collapsed ? "w-[60px]" : "w-[240px]"

  const renderNavItems = () => (
    <div className="flex flex-col flex-1 py-3">
      {NAV_SECTIONS.map((section) => (
        <div key={section.title} className="mb-4">
          {!collapsed && (
            <p className="px-4 mb-1 text-[11px] font-medium text-gray-400 uppercase tracking-wider">
              {section.title}
            </p>
          )}
          {section.items.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 mx-2 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors duration-150 ${
                  active
                    ? "bg-pink-50 text-pink-700"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <Icon size={16} className={active ? "text-pink-600" : "text-gray-400"} />
                {!collapsed && <span>{item.label}</span>}
                {active && !collapsed && (
                  <div className="absolute right-0 w-[3px] h-5 rounded-l-full" style={{ backgroundColor: BRAND.primaryColor }} />
                )}
              </Link>
            )
          })}
        </div>
      ))}

      {/* User section */}
      <div className="mb-2">
        {!collapsed && (
          <p className="px-4 mb-1 text-[11px] font-medium text-gray-400 uppercase tracking-wider">
            חשבון
          </p>
        )}
        {userId && (
          <Link
            href="/profile"
            className={`flex items-center gap-2.5 mx-2 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors duration-150 ${
              pathname === "/profile" || pathname.startsWith("/profile/")
                ? "bg-pink-50 text-pink-700"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            }`}
          >
            <User size={16} className={pathname === "/profile" ? "text-pink-600" : "text-gray-400"} />
            {!collapsed && <span>פרופיל</span>}
          </Link>
        )}
        {isAdmin && (
          <Link
            href="/admin"
            className={`flex items-center gap-2.5 mx-2 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors duration-150 ${
              pathname === "/admin"
                ? "bg-pink-50 text-pink-700"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            }`}
          >
            <Settings size={16} className={pathname === "/admin" ? "text-pink-600" : "text-gray-400"} />
            {!collapsed && <span>ניהול</span>}
          </Link>
        )}
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile header bar */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 h-14 flex items-center px-4 justify-between">
        <button onClick={() => setOpen(true)} className="p-1.5 rounded-lg hover:bg-gray-100 transition">
          <Menu size={20} className="text-gray-600" />
        </button>
        <Link href="/" className="flex items-center gap-2">
          <img src={BRAND.logoUrl} alt="XS" className="h-7" />
          <span className="font-semibold text-sm" style={{ color: BRAND.dark }}>XSAPP</span>
        </Link>
        <div className="w-8" />
      </header>

      {/* Mobile overlay */}
      {open && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <aside className="absolute right-0 top-0 bottom-0 w-[260px] bg-white border-l border-gray-200 flex flex-col shadow-xl">
            {/* Mobile sidebar header */}
            <div className="h-14 flex items-center justify-between px-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <img src={BRAND.logoUrl} alt="XS" className="h-7" />
                <span className="font-semibold text-sm" style={{ color: BRAND.dark }}>XSAPP</span>
              </div>
              <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100">
                <X size={18} className="text-gray-500" />
              </button>
            </div>
            {renderNavItems()}
            {/* User footer */}
            <div className="border-t border-gray-100 p-3">
              <div className="flex items-center gap-2.5 px-2 py-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: BRAND.primaryColor }}>
                  {userName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{userName}</p>
                </div>
                <button onClick={() => signOut()} className="p-1.5 rounded-lg hover:bg-gray-100" title="התנתק">
                  <LogOut size={15} className="text-gray-400" />
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className={`hidden md:flex fixed right-0 top-0 bottom-0 ${sidebarWidth} bg-white border-l border-gray-200 flex-col z-40 transition-all duration-200`}>
        {/* Logo */}
        <div className="h-14 flex items-center justify-between px-4 border-b border-gray-100">
          <Link href="/" className="flex items-center gap-2">
            <img src={BRAND.logoUrl} alt="XS" className="h-7" />
            {!collapsed && <span className="font-semibold text-sm" style={{ color: BRAND.dark }}>XSAPP</span>}
          </Link>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 rounded hover:bg-gray-100 transition"
            title={collapsed ? "הרחב" : "כווץ"}
          >
            <ChevronLeft size={14} className={`text-gray-400 transition-transform ${collapsed ? "rotate-180" : ""}`} />
          </button>
        </div>

        {renderNavItems()}

        {/* User footer */}
        <div className="border-t border-gray-100 p-3">
          <div className="flex items-center gap-2.5 px-1">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0" style={{ backgroundColor: BRAND.primaryColor }}>
              {userName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
            </div>
            {!collapsed && (
              <>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-800 truncate">{userName}</p>
                </div>
                <button onClick={() => signOut()} className="p-1 rounded hover:bg-gray-100" title="התנתק">
                  <LogOut size={14} className="text-gray-400" />
                </button>
              </>
            )}
          </div>
        </div>
      </aside>

      {/* Spacer for desktop layout */}
      <div className={`hidden md:block shrink-0 ${sidebarWidth} transition-all duration-200`} />
      {/* Spacer for mobile header */}
      <div className="md:hidden h-14" />
    </>
  )
}
