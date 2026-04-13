import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// Mark event as completed early
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { eventId } = await req.json()
  if (!eventId) return NextResponse.json({ error: "Missing eventId" }, { status: 400 })

  const event = await prisma.projectEvent.update({
    where: { id: eventId },
    data: {
      completedAt: new Date(),
      completedById: (session.user as any).id,
    },
  })

  return NextResponse.json(event)
}

// Undo completion
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const eventId = searchParams.get("eventId")
  if (!eventId) return NextResponse.json({ error: "Missing eventId" }, { status: 400 })

  const event = await prisma.projectEvent.update({
    where: { id: eventId },
    data: {
      completedAt: null,
      completedById: null,
    },
  })

  return NextResponse.json(event)
}
