import { PrismaClient, Role, FeeStatus, AttendanceStatus, ExamType, NoticeTarget } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function workdaysBefore(days: number): Date[] {
  const dates: Date[] = []
  const today = new Date()
  let d = 0
  while (dates.length < days) {
    const date = new Date(today)
    date.setDate(today.getDate() - d)
    d++
    if (date.getDay() === 0 || date.getDay() === 6) continue
    dates.push(date)
  }
  return dates
}

async function main() {
  try {
    console.log("Seeding database...")

    // --- Clean ---
    console.log("Clearing existing data...")
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
    console.log("✓ Cleared all tables")

    const hashedPassword = await bcrypt.hash("password123", 12)

    // --- Admin ---
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

    // --- Principal ---
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
    console.log("✓ Admin + Principal created")

    // --- Teachers (10) ---
    console.log("Creating 10 teachers...")
    const teacherData = [
      { email: "teacher1@college.edu",  first: "Amit",      last: "Verma",     emp: "TCH001", dept: "Mathematics", qual: "M.Sc Mathematics",  joined: "2020-06-15", phone: "9876543210" },
      { email: "teacher2@college.edu",  first: "Sunita",    last: "Patel",     emp: "TCH002", dept: "Science",     qual: "M.Sc Physics",     joined: "2019-07-01", phone: "9876543211" },
      { email: "teacher3@college.edu",  first: "Mohan",     last: "Das",       emp: "TCH003", dept: "English",     qual: "M.A English",      joined: "2021-08-01", phone: "9876543212" },
      { email: "teacher4@college.edu",  first: "Kavitha",   last: "Nair",      emp: "TCH004", dept: "Hindi",       qual: "M.A Hindi",        joined: "2018-05-10", phone: "9876543213" },
      { email: "teacher5@college.edu",  first: "Rajan",     last: "Iyer",      emp: "TCH005", dept: "Social Science", qual: "M.A History",  joined: "2022-01-15", phone: "9876543214" },
      { email: "teacher6@college.edu",  first: "Deepa",     last: "Menon",     emp: "TCH006", dept: "Education",   qual: "M.Ed",             joined: "2017-06-01", phone: "9876543215" },
      { email: "teacher7@college.edu",  first: "Suresh",    last: "Babu",      emp: "TCH007", dept: "Commerce",    qual: "M.Com",            joined: "2021-03-20", phone: "9876543216" },
      { email: "teacher8@college.edu",  first: "Anitha",    last: "Krishnan",  emp: "TCH008", dept: "Psychology",  qual: "M.Sc Psychology",  joined: "2023-07-01", phone: "9876543217" },
      { email: "teacher9@college.edu",  first: "Prakash",   last: "Sharma",    emp: "TCH009", dept: "Mathematics", qual: "Ph.D Mathematics", joined: "2016-04-01", phone: "9876543218" },
      { email: "teacher10@college.edu", first: "Meenakshi", last: "Sundaram",  emp: "TCH010", dept: "Science",     qual: "M.Sc Chemistry",   joined: "2020-09-15", phone: "9876543219" },
    ]

    const teacherUsers = []
    for (const t of teacherData) {
      const u = await prisma.user.create({
        data: {
          email: t.email,
          password: hashedPassword,
          firstName: t.first,
          lastName: t.last,
          role: Role.TEACHER,
          teacher: {
            create: {
              employeeId: t.emp,
              department: t.dept,
              phone: t.phone,
              qualification: t.qual,
              joiningDate: new Date(t.joined),
            },
          },
        },
      })
      teacherUsers.push(u)
    }
    console.log("✓ 10 teachers created")

    const teachers = await prisma.teacher.findMany({ include: { user: true } })
    const tById = (idx: number) => teachers[idx]

    // --- Courses (5) ---
    console.log("Creating courses...")
    const [bed, bscBed, baBed, deled, mEd] = await Promise.all([
      prisma.course.create({ data: { name: "Bachelor of Education", code: "B.Ed", duration: 2, description: "Two-year professional degree for teaching" } }),
      prisma.course.create({ data: { name: "B.Sc B.Ed", code: "B.Sc-B.Ed", duration: 4, description: "Integrated science and education degree" } }),
      prisma.course.create({ data: { name: "B.A B.Ed", code: "B.A-B.Ed", duration: 4, description: "Integrated arts and education degree" } }),
      prisma.course.create({ data: { name: "Diploma in Elementary Education", code: "D.El.Ed", duration: 2, description: "Diploma programme for elementary school teachers" } }),
      prisma.course.create({ data: { name: "Master of Education", code: "M.Ed", duration: 2, description: "Postgraduate programme in education" } }),
    ])
    console.log("✓ 5 courses created")

    // --- Classes (12) ---
    console.log("Creating classes...")
    const [
      bedY1A, bedY1B, bedY2A, bedY2B,
      bscY1A, bscY2A, bscY3A,
      baY1A, baY2A,
      deledY1A, deledY2A,
      medY1A,
    ] = await Promise.all([
      prisma.class.create({ data: { courseId: bed.id,    year: 1, section: "A" } }),
      prisma.class.create({ data: { courseId: bed.id,    year: 1, section: "B" } }),
      prisma.class.create({ data: { courseId: bed.id,    year: 2, section: "A" } }),
      prisma.class.create({ data: { courseId: bed.id,    year: 2, section: "B" } }),
      prisma.class.create({ data: { courseId: bscBed.id, year: 1, section: "A" } }),
      prisma.class.create({ data: { courseId: bscBed.id, year: 2, section: "A" } }),
      prisma.class.create({ data: { courseId: bscBed.id, year: 3, section: "A" } }),
      prisma.class.create({ data: { courseId: baBed.id,  year: 1, section: "A" } }),
      prisma.class.create({ data: { courseId: baBed.id,  year: 2, section: "A" } }),
      prisma.class.create({ data: { courseId: deled.id,  year: 1, section: "A" } }),
      prisma.class.create({ data: { courseId: deled.id,  year: 2, section: "A" } }),
      prisma.class.create({ data: { courseId: mEd.id,    year: 1, section: "A" } }),
    ])
    console.log("✓ 12 classes created")

    // --- Subjects ---
    console.log("Creating subjects...")
    const subjectMap: Record<string, { id: string; classId: string }[]> = {}

    const subjectDefs: [{ id: string }, string, string, number][] = [
      // BEd Y1
      [bedY1A, "Education Psychology",    "EP101",   4],
      [bedY1A, "Pedagogy of Mathematics", "PM101",   4],
      [bedY1A, "English Communication",   "EC101",   3],
      [bedY1A, "ICT in Education",        "ICT101",  3],
      [bedY1A, "Childhood & Growing Up",  "CG101",   4],
      [bedY1B, "Education Psychology",    "EP101B",  4],
      [bedY1B, "Pedagogy of Science",     "PS101B",  4],
      [bedY1B, "English Communication",   "EC101B",  3],
      [bedY1B, "ICT in Education",        "ICT101B", 3],
      // BEd Y2
      [bedY2A, "Advanced Pedagogy",       "AP201",   4],
      [bedY2A, "Research Methods",        "RM201",   4],
      [bedY2A, "Curriculum Design",       "CD201",   3],
      [bedY2A, "School Management",       "SM201",   3],
      [bedY2B, "Advanced Pedagogy",       "AP201B",  4],
      [bedY2B, "Research Methods",        "RM201B",  4],
      [bedY2B, "Assessment in Education", "AE201B",  3],
      // BScBEd
      [bscY1A, "Physics",                 "PHY101",  5],
      [bscY1A, "Chemistry",               "CHEM101", 5],
      [bscY1A, "Mathematics",             "MATH101", 4],
      [bscY1A, "Education Foundations",   "EF101",   3],
      [bscY2A, "Advanced Physics",        "PHY201",  5],
      [bscY2A, "Organic Chemistry",       "CHEM201", 5],
      [bscY2A, "Pedagogy of Science",     "PS201",   4],
      [bscY3A, "Research in Science Edu", "RSE301",  4],
      [bscY3A, "Internship",              "INT301",  6],
      // BABEd
      [baY1A,  "History of Education",    "HE101",   4],
      [baY1A,  "Hindi Literature",        "HL101",   4],
      [baY1A,  "English Literature",      "EL101",   4],
      [baY1A,  "Sociology of Education",  "SE101",   3],
      [baY2A,  "Political Science",       "POL201",  4],
      [baY2A,  "Advanced Hindi",          "HL201",   4],
      [baY2A,  "Pedagogy of Social Sci",  "PSS201",  4],
      // DElEd
      [deledY1A, "Child Development",     "CD101",   4],
      [deledY1A, "Language & Literacy",   "LL101",   4],
      [deledY1A, "Maths for Primary",     "MP101",   4],
      [deledY2A, "EVS & Science",         "EVS201",  4],
      [deledY2A, "Arts in Education",     "AE201",   3],
      // MEd
      [medY1A,  "Educational Philosophy", "EPH101",  4],
      [medY1A,  "Advanced Research",      "AR101",   4],
      [medY1A,  "Educational Statistics", "EST101",  4],
      [medY1A,  "Policy in Education",    "PE101",   3],
    ]

    const allSubjects: { id: string; classId: string }[] = []
    for (const [cls, name, code, credits] of subjectDefs) {
      const s = await prisma.subject.create({ data: { classId: cls.id, name, code, credits } })
      allSubjects.push({ id: s.id, classId: cls.id })
      if (!subjectMap[cls.id]) subjectMap[cls.id] = []
      subjectMap[cls.id].push({ id: s.id, classId: cls.id })
    }
    console.log(`✓ ${allSubjects.length} subjects created`)

    // --- Teacher Assignments ---
    console.log("Creating teacher assignments...")
    const classes = [bedY1A, bedY1B, bedY2A, bedY2B, bscY1A, bscY2A, bscY3A, baY1A, baY2A, deledY1A, deledY2A, medY1A]
    // Assign class teacher first
    for (let i = 0; i < classes.length; i++) {
      const t = tById(i % teachers.length)
      await prisma.teacherAssignment.create({
        data: { teacherId: t.id, classId: classes[i].id, subjectId: null, isClassTeacher: true },
      })
    }
    // Assign subject teachers
    for (const subj of allSubjects) {
      const t = pick(teachers)
      await prisma.teacherAssignment.upsert({
        where: { teacherId_classId_subjectId: { teacherId: t.id, classId: subj.classId, subjectId: subj.id } },
        create: { teacherId: t.id, classId: subj.classId, subjectId: subj.id, isClassTeacher: false },
        update: {},
      })
    }
    console.log("✓ Teacher assignments created")

    // --- Students (50) ---
    console.log("Creating 50 students...")
    const firstNames = [
      "Aarav","Priya","Rahul","Ananya","Vikram","Kavya","Arjun","Sneha","Karan","Pooja",
      "Rohan","Nisha","Siddharth","Divya","Aditya","Shreya","Manish","Ankita","Deepak","Simran",
      "Kunal","Riya","Nikhil","Tanvi","Harsh","Swati","Gaurav","Preeti","Varun","Neha",
      "Akash","Pallavi","Rohit","Shweta","Ajay","Meghna","Vijay","Sunaina","Piyush","Rekha",
      "Sandeep","Rashmi","Saurabh","Nandita","Vivek","Jyoti","Tarun","Lavanya","Madhav","Bhavna",
    ]
    const lastNames = [
      "Singh","Gupta","Mehta","Joshi","Rao","Nair","Reddy","Pillai","Malhotra","Tiwari",
      "Sharma","Verma","Patel","Desai","Iyer","Menon","Bose","Chatterjee","Das","Ghosh",
      "Kapoor","Khanna","Bhatia","Arora","Sethi","Chopra","Walia","Sood","Anand","Bajaj",
      "Kumar","Mishra","Tripathi","Pandey","Srivastava","Yadav","Chaudhary","Dubey","Shukla","Tomar",
      "Thakur","Rajput","Rathore","Chauhan","Bhadauria","Shekhawat","Ranawat","Jadeja","Solanki","Bhatt",
    ]

    const studentUsers: string[] = []
    for (let i = 0; i < 50; i++) {
      const first = firstNames[i]
      const last = lastNames[i]
      const rollYear = i < 20 ? 2024 : i < 35 ? 2023 : 2022
      const admYear = rollYear
      const roll = `${rollYear}${String(i + 1).padStart(3, "0")}`
      const u = await prisma.user.create({
        data: {
          email: `student${i + 1}@college.edu`,
          password: hashedPassword,
          firstName: first,
          lastName: last,
          role: Role.STUDENT,
          student: {
            create: {
              rollNumber: roll,
              phone: `9${rand(600000000, 999999999)}`,
              admissionYear: admYear,
              parentName: `${pick(["Mr.", "Mrs."])} ${last}`,
              parentPhone: `8${rand(600000000, 999999999)}`,
              address: `${rand(1, 999)}, ${pick(["MG Road","Gandhi Nagar","Nehru Street","Patel Colony","Shastri Nagar"])}, ${pick(["Delhi","Mumbai","Bangalore","Chennai","Kolkata","Hyderabad","Pune","Jaipur"])}`,
              dateOfBirth: new Date(2000 + rand(1, 5), rand(0, 11), rand(1, 28)),
            },
          },
        },
      })
      studentUsers.push(u.id)
    }
    console.log("✓ 50 students created")

    // --- Enroll students ---
    console.log("Enrolling students...")
    const students = await prisma.student.findMany()
    const classSlots = [
      ...Array(8).fill(bedY1A.id),
      ...Array(7).fill(bedY1B.id),
      ...Array(6).fill(bedY2A.id),
      ...Array(5).fill(bedY2B.id),
      ...Array(5).fill(bscY1A.id),
      ...Array(4).fill(bscY2A.id),
      ...Array(3).fill(bscY3A.id),
      ...Array(4).fill(baY1A.id),
      ...Array(3).fill(baY2A.id),
      ...Array(3).fill(deledY1A.id),
      ...Array(2).fill(deledY2A.id),
    ]
    for (let i = 0; i < students.length && i < classSlots.length; i++) {
      await prisma.enrollment.create({ data: { studentId: students[i].id, classId: classSlots[i] } })
    }
    console.log("✓ Students enrolled")

    // --- Attendance (60 working days) ---
    console.log("Creating attendance records (60 days)...")
    const enrollments = await prisma.enrollment.findMany()
    const dates = workdaysBefore(60)
    let attCount = 0
    for (const date of dates) {
      for (const en of enrollments) {
        const r = Math.random()
        const status = r < 0.78 ? AttendanceStatus.PRESENT : r < 0.92 ? AttendanceStatus.LATE : AttendanceStatus.ABSENT
        await prisma.classAttendance.upsert({
          where: { studentId_classId_date: { studentId: en.studentId, classId: en.classId, date } },
          create: { studentId: en.studentId, classId: en.classId, date, status },
          update: {},
        })
        attCount++
      }
    }
    console.log(`✓ ${attCount} attendance records created`)

    // --- Marks ---
    console.log("Creating marks...")
    let marksCount = 0
    const teacherList = await prisma.teacher.findMany()
    for (const student of students) {
      const enrollment = await prisma.enrollment.findFirst({ where: { studentId: student.id } })
      if (!enrollment) continue
      const classSubjects = subjectMap[enrollment.classId] ?? []
      for (const subj of classSubjects) {
        const t = pick(teacherList)
        const examTypes: { type: ExamType; min: number; max: number }[] = [
          { type: ExamType.INTERNAL,   min: 50, max: 95 },
          { type: ExamType.EXTERNAL,   min: 40, max: 90 },
          { type: ExamType.ASSIGNMENT, min: 60, max: 100 },
        ]
        for (const ex of examTypes) {
          await prisma.mark.upsert({
            where: { studentId_subjectId_examType: { studentId: student.id, subjectId: subj.id, examType: ex.type } },
            create: { studentId: student.id, subjectId: subj.id, teacherId: t.id, marks: rand(ex.min, ex.max), maxMarks: 100, examType: ex.type },
            update: {},
          })
          marksCount++
        }
      }
    }
    console.log(`✓ ${marksCount} marks created`)

    // --- Fees ---
    console.log("Creating fees...")
    const feeDescriptions = ["Semester 1 Tuition Fee", "Semester 2 Tuition Fee", "Examination Fee", "Library Fee", "Sports Fee", "Lab Fee"]
    const extraDescs = ["Back Paper Fee", "Re-admission Fee", "Late Fee Penalty", "Identity Card Fee"]
    let feeCount = 0
    for (let i = 0; i < students.length; i++) {
      const numFees = rand(1, 3)
      for (let f = 0; f < numFees; f++) {
        const dueOffset = rand(-30, 60)
        const dueDate = new Date()
        dueDate.setDate(dueDate.getDate() + dueOffset)
        const status: FeeStatus = pick([FeeStatus.PENDING, FeeStatus.PENDING, FeeStatus.SUBMITTED, FeeStatus.VERIFIED, FeeStatus.VERIFIED, FeeStatus.REJECTED])
        const t = pick(teacherList)
        await prisma.fee.create({
          data: {
            studentId: students[i].id,
            amount: pick([15000, 20000, 25000, 45000, 50000, 55000, 60000]) + rand(0, 999),
            dueDate,
            status,
            description: pick(feeDescriptions),
            utr: status === FeeStatus.SUBMITTED || status === FeeStatus.VERIFIED ? `UTR${rand(100000, 999999)}` : null,
            verifiedByTeacherId: status === FeeStatus.VERIFIED ? t.id : null,
            verifiedAt: status === FeeStatus.VERIFIED ? new Date(Date.now() - rand(0, 7) * 86400000) : null,
            submittedAt: status !== FeeStatus.PENDING ? new Date(Date.now() - rand(1, 14) * 86400000) : null,
          },
        })
        feeCount++
      }
      if (i % 4 === 0) {
        const dueDate = new Date()
        dueDate.setDate(dueDate.getDate() + rand(5, 30))
        await prisma.fee.create({
          data: {
            studentId: students[i].id,
            amount: rand(1000, 5000),
            dueDate,
            status: FeeStatus.PENDING,
            description: pick(extraDescs),
            isExtraFee: true,
          },
        })
        feeCount++
      }
    }
    console.log(`✓ ${feeCount} fees created`)

    // --- Notices (10) ---
    console.log("Creating notices...")
    const noticeData = [
      { title: "Mid-Term Examination Schedule",         content: "Mid-term examinations will commence from 15th November 2024. Students are advised to prepare accordingly. The time table will be shared by respective class teachers.",         target: NoticeTarget.ALL,  targetId: null,       by: adminUser.id },
      { title: "Fee Submission Reminder",               content: "Last date for fee submission is 30th October 2024. Students who have not submitted fees will not be allowed to appear in examinations. Contact the accounts office for any queries.",  target: NoticeTarget.ROLE, targetId: "STUDENT",  by: adminUser.id },
      { title: "Staff Meeting",                         content: "All teaching staff is requested to attend the mandatory staff meeting on 20th October 2024 at 10:00 AM in the Conference Hall. Attendance is compulsory.",                             target: NoticeTarget.ROLE, targetId: "TEACHER",  by: principalUser.id },
      { title: "Annual Sports Day",                     content: "The annual sports day will be held on 5th December 2024. All students are encouraged to participate. Registration forms are available with the sports coordinator.",                    target: NoticeTarget.ALL,  targetId: null,       by: adminUser.id },
      { title: "Library Timings Update",                content: "The library will now remain open from 8:00 AM to 7:00 PM on all working days including Saturday. Students are encouraged to utilize the extended hours for exam preparation.",          target: NoticeTarget.ALL,  targetId: null,       by: principalUser.id },
      { title: "Practical Examination Notice",          content: "Practical examinations for B.Sc B.Ed students will begin from 10th November 2024. Students must bring their lab journals and identity cards.",                                         target: NoticeTarget.ROLE, targetId: "STUDENT",  by: adminUser.id },
      { title: "Guest Lecture on NEP 2020",             content: "A guest lecture on the National Education Policy 2020 will be conducted on 25th October 2024 at 11:00 AM in the Main Auditorium. All faculty and students are invited.",              target: NoticeTarget.ALL,  targetId: null,       by: principalUser.id },
      { title: "Attendance Shortage Warning",           content: "Students with attendance below 75% will receive a written warning. Repeated shortage may lead to detention. Please check your attendance record with your class teacher.",             target: NoticeTarget.ROLE, targetId: "STUDENT",  by: adminUser.id },
      { title: "Staff Professional Development",        content: "A two-day professional development workshop will be held on 28-29 October 2024. All teachers must register with the HR department before 22nd October.",                              target: NoticeTarget.ROLE, targetId: "TEACHER",  by: principalUser.id },
      { title: "College Foundation Day Celebration",    content: "The college will celebrate its 25th Foundation Day on 1st December 2024. Cultural programmes, alumni meet, and prize distribution will be held. All are welcome.",                     target: NoticeTarget.ALL,  targetId: null,       by: adminUser.id },
    ]

    const createdNotices = []
    for (const n of noticeData) {
      const notice = await prisma.notice.create({
        data: {
          title: n.title,
          content: n.content,
          targetType: n.target,
          targetId: n.targetId,
          createdById: n.by,
        },
      })
      createdNotices.push(notice)
    }
    console.log("✓ 10 notices created")

    // --- Distribute notices ---
    console.log("Distributing notices...")
    const allUsers = await prisma.user.findMany()
    for (const notice of createdNotices) {
      for (const user of allUsers) {
        const relevant =
          notice.targetType === NoticeTarget.ALL ||
          (notice.targetType === NoticeTarget.ROLE && notice.targetId === user.role)
        if (!relevant) continue
        await prisma.noticeRecipient.upsert({
          where: { noticeId_userId: { noticeId: notice.id, userId: user.id } },
          create: { noticeId: notice.id, userId: user.id, isRead: Math.random() > 0.5 },
          update: {},
        })
      }
    }
    console.log("✓ Notices distributed")

    console.log("\n✅ Seeding complete!")
    console.log(`   Users: 1 admin, 1 principal, 10 teachers, 50 students`)
    console.log(`   Courses: 5 | Classes: 12 | Subjects: ${allSubjects.length}`)
    console.log(`   Attendance: ${attCount} records | Marks: ${marksCount} | Fees: ${feeCount}`)
    console.log(`   Notices: ${createdNotices.length}`)
    console.log("\nLogin credentials:")
    console.log("  Admin:     admin@college.edu      / password123")
    console.log("  Principal: principal@college.edu   / password123")
    console.log("  Teacher:   teacher1@college.edu    / password123")
    console.log("  Student:   student1@college.edu    / password123")
  } catch (e) {
    console.error("Error during seeding:", e)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()

