import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Grade, Schedule, Course, Class, GradeStatus, Appeal, AppealStatus, Exam, Major } from '@/types';
import { mockUsers, mockGrades, mockSchedule, mockCourses, mockClasses, generateId, getGradeLevel } from '@/data/mockData';

const mockMajors: Major[] = [
  { id: 'M001', name: '计算机科学与技术', department: '计算机学院' },
  { id: 'M002', name: '软件工程', department: '计算机学院' },
  { id: 'M003', name: '电子信息工程', department: '电子工程学院' },
  { id: 'M004', name: '通信工程', department: '电子工程学院' },
  { id: 'M005', name: '工商管理', department: '商学院' },
  { id: 'M006', name: '会计学', department: '商学院' },
];

const mockExams: Exam[] = [
  { id: 'E001', courseId: 'C001', courseName: '高等数学', classId: 'CL001', className: '2024级计算机1班', teacherId: 'T001', teacherName: '孙老师', examType: 'midterm', examDate: '2024-11-15', startTime: '09:00', endTime: '11:00', classroom: 'A101', description: '期中考试', createdAt: '2024-10-20' },
  { id: 'E002', courseId: 'C002', courseName: '计算机基础', classId: 'CL001', className: '2024级计算机1班', teacherId: 'T002', teacherName: '李老师', examType: 'quiz', examDate: '2024-11-20', startTime: '14:00', endTime: '15:30', classroom: 'B201', createdAt: '2024-10-25' },
];

const validAuthCodes = ['TEACHER123', 'ADMIN456', 'AUTH789'];

interface AuthState {
  user: User | null;
  isLoggedIn: boolean;
  login: (username: string, password: string, identity: 'student' | 'teacher' | 'admin') => boolean;
  logout: () => void;
}

interface GradeState {
  grades: Grade[];
  courses: Course[];
  classes: Class[];
  users: User[];
  getGrades: (filter?: {
    classId?: string;
    courseId?: string;
    studentId?: string;
    status?: GradeStatus;
    teacherId?: string;
  }) => Grade[];
  addGrade: (grade: Omit<Grade, 'id' | 'createdAt' | 'updatedAt' | 'gradeLevel'>) => void;
  editGrade: (id: string, updates: Partial<Grade>) => void;
  reviewGrade: (id: string, status: GradeStatus, comment?: string) => void;
  batchReviewGrades: (status: GradeStatus, gradeIds: string[], comment?: string) => void;
}

interface ScheduleState {
  schedules: Schedule[];
  getSchedule: (filter?: {
    classId?: string;
    teacherId?: string;
    dayOfWeek?: number;
  }) => Schedule[];
  addSchedule: (schedule: Omit<Schedule, 'id'>) => void;
  updateSchedule: (id: string, updates: Partial<Schedule>) => void;
  deleteSchedule: (id: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoggedIn: false,
      login: (username, password, identity) => {
        const user = mockUsers.find(
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
      logout: () => {
        set({ user: null, isLoggedIn: false });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);

export const useGradeStore = create<GradeState>((set, get) => ({
  grades: mockGrades,
  courses: mockCourses,
  classes: mockClasses,
  users: mockUsers,
  getGrades: (filter) => {
    const { grades } = get();
    return grades.filter((grade) => {
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
    const newGrade: Grade = {
      ...gradeData,
      id: generateId(),
      gradeLevel: getGradeLevel(gradeData.score),
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };
    set({ grades: [...grades, newGrade] });
  },
  editGrade: (id, updates) => {
    const { grades } = get();
    set({
      grades: grades.map((grade) =>
        grade.id === id
          ? {
              ...grade,
              ...updates,
              gradeLevel: updates.score !== undefined ? getGradeLevel(updates.score) : grade.gradeLevel,
              updatedAt: new Date().toISOString().split('T')[0],
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
              updatedAt: new Date().toISOString().split('T')[0],
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
              updatedAt: new Date().toISOString().split('T')[0],
            }
          : grade
      ),
    });
  },
}));

export const useScheduleStore = create<ScheduleState>((set, get) => ({
  schedules: mockSchedule,
  getSchedule: (filter) => {
    const { schedules } = get();
    return schedules.filter((schedule) => {
      if (filter?.classId && schedule.classId !== filter.classId) return false;
      if (filter?.teacherId && schedule.teacherId !== filter.teacherId) return false;
      if (filter?.dayOfWeek !== undefined && schedule.dayOfWeek !== filter.dayOfWeek) return false;
      return true;
    });
  },
  addSchedule: (scheduleData) => {
    const { schedules } = get();
    const newSchedule: Schedule = {
      ...scheduleData,
      id: generateId(),
    };
    set({ schedules: [...schedules, newSchedule] });
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
    const { schedules } = get();
    set({ schedules: schedules.filter((schedule) => schedule.id !== id) });
  },
}));

interface AppealState {
  appeals: Appeal[];
  getAppeals: (filter?: {
    studentId?: string;
    classId?: string;
    courseId?: string;
    status?: AppealStatus;
    teacherId?: string;
  }) => Appeal[];
  addAppeal: (appeal: Omit<Appeal, 'id' | 'createdAt' | 'updatedAt'>) => boolean;
  reviewAppeal: (id: string, status: AppealStatus, comment?: string, reviewerRole?: string) => void;
}

export const useAppealStore = create<AppealState>((set, get) => ({
  appeals: [],
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
    if (!validAuthCodes.includes(appealData.authCode)) {
      return false;
    }
    const { appeals } = get();
    const newAppeal: Appeal = {
      ...appealData,
      id: generateId(),
      status: 'pending',
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };
    set({ appeals: [...appeals, newAppeal] });
    return true;
  },
  reviewAppeal: (id, status, comment, reviewerRole) => {
    const { appeals } = get();
    set({
      appeals: appeals.map((appeal) =>
        appeal.id === id
          ? {
              ...appeal,
              status,
              homeroomComment: reviewerRole === 'homeroom_teacher' ? comment : appeal.homeroomComment,
              teacherComment: reviewerRole === 'teacher' ? comment : appeal.teacherComment,
              adminComment: reviewerRole === 'admin' ? comment : appeal.adminComment,
              updatedAt: new Date().toISOString().split('T')[0],
            }
          : appeal
      ),
    });
  },
}));

interface ExamState {
  exams: Exam[];
  getExams: (filter?: {
    classId?: string;
    courseId?: string;
    teacherId?: string;
    examType?: Exam['examType'];
  }) => Exam[];
  addExam: (exam: Omit<Exam, 'id' | 'createdAt'>) => void;
  deleteExam: (id: string) => void;
}

export const useExamStore = create<ExamState>((set, get) => ({
  exams: mockExams,
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
    const newExam: Exam = {
      ...examData,
      id: generateId(),
      createdAt: new Date().toISOString().split('T')[0],
    };
    set({ exams: [...exams, newExam] });
  },
  deleteExam: (id) => {
    const { exams } = get();
    set({ exams: exams.filter((exam) => exam.id !== id) });
  },
}));

interface UserManagementState {
  users: User[];
  majors: Major[];
  addUser: (user: Omit<User, 'id'>) => boolean;
  deleteUser: (id: string) => void;
  getUserById: (id: string) => User | undefined;
  updateUser: (id: string, updates: Partial<User>) => void;
}

export const useUserManagementStore = create<UserManagementState>((set, get) => ({
  users: mockUsers,
  majors: mockMajors,
  addUser: (userData) => {
    const { users } = get();
    if (users.some((u) => u.username === userData.username)) {
      return false;
    }
    const newUser: User = {
      ...userData,
      id: generateId(),
    };
    set({ users: [...users, newUser] });
    return true;
  },
  deleteUser: (id) => {
    const { users } = get();
    set({ users: users.filter((user) => user.id !== id) });
  },
  getUserById: (id) => {
    const { users } = get();
    return users.find((user) => user.id === id);
  },
  updateUser: (id, updates) => {
    const { users } = get();
    set({
      users: users.map((user) =>
        user.id === id ? { ...user, ...updates } : user
      ),
    });
  },
}));

interface CourseManagementState {
  courses: Course[];
  addCourse: (course: Omit<Course, 'id'>) => void;
  deleteCourse: (id: string) => void;
}

export const useCourseManagementStore = create<CourseManagementState>((set, get) => ({
  courses: mockCourses,
  addCourse: (courseData) => {
    const { courses } = get();
    const newCourse: Course = {
      ...courseData,
      id: generateId(),
    };
    set({ courses: [...courses, newCourse] });
  },
  deleteCourse: (id) => {
    const { courses } = get();
    set({ courses: courses.filter((course) => course.id !== id) });
  },
}));

interface ClassManagementState {
  classes: Class[];
  addClass: (cls: Omit<Class, 'id'>) => void;
  deleteClass: (id: string) => void;
  updateClass: (id: string, updates: Partial<Class>) => void;
}

export const useClassManagementStore = create<ClassManagementState>((set, get) => ({
  classes: mockClasses,
  addClass: (classData) => {
    const { classes } = get();
    const newClass: Class = {
      ...classData,
      id: generateId(),
    };
    set({ classes: [...classes, newClass] });
  },
  deleteClass: (id) => {
    const { classes } = get();
    set({ classes: classes.filter((cls) => cls.id !== id) });
  },
  updateClass: (id, updates) => {
    const { classes } = get();
    set({
      classes: classes.map((cls) =>
        cls.id === id ? { ...cls, ...updates } : cls
      ),
    });
  },
}));