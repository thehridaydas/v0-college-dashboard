import { Suspense } from "react"
import { db } from "@/lib/db"
import { AdminClassesClient } from "@/components/admin/classes/admin-classes-client"
import { ClassCardsSkeleton, PageHeaderSkeleton } from "@/components/ui/skeletons"

export const metadata = { title: "Classes | EduManage" }

async function ClassesContent() {
  const [classes, courses, teachers] = await Promise.all([
    db.class.findMany({
      include: {
        course: true,
        _count: { select: { enrollments: true, subjects: true } },
        assignments: {
          where: { isClassTeacher: true },
          include: { teacher: { include: { user: { select: { firstName: true, lastName: true } } } } },
          take: 1,
        },
      },
      orderBy: [{ course: { name: "asc" } }, { year: "asc" }],
    }),
    db.course.findMany({ orderBy: { name: "asc" } }),
    db.teacher.findMany({
      include: { user: { select: { firstName: true, lastName: true } } },
      orderBy: { user: { firstName: "asc" } },
    }),
  ])

  return (
    <AdminClassesClient
      classes={classes.map((c) => ({
        id: c.id,
        year: c.year,
        section: c.section,
        courseName: c.course.name,
        courseCode: c.course.code,
        courseId: c.courseId,
        studentCount: c._count.enrollments,
        subjectCount: c._count.subjects,
        classTeacher: c.assignments[0]
          ? `${c.assignments[0].teacher.user.firstName} ${c.assignments[0].teacher.user.lastName}`
          : null,
        classTeacherId: c.assignments[0]?.teacherId ?? null,
      }))}
      courses={courses.map((c) => ({ id: c.id, name: c.name, code: c.code }))}
      teachers={teachers.map((t) => ({ id: t.id, name: `${t.user.firstName} ${t.user.lastName}` }))}
    />
  )
}

function ClassesPageSkeleton() {
  return (
    <div className="flex flex-col gap-4 h-full">
      <PageHeaderSkeleton />
      <ClassCardsSkeleton count={12} />
    </div>
  )
}

export default function AdminClassesPage() {
  return (
    <Suspense fallback={<ClassesPageSkeleton />}>
      <ClassesContent />
    </Suspense>
  )
}
