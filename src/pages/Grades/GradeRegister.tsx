import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus } from 'lucide-react';
import Layout from '@/components/Layout/Layout';
import { useAppStore } from '@/store/useStore';
import Button from '@/components/Button/Button';
import { User } from '@/types';

const GradeRegister = () => {
  const { user, courses, classes, users, addGrade, showToast } = useAppStore();
  const navigate = useNavigate();

  const [selectedClass, setSelectedClass] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [students, setStudents] = useState<{ student: User; score: string }[]>([]);
  const [fullScore, setFullScore] = useState(100);

  const handleClassChange = (classId: string) => {
    setSelectedClass(classId);
    if (classId) {
      const classStudents = users.filter((item) => item.role === 'student' && item.classId === classId);
      setStudents(classStudents.map((student) => ({ student, score: '' })));
    } else {
      setStudents([]);
    }
  };

  const handleScoreChange = (index: number, score: string) => {
    const next = [...students];
    next[index].score = score;
    setStudents(next);
  };

  const handleSubmit = () => {
    if (!selectedClass || !selectedCourse) {
      showToast('请选择班级和课程', 'warning');
      return;
    }

    const course = courses.find((item) => item.id === selectedCourse);
    const cls = classes.find((item) => item.id === selectedClass);
    let successCount = 0;
    let skipCount = 0;
    const errors: string[] = [];

    students.forEach((item) => {
      if (item.score === '') return;
      const score = Number(item.score);
      if (Number.isNaN(score) || score < 0 || score > fullScore) {
        errors.push(`${item.student.name} 的成绩无效`);
        return;
      }
      const result = addGrade({
        studentId: item.student.id,
        studentName: item.student.name,
        classId: selectedClass,
        className: cls?.name || '',
        courseId: selectedCourse,
        courseName: course?.name || '',
        teacherId: user?.id || '',
        teacherName: user?.name || '',
        score,
        fullScore,
        status: 'pending',
      });
      if (result.ok) successCount += 1;
      else {
        skipCount += 1;
        errors.push(result.message);
      }
    });

    if (successCount === 0 && skipCount === 0 && errors.length === 0) {
      showToast('请至少录入一名学生的成绩', 'warning');
      return;
    }

    if (successCount > 0) {
      showToast(`成功登记 ${successCount} 条成绩${skipCount ? `，跳过 ${skipCount} 条重复` : ''}`, 'success');
      navigate('/grades');
      return;
    }

    showToast(errors[0] || '登记失败', 'error');
  };

  const canRegister = user?.role === 'teacher' || user?.role === 'admin';

  if (!canRegister) {
    return (
      <Layout currentPage="/grades">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-gray-500">您没有权限访问此页面</p>
            <Button variant="secondary" className="mt-4" onClick={() => navigate('/dashboard')}>
              返回首页
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout currentPage="/grades/register">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/grades')}
            className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors mr-4"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">登记成绩</h2>
            <p className="text-gray-500 mt-1">为学生录入成绩，提交后进入待复核</p>
          </div>
        </div>
      </div>

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
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
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
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">满分</label>
            <input
              type="number"
              min={1}
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
                students.map((item, index) => (
                  <tr key={item.student.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-500">{index + 1}</td>
                    <td className="px-6 py-4 text-sm text-gray-800">{item.student.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-800">{item.student.username}</td>
                    <td className="px-6 py-4">
                      <input
                        type="number"
                        min="0"
                        max={fullScore}
                        value={item.score}
                        onChange={(e) => handleScoreChange(index, e.target.value)}
                        placeholder="输入成绩，可填 0"
                        className="w-32 px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                    请先选择班级
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
        <Button variant="secondary" onClick={() => navigate('/grades')}>
          取消
        </Button>
      </div>
    </Layout>
  );
};

export default GradeRegister;
