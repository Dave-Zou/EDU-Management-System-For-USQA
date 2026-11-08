import { AppealStatus, GradeStatus, UserRole } from '@/types';

export const ROLE_LABELS: Record<UserRole, string> = {
  student: '学生',
  teacher: '任课老师',
  homeroom_teacher: '班主任老师',
  admin: '教务管理员',
};

export const GRADE_STATUS_LABELS: Record<GradeStatus, string> = {
  pending: '待复核',
  reviewed: '已复核',
  rejected: '已驳回',
};

export const APPEAL_STATUS_LABELS: Record<AppealStatus, string> = {
  pending: '待审核',
  reviewing: '审核中',
  approved: '已批准',
  rejected: '已驳回',
};

export const EXAM_TYPE_LABELS = {
  midterm: '期中考试',
  final: '期末考试',
  quiz: '测验',
  practice: '练习',
} as const;

export const gradeStatusClass: Record<GradeStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  reviewed: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
};

export const appealStatusClass: Record<AppealStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  reviewing: 'bg-blue-100 text-blue-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
};
