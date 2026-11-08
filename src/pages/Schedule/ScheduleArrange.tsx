import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, BookOpen } from 'lucide-react';
import Layout from '@/components/Layout/Layout';
import { useAppStore } from '@/store/useStore';
import Button from '@/components/Button/Button';
import { weekDays, periodLabels } from '@/utils/labels';

const emptyForm = {
  classId: '',
  courseId: '',
  teacherId: '',
  majorId: '',
  dayOfWeek: 1,
  period: 1,
  classroom: '',
  startDate: '',
  endDate: '',
};

const ScheduleArrange = () => {
  const { user, getSchedule, addSchedule, deleteSchedule, classes, courses, users, majors, addCourse, showToast } =
    useAppStore();
  const navigate = useNavigate();

  const [formData, setFormData] = useState(emptyForm);
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [courseFormData, setCourseFormData] = useState({
    name: '',
    code: '',
    credit: 2,
    department: '',
  });

  const schedules = getSchedule();
  const teachers = users.filter((item) => item.role === 'teacher' || item.role === 'homeroom_teacher');
  const canArrange = user?.role === 'admin';
  const selectedMajor = majors.find((item) => item.id === formData.majorId);
  const filteredClasses = selectedMajor ? classes.filter((cls) => cls.major === selectedMajor.name) : classes;

  const handleAddCourse = () => {
    if (!courseFormData.name || !courseFormData.code) {
      showToast('请填写课程名称和代码', 'warning');
      return;
    }
    addCourse(courseFormData);
    showToast('课程创建成功', 'success');
    setShowAddCourse(false);
    setCourseFormData({ name: '', code: '', credit: 2, department: '' });
  };

  if (!canArrange) {
    return (
      <Layout currentPage="/schedule">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-gray-500">您没有权限安排课程</p>
            <Button variant="secondary" className="mt-4" onClick={() => navigate('/schedule')}>
              返回课表
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const handleSubmit = () => {
    if (!formData.classId || !formData.courseId || !formData.teacherId || !formData.classroom) {
      showToast('请填写完整信息', 'warning');
      return;
    }

    const cls = classes.find((item) => item.id === formData.classId);
    const course = courses.find((item) => item.id === formData.courseId);
    const teacher = users.find((item) => item.id === formData.teacherId);

    const result = addSchedule({
      classId: formData.classId,
      className: cls?.name || '',
      courseId: formData.courseId,
      courseName: course?.name || '',
      teacherId: formData.teacherId,
      teacherName: teacher?.name || '',
      dayOfWeek: formData.dayOfWeek,
      period: formData.period,
      classroom: formData.classroom,
      startDate: formData.startDate || new Date().toISOString().split('T')[0],
      endDate: formData.endDate || '2024-06-28',
    });

    if (!result.ok) {
      showToast(result.message, 'error');
      return;
    }

    showToast(result.message, 'success');
    setFormData(emptyForm);
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除此课程安排吗？')) {
      deleteSchedule(id);
      showToast('删除成功', 'success');
    }
  };

  return (
    <Layout currentPage="/schedule/arrange">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/schedule')}
            className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors mr-4"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">课程安排</h2>
            <p className="text-gray-500 mt-1">为班级安排课程，自动检测时间冲突</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">新增课程安排</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">专业</label>
              <select
                value={formData.majorId}
                onChange={(e) => setFormData({ ...formData, majorId: e.target.value, classId: '' })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">全部专业</option>
                {majors.map((major) => (
                  <option key={major.id} value={major.id}>
                    {major.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">班级</label>
              <select
                value={formData.classId}
                onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">请选择班级</option>
                {filteredClasses.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">课程</label>
              <div className="flex gap-2">
                <select
                  value={formData.courseId}
                  onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">请选择课程</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => setShowAddCourse(true)}
                  className="px-3 rounded-lg border border-gray-300 text-gray-500 hover:text-primary-600"
                  title="新建课程"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">任课老师</label>
              <select
                value={formData.teacherId}
                onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">请选择老师</option>
                {teachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">星期</label>
                <select
                  value={formData.dayOfWeek}
                  onChange={(e) => setFormData({ ...formData, dayOfWeek: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  {weekDays.map((day, index) => (
                    <option key={day} value={index + 1}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">节次</label>
                <select
                  value={formData.period}
                  onChange={(e) => setFormData({ ...formData, period: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  {periodLabels.map((period, index) => (
                    <option key={period} value={index + 1}>
                      {period}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">教室</label>
              <input
                type="text"
                value={formData.classroom}
                onChange={(e) => setFormData({ ...formData, classroom: e.target.value })}
                placeholder="如: A101"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">开始日期</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">结束日期</label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
          </div>

          <Button onClick={handleSubmit} className="w-full mt-6">
            <Plus className="w-4 h-4 mr-2" />
            添加课程安排
          </Button>
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800">已安排课程</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">班级</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">课程</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">老师</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">时间</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">教室</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {schedules.length > 0 ? (
                  schedules.map((schedule) => (
                    <tr key={schedule.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-800">{schedule.className}</td>
                      <td className="px-6 py-4 text-sm text-gray-800">{schedule.courseName}</td>
                      <td className="px-6 py-4 text-sm text-gray-800">{schedule.teacherName}</td>
                      <td className="px-6 py-4 text-sm text-gray-800">
                        {weekDays[schedule.dayOfWeek - 1]} {periodLabels[schedule.period - 1]}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-800">{schedule.classroom}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleDelete(schedule.id)}
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
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                      暂无课程安排
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {showAddCourse && (
          <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <BookOpen className="w-5 h-5 mr-2" />
                新建课程
              </h3>
              <button onClick={() => setShowAddCourse(false)} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">课程名称</label>
                <input
                  type="text"
                  value={courseFormData.name}
                  onChange={(e) => setCourseFormData({ ...courseFormData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">课程代码</label>
                <input
                  type="text"
                  value={courseFormData.code}
                  onChange={(e) => setCourseFormData({ ...courseFormData, code: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">学分</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={courseFormData.credit}
                  onChange={(e) => setCourseFormData({ ...courseFormData, credit: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">所属学院</label>
                <select
                  value={courseFormData.department}
                  onChange={(e) => setCourseFormData({ ...courseFormData, department: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">请选择学院</option>
                  {[...new Set(majors.map((item) => item.department))].map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <Button variant="secondary" onClick={() => setShowAddCourse(false)}>
                取消
              </Button>
              <Button onClick={handleAddCourse}>
                <Plus className="w-4 h-4 mr-2" />
                创建课程
              </Button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ScheduleArrange;
