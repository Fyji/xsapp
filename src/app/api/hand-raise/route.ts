import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { toUserId, type } = await req.json()
  const fromUserId = (session.user as any).id

  const handRaise = await prisma.handRaise.create({
    data: { fromUserId, toUserId, type },
  })

  return NextResponse.json(handRaise)
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id, status } = await req.json()

  const handRaise = await prisma.handRaise.update({
    where: { id },
    data: { status, resolvedAt: status !== "pending" ? new Date() : null },
  })

  return NextResponse.json(handRaise)
}
