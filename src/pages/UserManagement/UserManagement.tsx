import { useState } from 'react';
import { Plus, Trash2, UserPlus, BookOpen, Building2, Pencil } from 'lucide-react';
import Layout from '@/components/Layout/Layout';
import { useAuthStore, useUserManagementStore, useClassManagementStore } from '@/store/useStore';
import Button from '@/components/Button/Button';
import Feedback from '@/components/Feedback/Feedback';
import { User } from '@/types';

const roleLabels: Record<User['role'], string> = {
  student: '学生',
  teacher: '任课老师',
  homeroom_teacher: '班主任老师',
  admin: '教务管理员',
};

type Tab = 'student' | 'teacher' | 'class';

const UserManagement = () => {
  const { user } = useAuthStore();
  const { users, majors, addUser, deleteUser, updateUser } = useUserManagementStore();
  const { classes, addClass, deleteClass, updateClass } = useClassManagementStore();
  const [activeTab, setActiveTab] = useState<Tab>('student');
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    role: 'student' as User['role'],
    classId: '',
    department: '',
  });
  const [classForm, setClassForm] = useState({ name: '', grade: '2024', major: '', homeroomTeacherId: '' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editClassId, setEditClassId] = useState('');

  const canManage = user?.role === 'admin';
  const departments = [...new Set(majors.map((major) => major.department))];
  const homeroomTeachers = users.filter((item) => item.role === 'homeroom_teacher');
  const visibleUsers = users.filter((item) =>
    activeTab === 'student' ? item.role === 'student' : item.role === 'teacher' || item.role === 'homeroom_teacher'
  );

  if (!canManage) {
    return (
      <Layout currentPage="/users">
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">您没有权限管理用户</p>
        </div>
      </Layout>
    );
  }

  const handleSubmit = () => {
    if (!formData.name.trim() || !formData.username.trim() || !formData.password) {
      setFeedback({ type: 'err', text: '请填写姓名、账号和密码' });
      return;
    }
    if ((formData.role === 'student' || formData.role === 'homeroom_teacher') && !formData.classId) {
      setFeedback({ type: 'err', text: formData.role === 'student' ? '请选择学生班级' : '请选择班主任负责的班级' });
      return;
    }

    const result = addUser({
      name: formData.name.trim(),
      username: formData.username.trim(),
      password: formData.password,
      role: formData.role,
      classId: formData.role === 'student' || formData.role === 'homeroom_teacher' ? formData.classId : undefined,
      department: formData.role === 'student' ? undefined : formData.department || undefined,
    });
    if (!result.ok || !result.id) {
      setFeedback({ type: 'err', text: result.message });
      return;
    }

    if (formData.role === 'homeroom_teacher') {
      const previous = users.find((item) => item.role === 'homeroom_teacher' && item.classId === formData.classId);
      if (previous) updateUser(previous.id, { classId: undefined });
      updateClass(formData.classId, { homeroomTeacherId: result.id });
    }

    setFeedback({ type: 'ok', text: '账号已创建，可以使用该账号登录' });
    setFormData({
      name: '',
      username: '',
      password: '',
      role: activeTab === 'teacher' ? 'teacher' : 'student',
      classId: '',
      department: '',
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm('确定要删除此用户吗？')) return;
    const result = deleteUser(id);
    setFeedback({ type: result.ok ? 'ok' : 'err', text: result.message });
  };

  const saveStudentClass = (studentId: string) => {
    updateUser(studentId, { classId: editClassId || undefined });
    setEditingId(null);
    setFeedback({ type: 'ok', text: '学生班级已更新' });
  };

  const handleAddClass = () => {
    if (!classForm.name.trim() || !classForm.grade.trim() || !classForm.major) {
      setFeedback({ type: 'err', text: '请填写班级名称、年级和专业' });
      return;
    }
    const result = addClass({
      name: classForm.name,
      grade: classForm.grade.trim(),
      major: classForm.major,
      homeroomTeacherId: classForm.homeroomTeacherId,
    });
    if (!result.ok || !result.id) {
      setFeedback({ type: 'err', text: result.message });
      return;
    }
    if (classForm.homeroomTeacherId) {
      const previousClass = classes.find((item) => item.homeroomTeacherId === classForm.homeroomTeacherId);
      if (previousClass) updateClass(previousClass.id, { homeroomTeacherId: '' });
      updateUser(classForm.homeroomTeacherId, { classId: result.id });
    }
    setClassForm({ name: '', grade: '2024', major: '', homeroomTeacherId: '' });
    setFeedback({ type: 'ok', text: result.message });
  };

  const handleDeleteClass = (id: string) => {
    if (!confirm('确定要删除此班级吗？')) return;
    const result = deleteClass(id);
    setFeedback({ type: result.ok ? 'ok' : 'err', text: result.message });
  };

  return (
    <Layout currentPage="/users">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">用户管理</h2>
        <p className="text-gray-500 mt-1">管理学生、老师和班级。新建账号立即可以登录。</p>
      </div>
      <Feedback feedback={feedback} />

      <div className="flex flex-wrap gap-2 mb-6">
        <Button variant={activeTab === 'student' ? 'primary' : 'secondary'} onClick={() => { setActiveTab('student'); setFormData({ ...formData, role: 'student' }); }}>
          <BookOpen className="w-4 h-4 mr-2" />学生
        </Button>
        <Button variant={activeTab === 'teacher' ? 'primary' : 'secondary'} onClick={() => { setActiveTab('teacher'); setFormData({ ...formData, role: 'teacher' }); }}>
          <UserPlus className="w-4 h-4 mr-2" />老师
        </Button>
        <Button variant={activeTab === 'class' ? 'primary' : 'secondary'} onClick={() => setActiveTab('class')}>
          <Building2 className="w-4 h-4 mr-2" />班级
        </Button>
      </div>

      {activeTab === 'class' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">新增班级</h3>
            <input value={classForm.name} onChange={(e) => setClassForm({ ...classForm, name: e.target.value })} placeholder="班级名称" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
            <input value={classForm.grade} onChange={(e) => setClassForm({ ...classForm, grade: e.target.value })} placeholder="年级，如 2024" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
            <select value={classForm.major} onChange={(e) => setClassForm({ ...classForm, major: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg">
              <option value="">请选择专业</option>
              {majors.map((major) => <option key={major.id} value={major.name}>{major.name}</option>)}
            </select>
            <select value={classForm.homeroomTeacherId} onChange={(e) => setClassForm({ ...classForm, homeroomTeacherId: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg">
              <option value="">暂不指定班主任</option>
              {homeroomTeachers.map((teacher) => <option key={teacher.id} value={teacher.id}>{teacher.name}</option>)}
            </select>
            <Button onClick={handleAddClass} className="w-full"><Plus className="w-4 h-4 mr-2" />创建班级</Button>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100"><h3 className="text-lg font-semibold text-gray-800">班级列表</h3></div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">班级</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">专业</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">人数</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">班主任</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {classes.map((cls) => {
                    const count = users.filter((item) => item.role === 'student' && item.classId === cls.id).length;
                    const teacher = users.find((item) => item.id === cls.homeroomTeacherId);
                    return (
                      <tr key={cls.id}>
                        <td className="px-4 py-4 text-sm text-gray-800">{cls.name}</td>
                        <td className="px-4 py-4 text-sm text-gray-800">{cls.major}</td>
                        <td className="px-4 py-4 text-sm text-gray-800">{count}</td>
                        <td className="px-4 py-4 text-sm text-gray-800">{teacher?.name || '-'}</td>
                        <td className="px-4 py-4">
                          <button onClick={() => handleDeleteClass(cls.id)} className="p-2 text-gray-500 hover:text-red-600 rounded-lg" title="删除">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">{activeTab === 'student' ? '新增学生' : '新增老师'}</h3>
            <input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="姓名" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
            <input value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} placeholder="账号" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
            <input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder="密码（至少 6 位）" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
            {activeTab === 'teacher' && (
              <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value as User['role'] })} className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                <option value="teacher">任课老师</option>
                <option value="homeroom_teacher">班主任老师</option>
              </select>
            )}
            {(activeTab === 'student' || formData.role === 'homeroom_teacher') && (
              <select value={formData.classId} onChange={(e) => setFormData({ ...formData, classId: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                <option value="">请选择班级</option>
                {classes.map((cls) => <option key={cls.id} value={cls.id}>{cls.name}</option>)}
              </select>
            )}
            {activeTab === 'teacher' && (
              <select value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                <option value="">请选择学院</option>
                {departments.map((dept) => <option key={dept} value={dept}>{dept}</option>)}
              </select>
            )}
            <Button onClick={handleSubmit} className="w-full"><Plus className="w-4 h-4 mr-2" />创建账号</Button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800">{activeTab === 'student' ? '学生列表' : '老师列表'}</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">姓名</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">账号</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">角色</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{activeTab === 'student' ? '班级' : '学院'}</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {visibleUsers.map((item) => {
                    const cls = classes.find((entry) => entry.id === item.classId);
                    return (
                      <tr key={item.id}>
                        <td className="px-4 py-4 text-sm text-gray-800">{item.name}</td>
                        <td className="px-4 py-4 text-sm text-gray-800">{item.username}</td>
                        <td className="px-4 py-4 text-sm text-gray-800">{roleLabels[item.role]}</td>
                        <td className="px-4 py-4 text-sm text-gray-800">
                          {activeTab === 'student' ? (
                            editingId === item.id ? (
                              <div className="flex items-center gap-2">
                                <select value={editClassId} onChange={(e) => setEditClassId(e.target.value)} className="px-2 py-1 border border-gray-300 rounded">
                                  <option value="">未分班</option>
                                  {classes.map((entry) => <option key={entry.id} value={entry.id}>{entry.name}</option>)}
                                </select>
                                <Button size="sm" onClick={() => saveStudentClass(item.id)}>保存</Button>
                              </div>
                            ) : (cls?.name || '-')
                          ) : (item.department || '-')}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center">
                            {activeTab === 'student' && (
                              <button
                                onClick={() => { setEditingId(item.id); setEditClassId(item.classId || ''); }}
                                className="p-2 text-gray-500 hover:text-primary-600 rounded-lg"
                                title="调整班级"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                            )}
                            <button onClick={() => handleDelete(item.id)} className="p-2 text-gray-500 hover:text-red-600 rounded-lg" title="删除">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default UserManagement;
