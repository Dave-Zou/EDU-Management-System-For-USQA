import type { Exam, Schedule } from '@/types';

export interface ScheduleSlot {
  classId: string;
  teacherId: string;
  classroom: string;
  dayOfWeek: number;
  period: number;
  startDate: string;
  endDate: string;
}

export interface ExamSlot {
  classId: string;
  teacherId: string;
  classroom: string;
  examDate: string;
  startTime: string;
  endTime: string;
}

export const validateScore = (score: number, fullScore: number): string | null => {
  if (!Number.isFinite(score) || !Number.isFinite(fullScore)) return '成绩格式不正确';
  if (fullScore <= 0) return '满分必须大于 0';
  if (score < 0 || score > fullScore) return `成绩需在 0 到 ${fullScore} 之间`;
  return null;
};

const datesOverlap = (startA: string, endA: string, startB: string, endB: string) =>
  startA <= endB && startB <= endA;

const sameRoom = (left: string, right: string) =>
  left.trim().toLowerCase() === right.trim().toLowerCase();

export const findScheduleConflict = (
  schedules: Schedule[],
  candidate: ScheduleSlot,
  ignoreId?: string
): string | null => {
  if (!candidate.startDate || !candidate.endDate) return '请填写开课和结课日期';
  if (candidate.startDate > candidate.endDate) return '结课日期不能早于开课日期';
  if (!candidate.classroom.trim()) return '请填写教室';

  const clash = schedules.find((item) => {
    if (item.id === ignoreId) return false;
    if (item.dayOfWeek !== candidate.dayOfWeek || item.period !== candidate.period) return false;
    if (!datesOverlap(item.startDate, item.endDate, candidate.startDate, candidate.endDate)) return false;
    return (
      item.classId === candidate.classId ||
      item.teacherId === candidate.teacherId ||
      sameRoom(item.classroom, candidate.classroom)
    );
  });

  if (!clash) return null;
  if (clash.classId === candidate.classId) return '该班级在此时段已有课程';
  if (clash.teacherId === candidate.teacherId) return '该老师在此时段已有课程';
  return '该教室在此时段已被占用';
};

const timesOverlap = (startA: string, endA: string, startB: string, endB: string) =>
  startA < endB && startB < endA;

export const findExamConflict = (
  exams: Exam[],
  candidate: ExamSlot,
  ignoreId?: string
): string | null => {
  if (!candidate.examDate) return '请选择考试日期';
  if (!candidate.startTime || !candidate.endTime) return '请填写考试时间';
  if (candidate.endTime <= candidate.startTime) return '结束时间必须晚于开始时间';
  if (!candidate.classroom.trim()) return '请填写考场';

  const clash = exams.find((item) => {
    if (item.id === ignoreId) return false;
    if (item.examDate !== candidate.examDate) return false;
    if (!timesOverlap(item.startTime, item.endTime, candidate.startTime, candidate.endTime)) return false;
    return (
      item.classId === candidate.classId ||
      item.teacherId === candidate.teacherId ||
      sameRoom(item.classroom, candidate.classroom)
    );
  });

  if (!clash) return null;
  if (clash.classId === candidate.classId) return '该班级在此时段已有考试';
  if (clash.teacherId === candidate.teacherId) return '该监考老师在此时段已有安排';
  return '该考场在此时段已被占用';
};

export const startOfWeek = (date: Date): Date => {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  const day = next.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  next.setDate(next.getDate() + diff);
  return next;
};

export const addDays = (date: Date, days: number): Date => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

export const formatISODate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const scheduleCoversWeek = (schedule: Schedule, weekStart: Date): boolean => {
  const weekEnd = formatISODate(addDays(weekStart, 6));
  const weekBegin = formatISODate(weekStart);
  return schedule.startDate <= weekEnd && schedule.endDate >= weekBegin;
};

export const isValidIdCard = (value: string): boolean => /^\d{17}[\dXx]$/.test(value.trim());
