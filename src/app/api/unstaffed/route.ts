import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const tasks = await prisma.task.findMany({
    where: { status: "open", assignedToId: null },
    include: {
      project: {
        include: {
          teamLead: { select: { id: true, fullName: true, phone: true } },
        },
      },
    },
    orderBy: [{ urgency: "asc" }, { deadline: "asc" }],
  })

  return NextResponse.json(tasks)
}

// Self-assign to a task
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { taskId } = await req.json()
  const userId = (session.user as any).id

  const task = await prisma.task.update({
    where: { id: taskId },
    data: { assignedToId: userId, status: "assigned" },
  })

  // Also add to project members if not already
  await prisma.projectMember.upsert({
    where: { userId_projectId: { userId, projectId: task.projectId } },
    update: {},
    create: { userId, projectId: task.projectId, roleInProject: "מסייע" },
  })

  return NextResponse.json(task)
}
