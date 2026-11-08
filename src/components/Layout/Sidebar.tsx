import { ChevronLeft, ChevronRight, LogOut } from 'lucide-react';
import { useAuthStore } from '@/store/useStore';
import { useNavigate } from 'react-router-dom';
import type { NavItem } from './navigation';

interface SidebarProps {
  currentPage: string;
  collapsed: boolean;
  items: NavItem[];
  onToggle: () => void;
}

const Sidebar = ({ currentPage, collapsed, items, onToggle }: SidebarProps) => {
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <aside
      className={`hidden md:flex fixed left-0 top-0 h-screen bg-primary-600 text-white transition-all duration-300 z-40 flex-col ${
        collapsed ? 'w-16' : 'w-56'
      }`}
    >
      <div className="flex items-center h-16 px-4 border-b border-primary-500">
        {!collapsed && <div className="text-lg font-bold truncate">教务管理系统</div>}
      </div>

      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1">
          {items.map((item) => (
            <li key={item.path}>
              <button
                onClick={() => navigate(item.path)}
                title={item.label}
                className={`w-full flex items-center py-3 transition-colors ${
                  collapsed ? 'justify-center px-2' : 'px-4'
                } ${
                  currentPage === item.path
                    ? 'bg-primary-500 text-white'
                    : 'hover:bg-primary-500/50 text-gray-200'
                }`}
              >
                <item.icon className={`w-5 h-5 shrink-0 ${collapsed ? '' : 'mr-3'}`} />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t border-primary-500 p-3">
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center py-2 text-gray-300 hover:text-white transition-colors"
          title={collapsed ? '展开菜单' : '收起菜单'}
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
        <button
          onClick={handleLogout}
          className={`w-full flex items-center py-3 mt-1 text-gray-300 hover:text-white hover:bg-primary-500/50 transition-colors ${
            collapsed ? 'justify-center px-2' : 'px-4'
          }`}
        >
          <LogOut className={`w-5 h-5 shrink-0 ${collapsed ? '' : 'mr-3'}`} />
          {!collapsed && <span>退出登录</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
