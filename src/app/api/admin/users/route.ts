import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

// GET all users (admin only)
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const users = await prisma.user.findMany({
    include: {
      projectMembers: { where: { project: { status: "active" } } },
      ledProjects: { where: { status: "active" } },
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(
    users.map((u) => ({
      id: u.id,
      email: u.email,
      fullName: u.fullName,
      role: u.role,
      title: u.title,
      phone: u.phone,
      createdAt: u.createdAt,
      activeProjects: u.projectMembers.length,
      ledProjects: u.ledProjects.length,
    }))
  )
}

// CREATE new user (admin only)
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const { email, fullName, password, role, title, phone } = await req.json()

  if (!email || !fullName || !password) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return NextResponse.json({ error: "Email already exists" }, { status: 409 })
  }

  const passwordHash = await bcrypt.hash(password, 10)

  const user = await prisma.user.create({
    data: { email, fullName, passwordHash, role: role || "employee", title, phone },
  })

  return NextResponse.json({ id: user.id, email: user.email, fullName: user.fullName })
}

// UPDATE user (admin only)
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const { id, email, fullName, role, title, phone, password } = await req.json()
  if (!id) return NextResponse.json({ error: "Missing user ID" }, { status: 400 })

  const data: any = {}
  if (email) data.email = email
  if (fullName) data.fullName = fullName
  if (role) data.role = role
  if (title !== undefined) data.title = title
  if (phone !== undefined) data.phone = phone
  if (password) data.passwordHash = await bcrypt.hash(password, 10)

  const user = await prisma.user.update({ where: { id }, data })

  return NextResponse.json({ id: user.id, email: user.email, fullName: user.fullName })
}

// DELETE user (admin only)
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")
  if (!id) return NextResponse.json({ error: "Missing user ID" }, { status: 400 })

  // Don't allow deleting yourself
  if (id === (session.user as any).id) {
    return NextResponse.json({ error: "Cannot delete yourself" }, { status: 400 })
  }

  // Remove user from projects first
  await prisma.projectMember.deleteMany({ where: { userId: id } })
  await prisma.availability.deleteMany({ where: { userId: id } })
  await prisma.handRaise.deleteMany({ where: { OR: [{ fromUserId: id }, { toUserId: id }] } })
  await prisma.task.updateMany({ where: { assignedToId: id }, data: { assignedToId: null, status: "open" } })
  await prisma.user.delete({ where: { id } })

  return NextResponse.json({ success: true })
}
