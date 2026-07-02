import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, GraduationCap, Building2, Lock, AlertCircle, X, UserPlus } from 'lucide-react';
import { useAuthStore, useUserManagementStore, useGradeStore } from '@/store/useStore';
import Button from '@/components/Button/Button';

type IdentityType = 'student' | 'teacher' | 'admin';

const Login = () => {
  const [identity, setIdentity] = useState<IdentityType>('student');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showRegister, setShowRegister] = useState(false);
  const [registerForm, setRegisterForm] = useState({
    name: '',
    username: '',
    password: '',
    confirmPassword: '',
    idCard: '',
    classId: '',
  });
  const { login } = useAuthStore();
  const { addUser } = useUserManagementStore();
  const { classes } = useGradeStore();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!username || !password) {
      setError('请输入账号和密码');
      return;
    }

    const success = login(username, password, identity);
    if (success) {
      navigate('/dashboard');
    } else {
      setError('账号或密码错误');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!registerForm.name || !registerForm.username || !registerForm.password || !registerForm.idCard) {
      setError('请填写完整信息');
      return;
    }

    if (registerForm.password !== registerForm.confirmPassword) {
      setError('两次密码输入不一致');
      return;
    }

    if (registerForm.password.length < 6) {
      setError('密码长度至少6位');
      return;
    }

    const success = addUser({
      name: registerForm.name,
      username: registerForm.username,
      password: registerForm.password,
      role: 'student',
      classId: registerForm.classId || undefined,
    });

    if (success) {
      alert('注册成功，请登录');
      setShowRegister(false);
      setRegisterForm({
        name: '',
        username: '',
        password: '',
        confirmPassword: '',
        idCard: '',
        classId: '',
      });
    } else {
      setError('用户名已存在');
    }
  };

  const identityOptions: { value: IdentityType; label: string; icon: typeof User }[] = [
    { value: 'student', label: '学生', icon: GraduationCap },
    { value: 'teacher', label: '老师', icon: User },
    { value: 'admin', label: '教务', icon: Building2 },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {showRegister ? (
            <>
              <div className="bg-primary-600 px-6 py-8 text-center">
                <h1 className="text-2xl font-bold text-white">学生注册</h1>
                <p className="text-primary-100 mt-2">填写信息完成注册</p>
              </div>
              
              <div className="p-6">
                <form onSubmit={handleRegister}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">姓名</label>
                      <input
                        type="text"
                        value={registerForm.name}
                        onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                        placeholder="请输入姓名"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">学号</label>
                      <input
                        type="text"
                        value={registerForm.username}
                        onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
                        placeholder="请输入学号"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">身份证号</label>
                      <input
                        type="text"
                        value={registerForm.idCard}
                        onChange={(e) => setRegisterForm({ ...registerForm, idCard: e.target.value })}
                        placeholder="请输入身份证号"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">班级（选填）</label>
                      <select
                        value={registerForm.classId}
                        onChange={(e) => setRegisterForm({ ...registerForm, classId: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                      >
                        <option value="">请选择班级</option>
                        {classes.map((cls) => (
                          <option key={cls.id} value={cls.id}>{cls.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">密码</label>
                      <input
                        type="password"
                        value={registerForm.password}
                        onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                        placeholder="请输入密码（至少6位）"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">确认密码</label>
                      <input
                        type="password"
                        value={registerForm.confirmPassword}
                        onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                        placeholder="请再次输入密码"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                      />
                    </div>
                    
                    {error && (
                      <div className="flex items-center text-red-600 bg-red-50 px-4 py-2 rounded-lg">
                        <AlertCircle className="w-4 h-4 mr-2" />
                        <span className="text-sm">{error}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex space-x-3 mt-6">
                    <Button variant="secondary" size="lg" className="flex-1" onClick={() => setShowRegister(false)}>
                      <X className="w-4 h-4 mr-2" />
                      取消
                    </Button>
                    <Button type="submit" variant="primary" size="lg" className="flex-1">
                      <UserPlus className="w-4 h-4 mr-2" />
                      注册
                    </Button>
                  </div>
                </form>
              </div>
            </>
          ) : (
            <>
              <div className="bg-primary-600 px-6 py-8 text-center">
                <h1 className="text-2xl font-bold text-white">教务管理系统</h1>
                <p className="text-primary-100 mt-2">请选择身份登录</p>
              </div>
              
              <div className="p-6">
                <div className="flex justify-center space-x-4 mb-6">
                  {identityOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setIdentity(option.value)}
                      className={`flex flex-col items-center p-4 rounded-xl transition-all ${
                        identity === option.value
                          ? 'bg-primary-100 text-primary-700 shadow-md'
                          : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                      }`}
                    >
                      <option.icon className="w-8 h-8 mb-2" />
                      <span className="text-sm font-medium">{option.label}</span>
                    </button>
                  ))}
                </div>
                
                <form onSubmit={handleSubmit}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {identity === 'student' ? '学号' : identity === 'teacher' ? '教师编号' : '账号'}
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          placeholder={identity === 'student' ? '请输入学号' : identity === 'teacher' ? '请输入教师编号' : '请输入账号'}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">密码</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="请输入密码"
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                        />
                      </div>
                    </div>
                    
                    {error && (
                      <div className="flex items-center text-red-600 bg-red-50 px-4 py-2 rounded-lg">
                        <AlertCircle className="w-4 h-4 mr-2" />
                        <span className="text-sm">{error}</span>
                      </div>
                    )}
                  </div>
                  
                  <Button type="submit" variant="primary" size="lg" className="w-full mt-6">
                    登录
                  </Button>
                </form>
                
                <div className="mt-6 text-center">
                  {identity === 'student' && (
                    <button
                      onClick={() => setShowRegister(true)}
                      className="text-primary-600 hover:text-primary-700 text-sm font-medium mb-4"
                    >
                      <UserPlus className="w-4 h-4 inline mr-1" />
                      学生注册
                    </button>
                  )}
                  <p className="text-sm text-gray-500">
                    默认密码: 123456
                  </p>
                  <div className="flex justify-center space-x-6 mt-4 text-xs text-gray-400">
                    <span>学生: 2024001</span>
                    <span>老师: t001</span>
                    <span>教务: admin</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;