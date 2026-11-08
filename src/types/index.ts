export type UserRole = 'student' | 'teacher' | 'homeroom_teacher' | 'admin';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  username: string;
  password: string;
  classId?: string;
  department?: string;
  idCard?: string;
}

export type GradeStatus = 'pending' | 'reviewed' | 'rejected';

export interface Grade {
  id: string;
  studentId: string;
  studentName: string;
  classId: string;
  className: string;
  courseId: string;
  courseName: string;
  teacherId: string;
  teacherName: string;
  score: number;
  fullScore: number;
  gradeLevel: string;
  status: GradeStatus;
  reviewComment?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Schedule {
  id: string;
  classId: string;
  className: string;
  courseId: string;
  courseName: string;
  teacherId: string;
  teacherName: string;
  dayOfWeek: number;
  period: number;
  classroom: string;
  startDate: string;
  endDate: string;
}

export interface Course {
  id: string;
  name: string;
  code: string;
  credit: number;
  department: string;
}

export interface Class {
  id: string;
  name: string;
  grade: string;
  major: string;
  homeroomTeacherId: string;
}

export interface LoginFormData {
  identity: 'student' | 'teacher' | 'admin';
  username: string;
  password: string;
}

export interface GradeFilter {
  classId?: string;
  courseId?: string;
  studentId?: string;
  studentKeyword?: string;
  status?: GradeStatus;
  teacherId?: string;
}

export interface ScheduleFilter {
  classId?: string;
  teacherId?: string;
  dayOfWeek?: number;
}

export type AppealStatus = 'pending' | 'reviewing' | 'approved' | 'rejected';

export interface Appeal {
  id: string;
  gradeId: string;
  studentId: string;
  studentName: string;
  classId: string;
  className: string;
  courseId: string;
  courseName: string;
  teacherId: string;
  teacherName: string;
  originalScore: number;
  requestedScore: number;
  reason: string;
  authCode: string;
  status: AppealStatus;
  homeroomComment?: string;
  teacherComment?: string;
  adminComment?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Exam {
  id: string;
  courseId: string;
  courseName: string;
  classId: string;
  className: string;
  teacherId: string;
  teacherName: string;
  examType: 'midterm' | 'final' | 'quiz' | 'practice';
  examDate: string;
  startTime: string;
  endTime: string;
  classroom: string;
  description?: string;
  createdAt: string;
}

export interface Major {
  id: string;
  name: string;
  department: string;
}

export interface AuthCode {
  code: string;
  createdBy: string;
  createdByName: string;
  createdAt: string;
}

export type ToastType = 'success' | 'error' | 'info';

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}
