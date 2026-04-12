import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { status, dailyNote } = await req.json()
  const userId = (session.user as any).id
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const availability = await prisma.availability.upsert({
    where: { userId_date: { userId, date: today } },
    update: { status, dailyNote },
    create: { userId, date: today, status, dailyNote },
  })

  return NextResponse.json(availability)
}
