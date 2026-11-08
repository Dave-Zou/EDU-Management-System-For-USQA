import { ReactNode, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { getNavItems } from './navigation';
import { useAuthStore } from '@/store/useStore';

interface LayoutProps {
  children: ReactNode;
  currentPage: string;
}

const Layout = ({ children, currentPage }: LayoutProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const items = getNavItems(user?.role);

  return (
    <div className={`min-h-screen bg-gray-50 transition-all duration-300 ${collapsed ? 'md:pl-16' : 'md:pl-56'}`}>
      <Sidebar
        currentPage={currentPage}
        collapsed={collapsed}
        items={items}
        onToggle={() => setCollapsed((value) => !value)}
      />
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 p-4 md:p-6 pb-24 md:pb-6">{children}</main>
      </div>
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-gray-200 flex overflow-x-auto">
        {items.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center justify-center min-w-[4.5rem] px-2 py-2 text-[11px] ${
              currentPage === item.path ? 'text-primary-600' : 'text-gray-500'
            }`}
          >
            <item.icon className="w-5 h-5 mb-1" />
            <span className="truncate max-w-[4.5rem]">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Layout;
