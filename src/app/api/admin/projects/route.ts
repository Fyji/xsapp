import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET all projects with stats (admin only)
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const projects = await prisma.project.findMany({
    include: {
      teamLead: { select: { id: true, fullName: true } },
      members: true,
      events: { orderBy: { date: "asc" } },
      tasks: true,
    },
    orderBy: { updatedAt: "desc" },
  })

  return NextResponse.json(
    projects.map((p) => ({
      id: p.id,
      name: p.name,
      clientName: p.clientName,
      status: p.status,
      urgency: p.urgency,
      teamLead: p.teamLead,
      memberCount: p.members.length,
      eventCount: p.events.length,
      openTasks: p.tasks.filter((t) => t.status === "open" && !t.assignedToId).length,
      totalTasks: p.tasks.length,
      nextEvent: p.events.find((e) => new Date(e.date) >= new Date()),
      createdAt: p.createdAt,
    }))
  )
}

// UPDATE project (admin can change anything)
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const { id, name, clientName, description, status, urgency, teamLeadId } = await req.json()
  if (!id) return NextResponse.json({ error: "Missing project ID" }, { status: 400 })

  const data: any = {}
  if (name) data.name = name
  if (clientName !== undefined) data.clientName = clientName
  if (description !== undefined) data.description = description
  if (status) data.status = status
  if (urgency) data.urgency = urgency
  if (teamLeadId) data.teamLeadId = teamLeadId

  const project = await prisma.project.update({ where: { id }, data })

  return NextResponse.json(project)
}

// DELETE project (admin only)
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")
  if (!id) return NextResponse.json({ error: "Missing project ID" }, { status: 400 })

  await prisma.project.delete({ where: { id } })

  return NextResponse.json({ success: true })
}
