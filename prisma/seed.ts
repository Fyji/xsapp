import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("Seeding database...")

  const hash = (pw: string) => bcrypt.hashSync(pw, 10)

  // Create users
  const admin = await prisma.user.upsert({
    where: { email: "admin@xs-arch.co.il" },
    update: {},
    create: {
      email: "admin@xs-arch.co.il",
      passwordHash: hash("xs2026"),
      fullName: "מאור גולדשטיין",
      role: "admin",
      title: "מנהל סטודיו",
      phone: "050-1234567",
    },
  })

  const dana = await prisma.user.upsert({
    where: { email: "dana@xs-arch.co.il" },
    update: {},
    create: {
      email: "dana@xs-arch.co.il",
      passwordHash: hash("xs2026"),
      fullName: "דנה כהן",
      role: "team_lead",
      title: "אדריכלית ראשית",
      phone: "052-1111111",
    },
  })

  const yuval = await prisma.user.upsert({
    where: { email: "yuval@xs-arch.co.il" },
    update: {},
    create: {
      email: "yuval@xs-arch.co.il",
      passwordHash: hash("xs2026"),
      fullName: "יובל לוי",
      role: "team_lead",
      title: "אדריכל",
      phone: "052-2222222",
    },
  })

  const noa = await prisma.user.upsert({
    where: { email: "noa@xs-arch.co.il" },
    update: {},
    create: {
      email: "noa@xs-arch.co.il",
      passwordHash: hash("xs2026"),
      fullName: "נועה שמש",
      role: "employee",
      title: "מעצבת פנים",
      phone: "054-3333333",
    },
  })

  const ron = await prisma.user.upsert({
    where: { email: "ron@xs-arch.co.il" },
    update: {},
    create: {
      email: "ron@xs-arch.co.il",
      passwordHash: hash("xs2026"),
      fullName: "רון אבירם",
      role: "employee",
      title: "אדריכל",
      phone: "053-4444444",
    },
  })

  const shira = await prisma.user.upsert({
    where: { email: "shira@xs-arch.co.il" },
    update: {},
    create: {
      email: "shira@xs-arch.co.il",
      passwordHash: hash("xs2026"),
      fullName: "שירה ברק",
      role: "employee",
      title: "מעצבת פנים",
      phone: "050-5555555",
    },
  })

  console.log("Users created")

  // Create projects
  const projectAlpha = await prisma.project.create({
    data: {
      name: "דירה קומפקטית - תל אביב",
      clientName: "משפחת אלון",
      description: "תכנון דירת 55 מ״ר ברחוב דיזנגוף, כולל מטבח, סלון, חדר שינה וחדר עבודה",
      status: "active",
      urgency: "urgent_important",
      teamLeadId: dana.id,
    },
  })

  const projectBeta = await prisma.project.create({
    data: {
      name: "בניין מגורים - יפו",
      clientName: "יזם השקעות",
      description: "תכנון בניין 12 יחידות דיור קומפקטיות ביפו העתיקה",
      status: "active",
      urgency: "not_urgent_important",
      teamLeadId: yuval.id,
    },
  })

  const projectGamma = await prisma.project.create({
    data: {
      name: "סטודיו אמן - פלורנטין",
      clientName: "רונית האמנית",
      description: "עיצוב פנים לסטודיו אמנות 40 מ״ר כולל אזור עבודה ותצוגה",
      status: "active",
      urgency: "urgent_not_important",
      teamLeadId: dana.id,
    },
  })

  const projectDelta = await prisma.project.create({
    data: {
      name: "מיקרו-דירה - רמת גן",
      clientName: "עידן כהן",
      description: "תכנון דירת 30 מ״ר עם פתרונות אחסון חכמים",
      status: "active",
      urgency: "not_urgent_not_important",
      teamLeadId: yuval.id,
    },
  })

  console.log("Projects created")

  // Add members to projects
  await prisma.projectMember.createMany({
    data: [
      { userId: dana.id, projectId: projectAlpha.id, roleInProject: "אדריכלית ראשית" },
      { userId: noa.id, projectId: projectAlpha.id, roleInProject: "מעצבת פנים" },
      { userId: ron.id, projectId: projectAlpha.id, roleInProject: "אדריכל" },
      { userId: yuval.id, projectId: projectBeta.id, roleInProject: "אדריכל ראשי" },
      { userId: shira.id, projectId: projectBeta.id, roleInProject: "מעצבת פנים" },
      { userId: admin.id, projectId: projectBeta.id, roleInProject: "מנהל" },
      { userId: dana.id, projectId: projectGamma.id, roleInProject: "ראש צוות" },
      { userId: shira.id, projectId: projectGamma.id, roleInProject: "מעצבת פנים" },
      { userId: yuval.id, projectId: projectDelta.id, roleInProject: "אדריכל ראשי" },
    ],
  })

  console.log("Members assigned")

  // Create events
  const now = new Date()
  const addDays = (d: number) => new Date(now.getTime() + d * 86400000)

  await prisma.projectEvent.createMany({
    data: [
      { projectId: projectAlpha.id, title: "הגשת ביניים - סקיצות", type: "interim_submission", date: addDays(3) },
      { projectId: projectAlpha.id, title: "הגשה סופית ללקוח", type: "final_submission", date: addDays(14) },
      { projectId: projectAlpha.id, title: "סקירה פנימית", type: "internal_meeting", date: addDays(1) },
      { projectId: projectBeta.id, title: "הגשה לוועדה", type: "final_submission", date: addDays(21) },
      { projectId: projectBeta.id, title: "פגישת לקוח", type: "external_meeting", date: addDays(5) },
      { projectId: projectGamma.id, title: "הגשת קונספט", type: "interim_submission", date: addDays(7) },
      { projectId: projectDelta.id, title: "פגישה פנימית - ריהוט", type: "internal_meeting", date: addDays(10) },
    ],
  })

  console.log("Events created")

  // Create some open tasks (unstaffed)
  await prisma.task.createMany({
    data: [
      {
        projectId: projectAlpha.id,
        title: "תכנון מטבח מפורט",
        description: "צריך לתכנן את המטבח כולל חתכים ופרטי נגרות",
        urgency: "urgent_important",
        deadline: addDays(5),
        status: "open",
        createdById: dana.id,
        requiredSkills: ["עיצוב פנים", "פרטי נגרות"],
      },
      {
        projectId: projectBeta.id,
        title: "הדמיות 3D לחזיתות",
        description: "הפקת 4 הדמיות חזיתות לפרזנטציה ללקוח",
        urgency: "urgent_not_important",
        deadline: addDays(4),
        status: "open",
        createdById: yuval.id,
        requiredSkills: ["תלת מימד", "הדמיות"],
      },
      {
        projectId: projectDelta.id,
        title: "מחקר ריהוט קומפקטי",
        description: "איסוף רפרנסים וספקים לריהוט חכם ומתקפל",
        urgency: "not_urgent_important",
        deadline: addDays(15),
        status: "open",
        createdById: yuval.id,
        requiredSkills: ["מחקר", "ריהוט"],
      },
    ],
  })

  console.log("Tasks created")

  // Set some availability
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  await prisma.availability.createMany({
    data: [
      { userId: admin.id, date: today, status: "available", dailyNote: "בסטודיו כל היום, פגישה ב-14:00" },
      { userId: dana.id, date: today, status: "busy", dailyNote: "עובדת על חתכים פרויקט דירה ת״א" },
      { userId: yuval.id, date: today, status: "offsite", dailyNote: "פגישה באתר ביפו בבוקר, חוזר אחה״צ" },
      { userId: noa.id, date: today, status: "available", dailyNote: "ממשיכה עם לוחות חומרים" },
      { userId: ron.id, date: today, status: "unavailable", dailyNote: "דדליין הגשת ביניים" },
      { userId: shira.id, date: today, status: "not_working", dailyNote: "" },
    ],
  })

  console.log("Availability set")

  // Create a hand raise
  await prisma.handRaise.create({
    data: {
      fromUserId: admin.id,
      toUserId: dana.id,
      type: "call",
      status: "pending",
    },
  })

  console.log("Seed complete! 🎉")
  console.log("\nLogin: admin@xs-arch.co.il / xs2026")
  console.log("All users use password: xs2026")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
