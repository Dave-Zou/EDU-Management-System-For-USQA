import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  User,
  Grade,
  Schedule,
  Course,
  Class,
  GradeStatus,
  Appeal,
  AppealStatus,
  Exam,
  Major,
  ToastItem,
  ToastType,
  AppNotification,
} from '@/types';
import {
  mockUsers,
  mockGrades,
  mockSchedule,
  mockCourses,
  mockClasses,
  mockMajors,
  mockExams,
  mockNotifications,
  generateId,
  getGradeLevel,
  todayISO,
  validAuthCodes,
} from '@/data/mockData';

interface AppState {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;

  toasts: ToastItem[];
  showToast: (message: string, type?: ToastType) => void;
  dismissToast: (id: string) => void;

  notifications: AppNotification[];
  addNotification: (notification: Omit<AppNotification, 'id' | 'time' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: (user: User | null) => void;
  getNotificationsForUser: (user: User | null) => AppNotification[];

  user: User | null;
  isLoggedIn: boolean;
  login: (username: string, password: string, identity: 'student' | 'teacher' | 'admin') => boolean;
  logout: () => void;
  changePassword: (oldPassword: string, newPassword: string) => boolean;

  users: User[];
  grades: Grade[];
  courses: Course[];
  classes: Class[];
  schedules: Schedule[];
  exams: Exam[];
  appeals: Appeal[];
  majors: Major[];

  getGrades: (filter?: {
    classId?: string;
    courseId?: string;
    studentId?: string;
    status?: GradeStatus;
    teacherId?: string;
    keyword?: string;
  }) => Grade[];
  addGrade: (grade: Omit<Grade, 'id' | 'createdAt' | 'updatedAt' | 'gradeLevel'>) => { ok: boolean; message: string };
  editGrade: (id: string, updates: Partial<Grade>) => void;
  reviewGrade: (id: string, status: GradeStatus, comment?: string) => void;
  batchReviewGrades: (status: GradeStatus, gradeIds: string[], comment?: string) => void;

  getSchedule: (filter?: {
    classId?: string;
    teacherId?: string;
    dayOfWeek?: number;
  }) => Schedule[];
  addSchedule: (schedule: Omit<Schedule, 'id'>) => { ok: boolean; message: string };
  updateSchedule: (id: string, updates: Partial<Schedule>) => void;
  deleteSchedule: (id: string) => void;
  checkScheduleConflict: (candidate: {
    classId: string;
    teacherId: string;
    classroom: string;
    dayOfWeek: number;
    period: number;
    excludeId?: string;
  }) => string | null;

  getAppeals: (filter?: {
    studentId?: string;
    classId?: string;
    courseId?: string;
    status?: AppealStatus;
    teacherId?: string;
  }) => Appeal[];
  addAppeal: (appeal: Omit<Appeal, 'id' | 'createdAt' | 'updatedAt'>) => boolean;
  reviewAppeal: (id: string, status: AppealStatus, comment?: string, reviewerRole?: string) => void;

  getExams: (filter?: {
    classId?: string;
    courseId?: string;
    teacherId?: string;
    examType?: Exam['examType'];
  }) => Exam[];
  addExam: (exam: Omit<Exam, 'id' | 'createdAt'>) => void;
  deleteExam: (id: string) => void;

  addUser: (user: Omit<User, 'id'>) => boolean;
  deleteUser: (id: string) => void;
  getUserById: (id: string) => User | undefined;
  updateUser: (id: string, updates: Partial<User>) => void;

  addCourse: (course: Omit<Course, 'id'>) => void;
  deleteCourse: (id: string) => void;

  addClass: (cls: Omit<Class, 'id'>) => void;
  deleteClass: (id: string) => void;
  updateClass: (id: string, updates: Partial<Class>) => void;
}

const matchesIdentity = (user: User, identity: 'student' | 'teacher' | 'admin') => {
  if (identity === 'student') return user.role === 'student';
  if (identity === 'admin') return user.role === 'admin';
  return user.role === 'teacher' || user.role === 'homeroom_teacher';
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      sidebarCollapsed: false,
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

      toasts: [],
      showToast: (message, type = 'info') => {
        const id = generateId();
        set((state) => ({ toasts: [...state.toasts, { id, message, type }] }));
        window.setTimeout(() => {
          get().dismissToast(id);
        }, 3200);
      },
      dismissToast: (id) => {
        set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) }));
      },

      notifications: mockNotifications,
      addNotification: (notification) => {
        const item: AppNotification = {
          ...notification,
          id: generateId(),
          time: '刚刚',
          read: false,
        };
        set((state) => ({ notifications: [item, ...state.notifications] }));
      },
      markNotificationRead: (id) => {
        set((state) => ({
          notifications: state.notifications.map((item) =>
            item.id === id ? { ...item, read: true } : item
          ),
        }));
      },
      markAllNotificationsRead: (user) => {
        if (!user) return;
        set((state) => ({
          notifications: state.notifications.map((item) =>
            item.targetRole === user.role || item.targetUserId === user.id || item.targetRole === 'all'
              ? { ...item, read: true }
              : item
          ),
        }));
      },
      getNotificationsForUser: (user) => {
        if (!user) return [];
        return get().notifications.filter(
          (item) =>
            item.targetRole === 'all' ||
            item.targetRole === user.role ||
            item.targetUserId === user.id
        );
      },

      user: null,
      isLoggedIn: false,
      login: (username, password, identity) => {
        const user = get().users.find(
          (candidate) =>
            candidate.username === username.trim() &&
            candidate.password === password &&
            matchesIdentity(candidate, identity)
        );
        if (user) {
          set({ user, isLoggedIn: true });
          return true;
        }
        return false;
      },
      logout: () => set({ user: null, isLoggedIn: false }),
      changePassword: (oldPassword, newPassword) => {
        const { user, users } = get();
        if (!user || user.password !== oldPassword) return false;
        const updated = { ...user, password: newPassword };
        set({
          user: updated,
          users: users.map((item) => (item.id === user.id ? updated : item)),
        });
        return true;
      },

      users: mockUsers,
      grades: mockGrades,
      courses: mockCourses,
      classes: mockClasses,
      schedules: mockSchedule,
      exams: mockExams,
      appeals: [],
      majors: mockMajors,

      getGrades: (filter) => {
        const { grades, users } = get();
        return grades.filter((grade) => {
          if (filter?.classId && grade.classId !== filter.classId) return false;
          if (filter?.courseId && grade.courseId !== filter.courseId) return false;
          if (filter?.studentId && grade.studentId !== filter.studentId) return false;
          if (filter?.status && grade.status !== filter.status) return false;
          if (filter?.teacherId && grade.teacherId !== filter.teacherId) return false;
          if (filter?.keyword) {
            const keyword = filter.keyword.trim().toLowerCase();
            const student = users.find((item) => item.id === grade.studentId);
            const haystack = `${grade.studentName} ${student?.username ?? ''} ${grade.courseName}`.toLowerCase();
            if (!haystack.includes(keyword)) return false;
          }
          return true;
        });
      },
      addGrade: (gradeData) => {
        const { grades } = get();
        const duplicate = grades.some(
          (grade) => grade.studentId === gradeData.studentId && grade.courseId === gradeData.courseId
        );
        if (duplicate) {
          return { ok: false, message: `${gradeData.studentName} 已有「${gradeData.courseName}」成绩，请改用编辑` };
        }
        const newGrade: Grade = {
          ...gradeData,
          id: generateId(),
          gradeLevel: getGradeLevel(gradeData.score),
          createdAt: todayISO(),
          updatedAt: todayISO(),
        };
        set({ grades: [...grades, newGrade] });
        return { ok: true, message: '登记成功' };
      },
      editGrade: (id, updates) => {
        const { grades } = get();
        set({
          grades: grades.map((grade) =>
            grade.id === id
              ? {
                  ...grade,
                  ...updates,
                  gradeLevel:
                    updates.score !== undefined ? getGradeLevel(updates.score) : grade.gradeLevel,
                  updatedAt: todayISO(),
                }
              : grade
          ),
        });
      },
      reviewGrade: (id, status, comment) => {
        const { grades, addNotification } = get();
        const target = grades.find((grade) => grade.id === id);
        set({
          grades: grades.map((grade) =>
            grade.id === id
              ? {
                  ...grade,
                  status,
                  reviewComment: comment,
                  updatedAt: todayISO(),
                }
              : grade
          ),
        });
        if (target) {
          addNotification({
            title: status === 'reviewed' ? '成绩已复核通过' : '成绩已被驳回',
            content: `${target.courseName}：${target.score} 分${comment ? `，意见：${comment}` : ''}`,
            type: status === 'reviewed' ? 'success' : 'warning',
            targetUserId: target.studentId,
          });
        }
      },
      batchReviewGrades: (status, gradeIds, comment) => {
        gradeIds.forEach((id) => get().reviewGrade(id, status, comment));
      },

      getSchedule: (filter) => {
        const { schedules } = get();
        return schedules.filter((schedule) => {
          if (filter?.classId && schedule.classId !== filter.classId) return false;
          if (filter?.teacherId && schedule.teacherId !== filter.teacherId) return false;
          if (filter?.dayOfWeek !== undefined && schedule.dayOfWeek !== filter.dayOfWeek) return false;
          return true;
        });
      },
      checkScheduleConflict: (candidate) => {
        const { schedules } = get();
        const clash = schedules.find((schedule) => {
          if (candidate.excludeId && schedule.id === candidate.excludeId) return false;
          if (schedule.dayOfWeek !== candidate.dayOfWeek || schedule.period !== candidate.period) {
            return false;
          }
          return (
            schedule.classId === candidate.classId ||
            schedule.teacherId === candidate.teacherId ||
            schedule.classroom.trim().toLowerCase() === candidate.classroom.trim().toLowerCase()
          );
        });
        if (!clash) return null;
        if (clash.classId === candidate.classId) {
          return `该班级此时段已有「${clash.courseName}」`;
        }
        if (clash.teacherId === candidate.teacherId) {
          return `该教师此时段已在「${clash.className}」授课`;
        }
        return `教室 ${clash.classroom} 此时段已被「${clash.courseName}」占用`;
      },
      addSchedule: (scheduleData) => {
        const conflict = get().checkScheduleConflict(scheduleData);
        if (conflict) return { ok: false, message: conflict };
        const { schedules } = get();
        set({
          schedules: [
            ...schedules,
            {
              ...scheduleData,
              id: generateId(),
            },
          ],
        });
        return { ok: true, message: '课程安排成功' };
      },
      updateSchedule: (id, updates) => {
        const { schedules } = get();
        set({
          schedules: schedules.map((schedule) =>
            schedule.id === id ? { ...schedule, ...updates } : schedule
          ),
        });
      },
      deleteSchedule: (id) => {
        set({ schedules: get().schedules.filter((schedule) => schedule.id !== id) });
      },

      getAppeals: (filter) => {
        const { appeals } = get();
        return appeals.filter((appeal) => {
          if (filter?.studentId && appeal.studentId !== filter.studentId) return false;
          if (filter?.classId && appeal.classId !== filter.classId) return false;
          if (filter?.courseId && appeal.courseId !== filter.courseId) return false;
          if (filter?.status && appeal.status !== filter.status) return false;
          if (filter?.teacherId && appeal.teacherId !== filter.teacherId) return false;
          return true;
        });
      },
      addAppeal: (appealData) => {
        if (!validAuthCodes.includes(appealData.authCode.trim().toUpperCase())) {
          return false;
        }
        const { appeals } = get();
        const duplicate = appeals.some(
          (appeal) =>
            appeal.gradeId === appealData.gradeId &&
            appeal.status !== 'rejected' &&
            appeal.status !== 'approved'
        );
        if (duplicate) return false;
        const newAppeal: Appeal = {
          ...appealData,
          authCode: appealData.authCode.trim().toUpperCase(),
          id: generateId(),
          status: 'pending',
          createdAt: todayISO(),
          updatedAt: todayISO(),
        };
        set({ appeals: [...appeals, newAppeal] });
        get().addNotification({
          title: '新的成绩申诉',
          content: `${newAppeal.studentName} 对「${newAppeal.courseName}」提出申诉`,
          type: 'warning',
          targetRole: 'homeroom_teacher',
        });
        return true;
      },
      reviewAppeal: (id, status, comment, reviewerRole) => {
        const { appeals, editGrade, addNotification } = get();
        const target = appeals.find((appeal) => appeal.id === id);
        set({
          appeals: appeals.map((appeal) =>
            appeal.id === id
              ? {
                  ...appeal,
                  status,
                  homeroomComment:
                    reviewerRole === 'homeroom_teacher' ? comment : appeal.homeroomComment,
                  teacherComment: reviewerRole === 'teacher' ? comment : appeal.teacherComment,
                  adminComment: reviewerRole === 'admin' ? comment : appeal.adminComment,
                  updatedAt: todayISO(),
                }
              : appeal
          ),
        });
        if (target && status === 'approved') {
          editGrade(target.gradeId, {
            score: target.requestedScore,
            status: 'reviewed',
            reviewComment: `申诉通过，成绩由 ${target.originalScore} 调整为 ${target.requestedScore}`,
          });
        }
        if (target) {
          addNotification({
            title: status === 'approved' ? '成绩申诉已批准' : '成绩申诉已驳回',
            content: `课程「${target.courseName}」的申诉已${status === 'approved' ? '批准并更新成绩' : '驳回'}`,
            type: status === 'approved' ? 'success' : 'warning',
            targetUserId: target.studentId,
          });
        }
      },

      getExams: (filter) => {
        const { exams } = get();
        return exams.filter((exam) => {
          if (filter?.classId && exam.classId !== filter.classId) return false;
          if (filter?.courseId && exam.courseId !== filter.courseId) return false;
          if (filter?.teacherId && exam.teacherId !== filter.teacherId) return false;
          if (filter?.examType && exam.examType !== filter.examType) return false;
          return true;
        });
      },
      addExam: (examData) => {
        const { exams } = get();
        set({
          exams: [
            ...exams,
            {
              ...examData,
              id: generateId(),
              createdAt: todayISO(),
            },
          ],
        });
      },
      deleteExam: (id) => {
        set({ exams: get().exams.filter((exam) => exam.id !== id) });
      },

      addUser: (userData) => {
        const { users } = get();
        if (users.some((item) => item.username === userData.username.trim())) {
          return false;
        }
        const newUser: User = {
          ...userData,
          username: userData.username.trim(),
          id: generateId(),
        };
        set({ users: [...users, newUser] });
        return true;
      },
      deleteUser: (id) => {
        const { user } = get();
        if (user?.id === id) return;
        set({ users: get().users.filter((item) => item.id !== id) });
      },
      getUserById: (id) => get().users.find((item) => item.id === id),
      updateUser: (id, updates) => {
        const { users, user } = get();
        const nextUsers = users.map((item) => (item.id === id ? { ...item, ...updates } : item));
        set({
          users: nextUsers,
          user: user?.id === id ? { ...user, ...updates } : user,
        });
      },

      addCourse: (courseData) => {
        const { courses } = get();
        set({
          courses: [
            ...courses,
            {
              ...courseData,
              id: generateId(),
            },
          ],
        });
      },
      deleteCourse: (id) => {
        set({ courses: get().courses.filter((course) => course.id !== id) });
      },

      addClass: (classData) => {
        const { classes } = get();
        set({
          classes: [
            ...classes,
            {
              ...classData,
              id: generateId(),
            },
          ],
        });
      },
      deleteClass: (id) => {
        set({ classes: get().classes.filter((cls) => cls.id !== id) });
      },
      updateClass: (id, updates) => {
        const { classes } = get();
        set({
          classes: classes.map((cls) => (cls.id === id ? { ...cls, ...updates } : cls)),
        });
      },
    }),
    {
      name: 'edu-app-storage',
      partialize: (state) => ({
        user: state.user,
        isLoggedIn: state.isLoggedIn,
        users: state.users,
        grades: state.grades,
        courses: state.courses,
        classes: state.classes,
        schedules: state.schedules,
        exams: state.exams,
        appeals: state.appeals,
        majors: state.majors,
        notifications: state.notifications,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }
  )
);

export const useAuthStore = useAppStore;
export const useGradeStore = useAppStore;
export const useScheduleStore = useAppStore;
export const useAppealStore = useAppStore;
export const useExamStore = useAppStore;
export const useUserManagementStore = useAppStore;
export const useCourseManagementStore = useAppStore;
export const useClassManagementStore = useAppStore;
