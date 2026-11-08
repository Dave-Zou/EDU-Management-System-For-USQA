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
  AuthCode,
  ToastItem,
  ToastType,
} from '@/types';
import {
  mockUsers,
  mockGrades,
  mockSchedule,
  mockCourses,
  mockClasses,
  mockExams,
  mockMajors,
  mockAppeals,
  mockAuthCodes,
  generateId,
  getGradeLevel,
  todayISO,
} from '@/data/mockData';

const initialData = {
  users: mockUsers,
  grades: mockGrades,
  courses: mockCourses,
  classes: mockClasses,
  schedules: mockSchedule,
  appeals: mockAppeals,
  exams: mockExams,
  majors: mockMajors,
  authCodes: mockAuthCodes,
};

interface AppState {
  users: User[];
  grades: Grade[];
  courses: Course[];
  classes: Class[];
  schedules: Schedule[];
  appeals: Appeal[];
  exams: Exam[];
  majors: Major[];
  authCodes: AuthCode[];

  getGrades: (filter?: {
    classId?: string;
    courseId?: string;
    studentId?: string;
    status?: GradeStatus;
    teacherId?: string;
  }) => Grade[];
  addGrade: (grade: Omit<Grade, 'id' | 'createdAt' | 'updatedAt' | 'gradeLevel'>) => boolean;
  editGrade: (id: string, updates: Partial<Grade>) => void;
  reviewGrade: (id: string, status: GradeStatus, comment?: string) => void;
  batchReviewGrades: (status: GradeStatus, gradeIds: string[], comment?: string) => void;

  getSchedule: (filter?: { classId?: string; teacherId?: string; dayOfWeek?: number }) => Schedule[];
  addSchedule: (schedule: Omit<Schedule, 'id'>) => void;
  updateSchedule: (id: string, updates: Partial<Schedule>) => void;
  deleteSchedule: (id: string) => void;
  checkScheduleConflict: (
    candidate: Pick<Schedule, 'classId' | 'teacherId' | 'classroom' | 'dayOfWeek' | 'period'>,
    excludeId?: string
  ) => string | null;

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
  checkExamConflict: (
    candidate: Pick<Exam, 'classId' | 'teacherId' | 'classroom' | 'examDate' | 'startTime' | 'endTime'>,
    excludeId?: string
  ) => string | null;

  addUser: (user: Omit<User, 'id'>) => boolean;
  deleteUser: (id: string) => void;
  getUserById: (id: string) => User | undefined;
  updateUser: (id: string, updates: Partial<User>) => void;

  addCourse: (course: Omit<Course, 'id'>) => void;
  deleteCourse: (id: string) => void;

  addClass: (cls: Omit<Class, 'id'>) => void;
  deleteClass: (id: string) => void;
  updateClass: (id: string, updates: Partial<Class>) => void;

  generateAuthCode: (createdBy: string, createdByName: string) => string;
  resetDemoData: () => void;
}

const timesOverlap = (aStart: string, aEnd: string, bStart: string, bEnd: string) =>
  aStart < bEnd && bStart < aEnd;

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...initialData,

      getGrades: (filter) => {
        return get().grades.filter((grade) => {
          if (filter?.classId && grade.classId !== filter.classId) return false;
          if (filter?.courseId && grade.courseId !== filter.courseId) return false;
          if (filter?.studentId && grade.studentId !== filter.studentId) return false;
          if (filter?.status && grade.status !== filter.status) return false;
          if (filter?.teacherId && grade.teacherId !== filter.teacherId) return false;
          return true;
        });
      },
      addGrade: (gradeData) => {
        const { grades } = get();
        const duplicate = grades.find(
          (g) => g.studentId === gradeData.studentId && g.courseId === gradeData.courseId
        );
        if (duplicate) {
          set({
            grades: grades.map((grade) =>
              grade.id === duplicate.id
                ? {
                    ...grade,
                    ...gradeData,
                    gradeLevel: getGradeLevel(gradeData.score, gradeData.fullScore),
                    status: 'pending',
                    updatedAt: todayISO(),
                  }
                : grade
            ),
          });
          return true;
        }
        const newGrade: Grade = {
          ...gradeData,
          id: generateId(),
          gradeLevel: getGradeLevel(gradeData.score, gradeData.fullScore),
          createdAt: todayISO(),
          updatedAt: todayISO(),
        };
        set({ grades: [...grades, newGrade] });
        return true;
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
                    updates.score !== undefined || updates.fullScore !== undefined
                      ? getGradeLevel(
                          updates.score ?? grade.score,
                          updates.fullScore ?? grade.fullScore
                        )
                      : grade.gradeLevel,
                  updatedAt: todayISO(),
                }
              : grade
          ),
        });
      },
      reviewGrade: (id, status, comment) => {
        const { grades } = get();
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
      },
      batchReviewGrades: (status, gradeIds, comment) => {
        const { grades } = get();
        set({
          grades: grades.map((grade) =>
            gradeIds.includes(grade.id)
              ? {
                  ...grade,
                  status,
                  reviewComment: comment,
                  updatedAt: todayISO(),
                }
              : grade
          ),
        });
      },

      getSchedule: (filter) => {
        return get().schedules.filter((schedule) => {
          if (filter?.classId && schedule.classId !== filter.classId) return false;
          if (filter?.teacherId && schedule.teacherId !== filter.teacherId) return false;
          if (filter?.dayOfWeek !== undefined && schedule.dayOfWeek !== filter.dayOfWeek) return false;
          return true;
        });
      },
      addSchedule: (scheduleData) => {
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
      checkScheduleConflict: (candidate, excludeId) => {
        for (const s of get().schedules) {
          if (excludeId && s.id === excludeId) continue;
          if (s.dayOfWeek !== candidate.dayOfWeek || s.period !== candidate.period) continue;
          if (s.classId === candidate.classId) {
            return `该班级此时段已有「${s.courseName}」`;
          }
          if (s.teacherId === candidate.teacherId) {
            return `${s.teacherName} 此时段已在「${s.className}」授课`;
          }
          if (s.classroom && s.classroom === candidate.classroom) {
            return `教室 ${s.classroom} 此时段已被「${s.courseName}」占用`;
          }
        }
        return null;
      },

      getAppeals: (filter) => {
        return get().appeals.filter((appeal) => {
          if (filter?.studentId && appeal.studentId !== filter.studentId) return false;
          if (filter?.classId && appeal.classId !== filter.classId) return false;
          if (filter?.courseId && appeal.courseId !== filter.courseId) return false;
          if (filter?.status && appeal.status !== filter.status) return false;
          if (filter?.teacherId && appeal.teacherId !== filter.teacherId) return false;
          return true;
        });
      },
      addAppeal: (appealData) => {
        const { appeals, authCodes } = get();
        if (!authCodes.some((item) => item.code === appealData.authCode)) {
          return false;
        }
        if (appeals.some((a) => a.gradeId === appealData.gradeId && a.status !== 'rejected')) {
          return false;
        }
        const newAppeal: Appeal = {
          ...appealData,
          id: generateId(),
          status: 'pending',
          createdAt: todayISO(),
          updatedAt: todayISO(),
        };
        set({ appeals: [...appeals, newAppeal] });
        return true;
      },
      reviewAppeal: (id, status, comment, reviewerRole) => {
        const { appeals, grades } = get();
        const target = appeals.find((a) => a.id === id);
        if (!target) return;

        const nextAppeals = appeals.map((appeal) =>
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
        );

        const nextGrades =
          status === 'approved'
            ? grades.map((grade) =>
                grade.id === target.gradeId
                  ? {
                      ...grade,
                      score: target.requestedScore,
                      gradeLevel: getGradeLevel(target.requestedScore, grade.fullScore),
                      status: 'reviewed' as GradeStatus,
                      reviewComment: comment || '申诉通过，成绩已更正',
                      updatedAt: todayISO(),
                    }
                  : grade
              )
            : grades;

        set({ appeals: nextAppeals, grades: nextGrades });
      },

      getExams: (filter) => {
        return get().exams.filter((exam) => {
          if (filter?.classId && exam.classId !== filter.classId) return false;
          if (filter?.courseId && exam.courseId !== filter.courseId) return false;
          if (filter?.teacherId && exam.teacherId !== filter.teacherId) return false;
          if (filter?.examType && exam.examType !== filter.examType) return false;
          return true;
        });
      },
      addExam: (examData) => {
        set({
          exams: [
            ...get().exams,
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
      checkExamConflict: (candidate, excludeId) => {
        for (const exam of get().exams) {
          if (excludeId && exam.id === excludeId) continue;
          if (exam.examDate !== candidate.examDate) continue;
          if (!timesOverlap(exam.startTime, exam.endTime, candidate.startTime, candidate.endTime)) {
            continue;
          }
          if (exam.classId === candidate.classId) {
            return `该班级在此时段已有「${exam.courseName}」考试`;
          }
          if (exam.teacherId === candidate.teacherId) {
            return `${exam.teacherName} 在此时段已有监考任务`;
          }
          if (exam.classroom === candidate.classroom) {
            return `考场 ${exam.classroom} 在此时段已被占用`;
          }
        }
        return null;
      },

      addUser: (userData) => {
        const { users } = get();
        if (users.some((u) => u.username === userData.username)) {
          return false;
        }
        set({
          users: [
            ...users,
            {
              ...userData,
              id: generateId(),
            },
          ],
        });
        return true;
      },
      deleteUser: (id) => {
        set({ users: get().users.filter((user) => user.id !== id) });
      },
      getUserById: (id) => get().users.find((user) => user.id === id),
      updateUser: (id, updates) => {
        set({
          users: get().users.map((user) => (user.id === id ? { ...user, ...updates } : user)),
        });
      },

      addCourse: (courseData) => {
        set({
          courses: [
            ...get().courses,
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
        const newClass: Class = { ...classData, id: generateId() };
        const users = get().users.map((user) =>
          user.id === classData.homeroomTeacherId ? { ...user, classId: newClass.id } : user
        );
        set({ classes: [...get().classes, newClass], users });
      },
      deleteClass: (id) => {
        set({ classes: get().classes.filter((cls) => cls.id !== id) });
      },
      updateClass: (id, updates) => {
        set({
          classes: get().classes.map((cls) => (cls.id === id ? { ...cls, ...updates } : cls)),
        });
      },

      generateAuthCode: (createdBy, createdByName) => {
        const code = `AUTH${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        set({
          authCodes: [
            ...get().authCodes,
            { code, createdBy, createdByName, createdAt: todayISO() },
          ],
        });
        return code;
      },
      resetDemoData: () => set({ ...initialData }),
    }),
    {
      name: 'edu-app-data-v1',
      partialize: (state) => ({
        users: state.users,
        grades: state.grades,
        courses: state.courses,
        classes: state.classes,
        schedules: state.schedules,
        appeals: state.appeals,
        exams: state.exams,
        majors: state.majors,
        authCodes: state.authCodes,
      }),
    }
  )
);

interface AuthState {
  user: User | null;
  isLoggedIn: boolean;
  login: (username: string, password: string, identity: 'student' | 'teacher' | 'admin') => boolean;
  logout: () => void;
  changePassword: (oldPassword: string, newPassword: string) => { ok: boolean; message: string };
  syncUser: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoggedIn: false,
      login: (username, password, identity) => {
        const user = useAppStore.getState().users.find(
          (u) =>
            u.username === username &&
            u.password === password &&
            ((identity === 'student' && u.role === 'student') ||
              (identity === 'teacher' && (u.role === 'teacher' || u.role === 'homeroom_teacher')) ||
              (identity === 'admin' && u.role === 'admin'))
        );
        if (user) {
          set({ user, isLoggedIn: true });
          return true;
        }
        return false;
      },
      logout: () => set({ user: null, isLoggedIn: false }),
      changePassword: (oldPassword, newPassword) => {
        const { user } = get();
        if (!user) return { ok: false, message: '未登录' };
        const latest = useAppStore.getState().users.find((u) => u.id === user.id) ?? user;
        if (latest.password !== oldPassword) return { ok: false, message: '旧密码不正确' };
        if (newPassword.length < 6) return { ok: false, message: '新密码至少 6 位' };
        useAppStore.getState().updateUser(user.id, { password: newPassword });
        set({ user: { ...latest, password: newPassword } });
        return { ok: true, message: '密码修改成功' };
      },
      syncUser: () => {
        const { user } = get();
        if (!user) return;
        const latest = useAppStore.getState().users.find((u) => u.id === user.id);
        if (latest) set({ user: latest });
      },
    }),
    { name: 'auth-storage' }
  )
);

interface UIState {
  collapsed: boolean;
  mobileOpen: boolean;
  toggleCollapsed: () => void;
  setMobileOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  collapsed: false,
  mobileOpen: false,
  toggleCollapsed: () => set((s) => ({ collapsed: !s.collapsed })),
  setMobileOpen: (open) => set({ mobileOpen: open }),
}));

interface ToastState {
  toasts: ToastItem[];
  showToast: (message: string, type?: ToastType) => void;
  dismissToast: (id: string) => void;
}

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],
  showToast: (message, type = 'info') => {
    const id = generateId();
    set({ toasts: [...get().toasts, { id, message, type }] });
    window.setTimeout(() => {
      set({ toasts: get().toasts.filter((t) => t.id !== id) });
    }, 2800);
  },
  dismissToast: (id) => set({ toasts: get().toasts.filter((t) => t.id !== id) }),
}));

export const useGradeStore = useAppStore;
export const useScheduleStore = useAppStore;
export const useAppealStore = useAppStore;
export const useExamStore = useAppStore;
export const useUserManagementStore = useAppStore;
export const useCourseManagementStore = useAppStore;
export const useClassManagementStore = useAppStore;
