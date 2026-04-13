import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const events = await prisma.projectEvent.findMany({
    where: {
      date: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      project: { status: "active" },
    },
    include: {
      project: { select: { id: true, name: true, urgency: true } },
      completedBy: { select: { id: true, fullName: true } },
    },
    orderBy: { date: "asc" },
  })

  return NextResponse.json(events)
}
