import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, UserPlus, BookOpen, Building2 } from 'lucide-react';
import Layout from '@/components/Layout/Layout';
import { useAppStore } from '@/store/useStore';
import Button from '@/components/Button/Button';
import { User } from '@/types';
import { roleLabels } from '@/utils/labels';

const UserManagement = () => {
  const { user, users, majors, addUser, deleteUser, classes, addClass, deleteClass, showToast } = useAppStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'student' | 'teacher' | 'class'>('student');
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    role: 'student' as User['role'],
    classId: '',
    majorId: '',
    department: '',
  });
  const [classFormData, setClassFormData] = useState({
    name: '',
    grade: '2024',
    major: '',
    homeroomTeacherId: '',
  });

  const canManage = user?.role === 'admin';
  const homeroomTeachers = users.filter((item) => item.role === 'homeroom_teacher');

  if (!canManage) {
    return (
      <Layout currentPage="/users">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-gray-500">您没有权限管理用户</p>
            <Button variant="secondary" className="mt-4" onClick={() => navigate('/dashboard')}>
              返回首页
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const filteredUsers = users.filter((item) =>
    activeTab === 'student' ? item.role === 'student' : item.role === 'teacher' || item.role === 'homeroom_teacher'
  );

  const handleSubmit = () => {
    if (!formData.name || !formData.username || !formData.password) {
      showToast('请填写完整信息', 'warning');
      return;
    }
    if (formData.password.length < 6) {
      showToast('密码长度至少6位', 'warning');
      return;
    }

    const majorInfo = majors.find((item) => item.id === formData.majorId);
    const success = addUser({
      name: formData.name,
      username: formData.username,
      password: formData.password,
      role: formData.role,
      classId: formData.role === 'student' || formData.role === 'homeroom_teacher' ? formData.classId : undefined,
      department: formData.role !== 'student' ? majorInfo?.department || formData.department : undefined,
    });

    if (success) {
      showToast('用户创建成功，可立即登录', 'success');
      setFormData({
        name: '',
        username: '',
        password: '',
        role: activeTab === 'student' ? 'student' : 'teacher',
        classId: '',
        majorId: '',
        department: '',
      });
    } else {
      showToast('用户名已存在', 'error');
    }
  };

  const handleDelete = (id: string) => {
    if (id === user?.id) {
      showToast('不能删除当前登录账号', 'warning');
      return;
    }
    if (confirm('确定要删除此用户吗？')) {
      deleteUser(id);
      showToast('删除成功', 'success');
    }
  };

  const handleAddClass = () => {
    if (!classFormData.name || !classFormData.grade || !classFormData.major) {
      showToast('请填写班级名称、年级和专业', 'warning');
      return;
    }
    addClass(classFormData);
    showToast('班级创建成功', 'success');
    setClassFormData({ name: '', grade: '2024', major: '', homeroomTeacherId: '' });
  };

  return (
    <Layout currentPage="/users">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors mr-4"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">用户管理</h2>
            <p className="text-gray-500 mt-1">管理学生、老师和班级</p>
          </div>
        </div>
      </div>

      <div className="flex space-x-2 mb-6">
        <Button
          variant={activeTab === 'student' ? 'primary' : 'secondary'}
          onClick={() => {
            setActiveTab('student');
            setFormData({ ...formData, role: 'student' });
          }}
        >
          <BookOpen className="w-4 h-4 mr-2" />
          学生
        </Button>
        <Button
          variant={activeTab === 'teacher' ? 'primary' : 'secondary'}
          onClick={() => {
            setActiveTab('teacher');
            setFormData({ ...formData, role: 'teacher' });
          }}
        >
          <UserPlus className="w-4 h-4 mr-2" />
          老师
        </Button>
        <Button variant={activeTab === 'class' ? 'primary' : 'secondary'} onClick={() => setActiveTab('class')}>
          <Building2 className="w-4 h-4 mr-2" />
          班级
        </Button>
      </div>

      {activeTab !== 'class' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {activeTab === 'student' ? '新增学生' : '新增老师'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">姓名</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">账号</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">密码</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="至少6位"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              {activeTab === 'teacher' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">角色类型</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as User['role'] })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="teacher">任课老师</option>
                    <option value="homeroom_teacher">班主任老师</option>
                  </select>
                </div>
              )}
              {(activeTab === 'student' || formData.role === 'homeroom_teacher') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">班级</label>
                  <select
                    value={formData.classId}
                    onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">请选择班级</option>
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {activeTab === 'teacher' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">所属学院</label>
                  <select
                    value={formData.majorId}
                    onChange={(e) => {
                      const major = majors.find((item) => item.id === e.target.value);
                      setFormData({
                        ...formData,
                        majorId: e.target.value,
                        department: major?.department || '',
                      });
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">请选择学院</option>
                    {[...new Map(majors.map((item) => [item.department, item])).values()].map((major) => (
                      <option key={major.department} value={major.id}>
                        {major.department}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            <Button onClick={handleSubmit} className="w-full mt-6">
              <Plus className="w-4 h-4 mr-2" />
              创建账号
            </Button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800">
                {activeTab === 'student' ? '学生列表' : '老师列表'}
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">姓名</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">账号</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">角色</th>
                    {activeTab === 'student' && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">班级</th>
                    )}
                    {activeTab === 'teacher' && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">学院</th>
                    )}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredUsers.map((item) => {
                    const cls = classes.find((c) => c.id === item.classId);
                    return (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-800">{item.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-800">{item.username}</td>
                        <td className="px-6 py-4 text-sm text-gray-800">{roleLabels[item.role]}</td>
                        {activeTab === 'student' && (
                          <td className="px-6 py-4 text-sm text-gray-800">{cls?.name || '-'}</td>
                        )}
                        {activeTab === 'teacher' && (
                          <td className="px-6 py-4 text-sm text-gray-800">{item.department || '-'}</td>
                        )}
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                          >
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
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">新增班级</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">班级名称</label>
                <input
                  type="text"
                  value={classFormData.name}
                  onChange={(e) => setClassFormData({ ...classFormData, name: e.target.value })}
                  placeholder="如：计算机2403班"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">年级</label>
                <input
                  type="text"
                  value={classFormData.grade}
                  onChange={(e) => setClassFormData({ ...classFormData, grade: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">专业</label>
                <select
                  value={classFormData.major}
                  onChange={(e) => setClassFormData({ ...classFormData, major: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">请选择专业</option>
                  {majors.map((major) => (
                    <option key={major.id} value={major.name}>
                      {major.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">班主任</label>
                <select
                  value={classFormData.homeroomTeacherId}
                  onChange={(e) => setClassFormData({ ...classFormData, homeroomTeacherId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">请选择班主任</option>
                  {homeroomTeachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <Button onClick={handleAddClass} className="w-full mt-6">
              <Plus className="w-4 h-4 mr-2" />
              创建班级
            </Button>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800">班级列表</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">名称</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">年级</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">专业</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">人数</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {classes.map((cls) => (
                    <tr key={cls.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-800">{cls.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-800">{cls.grade}</td>
                      <td className="px-6 py-4 text-sm text-gray-800">{cls.major}</td>
                      <td className="px-6 py-4 text-sm text-gray-800">
                        {users.filter((item) => item.role === 'student' && item.classId === cls.id).length}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => {
                            if (confirm('确定删除该班级？')) {
                              deleteClass(cls.id);
                              showToast('班级已删除', 'success');
                            }
                          }}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
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
