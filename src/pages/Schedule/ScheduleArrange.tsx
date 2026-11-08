import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, BookOpen, Pencil } from 'lucide-react';
import Layout from '@/components/Layout/Layout';
import { useAuthStore, useScheduleStore, useGradeStore, useCourseManagementStore, useUserManagementStore } from '@/store/useStore';
import Button from '@/components/Button/Button';
import Modal from '@/components/Modal/Modal';
import Feedback from '@/components/Feedback/Feedback';

const days = ['周一', '周二', '周三', '周四', '周五'];
const periods = ['第1节', '第2节', '第3节', '第4节', '第5节', '第6节'];

const emptyForm = {
  classId: '',
  courseId: '',
  teacherId: '',
  majorId: '',
  dayOfWeek: 1,
  period: 1,
  classroom: '',
  startDate: '2026-09-07',
  endDate: '2027-01-15',
};

const ScheduleArrange = () => {
  const { user } = useAuthStore();
  const { getSchedule, addSchedule, updateSchedule, deleteSchedule } = useScheduleStore();
  const { classes, courses, users } = useGradeStore();
  const { majors } = useUserManagementStore();
  const { addCourse } = useCourseManagementStore();
  const navigate = useNavigate();

  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [courseFormData, setCourseFormData] = useState({ name: '', code: '', credit: 2, department: '' });

  const schedules = getSchedule();
  const teachers = users.filter((item) => item.role === 'teacher' || item.role === 'homeroom_teacher');
  const departments = [...new Set(majors.map((major) => major.department))];
  const selectedMajor = majors.find((major) => major.id === formData.majorId);
  const filteredClasses = selectedMajor ? classes.filter((cls) => cls.major === selectedMajor.name) : classes;
  const canArrange = user?.role === 'admin';

  const handleAddCourse = () => {
    const result = addCourse(courseFormData);
    if (!result.ok) {
      setFeedback({ type: 'err', text: result.message });
      return;
    }
    setFormData({ ...formData, courseId: result.id || '' });
    setShowAddCourse(false);
    setCourseFormData({ name: '', code: '', credit: 2, department: '' });
    setFeedback({ type: 'ok', text: result.message });
  };

  const handleSubmit = () => {
    if (!formData.classId || !formData.courseId || !formData.teacherId || !formData.classroom.trim()) {
      setFeedback({ type: 'err', text: '请填写班级、课程、老师和教室' });
      return;
    }
    const cls = classes.find((item) => item.id === formData.classId);
    const course = courses.find((item) => item.id === formData.courseId);
    const teacher = users.find((item) => item.id === formData.teacherId);
    const payload = {
      classId: formData.classId,
      className: cls?.name || '',
      courseId: formData.courseId,
      courseName: course?.name || '',
      teacherId: formData.teacherId,
      teacherName: teacher?.name || '',
      dayOfWeek: formData.dayOfWeek,
      period: formData.period,
      classroom: formData.classroom.trim(),
      startDate: formData.startDate,
      endDate: formData.endDate,
    };
    const result = editingId ? updateSchedule(editingId, payload) : addSchedule(payload);
    if (!result.ok) {
      setFeedback({ type: 'err', text: result.message });
      return;
    }
    setFeedback({ type: 'ok', text: result.message });
    setEditingId(null);
    setFormData(emptyForm);
  };

  const handleEdit = (id: string) => {
    const schedule = schedules.find((item) => item.id === id);
    if (!schedule) return;
    const cls = classes.find((item) => item.id === schedule.classId);
    const major = majors.find((item) => item.name === cls?.major);
    setEditingId(id);
    setFormData({
      classId: schedule.classId,
      courseId: schedule.courseId,
      teacherId: schedule.teacherId,
      majorId: major?.id || '',
      dayOfWeek: schedule.dayOfWeek,
      period: schedule.period,
      classroom: schedule.classroom,
      startDate: schedule.startDate,
      endDate: schedule.endDate,
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm('确定要删除此课程安排吗？')) return;
    deleteSchedule(id);
    if (editingId === id) {
      setEditingId(null);
      setFormData(emptyForm);
    }
    setFeedback({ type: 'ok', text: '已删除课程安排' });
  };

  if (!canArrange) {
    return (
      <Layout currentPage="/schedule/arrange">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-gray-500">您没有权限安排课程</p>
            <Button variant="secondary" className="mt-4" onClick={() => navigate('/schedule')}>返回课表</Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout currentPage="/schedule/arrange">
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate('/schedule')}
          className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors mr-4"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">课程安排</h2>
          <p className="text-gray-500 mt-1">同一时段不能排重班级、老师或教室</p>
        </div>
      </div>

      <Feedback feedback={feedback} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">{editingId ? '修改课程安排' : '新增课程安排'}</h3>
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
                  <option key={major.id} value={major.id}>{major.name}</option>
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
                  <option key={cls.id} value={cls.id}>{cls.name}</option>
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
                    <option key={course.id} value={course.id}>{course.name}</option>
                  ))}
                </select>
                <Button variant="secondary" onClick={() => setShowAddCourse(true)}>
                  <Plus className="w-4 h-4" />
                </Button>
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
                  <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
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
                  {days.map((day, index) => (
                    <option key={day} value={index + 1}>{day}</option>
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
                  {periods.map((period, index) => (
                    <option key={period} value={index + 1}>{period}</option>
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
          <div className="flex gap-3 mt-6">
            {editingId && (
              <Button variant="secondary" className="flex-1" onClick={() => { setEditingId(null); setFormData(emptyForm); }}>
                取消修改
              </Button>
            )}
            <Button onClick={handleSubmit} className="flex-1">
              <Plus className="w-4 h-4 mr-2" />
              {editingId ? '保存修改' : '添加课程安排'}
            </Button>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800">已安排课程</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">班级</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">课程</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">老师</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">时间</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">教室</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {schedules.length > 0 ? (
                  schedules.map((schedule) => (
                    <tr key={schedule.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-4 text-sm text-gray-800">{schedule.className}</td>
                      <td className="px-4 py-4 text-sm text-gray-800">{schedule.courseName}</td>
                      <td className="px-4 py-4 text-sm text-gray-800">{schedule.teacherName}</td>
                      <td className="px-4 py-4 text-sm text-gray-800">{days[schedule.dayOfWeek - 1]} {periods[schedule.period - 1]}</td>
                      <td className="px-4 py-4 text-sm text-gray-800">{schedule.classroom}</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center">
                          <button onClick={() => handleEdit(schedule.id)} className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg" title="编辑">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(schedule.id)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg" title="删除">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400">暂无课程安排</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Modal isOpen={showAddCourse} onClose={() => setShowAddCourse(false)} title="新建课程">
        <div className="space-y-4">
          <div className="flex items-center text-gray-700">
            <BookOpen className="w-4 h-4 mr-2" />
            <span className="text-sm">新建后会立刻出现在排课和成绩登记里</span>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">课程名称</label>
            <input
              type="text"
              value={courseFormData.name}
              onChange={(e) => setCourseFormData({ ...courseFormData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">课程代码</label>
            <input
              type="text"
              value={courseFormData.code}
              onChange={(e) => setCourseFormData({ ...courseFormData, code: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">学分</label>
              <input
                type="number"
                min="1"
                max="10"
                value={courseFormData.credit}
                onChange={(e) => setCourseFormData({ ...courseFormData, credit: Number(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">所属学院</label>
              <select
                value={courseFormData.department}
                onChange={(e) => setCourseFormData({ ...courseFormData, department: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">请选择学院</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setShowAddCourse(false)}>取消</Button>
            <Button onClick={handleAddCourse}>创建课程</Button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
};

export default ScheduleArrange;
