import { useState } from 'react';
import { User, Lock, Mail, GraduationCap, Building2, KeyRound, Copy, RefreshCw } from 'lucide-react';
import Layout from '@/components/Layout/Layout';
import { useAuthStore, useGradeStore, useAppStore, useToastStore } from '@/store/useStore';
import Button from '@/components/Button/Button';
import Modal from '@/components/Modal/Modal';
import { ROLE_LABELS } from '@/utils/labels';

const Profile = () => {
  const { user, changePassword, syncUser } = useAuthStore();
  const { classes } = useGradeStore();
  const { authCodes, generateAuthCode, resetDemoData } = useAppStore();
  const { showToast } = useToastStore();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const className = classes.find((c) => c.id === user?.classId)?.name;
  const myCodes = authCodes.filter((c) => user?.role === 'admin' || c.createdBy === user?.id);
  const canManageCodes = user?.role === 'admin' || user?.role === 'teacher' || user?.role === 'homeroom_teacher';

  const handlePasswordChange = () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      showToast('请填写所有密码字段', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('新密码和确认密码不一致', 'error');
      return;
    }
    const result = changePassword(oldPassword, newPassword);
    if (!result.ok) {
      showToast(result.message, 'error');
      return;
    }
    showToast('密码修改成功，下次请使用新密码登录', 'success');
    setIsPasswordModalOpen(false);
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const infoItems = [
    { label: '姓名', value: user?.name, icon: User },
    { label: '身份', value: user ? ROLE_LABELS[user.role] : '', icon: GraduationCap },
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center mb-6">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mr-4">
                <User className="w-8 h-8 text-primary-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800">{user?.name}</h3>
                <p className="text-gray-500">{user ? ROLE_LABELS[user.role] : ''}</p>
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

          {canManageCodes && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  <KeyRound className="w-5 h-5 mr-2" />
                  申诉授权码
                </h3>
                <Button
                  size="sm"
                  onClick={() => {
                    if (!user) return;
                    const code = generateAuthCode(user.id, user.name);
                    showToast(`已生成授权码 ${code}`, 'success');
                  }}
                >
                  生成新授权码
                </Button>
              </div>
              <p className="text-sm text-gray-500 mb-4">学生提交成绩申诉时需要填写授权码，请妥善发放。</p>
              <div className="space-y-2">
                {myCodes.length > 0 ? (
                  myCodes.map((item) => (
                    <div key={item.code} className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-mono font-medium text-gray-800">{item.code}</p>
                        <p className="text-xs text-gray-500">
                          {item.createdByName} · {item.createdAt}
                        </p>
                      </div>
                      <button
                        type="button"
                        className="p-2 text-gray-500 hover:text-primary-600"
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(item.code);
                            showToast('已复制授权码', 'success');
                          } catch {
                            showToast('复制失败，请手动复制', 'error');
                          }
                        }}
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-400">暂无授权码</p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">账户安全</h3>
            <Button
              variant="secondary"
              className="w-full flex items-center justify-center"
              onClick={() => setIsPasswordModalOpen(true)}
            >
              <Lock className="w-4 h-4 mr-2" />
              修改密码
            </Button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">系统提示</h3>
            <div className="space-y-3">
              <div className="flex items-start">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></div>
                <p className="text-sm text-gray-600">请妥善保管您的账号密码</p>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></div>
                <p className="text-sm text-gray-600">定期更换密码以保障账户安全</p>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></div>
                <p className="text-sm text-gray-600">如遇问题请联系教务管理员</p>
              </div>
            </div>
          </div>

          {user?.role === 'admin' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">演示数据</h3>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  if (confirm('将恢复初始演示数据，当前本地修改会丢失。')) {
                    resetDemoData();
                    syncUser();
                    showToast('已恢复演示数据', 'success');
                  }
                }}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                恢复演示数据
              </Button>
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={isPasswordModalOpen} onClose={() => setIsPasswordModalOpen(false)} title="修改密码">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">旧密码</label>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="请输入旧密码"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">新密码</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="至少 6 位"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">确认新密码</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="请再次输入新密码"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div className="flex justify-end space-x-4">
            <Button variant="secondary" onClick={() => setIsPasswordModalOpen(false)}>
              取消
            </Button>
            <Button onClick={handlePasswordChange}>确认修改</Button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
};

export default Profile;
