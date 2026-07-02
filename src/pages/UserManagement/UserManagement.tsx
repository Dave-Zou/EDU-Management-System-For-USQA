import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, UserPlus, BookOpen, Building2, Edit2 } from 'lucide-react';
import Layout from '@/components/Layout/Layout';
import { useAuthStore, useUserManagementStore, useGradeStore, useClassManagementStore } from '@/store/useStore';
import Button from '@/components/Button/Button';
import { User, Class } from '@/types';

const roleLabels: Record<User['role'], string> = {
  student: '学生',
  teacher: '任课老师',
  homeroom_teacher: '班主任老师',
  admin: '教务管理员',
};

const UserManagement = () => {
  const { user } = useAuthStore();
  const { users, majors, addUser, deleteUser } = useUserManagementStore();
  const { classes, users: allUsers } = useGradeStore();
  const { addClass } = useClassManagementStore();
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
    grade: '',
    major: '',
    homeroomTeacherId: '',
  });

  const [editingStudent, setEditingStudent] = useState<User | null>(null);
  const [editClassId, setEditClassId] = useState('');

  const canManage = user?.role === 'admin';

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

  const filteredUsers = users.filter((u) => 
    activeTab === 'student' ? u.role === 'student' : 
    u.role === 'teacher' || u.role === 'homeroom_teacher'
  );

  const handleSubmit = () => {
    if (!formData.name || !formData.username || !formData.password) {
      alert('请填写完整信息');
      return;
    }

    if (formData.password.length < 6) {
      alert('密码长度至少6位');
      return;
    }

    const classInfo = classes.find((c) => c.id === formData.classId);
    const majorInfo = majors.find((m) => m.id === formData.majorId);

    const success = addUser({
      name: formData.name,
      username: formData.username,
      password: formData.password,
      role: formData.role,
      classId: formData.role === 'student' ? formData.classId : undefined,
      department: formData.role !== 'student' ? (majorInfo?.department || formData.department) : undefined,
    });

    if (success) {
      alert('用户创建成功');
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
      alert('用户名已存在');
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除此用户吗？')) {
      deleteUser(id);
      alert('删除成功');
    }
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
            <p className="text-gray-500 mt-1">管理学生和老师账号</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            {activeTab === 'student' ? (
              <span className="flex items-center">
                <BookOpen className="w-5 h-5 mr-2" />
                新增学生
              </span>
            ) : (
              <span className="flex items-center">
                <UserPlus className="w-5 h-5 mr-2" />
                新增老师
              </span>
            )}
          </h3>

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
          </div>

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
            )}

            {activeTab === 'student' && (
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
            )}

            {activeTab === 'teacher' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">所属学院</label>
                <select
                  value={formData.majorId}
                  onChange={(e) => {
                    const major = majors.find((m) => m.id === e.target.value);
                    setFormData({ 
                      ...formData, 
                      majorId: e.target.value,
                      department: major?.department || ''
                    });
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">请选择学院</option>
                  {majors.map((major) => (
                    <option key={major.id} value={major.id}>{major.department}</option>
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
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => {
                    const cls = classes.find((c) => c.id === user.classId);
                    return (
                      <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm text-gray-800">{user.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-800">{user.username}</td>
                        <td className="px-6 py-4 text-sm text-gray-800">{roleLabels[user.role]}</td>
                        {activeTab === 'student' && (
                          <td className="px-6 py-4 text-sm text-gray-800">{cls?.name || '-'}</td>
                        )}
                        {activeTab === 'teacher' && (
                          <td className="px-6 py-4 text-sm text-gray-800">{user.department || '-'}</td>
                        )}
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleDelete(user.id)}
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
                    <td colSpan={activeTab === 'student' ? 5 : 5} className="px-6 py-12 text-center text-gray-400">
                      暂无{activeTab === 'student' ? '学生' : '老师'}
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

export default UserManagement;