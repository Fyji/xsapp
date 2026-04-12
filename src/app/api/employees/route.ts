import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const users = await prisma.user.findMany({
    include: {
      availability: {
        where: { date: today },
        take: 1,
      },
      projectMembers: {
        where: { project: { status: "active" } },
      },
      handRaisesReceived: {
        where: { status: "pending" },
      },
    },
    orderBy: { fullName: "asc" },
  })

  const employees = users.map((u) => ({
    id: u.id,
    fullName: u.fullName,
    email: u.email,
    role: u.role,
    title: u.title,
    phone: u.phone,
    avatarUrl: u.avatarUrl,
    availability: u.availability[0]?.status || "available",
    dailyNote: u.availability[0]?.dailyNote || "",
    activeProjectCount: u.projectMembers.length,
    pendingHandRaises: u.handRaisesReceived.length,
  }))

  return NextResponse.json(employees)
}
