import { User, Course, Class, Grade, Schedule, Exam, Major, Appeal, AuthCode } from '@/types';

export const mockUsers: User[] = [
  {
    id: 'u001',
    name: '张三',
    role: 'student',
    username: '2024001',
    password: '123456',
    classId: 'c001',
  },
  {
    id: 'u002',
    name: '李四',
    role: 'student',
    username: '2024002',
    password: '123456',
    classId: 'c001',
  },
  {
    id: 'u003',
    name: '王五',
    role: 'student',
    username: '2024003',
    password: '123456',
    classId: 'c002',
  },
  {
    id: 'u004',
    name: '赵六',
    role: 'student',
    username: '2024004',
    password: '123456',
    classId: 'c002',
  },
  {
    id: 't001',
    name: '孙老师',
    role: 'teacher',
    username: 't001',
    password: '123456',
    department: '计算机学院',
  },
  {
    id: 't002',
    name: '李老师',
    role: 'teacher',
    username: 't002',
    password: '123456',
    department: '数学系',
  },
  {
    id: 't003',
    name: '王班主任',
    role: 'homeroom_teacher',
    username: 't003',
    password: '123456',
    classId: 'c001',
    department: '计算机学院',
  },
  {
    id: 't004',
    name: '张班主任',
    role: 'homeroom_teacher',
    username: 't004',
    password: '123456',
    classId: 'c002',
    department: '数学系',
  },
  {
    id: 'a001',
    name: '管理员',
    role: 'admin',
    username: 'admin',
    password: '123456',
  },
];

export const mockCourses: Course[] = [
  { id: 'course001', name: '高等数学', code: 'MATH101', credit: 4, department: '数学系' },
  { id: 'course002', name: '大学英语', code: 'ENG101', credit: 3, department: '外语学院' },
  { id: 'course003', name: '计算机基础', code: 'CS101', credit: 3, department: '计算机学院' },
  { id: 'course004', name: '数据结构', code: 'CS102', credit: 4, department: '计算机学院' },
  { id: 'course005', name: '线性代数', code: 'MATH102', credit: 3, department: '数学系' },
  { id: 'course006', name: '软件工程', code: 'CS103', credit: 4, department: '计算机学院' },
];

export const mockClasses: Class[] = [
  { id: 'c001', name: '计算机2401班', grade: '2024', major: '计算机科学与技术', homeroomTeacherId: 't003' },
  { id: 'c002', name: '数学2401班', grade: '2024', major: '数学与应用数学', homeroomTeacherId: 't004' },
  { id: 'c003', name: '计算机2402班', grade: '2024', major: '计算机科学与技术', homeroomTeacherId: 't003' },
];

export const mockMajors: Major[] = [
  { id: 'M001', name: '计算机科学与技术', department: '计算机学院' },
  { id: 'M002', name: '软件工程', department: '计算机学院' },
  { id: 'M003', name: '电子信息工程', department: '电子工程学院' },
  { id: 'M004', name: '通信工程', department: '电子工程学院' },
  { id: 'M005', name: '工商管理', department: '商学院' },
  { id: 'M006', name: '会计学', department: '商学院' },
  { id: 'M007', name: '数学与应用数学', department: '数学系' },
];

export const mockGrades: Grade[] = [
  {
    id: 'g001',
    studentId: 'u001',
    studentName: '张三',
    classId: 'c001',
    className: '计算机2401班',
    courseId: 'course001',
    courseName: '高等数学',
    teacherId: 't002',
    teacherName: '李老师',
    score: 85,
    fullScore: 100,
    gradeLevel: '良好',
    status: 'reviewed',
    reviewComment: '成绩良好',
    createdAt: '2024-01-10',
    updatedAt: '2024-01-12',
  },
  {
    id: 'g002',
    studentId: 'u001',
    studentName: '张三',
    classId: 'c001',
    className: '计算机2401班',
    courseId: 'course003',
    courseName: '计算机基础',
    teacherId: 't001',
    teacherName: '孙老师',
    score: 92,
    fullScore: 100,
    gradeLevel: '优秀',
    status: 'reviewed',
    reviewComment: '成绩优秀',
    createdAt: '2024-01-11',
    updatedAt: '2024-01-13',
  },
  {
    id: 'g003',
    studentId: 'u002',
    studentName: '李四',
    classId: 'c001',
    className: '计算机2401班',
    courseId: 'course001',
    courseName: '高等数学',
    teacherId: 't002',
    teacherName: '李老师',
    score: 78,
    fullScore: 100,
    gradeLevel: '中等',
    status: 'pending',
    createdAt: '2024-01-14',
    updatedAt: '2024-01-14',
  },
  {
    id: 'g004',
    studentId: 'u002',
    studentName: '李四',
    classId: 'c001',
    className: '计算机2401班',
    courseId: 'course003',
    courseName: '计算机基础',
    teacherId: 't001',
    teacherName: '孙老师',
    score: 88,
    fullScore: 100,
    gradeLevel: '良好',
    status: 'pending',
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15',
  },
  {
    id: 'g005',
    studentId: 'u003',
    studentName: '王五',
    classId: 'c002',
    className: '数学2401班',
    courseId: 'course001',
    courseName: '高等数学',
    teacherId: 't002',
    teacherName: '李老师',
    score: 95,
    fullScore: 100,
    gradeLevel: '优秀',
    status: 'rejected',
    reviewComment: '成绩异常，需重新核对',
    createdAt: '2024-01-12',
    updatedAt: '2024-01-16',
  },
  {
    id: 'g006',
    studentId: 'u004',
    studentName: '赵六',
    classId: 'c002',
    className: '数学2401班',
    courseId: 'course005',
    courseName: '线性代数',
    teacherId: 't002',
    teacherName: '李老师',
    score: 72,
    fullScore: 100,
    gradeLevel: '及格',
    status: 'reviewed',
    reviewComment: '及格',
    createdAt: '2024-01-13',
    updatedAt: '2024-01-15',
  },
];

export const mockSchedule: Schedule[] = [
  {
    id: 's001',
    classId: 'c001',
    className: '计算机2401班',
    courseId: 'course001',
    courseName: '高等数学',
    teacherId: 't002',
    teacherName: '李老师',
    dayOfWeek: 1,
    period: 1,
    classroom: 'A101',
    startDate: '2026-09-01',
    endDate: '2027-01-16',
  },
  {
    id: 's002',
    classId: 'c001',
    className: '计算机2401班',
    courseId: 'course003',
    courseName: '计算机基础',
    teacherId: 't001',
    teacherName: '孙老师',
    dayOfWeek: 1,
    period: 3,
    classroom: 'B201',
    startDate: '2026-09-01',
    endDate: '2027-01-16',
  },
  {
    id: 's003',
    classId: 'c001',
    className: '计算机2401班',
    courseId: 'course002',
    courseName: '大学英语',
    teacherId: 't001',
    teacherName: '孙老师',
    dayOfWeek: 2,
    period: 2,
    classroom: 'C301',
    startDate: '2026-09-01',
    endDate: '2027-01-16',
  },
  {
    id: 's004',
    classId: 'c001',
    className: '计算机2401班',
    courseId: 'course004',
    courseName: '数据结构',
    teacherId: 't001',
    teacherName: '孙老师',
    dayOfWeek: 3,
    period: 1,
    classroom: 'B201',
    startDate: '2026-09-01',
    endDate: '2027-01-16',
  },
  {
    id: 's005',
    classId: 'c002',
    className: '数学2401班',
    courseId: 'course001',
    courseName: '高等数学',
    teacherId: 't002',
    teacherName: '李老师',
    dayOfWeek: 1,
    period: 2,
    classroom: 'A102',
    startDate: '2026-09-01',
    endDate: '2027-01-16',
  },
  {
    id: 's006',
    classId: 'c002',
    className: '数学2401班',
    courseId: 'course005',
    courseName: '线性代数',
    teacherId: 't002',
    teacherName: '李老师',
    dayOfWeek: 2,
    period: 1,
    classroom: 'A102',
    startDate: '2026-09-01',
    endDate: '2027-01-16',
  },
  {
    id: 's007',
    classId: 'c002',
    className: '数学2401班',
    courseId: 'course002',
    courseName: '大学英语',
    teacherId: 't001',
    teacherName: '孙老师',
    dayOfWeek: 4,
    period: 3,
    classroom: 'C302',
    startDate: '2026-09-01',
    endDate: '2027-01-16',
  },
];

export const mockExams: Exam[] = [
  {
    id: 'e001',
    courseId: 'course001',
    courseName: '高等数学',
    classId: 'c001',
    className: '计算机2401班',
    teacherId: 't002',
    teacherName: '李老师',
    examType: 'midterm',
    examDate: '2026-11-15',
    startTime: '09:00',
    endTime: '11:00',
    classroom: 'A101',
    description: '期中考试，闭卷',
    createdAt: '2026-10-20',
  },
  {
    id: 'e002',
    courseId: 'course003',
    courseName: '计算机基础',
    classId: 'c001',
    className: '计算机2401班',
    teacherId: 't001',
    teacherName: '孙老师',
    examType: 'quiz',
    examDate: '2026-11-20',
    startTime: '14:00',
    endTime: '15:30',
    classroom: 'B201',
    createdAt: '2026-10-25',
  },
  {
    id: 'e003',
    courseId: 'course005',
    courseName: '线性代数',
    classId: 'c002',
    className: '数学2401班',
    teacherId: 't002',
    teacherName: '李老师',
    examType: 'final',
    examDate: '2026-12-20',
    startTime: '09:00',
    endTime: '11:00',
    classroom: 'A102',
    description: '期末考试',
    createdAt: '2026-11-01',
  },
];

export const mockAppeals: Appeal[] = [
  {
    id: 'ap001',
    gradeId: 'g001',
    studentId: 'u001',
    studentName: '张三',
    classId: 'c001',
    className: '计算机2401班',
    courseId: 'course001',
    courseName: '高等数学',
    teacherId: 't002',
    teacherName: '李老师',
    originalScore: 85,
    requestedScore: 90,
    reason: '第三大题步骤分未计入，申请复核卷面。',
    authCode: 'TEACHER123',
    status: 'pending',
    createdAt: '2026-11-02',
    updatedAt: '2026-11-02',
  },
];

export const mockAuthCodes: AuthCode[] = [
  { code: 'TEACHER123', createdBy: 't001', createdByName: '孙老师', createdAt: '2026-10-01' },
  { code: 'ADMIN456', createdBy: 'a001', createdByName: '管理员', createdAt: '2026-10-01' },
  { code: 'AUTH789', createdBy: 't002', createdByName: '李老师', createdAt: '2026-10-08' },
];

export const DAYS = ['周一', '周二', '周三', '周四', '周五'];
export const PERIODS = ['第1节', '第2节', '第3节', '第4节', '第5节', '第6节'];
export const PERIOD_TIMES = ['08:00-08:45', '08:55-09:40', '10:00-10:45', '10:55-11:40', '14:00-14:45', '14:55-15:40'];
export const SEMESTER_START = '2026-09-01';
export const SEMESTER_WEEKS = 18;

export const generateId = (): string => {
  return `${Date.now().toString(36)}${Math.random().toString(36).substring(2, 6)}`;
};

export const getGradeLevel = (score: number, fullScore = 100): string => {
  const percent = fullScore > 0 ? (score / fullScore) * 100 : 0;
  if (percent >= 90) return '优秀';
  if (percent >= 80) return '良好';
  if (percent >= 70) return '中等';
  if (percent >= 60) return '及格';
  return '不及格';
};

export const todayISO = (): string => new Date().toISOString().split('T')[0];

export const getWeekRange = (week: number): { start: string; end: string } => {
  const start = new Date(`${SEMESTER_START}T00:00:00`);
  start.setDate(start.getDate() + (week - 1) * 7);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  const toISO = (d: Date) => d.toISOString().split('T')[0];
  return { start: toISO(start), end: toISO(end) };
};

export const getCurrentWeek = (): number => {
  const start = new Date(`${SEMESTER_START}T00:00:00`).getTime();
  const now = Date.now();
  const week = Math.floor((now - start) / (7 * 24 * 60 * 60 * 1000)) + 1;
  if (week < 1) return 1;
  if (week > SEMESTER_WEEKS) return SEMESTER_WEEKS;
  return week;
};

export const isScheduleInWeek = (schedule: Schedule, week: number): boolean => {
  const { start, end } = getWeekRange(week);
  return schedule.startDate <= end && schedule.endDate >= start;
};
