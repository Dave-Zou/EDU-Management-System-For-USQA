import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import Layout from '@/components/Layout/Layout';
import { useAuthStore, useExamStore, useGradeStore } from '@/store/useStore';
import Button from '@/components/Button/Button';
import { Exam } from '@/types';

const examTypeLabels: Record<Exam['examType'], string> = {
  midterm: '期中考试',
  final: '期末考试',
  quiz: '测验',
  practice: '练习',
};

const ExamSchedule = () => {
  const { user } = useAuthStore();
  const { getExams, addExam, deleteExam } = useExamStore();
  const { classes, courses, users } = useGradeStore();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    classId: '',
    courseId: '',
    teacherId: '',
    examType: 'midterm' as Exam['examType'],
    examDate: '',
    startTime: '',
    endTime: '',
    classroom: '',
    description: '',
  });

  const exams = getExams();
  const teachers = users.filter((u) => u.role === 'teacher' || u.role === 'homeroom_teacher');

  const canManage = user?.role === 'admin';

  if (!canManage) {
    return (
      <Layout currentPage="/exam">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-gray-500">您没有权限管理考试安排</p>
            <Button variant="secondary" className="mt-4" onClick={() => navigate('/dashboard')}>
              返回首页
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const handleSubmit = () => {
    if (!formData.classId || !formData.courseId || !formData.teacherId || !formData.examDate || !formData.startTime || !formData.endTime || !formData.classroom) {
      alert('请填写完整信息');
      return;
    }

    const cls = classes.find((c) => c.id === formData.classId);
    const course = courses.find((c) => c.id === formData.courseId);
    const teacher = users.find((u) => u.id === formData.teacherId);

    addExam({
      classId: formData.classId,
      className: cls?.name || '',
      courseId: formData.courseId,
      courseName: course?.name || '',
      teacherId: formData.teacherId,
      teacherName: teacher?.name || '',
      examType: formData.examType,
      examDate: formData.examDate,
      startTime: formData.startTime,
      endTime: formData.endTime,
      classroom: formData.classroom,
      description: formData.description,
    });

    alert('考试安排成功');
    setFormData({
      classId: '',
      courseId: '',
      teacherId: '',
      examType: 'midterm',
      examDate: '',
      startTime: '',
      endTime: '',
      classroom: '',
      description: '',
    });
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除此考试安排吗？')) {
      deleteExam(id);
      alert('删除成功');
    }
  };

  return (
    <Layout currentPage="/exam">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors mr-4"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">考试安排</h2>
            <p className="text-gray-500 mt-1">管理考试安排</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">新增考试安排</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">班级</label>
              <select
                value={formData.classId}
                onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">请选择班级</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>{cls.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">课程</label>
              <select
                value={formData.courseId}
                onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">请选择课程</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>{course.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">监考老师</label>
              <select
                value={formData.teacherId}
                onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">请选择老师</option>
                {teachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">考试类型</label>
              <select
                value={formData.examType}
                onChange={(e) => setFormData({ ...formData, examType: e.target.value as Exam['examType'] })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                {Object.entries(examTypeLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">考试日期</label>
              <input
                type="date"
                value={formData.examDate}
                onChange={(e) => setFormData({ ...formData, examDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">开始时间</label>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">结束时间</label>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">考场</label>
              <input
                type="text"
                value={formData.classroom}
                onChange={(e) => setFormData({ ...formData, classroom: e.target.value })}
                placeholder="如: A101"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">备注（选填）</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="请输入备注信息"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                rows={2}
              />
            </div>
          </div>

          <Button onClick={handleSubmit} className="w-full mt-6">
            <Plus className="w-4 h-4 mr-2" />
            添加考试安排
          </Button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800">已安排考试</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">班级</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">课程</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">类型</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">时间</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">考场</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">监考老师</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {exams.length > 0 ? (
                  exams.map((exam) => (
                    <tr key={exam.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-800">{exam.className}</td>
                      <td className="px-6 py-4 text-sm text-gray-800">{exam.courseName}</td>
                      <td className="px-6 py-4 text-sm text-gray-800">{examTypeLabels[exam.examType]}</td>
                      <td className="px-6 py-4 text-sm text-gray-800">
                        {exam.examDate} {exam.startTime}-{exam.endTime}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-800">{exam.classroom}</td>
                      <td className="px-6 py-4 text-sm text-gray-800">{exam.teacherName}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleDelete(exam.id)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="删除"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                      暂无考试安排
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ExamSchedule;