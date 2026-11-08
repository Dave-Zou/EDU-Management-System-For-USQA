import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus } from 'lucide-react';
import Layout from '@/components/Layout/Layout';
import { useAuthStore, useGradeStore, useScheduleStore } from '@/store/useStore';
import Button from '@/components/Button/Button';
import Feedback from '@/components/Feedback/Feedback';

const GradeRegister = () => {
  const { user } = useAuthStore();
  const { courses, classes, users, addGrade } = useGradeStore();
  const { getSchedule } = useScheduleStore();
  const navigate = useNavigate();

  const [selectedClass, setSelectedClass] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [scores, setScores] = useState<Record<string, string>>({});
  const [fullScore, setFullScore] = useState(100);
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const canRegister = user?.role === 'teacher' || user?.role === 'admin';
  const teaching = user?.role === 'teacher' ? getSchedule({ teacherId: user.id }) : [];

  const classOptions = useMemo(() => {
    if (user?.role !== 'teacher') return classes;
    const classIds = new Set(teaching.map((item) => item.classId));
    return classes.filter((item) => classIds.has(item.id));
  }, [classes, teaching, user?.role]);

  const courseOptions = useMemo(() => {
    if (user?.role !== 'teacher') return courses;
    const related = teaching.filter((item) => !selectedClass || item.classId === selectedClass);
    const courseIds = new Set(related.map((item) => item.courseId));
    return courses.filter((item) => courseIds.has(item.id));
  }, [courses, selectedClass, teaching, user?.role]);

  const students = useMemo(
    () => users.filter((item) => item.role === 'student' && item.classId === selectedClass),
    [selectedClass, users]
  );

  const handleClassChange = (classId: string) => {
    setSelectedClass(classId);
    setSelectedCourse('');
    setScores({});
  };

  const handleSubmit = () => {
    if (!selectedClass || !selectedCourse) {
      setFeedback({ type: 'err', text: '请选择班级和课程' });
      return;
    }
    if (fullScore <= 0) {
      setFeedback({ type: 'err', text: '满分必须大于 0' });
      return;
    }

    const filled = students.filter((student) => (scores[student.id] ?? '') !== '');
    if (filled.length === 0) {
      setFeedback({ type: 'err', text: '请至少录入一名学生的成绩。留空的学生不会提交，0 分会提交。' });
      return;
    }

    const course = courses.find((item) => item.id === selectedCourse);
    const cls = classes.find((item) => item.id === selectedClass);
    const saved: string[] = [];
    const failed: string[] = [];

    filled.forEach((student) => {
      const result = addGrade({
        studentId: student.id,
        studentName: student.name,
        classId: selectedClass,
        className: cls?.name || '',
        courseId: selectedCourse,
        courseName: course?.name || '',
        teacherId: user?.id || '',
        teacherName: user?.name || '',
        score: Number(scores[student.id]),
        fullScore,
        status: 'pending',
      });
      if (result.ok) saved.push(`${student.name}：${result.message}`);
      else failed.push(`${student.name}：${result.message}`);
    });

    if (saved.length === 0) {
      setFeedback({ type: 'err', text: failed.join('\n') });
      return;
    }

    setScores({});
    setFeedback({
      type: failed.length ? 'err' : 'ok',
      text: [`已提交 ${saved.length} 条。`, ...saved, ...failed].join('\n'),
    });
  };

  if (!canRegister) {
    return (
      <Layout currentPage="/grades/register">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-gray-500">您没有权限访问此页面</p>
            <Button variant="secondary" className="mt-4" onClick={() => navigate('/dashboard')}>返回首页</Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout currentPage="/grades/register">
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate('/grades')}
          className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors mr-4"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">登记成绩</h2>
          <p className="text-gray-500 mt-1">
            {user?.role === 'teacher' ? '只能登记自己课表上的班级和课程' : '为学生录入成绩'}
          </p>
        </div>
      </div>

      <Feedback feedback={feedback} />

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">班级</label>
            <select
              value={selectedClass}
              onChange={(e) => handleClassChange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">请选择班级</option>
              {classOptions.map((cls) => (
                <option key={cls.id} value={cls.id}>{cls.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">课程</label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">请选择课程</option>
              {courseOptions.map((course) => (
                <option key={course.id} value={course.id}>{course.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">满分</label>
            <input
              type="number"
              min="1"
              value={fullScore}
              onChange={(e) => setFullScore(Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">序号</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">学生姓名</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">学号</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">成绩</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {students.length > 0 ? (
                students.map((student, index) => (
                  <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-500">{index + 1}</td>
                    <td className="px-6 py-4 text-sm text-gray-800">{student.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-800">{student.username}</td>
                    <td className="px-6 py-4">
                      <input
                        type="number"
                        min="0"
                        max={fullScore}
                        value={scores[student.id] ?? ''}
                        onChange={(e) => setScores({ ...scores, [student.id]: e.target.value })}
                        placeholder="留空则跳过"
                        className="w-28 px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                    {user?.role === 'teacher' && classOptions.length === 0 ? '您的课表里还没有班级' : '请先选择班级'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-end mt-6">
        <Button onClick={handleSubmit} className="mr-4">
          <Plus className="w-4 h-4 mr-2" />
          提交成绩
        </Button>
        <Button variant="secondary" onClick={() => navigate('/grades')}>取消</Button>
      </div>
    </Layout>
  );
};

export default GradeRegister;
