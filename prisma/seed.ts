import { PrismaClient, Role, FeeStatus, AttendanceStatus, ExamType, NoticeTarget } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("Seeding database...")

  // Clean existing data
  await prisma.noticeRecipient.deleteMany()
  await prisma.notice.deleteMany()
  await prisma.fee.deleteMany()
  await prisma.mark.deleteMany()
  await prisma.subjectAttendance.deleteMany()
  await prisma.classAttendance.deleteMany()
  await prisma.enrollment.deleteMany()
  await prisma.teacherAssignment.deleteMany()
  await prisma.subject.deleteMany()
  await prisma.class.deleteMany()
  await prisma.course.deleteMany()
  await prisma.student.deleteMany()
  await prisma.teacher.deleteMany()
  await prisma.admin.deleteMany()
  await prisma.principal.deleteMany()
  await prisma.session.deleteMany()
  await prisma.account.deleteMany()
  await prisma.user.deleteMany()

  const hashedPassword = await bcrypt.hash("password123", 12)

  // Create Admin
  const adminUser = await prisma.user.create({
    data: {
      email: "admin@college.edu",
      password: hashedPassword,
      firstName: "Rajesh",
      lastName: "Kumar",
      role: Role.ADMIN,
      admin: { create: {} },
    },
  })

  // Create Principal
  const principalUser = await prisma.user.create({
    data: {
      email: "principal@college.edu",
      password: hashedPassword,
      firstName: "Dr. Priya",
      lastName: "Sharma",
      role: Role.PRINCIPAL,
      principal: { create: {} },
    },
  })

  // Create Teachers
  const teacher1User = await prisma.user.create({
    data: {
      email: "teacher1@college.edu",
      password: hashedPassword,
      firstName: "Amit",
      lastName: "Verma",
      role: Role.TEACHER,
      teacher: {
        create: {
          employeeId: "TCH001",
          department: "Mathematics",
          phone: "9876543210",
          qualification: "M.Sc Mathematics",
          joiningDate: new Date("2020-06-15"),
        },
      },
    },
  })

  const teacher2User = await prisma.user.create({
    data: {
      email: "teacher2@college.edu",
      password: hashedPassword,
      firstName: "Sunita",
      lastName: "Patel",
      role: Role.TEACHER,
      teacher: {
        create: {
          employeeId: "TCH002",
          department: "Science",
          phone: "9876543211",
          qualification: "M.Sc Physics",
          joiningDate: new Date("2019-07-01"),
        },
      },
    },
  })

  const teacher3User = await prisma.user.create({
    data: {
      email: "teacher3@college.edu",
      password: hashedPassword,
      firstName: "Mohan",
      lastName: "Das",
      role: Role.TEACHER,
      teacher: {
        create: {
          employeeId: "TCH003",
          department: "English",
          phone: "9876543212",
          qualification: "M.A English",
          joiningDate: new Date("2021-08-01"),
        },
      },
    },
  })

  // Create Students
  const studentUsers = []
  const studentData = [
    { first: "Aarav", last: "Singh", email: "student1@college.edu", roll: "2024001" },
    { first: "Priya", last: "Gupta", email: "student2@college.edu", roll: "2024002" },
    { first: "Rahul", last: "Mehta", email: "student3@college.edu", roll: "2024003" },
    { first: "Ananya", last: "Joshi", email: "student4@college.edu", roll: "2024004" },
    { first: "Vikram", last: "Rao", email: "student5@college.edu", roll: "2024005" },
    { first: "Kavya", last: "Nair", email: "student6@college.edu", roll: "2024006" },
    { first: "Arjun", last: "Reddy", email: "student7@college.edu", roll: "2024007" },
    { first: "Sneha", last: "Pillai", email: "student8@college.edu", roll: "2024008" },
    { first: "Karan", last: "Malhotra", email: "student9@college.edu", roll: "2024009" },
    { first: "Pooja", last: "Tiwari", email: "student10@college.edu", roll: "2024010" },
  ]

  for (const s of studentData) {
    const user = await prisma.user.create({
      data: {
        email: s.email,
        password: hashedPassword,
        firstName: s.first,
        lastName: s.last,
        role: Role.STUDENT,
        student: {
          create: {
            rollNumber: s.roll,
            phone: `98765${s.roll.slice(-5)}`,
            admissionYear: 2024,
            parentName: `Parent of ${s.first}`,
            parentPhone: `87654${s.roll.slice(-5)}`,
          },
        },
      },
    })
    studentUsers.push(user)
  }

  // Create Courses
  const bed = await prisma.course.create({
    data: {
      name: "Bachelor of Education",
      code: "B.Ed",
      duration: 2,
      description: "Two-year professional degree for teaching",
    },
  })

  const bscBed = await prisma.course.create({
    data: {
      name: "B.Sc B.Ed",
      code: "B.Sc-B.Ed",
      duration: 4,
      description: "Integrated science and education degree",
    },
  })

  const baBed = await prisma.course.create({
    data: {
      name: "B.A B.Ed",
      code: "B.A-B.Ed",
      duration: 4,
      description: "Integrated arts and education degree",
    },
  })

  // Create Classes
  const class1 = await prisma.class.create({
    data: { courseId: bed.id, year: 1, section: "A" },
  })
  const class2 = await prisma.class.create({
    data: { courseId: bed.id, year: 2, section: "A" },
  })
  const class3 = await prisma.class.create({
    data: { courseId: bscBed.id, year: 1, section: "A" },
  })
  const class4 = await prisma.class.create({
    data: { courseId: baBed.id, year: 1, section: "A" },
  })

  // Create Subjects
  const subjects1 = await Promise.all([
    prisma.subject.create({ data: { classId: class1.id, name: "Education Psychology", code: "EP101", credits: 4 } }),
    prisma.subject.create({ data: { classId: class1.id, name: "Pedagogy of Mathematics", code: "PM101", credits: 4 } }),
    prisma.subject.create({ data: { classId: class1.id, name: "English Communication", code: "EC101", credits: 3 } }),
    prisma.subject.create({ data: { classId: class1.id, name: "ICT in Education", code: "ICT101", credits: 3 } }),
  ])

  const subjects2 = await Promise.all([
    prisma.subject.create({ data: { classId: class2.id, name: "Advanced Pedagogy", code: "AP201", credits: 4 } }),
    prisma.subject.create({ data: { classId: class2.id, name: "Research Methods", code: "RM201", credits: 4 } }),
    prisma.subject.create({ data: { classId: class2.id, name: "Curriculum Design", code: "CD201", credits: 3 } }),
  ])

  const subjects3 = await Promise.all([
    prisma.subject.create({ data: { classId: class3.id, name: "Physics", code: "PHY101", credits: 5 } }),
    prisma.subject.create({ data: { classId: class3.id, name: "Chemistry", code: "CHEM101", credits: 5 } }),
    prisma.subject.create({ data: { classId: class3.id, name: "Mathematics", code: "MATH101", credits: 4 } }),
  ])

  // Get teacher records
  const teacher1 = await prisma.teacher.findUnique({ where: { userId: teacher1User.id } })
  const teacher2 = await prisma.teacher.findUnique({ where: { userId: teacher2User.id } })
  const teacher3 = await prisma.teacher.findUnique({ where: { userId: teacher3User.id } })

  // Teacher Assignments
  await prisma.teacherAssignment.createMany({
    data: [
      // Teacher1 (Math) is class teacher + subject teacher for class1
      { teacherId: teacher1!.id, classId: class1.id, subjectId: subjects1[1].id, isClassTeacher: false },
      { teacherId: teacher1!.id, classId: class1.id, subjectId: null, isClassTeacher: true },
      // Teacher2 (Science) teaches class2 and class3
      { teacherId: teacher2!.id, classId: class2.id, subjectId: subjects2[0].id, isClassTeacher: false },
      { teacherId: teacher2!.id, classId: class3.id, subjectId: subjects3[0].id, isClassTeacher: false },
      { teacherId: teacher2!.id, classId: class3.id, subjectId: null, isClassTeacher: true },
      // Teacher3 (English) teaches class1 english
      { teacherId: teacher3!.id, classId: class1.id, subjectId: subjects1[2].id, isClassTeacher: false },
      { teacherId: teacher3!.id, classId: class2.id, subjectId: null, isClassTeacher: true },
    ],
  })

  // Enroll students in classes
  const students = await prisma.student.findMany()

  for (let i = 0; i < students.length; i++) {
    const classId = i < 5 ? class1.id : i < 8 ? class2.id : class3.id
    await prisma.enrollment.create({
      data: { studentId: students[i].id, classId },
    })
  }

  // Create Attendance Records (last 30 days)
  const today = new Date()
  for (let d = 0; d < 20; d++) {
    const date = new Date(today)
    date.setDate(date.getDate() - d)
    if (date.getDay() === 0 || date.getDay() === 6) continue // skip weekends

    const enrollments = await prisma.enrollment.findMany()
    for (const enrollment of enrollments) {
      const rand = Math.random()
      const status = rand < 0.85 ? AttendanceStatus.PRESENT : rand < 0.95 ? AttendanceStatus.LATE : AttendanceStatus.ABSENT
      await prisma.classAttendance.upsert({
        where: { studentId_classId_date: { studentId: enrollment.studentId, classId: enrollment.classId, date } },
        create: { studentId: enrollment.studentId, classId: enrollment.classId, date, status },
        update: { status },
      })
    }
  }

  // Create Marks
  const allSubjects = [...subjects1, ...subjects2, ...subjects3]
  for (const student of students) {
    const enrollment = await prisma.enrollment.findFirst({ where: { studentId: student.id } })
    if (!enrollment) continue
    const classSubjects = allSubjects.filter((s) => s.classId === enrollment.classId)
    for (const subject of classSubjects) {
      const teacherAssignment = await prisma.teacherAssignment.findFirst({ where: { classId: enrollment.classId, subjectId: subject.id } })
      const teacherId = teacherAssignment?.teacherId ?? teacher1!.id
      const internalMark = Math.floor(Math.random() * 40) + 55
      const externalMark = Math.floor(Math.random() * 40) + 50
      await prisma.mark.createMany({
        data: [
          { studentId: student.id, subjectId: subject.id, teacherId, marks: internalMark, maxMarks: 100, examType: ExamType.INTERNAL },
          { studentId: student.id, subjectId: subject.id, teacherId, marks: externalMark, maxMarks: 100, examType: ExamType.EXTERNAL },
        ],
        skipDuplicates: true,
      })
    }
  }

  // Create Fees
  const feeStatuses = [FeeStatus.PENDING, FeeStatus.SUBMITTED, FeeStatus.VERIFIED, FeeStatus.VERIFIED, FeeStatus.PENDING]
  for (let i = 0; i < students.length; i++) {
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + 15)
    const status = feeStatuses[i % feeStatuses.length]
    await prisma.fee.create({
      data: {
        studentId: students[i].id,
        amount: 45000 + Math.floor(Math.random() * 5000),
        dueDate,
        status,
        description: "Semester 1 Tuition Fee",
        utr: status === FeeStatus.SUBMITTED || status === FeeStatus.VERIFIED ? `UTR${100000 + i}` : null,
        verifiedByTeacherId: status === FeeStatus.VERIFIED ? teacher1!.id : null,
        verifiedAt: status === FeeStatus.VERIFIED ? new Date() : null,
        submittedAt: status !== FeeStatus.PENDING ? new Date() : null,
      },
    })
    // Extra fee for some
    if (i % 3 === 0) {
      await prisma.fee.create({
        data: {
          studentId: students[i].id,
          amount: 2500,
          dueDate,
          status: FeeStatus.PENDING,
          description: "Back Paper Fee",
          isExtraFee: true,
        },
      })
    }
  }

  // Create Notices
  const notice1 = await prisma.notice.create({
    data: {
      title: "Mid-Term Examination Schedule",
      content: "Mid-term examinations will commence from 15th November 2024. Students are advised to prepare accordingly. The timetable will be posted on the notice board.",
      targetType: NoticeTarget.ALL,
      createdById: adminUser.id,
    },
  })

  const notice2 = await prisma.notice.create({
    data: {
      title: "Fee Submission Reminder",
      content: "Last date for fee submission is 30th October 2024. Students who have not submitted fees will not be allowed to appear in examinations.",
      targetType: NoticeTarget.ROLE,
      targetId: "STUDENT",
      createdById: adminUser.id,
    },
  })

  const notice3 = await prisma.notice.create({
    data: {
      title: "Staff Meeting",
      content: "All teaching staff is requested to attend the mandatory staff meeting on 20th October 2024 at 10:00 AM in the Conference Hall.",
      targetType: NoticeTarget.ROLE,
      targetId: "TEACHER",
      createdById: principalUser.id,
    },
  })

  // Distribute notices to users
  const allUsers = await prisma.user.findMany()
  for (const user of allUsers) {
    await prisma.noticeRecipient.createMany({
      data: [
        { noticeId: notice1.id, userId: user.id, isRead: Math.random() > 0.5 },
      ],
      skipDuplicates: true,
    })
    if (user.role === Role.STUDENT) {
      await prisma.noticeRecipient.createMany({
        data: [{ noticeId: notice2.id, userId: user.id, isRead: Math.random() > 0.6 }],
        skipDuplicates: true,
      })
    }
    if (user.role === Role.TEACHER) {
      await prisma.noticeRecipient.createMany({
        data: [{ noticeId: notice3.id, userId: user.id, isRead: Math.random() > 0.4 }],
        skipDuplicates: true,
      })
    }
  }

  console.log("Seeding complete!")
  console.log("\nLogin credentials:")
  console.log("Admin:     admin@college.edu     / password123")
  console.log("Principal: principal@college.edu  / password123")
  console.log("Teacher:   teacher1@college.edu   / password123")
  console.log("Student:   student1@college.edu   / password123")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
