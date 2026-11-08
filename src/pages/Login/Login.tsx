import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, GraduationCap, Building2, Lock, AlertCircle, X, UserPlus, RefreshCw } from 'lucide-react';
import { useAuthStore, useUserManagementStore, useGradeStore } from '@/store/useStore';
import Button from '@/components/Button/Button';
import { isValidIdCard } from '@/utils/academic';

type IdentityType = 'student' | 'teacher' | 'admin';

const captchaChars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

const createCaptcha = () =>
  Array.from({ length: 4 }, () => captchaChars[Math.floor(Math.random() * captchaChars.length)]).join('');

const Login = () => {
  const [identity, setIdentity] = useState<IdentityType>('student');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [captcha, setCaptcha] = useState(createCaptcha);
  const [captchaInput, setCaptchaInput] = useState('');
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
  const { login, isLoggedIn } = useAuthStore();
  const { addUser } = useUserManagementStore();
  const { classes } = useGradeStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoggedIn) navigate('/dashboard', { replace: true });
  }, [isLoggedIn, navigate]);

  const refreshCaptcha = () => {
    setCaptcha(createCaptcha());
    setCaptchaInput('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('请输入账号和密码');
      return;
    }
    if (captchaInput.trim().toUpperCase() !== captcha) {
      setError('验证码错误');
      refreshCaptcha();
      return;
    }

    const success = login(username.trim(), password, identity);
    if (success) {
      navigate('/dashboard');
    } else {
      setError('账号、密码或身份不匹配');
      refreshCaptcha();
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!registerForm.name || !registerForm.username || !registerForm.password || !registerForm.idCard || !registerForm.classId) {
      setError('请填写完整信息并选择班级');
      return;
    }
    if (!isValidIdCard(registerForm.idCard)) {
      setError('请输入 18 位身份证号');
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

    const result = addUser({
      name: registerForm.name.trim(),
      username: registerForm.username.trim(),
      password: registerForm.password,
      role: 'student',
      classId: registerForm.classId,
      idCard: registerForm.idCard.trim().toUpperCase(),
    });

    if (result.ok) {
      setShowRegister(false);
      setUsername(registerForm.username.trim());
      setIdentity('student');
      setError('');
      setRegisterForm({
        name: '',
        username: '',
        password: '',
        confirmPassword: '',
        idCard: '',
        classId: '',
      });
      refreshCaptcha();
    } else {
      setError(result.message);
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
                        placeholder="请输入 18 位身份证号"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">班级</label>
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
                    <Button variant="secondary" size="lg" className="flex-1" onClick={() => { setShowRegister(false); setError(''); }}>
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
                      type="button"
                      onClick={() => { setIdentity(option.value); setError(''); }}
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
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">验证码</label>
                      <div className="flex items-center gap-3">
                        <input
                          type="text"
                          value={captchaInput}
                          onChange={(e) => setCaptchaInput(e.target.value)}
                          placeholder="请输入验证码"
                          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                        />
                        <button
                          type="button"
                          onClick={refreshCaptcha}
                          className="flex items-center gap-2 px-3 py-3 rounded-lg bg-primary-50 text-primary-700 tracking-[0.3em] font-semibold"
                          title="换一张"
                        >
                          {captcha}
                          <RefreshCw className="w-4 h-4 tracking-normal" />
                        </button>
                      </div>
                    </div>
                    {error && (
                      <div className="flex items-center text-red-600 bg-red-50 px-4 py-2 rounded-lg">
                        <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
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
                      onClick={() => { setShowRegister(true); setError(''); }}
                      className="text-primary-600 hover:text-primary-700 text-sm font-medium mb-4"
                    >
                      <UserPlus className="w-4 h-4 inline mr-1" />
                      学生注册
                    </button>
                  )}
                  <p className="text-sm text-gray-500">默认密码: 123456</p>
                  <div className="mt-3 text-xs text-gray-400 space-y-1">
                    <p>学生 2024001 · 任课老师 t001 / t002</p>
                    <p>班主任 t003 / t004（从老师入口登录）· 教务 admin</p>
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
