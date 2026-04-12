import type { Metadata } from "next"
import { Assistant } from "next/font/google"
import "./globals.css"
import { Providers } from "./providers"

const assistant = Assistant({ subsets: ["latin", "hebrew"], weight: ["400", "500", "600", "700"] })

export const metadata: Metadata = {
  title: "XSAPP — XS Studio",
  description: "מערכת ניהול סטודיו XS",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl">
      <body className={assistant.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
