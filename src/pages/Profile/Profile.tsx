import { useState } from 'react';
import { User, Lock, Mail, GraduationCap, Building2 } from 'lucide-react';
import Layout from '@/components/Layout/Layout';
import { useAuthStore, useGradeStore } from '@/store/useStore';
import Button from '@/components/Button/Button';
import Modal from '@/components/Modal/Modal';
import Feedback from '@/components/Feedback/Feedback';

const Profile = () => {
  const { user, changePassword, resetData } = useAuthStore();
  const { classes } = useGradeStore();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [modalError, setModalError] = useState('');

  const className = classes.find((item) => item.id === user?.classId)?.name;

  const getRoleLabel = () => {
    switch (user?.role) {
      case 'student':
        return '学生';
      case 'teacher':
        return '任课老师';
      case 'homeroom_teacher':
        return '班主任老师';
      case 'admin':
        return '教务管理员';
      default:
        return '';
    }
  };

  const handlePasswordChange = () => {
    setModalError('');
    if (!oldPassword || !newPassword || !confirmPassword) {
      setModalError('请填写所有密码字段');
      return;
    }
    if (newPassword !== confirmPassword) {
      setModalError('新密码和确认密码不一致');
      return;
    }
    const result = changePassword(oldPassword, newPassword);
    if (!result.ok) {
      setModalError(result.message);
      return;
    }
    setFeedback({ type: 'ok', text: result.message });
    setIsPasswordModalOpen(false);
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleReset = () => {
    if (!confirm('恢复初始数据会清除注册账号、新成绩和新课表。当前登录账号如果是初始账号会保留登录。')) return;
    resetData();
    setFeedback({ type: 'ok', text: '已恢复初始演示数据' });
  };

  const infoItems = [
    { label: '姓名', value: user?.name, icon: User },
    { label: '身份', value: getRoleLabel(), icon: GraduationCap },
    { label: '账号', value: user?.username, icon: Mail },
    { label: '班级', value: className || '-', icon: Building2 },
    { label: '部门', value: user?.department || '-', icon: Building2 },
  ];

  return (
    <Layout currentPage="/profile">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">个人中心</h2>
        <p className="text-gray-500 mt-1">管理您的个人信息</p>
      </div>
      <Feedback feedback={feedback} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center mb-6">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mr-4">
                <User className="w-8 h-8 text-primary-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800">{user?.name}</h3>
                <p className="text-gray-500">{getRoleLabel()}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {infoItems.map((item) => (
                <div key={item.label} className="flex items-center p-4 bg-gray-50 rounded-lg">
                  <item.icon className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">{item.label}</p>
                    <p className="font-medium text-gray-800">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">账户安全</h3>
            <Button variant="secondary" className="w-full" onClick={() => { setModalError(''); setIsPasswordModalOpen(true); }}>
              <Lock className="w-4 h-4 mr-2" />
              修改密码
            </Button>
            {user?.role === 'admin' && (
              <Button variant="outline" className="w-full mt-3" onClick={handleReset}>
                恢复初始数据
              </Button>
            )}
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">系统提示</h3>
            <div className="space-y-3 text-sm text-gray-600">
              <p>成绩、课表和账号会保存在本机浏览器中，刷新后仍然在。</p>
              <p>修改成绩后需要重新复核。申诉通过后，分数会更新并再次进入复核。</p>
              <p>排课会检查班级、老师和教室是否在同一时段冲突。</p>
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={isPasswordModalOpen} onClose={() => setIsPasswordModalOpen(false)} title="修改密码">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">旧密码</label>
            <input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">新密码</label>
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="至少 6 位" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">确认新密码</label>
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
          </div>
          {modalError && <p className="text-sm text-red-600">{modalError}</p>}
          <div className="flex justify-end space-x-4">
            <Button variant="secondary" onClick={() => setIsPasswordModalOpen(false)}>取消</Button>
            <Button onClick={handlePasswordChange}>确认修改</Button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
};

export default Profile;
