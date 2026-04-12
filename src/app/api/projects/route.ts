import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const projects = await prisma.project.findMany({
    where: { status: { in: ["active", "on_hold"] } },
    include: {
      teamLead: { select: { id: true, fullName: true } },
      members: { include: { user: { select: { id: true, fullName: true } } } },
      events: { orderBy: { date: "asc" } },
      tasks: { where: { status: { in: ["open", "assigned", "in_progress"] } } },
    },
    orderBy: [{ urgency: "asc" }, { updatedAt: "desc" }],
  })

  return NextResponse.json(projects)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const role = (session.user as any).role
  if (role !== "team_lead" && role !== "admin") {
    return NextResponse.json({ error: "Only team leads can create projects" }, { status: 403 })
  }

  const body = await req.json()
  const project = await prisma.project.create({
    data: {
      name: body.name,
      clientName: body.clientName,
      description: body.description,
      urgency: body.urgency || "not_urgent_not_important",
      teamLeadId: (session.user as any).id,
    },
  })

  return NextResponse.json(project)
}
