import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      availability: { where: { date: today }, take: 1 },
      projectMembers: {
        where: { project: { status: "active" } },
        include: {
          project: {
            include: {
              events: {
                where: { date: { gte: new Date() } },
                orderBy: { date: "asc" },
                take: 1,
              },
            },
          },
        },
      },
      handRaisesReceived: {
        where: { status: "pending" },
        include: { fromUser: { select: { id: true, fullName: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  })

  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 })

  return NextResponse.json({
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    title: user.title,
    phone: user.phone,
    avatarUrl: user.avatarUrl,
    availability: user.availability[0]?.status || "available",
    dailyNote: user.availability[0]?.dailyNote || "",
    projects: user.projectMembers.map((pm) => ({
      id: pm.project.id,
      name: pm.project.name,
      roleInProject: pm.roleInProject,
      urgency: pm.project.urgency,
      nextDeadline: pm.project.events[0]?.date || null,
      nextDeadlineTitle: pm.project.events[0]?.title || null,
    })),
    pendingHandRaises: user.handRaisesReceived.map((hr) => ({
      id: hr.id,
      type: hr.type,
      from: hr.fromUser,
      createdAt: hr.createdAt,
    })),
  })
}
