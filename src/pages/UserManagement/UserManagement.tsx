import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, UserPlus, BookOpen, Building2 } from 'lucide-react';
import Layout from '@/components/Layout/Layout';
import { useAuthStore, useUserManagementStore, useGradeStore, useClassManagementStore, useToastStore } from '@/store/useStore';
import Button from '@/components/Button/Button';
import Pagination from '@/components/Pagination/Pagination';
import { User } from '@/types';
import { ROLE_LABELS } from '@/utils/labels';

const PAGE_SIZE = 8;

const UserManagement = () => {
  const { user } = useAuthStore();
  const { users, majors, addUser, deleteUser } = useUserManagementStore();
  const { classes } = useGradeStore();
  const { addClass, deleteClass } = useClassManagementStore();
  const { showToast } = useToastStore();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'student' | 'teacher' | 'class'>('student');
  const [page, setPage] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    role: 'student' as User['role'],
    classId: '',
    department: '',
  });
  const [classFormData, setClassFormData] = useState({
    name: '',
    grade: '2024',
    major: '',
    homeroomTeacherId: '',
  });

  const canManage = user?.role === 'admin';
  const teachers = users.filter((u) => u.role === 'teacher' || u.role === 'homeroom_teacher');
  const filteredUsers = users.filter((u) =>
    activeTab === 'student' ? u.role === 'student' : u.role === 'teacher' || u.role === 'homeroom_teacher'
  );
  const pagedUsers = filteredUsers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const pagedClasses = classes.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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

  const handleSubmit = () => {
    if (!formData.name || !formData.username || !formData.password) {
      showToast('请填写完整信息', 'error');
      return;
    }
    if (formData.password.length < 6) {
      showToast('密码长度至少6位', 'error');
      return;
    }
    if (formData.role === 'homeroom_teacher' && !formData.classId) {
      showToast('班主任需要选择负责班级', 'error');
      return;
    }

    const success = addUser({
      name: formData.name,
      username: formData.username.trim(),
      password: formData.password,
      role: formData.role,
      classId: formData.role === 'student' || formData.role === 'homeroom_teacher' ? formData.classId || undefined : undefined,
      department: formData.role !== 'student' ? formData.department : undefined,
    });

    if (success) {
      showToast('账号创建成功，可立即登录', 'success');
      setFormData({
        name: '',
        username: '',
        password: '',
        role: activeTab === 'student' ? 'student' : 'teacher',
        classId: '',
        department: '',
      });
    } else {
      showToast('用户名已存在', 'error');
    }
  };

  const handleAddClass = () => {
    if (!classFormData.name || !classFormData.major) {
      showToast('请填写班级名称和专业', 'error');
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
            type="button"
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
            setPage(1);
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
            setPage(1);
          }}
        >
          <UserPlus className="w-4 h-4 mr-2" />
          老师
        </Button>
        <Button
          variant={activeTab === 'class' ? 'primary' : 'secondary'}
          onClick={() => {
            setActiveTab('class');
            setPage(1);
          }}
        >
          <Building2 className="w-4 h-4 mr-2" />
          班级
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          {activeTab !== 'class' ? (
            <>
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
                    placeholder="请输入姓名"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">账号</label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="请输入账号"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">密码</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="请输入密码（至少6位）"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                {activeTab === 'teacher' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">角色类型</label>
                      <select
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value as User['role'] })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value="teacher">任课老师</option>
                        <option value="homeroom_teacher">班主任老师</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">所属学院</label>
                      <select
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value="">请选择学院</option>
                        {[...new Set(majors.map((m) => m.department))].map((dept) => (
                          <option key={dept} value={dept}>
                            {dept}
                          </option>
                        ))}
                      </select>
                    </div>
                  </>
                )}
                {(activeTab === 'student' || formData.role === 'homeroom_teacher') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">班级</label>
                    <select
                      value={formData.classId}
                      onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
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
                )}
              </div>
              <Button onClick={handleSubmit} className="w-full mt-6">
                <Plus className="w-4 h-4 mr-2" />
                创建账号
              </Button>
            </>
          ) : (
            <>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">新增班级</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">班级名称</label>
                  <input
                    type="text"
                    value={classFormData.name}
                    onChange={(e) => setClassFormData({ ...classFormData, name: e.target.value })}
                    placeholder="如：计算机2403班"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">年级</label>
                  <input
                    type="text"
                    value={classFormData.grade}
                    onChange={(e) => setClassFormData({ ...classFormData, grade: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">专业</label>
                  <select
                    value={classFormData.major}
                    onChange={(e) => setClassFormData({ ...classFormData, major: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">请选择班主任</option>
                    {teachers.map((teacher) => (
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
            </>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800">
              {activeTab === 'student' ? '学生列表' : activeTab === 'teacher' ? '老师列表' : '班级列表'}
            </h3>
          </div>
          <div className="overflow-x-auto">
            {activeTab === 'class' ? (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">班级</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">年级</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">专业</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">班主任</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">人数</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {pagedClasses.map((cls) => {
                    const teacher = users.find((u) => u.id === cls.homeroomTeacherId);
                    const count = users.filter((u) => u.role === 'student' && u.classId === cls.id).length;
                    return (
                      <tr key={cls.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm">{cls.name}</td>
                        <td className="px-6 py-4 text-sm">{cls.grade}</td>
                        <td className="px-6 py-4 text-sm">{cls.major}</td>
                        <td className="px-6 py-4 text-sm">{teacher?.name || '-'}</td>
                        <td className="px-6 py-4 text-sm">{count}</td>
                        <td className="px-6 py-4">
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm('确定删除该班级吗？')) {
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
                    );
                  })}
                </tbody>
              </table>
            ) : (
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
                  {pagedUsers.length > 0 ? (
                    pagedUsers.map((item) => {
                      const cls = classes.find((c) => c.id === item.classId);
                      return (
                        <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 text-sm text-gray-800">{item.name}</td>
                          <td className="px-6 py-4 text-sm text-gray-800">{item.username}</td>
                          <td className="px-6 py-4 text-sm text-gray-800">{ROLE_LABELS[item.role]}</td>
                          {activeTab === 'student' && (
                            <td className="px-6 py-4 text-sm text-gray-800">{cls?.name || '-'}</td>
                          )}
                          {activeTab === 'teacher' && (
                            <td className="px-6 py-4 text-sm text-gray-800">{item.department || '-'}</td>
                          )}
                          <td className="px-6 py-4">
                            <button
                              type="button"
                              onClick={() => {
                                if (item.id === user?.id) {
                                  showToast('不能删除当前登录账号', 'error');
                                  return;
                                }
                                if (confirm('确定要删除此用户吗？')) {
                                  deleteUser(item.id);
                                  showToast('用户已删除', 'success');
                                }
                              }}
                              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="删除"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                        暂无{activeTab === 'student' ? '学生' : '老师'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
          <Pagination
            page={page}
            pageSize={PAGE_SIZE}
            total={activeTab === 'class' ? classes.length : filteredUsers.length}
            onChange={setPage}
          />
        </div>
      </div>
    </Layout>
  );
};

export default UserManagement;
