import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      teamLead: true,
      members: { include: { user: true } },
      events: {
        orderBy: { date: "asc" },
        include: { completedBy: { select: { id: true, fullName: true } } },
      },
      tasks: {
        include: {
          assignedTo: { select: { id: true, fullName: true } },
          createdBy: { select: { id: true, fullName: true } },
        },
        orderBy: { deadline: "asc" },
      },
    },
  })

  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(project)
}
