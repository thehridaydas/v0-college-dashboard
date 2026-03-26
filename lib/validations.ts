import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

export const createUserSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["ADMIN", "TEACHER", "STUDENT", "PRINCIPAL"]),
})

export const createStudentSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  rollNumber: z.string().min(1, "Roll number is required"),
  phone: z.string().optional(),
  address: z.string().optional(),
  parentName: z.string().optional(),
  parentPhone: z.string().optional(),
  admissionYear: z.number().int().default(new Date().getFullYear()),
  classId: z.string().optional(),
})

export const createTeacherSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  employeeId: z.string().min(1, "Employee ID is required"),
  department: z.string().optional(),
  phone: z.string().optional(),
  qualification: z.string().optional(),
})

export const createClassSchema = z.object({
  courseId: z.string().min(1, "Course is required"),
  year: z.number().int().min(1).max(6),
  section: z.string().min(1, "Section is required"),
})

export const createSubjectSchema = z.object({
  classId: z.string().min(1, "Class is required"),
  name: z.string().min(2, "Subject name is required"),
  code: z.string().min(1, "Subject code is required"),
  credits: z.number().int().min(1).max(10).default(4),
})

export const createCourseSchema = z.object({
  name: z.string().min(2),
  code: z.string().min(1),
  duration: z.number().int().min(1).max(6).default(4),
  description: z.string().optional(),
})

export const markAttendanceSchema = z.object({
  classId: z.string(),
  date: z.string(),
  attendance: z.array(
    z.object({
      studentId: z.string(),
      status: z.enum(["PRESENT", "ABSENT", "LATE"]),
    })
  ),
})

export const createMarkSchema = z.object({
  studentId: z.string(),
  subjectId: z.string(),
  marks: z.number().min(0).max(100),
  maxMarks: z.number().min(0).max(100).default(100),
  examType: z.enum(["INTERNAL", "EXTERNAL", "ASSIGNMENT", "PRACTICAL"]),
  examDate: z.string().optional(),
  remarks: z.string().optional(),
})

export const createFeeSchema = z.object({
  studentId: z.string(),
  amount: z.number().positive(),
  dueDate: z.string(),
  description: z.string().optional(),
  isExtraFee: z.boolean().default(false),
})

export const submitUTRSchema = z.object({
  feeId: z.string(),
  utr: z.string().min(1, "UTR number is required"),
})

export const createNoticeSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  content: z.string().min(10, "Content must be at least 10 characters"),
  targetType: z.enum(["ALL", "CLASS", "ROLE"]),
  targetId: z.string().optional(),
})

export type LoginInput = z.infer<typeof loginSchema>
export type CreateStudentInput = z.infer<typeof createStudentSchema>
export type CreateTeacherInput = z.infer<typeof createTeacherSchema>
export type CreateClassInput = z.infer<typeof createClassSchema>
export type CreateSubjectInput = z.infer<typeof createSubjectSchema>
export type CreateNoticeInput = z.infer<typeof createNoticeSchema>
export type CreateFeeInput = z.infer<typeof createFeeSchema>
export type MarkAttendanceInput = z.infer<typeof markAttendanceSchema>
export type CreateMarkInput = z.infer<typeof createMarkSchema>
