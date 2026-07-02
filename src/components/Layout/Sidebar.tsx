import { useState } from 'react';
import {
  LayoutDashboard,
  GraduationCap,
  BookOpen,
  ClipboardList,
  Calendar,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  FileText,
  Users,
  Clock,
} from 'lucide-react';
import { useAuthStore } from '@/store/useStore';
import { useNavigate } from 'react-router-dom';

interface SidebarProps {
  currentPage: string;
}

const Sidebar = ({ currentPage }: SidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: '首页' },
    { path: '/grades', icon: GraduationCap, label: '成绩管理' },
    { path: '/appeals', icon: FileText, label: '申诉管理' },
    { path: '/schedule', icon: Calendar, label: '课表管理' },
    { path: '/profile', icon: User, label: '个人中心' },
  ];

  const roleBasedItems = () => {
    if (!user) return [];
    switch (user.role) {
      case 'admin':
        return [
          { path: '/grades/register', icon: ClipboardList, label: '登记成绩' },
          { path: '/grades/review', icon: BookOpen, label: '复核成绩' },
          { path: '/schedule/arrange', icon: Calendar, label: '课程安排' },
          { path: '/exam', icon: Clock, label: '考试安排' },
          { path: '/users', icon: Users, label: '用户管理' },
        ];
      case 'teacher':
        return [{ path: '/grades/register', icon: ClipboardList, label: '登记成绩' }];
      case 'homeroom_teacher':
        return [{ path: '/grades/review', icon: BookOpen, label: '复核成绩' }];
      default:
        return [];
    }
  };

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-primary-600 text-white transition-all duration-300 z-50 ${
        collapsed ? 'w-16' : 'w-56'
      }`}
    >
      <div className="flex items-center h-16 px-4 border-b border-primary-500">
        {!collapsed && (
          <div className="text-lg font-bold">教务管理系统</div>
        )}
      </div>

      <nav className="flex-1 py-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <button
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center px-4 py-3 transition-colors ${
                  currentPage === item.path
                    ? 'bg-primary-500 text-white'
                    : 'hover:bg-primary-500/50 text-gray-200'
                }`}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {!collapsed && <span>{item.label}</span>}
              </button>
            </li>
          ))}
          {roleBasedItems().map((item) => (
            <li key={item.path}>
              <button
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center px-4 py-3 transition-colors ${
                  currentPage === item.path
                    ? 'bg-primary-500 text-white'
                    : 'hover:bg-primary-500/50 text-gray-200'
                }`}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {!collapsed && <span>{item.label}</span>}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t border-primary-500 p-4">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center py-2 text-gray-300 hover:text-white transition-colors"
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
        <button
          onClick={handleLogout}
          className="w-full flex items-center px-4 py-3 mt-2 text-gray-300 hover:text-white hover:bg-primary-500/50 transition-colors"
        >
          <LogOut className="w-5 h-5 mr-3" />
          {!collapsed && <span>退出登录</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;