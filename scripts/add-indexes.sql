-- Add indexes to speed up slow queries
-- Run this in Supabase Dashboard > SQL Editor

-- Student
CREATE INDEX IF NOT EXISTS idx_student_user_id ON "Student"("userId");

-- Teacher
CREATE INDEX IF NOT EXISTS idx_teacher_user_id ON "Teacher"("userId");

-- Enrollment
CREATE INDEX IF NOT EXISTS idx_enrollment_student_id ON "Enrollment"("studentId");
CREATE INDEX IF NOT EXISTS idx_enrollment_class_id ON "Enrollment"("classId");

-- ClassAttendance
CREATE INDEX IF NOT EXISTS idx_class_attendance_student_date ON "ClassAttendance"("studentId", "date");
CREATE INDEX IF NOT EXISTS idx_class_attendance_class_date ON "ClassAttendance"("classId", "date");
CREATE INDEX IF NOT EXISTS idx_class_attendance_status ON "ClassAttendance"("status");

-- Mark
CREATE INDEX IF NOT EXISTS idx_mark_student_id ON "Mark"("studentId");
CREATE INDEX IF NOT EXISTS idx_mark_teacher_id ON "Mark"("teacherId");
CREATE INDEX IF NOT EXISTS idx_mark_subject_id ON "Mark"("subjectId");

-- Fee
CREATE INDEX IF NOT EXISTS idx_fee_student_id ON "Fee"("studentId");
CREATE INDEX IF NOT EXISTS idx_fee_status ON "Fee"("status");
CREATE INDEX IF NOT EXISTS idx_fee_verified_by ON "Fee"("verifiedByTeacherId");

-- Notice
CREATE INDEX IF NOT EXISTS idx_notice_target ON "Notice"("targetType", "targetId");
CREATE INDEX IF NOT EXISTS idx_notice_created_at ON "Notice"("createdAt");

-- NoticeRecipient
CREATE INDEX IF NOT EXISTS idx_notice_recipient_user_read ON "NoticeRecipient"("userId", "isRead");

-- TeacherAssignment
CREATE INDEX IF NOT EXISTS idx_teacher_assignment_teacher ON "TeacherAssignment"("teacherId");
CREATE INDEX IF NOT EXISTS idx_teacher_assignment_class ON "TeacherAssignment"("classId");

-- User
CREATE INDEX IF NOT EXISTS idx_user_role ON "User"("role");
CREATE INDEX IF NOT EXISTS idx_user_created_at ON "User"("createdAt");
