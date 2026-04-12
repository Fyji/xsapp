import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [
    totalUsers,
    activeProjects,
    openTasks,
    pendingHandRaises,
    todayAvailability,
    upcomingEvents,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.project.count({ where: { status: "active" } }),
    prisma.task.count({ where: { status: "open", assignedToId: null } }),
    prisma.handRaise.count({ where: { status: "pending" } }),
    prisma.availability.findMany({
      where: { date: today },
      include: { user: { select: { fullName: true } } },
    }),
    prisma.projectEvent.findMany({
      where: { date: { gte: new Date(), lte: new Date(Date.now() + 14 * 86400000) } },
      include: { project: { select: { name: true } } },
      orderBy: { date: "asc" },
    }),
  ])

  const availabilitySummary = {
    available: todayAvailability.filter((a) => a.status === "available").length,
    busy: todayAvailability.filter((a) => a.status === "busy").length,
    unavailable: todayAvailability.filter((a) => a.status === "unavailable").length,
    not_working: todayAvailability.filter((a) => a.status === "not_working").length,
    offsite: todayAvailability.filter((a) => a.status === "offsite").length,
    no_update: totalUsers - todayAvailability.length,
  }

  return NextResponse.json({
    totalUsers,
    activeProjects,
    openTasks,
    pendingHandRaises,
    availabilitySummary,
    upcomingEvents: upcomingEvents.map((e) => ({
      id: e.id,
      title: e.title,
      type: e.type,
      date: e.date,
      projectName: e.project.name,
    })),
  })
}
