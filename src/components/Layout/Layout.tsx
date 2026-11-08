import { ReactNode, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { useUIStore } from '@/store/useStore';

interface LayoutProps {
  children: ReactNode;
  currentPage: string;
}

const Layout = ({ children, currentPage }: LayoutProps) => {
  const { collapsed, mobileOpen, setMobileOpen } = useUIStore();

  useEffect(() => {
    setMobileOpen(false);
  }, [currentPage, setMobileOpen]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar currentPage={currentPage} />
      {mobileOpen && (
        <button
          type="button"
          aria-label="关闭菜单"
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <div
        className={`min-h-screen transition-all duration-300 ${
          collapsed ? 'md:ml-16' : 'md:ml-56'
        }`}
      >
        <Header />
        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
