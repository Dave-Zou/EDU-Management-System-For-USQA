import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { shallow } from 'zustand/shallow';
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
} from '@/types';
import {
  mockUsers,
  mockGrades,
  mockSchedule,
  mockCourses,
  mockClasses,
  mockMajors,
  mockExams,
  mockAppeals,
  appealAuthCodes,
  generateId,
  getGradeLevel,
} from '@/data/mockData';
import { findExamConflict, findScheduleConflict, validateScore } from '@/utils/academic';

export interface ActionResult {
  ok: boolean;
  message: string;
  id?: string;
}

const today = () => new Date().toISOString().split('T')[0];

const seed = () => ({
  users: mockUsers,
  courses: mockCourses,
  classes: mockClasses,
  majors: mockMajors,
  grades: mockGrades,
  schedules: mockSchedule,
  appeals: mockAppeals,
  exams: mockExams,
});

interface GradeFilter {
  classId?: string;
  courseId?: string;
  studentId?: string;
  status?: GradeStatus;
  teacherId?: string;
}

interface ScheduleFilter {
  classId?: string;
  teacherId?: string;
  dayOfWeek?: number;
}

interface AppealFilter {
  studentId?: string;
  classId?: string;
  courseId?: string;
  status?: AppealStatus;
  teacherId?: string;
  gradeId?: string;
}

interface ExamFilter {
  classId?: string;
  courseId?: string;
  teacherId?: string;
  examType?: Exam['examType'];
}

interface AppState {
  user: User | null;
  isLoggedIn: boolean;
  users: User[];
  courses: Course[];
  classes: Class[];
  majors: Major[];
  grades: Grade[];
  schedules: Schedule[];
  appeals: Appeal[];
  exams: Exam[];
  login: (username: string, password: string, identity: 'student' | 'teacher' | 'admin') => boolean;
  logout: () => void;
  changePassword: (oldPassword: string, newPassword: string) => ActionResult;
  resetData: () => void;
  getGrades: (filter?: GradeFilter) => Grade[];
  addGrade: (grade: Omit<Grade, 'id' | 'createdAt' | 'updatedAt' | 'gradeLevel'>) => ActionResult;
  editGrade: (id: string, updates: Partial<Grade>) => ActionResult;
  reviewGrade: (id: string, status: GradeStatus, comment?: string) => void;
  batchReviewGrades: (status: GradeStatus, gradeIds: string[], comment?: string) => void;
  getSchedule: (filter?: ScheduleFilter) => Schedule[];
  addSchedule: (schedule: Omit<Schedule, 'id'>) => ActionResult;
  updateSchedule: (id: string, updates: Partial<Schedule>) => ActionResult;
  deleteSchedule: (id: string) => void;
  getAppeals: (filter?: AppealFilter) => Appeal[];
  addAppeal: (appeal: Omit<Appeal, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => ActionResult;
  reviewAppeal: (id: string, status: AppealStatus, comment: string | undefined, reviewerRole: string) => ActionResult;
  getExams: (filter?: ExamFilter) => Exam[];
  addExam: (exam: Omit<Exam, 'id' | 'createdAt'>) => ActionResult;
  deleteExam: (id: string) => void;
  addUser: (user: Omit<User, 'id'>) => ActionResult;
  deleteUser: (id: string) => ActionResult;
  getUserById: (id: string) => User | undefined;
  updateUser: (id: string, updates: Partial<User>) => void;
  addCourse: (course: Omit<Course, 'id'>) => ActionResult;
  deleteCourse: (id: string) => ActionResult;
  addClass: (cls: Omit<Class, 'id'>) => ActionResult;
  deleteClass: (id: string) => ActionResult;
  updateClass: (id: string, updates: Partial<Class>) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoggedIn: false,
      ...seed(),
      login: (username, password, identity) => {
        const user = get().users.find(
          (item) =>
            item.username === username &&
            item.password === password &&
            ((identity === 'student' && item.role === 'student') ||
              (identity === 'teacher' && (item.role === 'teacher' || item.role === 'homeroom_teacher')) ||
              (identity === 'admin' && item.role === 'admin'))
        );
        if (!user) return false;
        set({ user, isLoggedIn: true });
        return true;
      },
      logout: () => set({ user: null, isLoggedIn: false }),
      changePassword: (oldPassword, newPassword) => {
        const current = get().user;
        if (!current) return { ok: false, message: '未登录' };
        const record = get().users.find((item) => item.id === current.id);
        if (!record || record.password !== oldPassword) return { ok: false, message: '旧密码不正确' };
        if (newPassword.length < 6) return { ok: false, message: '新密码至少 6 位' };
        if (newPassword === oldPassword) return { ok: false, message: '新密码不能与旧密码相同' };
        const nextUser = { ...record, password: newPassword };
        set({
          users: get().users.map((item) => (item.id === current.id ? nextUser : item)),
          user: nextUser,
        });
        return { ok: true, message: '密码已更新，下次请使用新密码登录' };
      },
      resetData: () => {
        const currentId = get().user?.id;
        const next = seed();
        const still = currentId ? next.users.find((item) => item.id === currentId) ?? null : null;
        set({ ...next, user: still, isLoggedIn: !!still });
      },
      getGrades: (filter) =>
        get().grades.filter((grade) => {
          if (filter?.classId && grade.classId !== filter.classId) return false;
          if (filter?.courseId && grade.courseId !== filter.courseId) return false;
          if (filter?.studentId && grade.studentId !== filter.studentId) return false;
          if (filter?.status && grade.status !== filter.status) return false;
          if (filter?.teacherId && grade.teacherId !== filter.teacherId) return false;
          return true;
        }),
      addGrade: (gradeData) => {
        const scoreError = validateScore(gradeData.score, gradeData.fullScore);
        if (scoreError) return { ok: false, message: scoreError };
        const existing = get().grades.find(
          (grade) => grade.studentId === gradeData.studentId && grade.courseId === gradeData.courseId
        );
        const stamped = today();
        if (existing && existing.status !== 'rejected') {
          return { ok: false, message: '该生此课程已有成绩' };
        }
        if (existing) {
          set({
            grades: get().grades.map((grade) =>
              grade.id === existing.id
                ? {
                    ...grade,
                    ...gradeData,
                    gradeLevel: getGradeLevel(gradeData.score, gradeData.fullScore),
                    status: 'pending',
                    reviewComment: undefined,
                    updatedAt: stamped,
                  }
                : grade
            ),
          });
          return { ok: true, message: '已重新提交被驳回的成绩' };
        }
        const newGrade: Grade = {
          ...gradeData,
          id: generateId(),
          gradeLevel: getGradeLevel(gradeData.score, gradeData.fullScore),
          status: 'pending',
          createdAt: stamped,
          updatedAt: stamped,
        };
        set({ grades: [...get().grades, newGrade] });
        return { ok: true, message: '登记成功' };
      },
      editGrade: (id, updates) => {
        const grade = get().grades.find((item) => item.id === id);
        if (!grade) return { ok: false, message: '成绩不存在' };
        const score = updates.score ?? grade.score;
        const fullScore = updates.fullScore ?? grade.fullScore;
        const scoreError = validateScore(score, fullScore);
        if (scoreError) return { ok: false, message: scoreError };
        set({
          grades: get().grades.map((item) =>
            item.id === id
              ? {
                  ...item,
                  ...updates,
                  score,
                  fullScore,
                  gradeLevel: getGradeLevel(score, fullScore),
                  status: 'pending',
                  updatedAt: today(),
                }
              : item
          ),
        });
        return { ok: true, message: '已保存，成绩需重新复核' };
      },
      reviewGrade: (id, status, comment) => {
        set({
          grades: get().grades.map((grade) =>
            grade.id === id ? { ...grade, status, reviewComment: comment, updatedAt: today() } : grade
          ),
        });
      },
      batchReviewGrades: (status, gradeIds, comment) => {
        set({
          grades: get().grades.map((grade) =>
            gradeIds.includes(grade.id)
              ? { ...grade, status, reviewComment: comment, updatedAt: today() }
              : grade
          ),
        });
      },
      getSchedule: (filter) =>
        get().schedules.filter((schedule) => {
          if (filter?.classId && schedule.classId !== filter.classId) return false;
          if (filter?.teacherId && schedule.teacherId !== filter.teacherId) return false;
          if (filter?.dayOfWeek !== undefined && schedule.dayOfWeek !== filter.dayOfWeek) return false;
          return true;
        }),
      addSchedule: (scheduleData) => {
        const conflict = findScheduleConflict(get().schedules, scheduleData);
        if (conflict) return { ok: false, message: conflict };
        const id = generateId();
        set({ schedules: [...get().schedules, { ...scheduleData, id }] });
        return { ok: true, message: '课程安排成功', id };
      },
      updateSchedule: (id, updates) => {
        const current = get().schedules.find((item) => item.id === id);
        if (!current) return { ok: false, message: '课表不存在' };
        const next = { ...current, ...updates, id };
        const conflict = findScheduleConflict(get().schedules, next, id);
        if (conflict) return { ok: false, message: conflict };
        set({ schedules: get().schedules.map((item) => (item.id === id ? next : item)) });
        return { ok: true, message: '课表已更新' };
      },
      deleteSchedule: (id) => set({ schedules: get().schedules.filter((item) => item.id !== id) }),
      getAppeals: (filter) =>
        get().appeals.filter((appeal) => {
          if (filter?.studentId && appeal.studentId !== filter.studentId) return false;
          if (filter?.classId && appeal.classId !== filter.classId) return false;
          if (filter?.courseId && appeal.courseId !== filter.courseId) return false;
          if (filter?.status && appeal.status !== filter.status) return false;
          if (filter?.teacherId && appeal.teacherId !== filter.teacherId) return false;
          if (filter?.gradeId && appeal.gradeId !== filter.gradeId) return false;
          return true;
        }),
      addAppeal: (appealData) => {
        const code = appealData.authCode.trim().toUpperCase();
        if (!appealAuthCodes.includes(code)) {
          return { ok: false, message: '授权码无效，请联系任课老师或教务获取' };
        }
        const grade = get().grades.find((item) => item.id === appealData.gradeId);
        if (!grade) return { ok: false, message: '成绩不存在' };
        if (grade.status !== 'reviewed') return { ok: false, message: '只有已复核的成绩可以申诉' };
        if (appealData.requestedScore === grade.score) return { ok: false, message: '申请分数与原成绩相同' };
        const scoreError = validateScore(appealData.requestedScore, grade.fullScore);
        if (scoreError) return { ok: false, message: scoreError };
        const open = get().appeals.some(
          (appeal) =>
            appeal.gradeId === appealData.gradeId && (appeal.status === 'pending' || appeal.status === 'reviewing')
        );
        if (open) return { ok: false, message: '该成绩已有进行中的申诉' };
        const stamped = today();
        const id = generateId();
        set({
          appeals: [
            ...get().appeals,
            { ...appealData, authCode: code, id, status: 'pending', createdAt: stamped, updatedAt: stamped },
          ],
        });
        return { ok: true, message: '申诉已提交，等待班主任初审', id };
      },
      reviewAppeal: (id, status, comment, reviewerRole) => {
        const appeal = get().appeals.find((item) => item.id === id);
        if (!appeal) return { ok: false, message: '申诉不存在' };
        if (appeal.status === 'approved' || appeal.status === 'rejected') {
          return { ok: false, message: '该申诉已结束' };
        }
        if (status === 'rejected' && !comment?.trim()) return { ok: false, message: '驳回时请填写意见' };
        const current = get().user;
        const stamped = today();
        const patch = (updates: Partial<Appeal>, message: string): ActionResult => {
          set({
            appeals: get().appeals.map((item) =>
              item.id === id ? { ...item, ...updates, updatedAt: stamped } : item
            ),
          });
          return { ok: true, message };
        };

        if (reviewerRole === 'homeroom_teacher') {
          if (current?.classId && appeal.classId !== current.classId) {
            return { ok: false, message: '只能处理本班申诉' };
          }
          if (appeal.status !== 'pending') return { ok: false, message: '该申诉不在班主任初审阶段' };
          if (status === 'rejected') return patch({ status: 'rejected', homeroomComment: comment }, '申诉已驳回');
          return patch({ status: 'reviewing', homeroomComment: comment }, '已通过初审，等待任课老师确认');
        }

        if (reviewerRole === 'teacher') {
          if (appeal.teacherId !== current?.id) return { ok: false, message: '只能处理自己课程的申诉' };
          if (appeal.status !== 'reviewing' || appeal.teacherComment) {
            return { ok: false, message: '请等班主任初审后，再确认这条申诉' };
          }
          if (status === 'rejected') return patch({ status: 'rejected', teacherComment: comment }, '申诉已驳回');
          return patch({ teacherComment: comment || '同意调整' }, '已确认，等待教务终审');
        }

        if (reviewerRole === 'admin') {
          if (status === 'rejected') return patch({ status: 'rejected', adminComment: comment }, '申诉已驳回');
          const grade = get().grades.find((item) => item.id === appeal.gradeId);
          if (!grade) return { ok: false, message: '原成绩不存在，无法更新' };
          const scoreError = validateScore(appeal.requestedScore, grade.fullScore);
          if (scoreError) return { ok: false, message: scoreError };
          set({
            appeals: get().appeals.map((item) =>
              item.id === id
                ? { ...item, status: 'approved', adminComment: comment, updatedAt: stamped }
                : item
            ),
            grades: get().grades.map((item) =>
              item.id === grade.id
                ? {
                    ...item,
                    score: appeal.requestedScore,
                    gradeLevel: getGradeLevel(appeal.requestedScore, item.fullScore),
                    status: 'pending',
                    reviewComment: comment || '申诉通过，成绩已调整，请重新复核',
                    updatedAt: stamped,
                  }
                : item
            ),
          });
          return { ok: true, message: '已批准，成绩已更新并重新进入复核' };
        }

        return { ok: false, message: '当前身份不能审核申诉' };
      },
      getExams: (filter) =>
        get().exams.filter((exam) => {
          if (filter?.classId && exam.classId !== filter.classId) return false;
          if (filter?.courseId && exam.courseId !== filter.courseId) return false;
          if (filter?.teacherId && exam.teacherId !== filter.teacherId) return false;
          if (filter?.examType && exam.examType !== filter.examType) return false;
          return true;
        }),
      addExam: (examData) => {
        const conflict = findExamConflict(get().exams, examData);
        if (conflict) return { ok: false, message: conflict };
        const id = generateId();
        set({ exams: [...get().exams, { ...examData, id, createdAt: today() }] });
        return { ok: true, message: '考试安排成功', id };
      },
      deleteExam: (id) => set({ exams: get().exams.filter((item) => item.id !== id) }),
      addUser: (userData) => {
        if (get().users.some((item) => item.username === userData.username)) {
          return { ok: false, message: '用户名已存在' };
        }
        if (userData.password.length < 6) return { ok: false, message: '密码至少 6 位' };
        const id = generateId();
        set({ users: [...get().users, { ...userData, id }] });
        return { ok: true, message: '创建成功', id };
      },
      deleteUser: (id) => {
        if (get().user?.id === id) return { ok: false, message: '不能删除当前登录账号' };
        const target = get().users.find((item) => item.id === id);
        if (!target) return { ok: false, message: '用户不存在' };
        if (target.role === 'admin' && get().users.filter((item) => item.role === 'admin').length <= 1) {
          return { ok: false, message: '至少保留一名教务管理员' };
        }
        set({ users: get().users.filter((item) => item.id !== id) });
        return { ok: true, message: '已删除' };
      },
      getUserById: (id) => get().users.find((item) => item.id === id),
      updateUser: (id, updates) => {
        const current = get().user;
        set({
          users: get().users.map((item) => (item.id === id ? { ...item, ...updates } : item)),
          user: current?.id === id ? { ...current, ...updates } : current,
        });
      },
      addCourse: (courseData) => {
        const name = courseData.name.trim();
        const code = courseData.code.trim().toUpperCase();
        if (!name || !code) return { ok: false, message: '请填写课程名称和代码' };
        if (get().courses.some((item) => item.code.toLowerCase() === code.toLowerCase())) {
          return { ok: false, message: '课程代码已存在' };
        }
        const id = generateId();
        set({ courses: [...get().courses, { ...courseData, id, name, code }] });
        return { ok: true, message: '课程已创建', id };
      },
      deleteCourse: (id) => {
        if (get().grades.some((item) => item.courseId === id) || get().schedules.some((item) => item.courseId === id)) {
          return { ok: false, message: '课程已被成绩或课表使用，不能删除' };
        }
        set({ courses: get().courses.filter((item) => item.id !== id) });
        return { ok: true, message: '已删除' };
      },
      addClass: (classData) => {
        const name = classData.name.trim();
        if (!name) return { ok: false, message: '请填写班级名称' };
        if (get().classes.some((item) => item.name === name)) return { ok: false, message: '班级名称已存在' };
        const id = generateId();
        set({ classes: [...get().classes, { ...classData, id, name }] });
        return { ok: true, message: '班级已创建', id };
      },
      deleteClass: (id) => {
        if (get().users.some((item) => item.role === 'student' && item.classId === id)) {
          return { ok: false, message: '班里还有学生，不能删除' };
        }
        if (get().schedules.some((item) => item.classId === id)) {
          return { ok: false, message: '班级还有课表，不能删除' };
        }
        set({ classes: get().classes.filter((item) => item.id !== id) });
        return { ok: true, message: '已删除' };
      },
      updateClass: (id, updates) => {
        set({ classes: get().classes.map((item) => (item.id === id ? { ...item, ...updates } : item)) });
      },
    }),
    {
      name: 'edu-app',
      version: 1,
      partialize: (state) => ({
        user: state.user,
        isLoggedIn: state.isLoggedIn,
        users: state.users,
        courses: state.courses,
        classes: state.classes,
        majors: state.majors,
        grades: state.grades,
        schedules: state.schedules,
        appeals: state.appeals,
        exams: state.exams,
      }),
    }
  )
);

export const useAuthStore = () =>
  useAppStore(
    (state) => ({
      user: state.user,
      isLoggedIn: state.isLoggedIn,
      login: state.login,
      logout: state.logout,
      changePassword: state.changePassword,
      resetData: state.resetData,
    }),
    shallow
  );

export const useGradeStore = () =>
  useAppStore(
    (state) => ({
      grades: state.grades,
      courses: state.courses,
      classes: state.classes,
      users: state.users,
      getGrades: state.getGrades,
      addGrade: state.addGrade,
      editGrade: state.editGrade,
      reviewGrade: state.reviewGrade,
      batchReviewGrades: state.batchReviewGrades,
    }),
    shallow
  );

export const useScheduleStore = () =>
  useAppStore(
    (state) => ({
      schedules: state.schedules,
      getSchedule: state.getSchedule,
      addSchedule: state.addSchedule,
      updateSchedule: state.updateSchedule,
      deleteSchedule: state.deleteSchedule,
    }),
    shallow
  );

export const useAppealStore = () =>
  useAppStore(
    (state) => ({
      appeals: state.appeals,
      getAppeals: state.getAppeals,
      addAppeal: state.addAppeal,
      reviewAppeal: state.reviewAppeal,
    }),
    shallow
  );

export const useExamStore = () =>
  useAppStore(
    (state) => ({
      exams: state.exams,
      getExams: state.getExams,
      addExam: state.addExam,
      deleteExam: state.deleteExam,
    }),
    shallow
  );

export const useUserManagementStore = () =>
  useAppStore(
    (state) => ({
      users: state.users,
      majors: state.majors,
      addUser: state.addUser,
      deleteUser: state.deleteUser,
      getUserById: state.getUserById,
      updateUser: state.updateUser,
    }),
    shallow
  );

export const useCourseManagementStore = () =>
  useAppStore(
    (state) => ({
      courses: state.courses,
      addCourse: state.addCourse,
      deleteCourse: state.deleteCourse,
    }),
    shallow
  );

export const useClassManagementStore = () =>
  useAppStore(
    (state) => ({
      classes: state.classes,
      addClass: state.addClass,
      deleteClass: state.deleteClass,
      updateClass: state.updateClass,
    }),
    shallow
  );
