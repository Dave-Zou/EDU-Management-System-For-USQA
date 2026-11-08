import { AppealStatus, GradeStatus, UserRole, Exam } from '@/types';

export const roleLabels: Record<UserRole, string> = {
  student: '学生',
  teacher: '任课老师',
  homeroom_teacher: '班主任老师',
  admin: '教务管理员',
};

export const gradeStatusLabels: Record<GradeStatus, string> = {
  pending: '待复核',
  reviewed: '已复核',
  rejected: '已驳回',
};

export const appealStatusLabels: Record<AppealStatus, string> = {
  pending: '待审核',
  reviewing: '审核中',
  approved: '已批准',
  rejected: '已驳回',
};

export const examTypeLabels: Record<Exam['examType'], string> = {
  midterm: '期中考试',
  final: '期末考试',
  quiz: '测验',
  practice: '练习',
};

export const weekDays = ['周一', '周二', '周三', '周四', '周五'];
export const periodLabels = ['第1节', '第2节', '第3节', '第4节', '第5节', '第6节'];
