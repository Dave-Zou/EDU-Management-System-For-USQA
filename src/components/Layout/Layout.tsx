import { ReactNode, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { useAppStore } from '@/store/useStore';
import useMediaQuery from '@/hooks/useMediaQuery';

interface LayoutProps {
  children: ReactNode;
  currentPage: string;
}

const Layout = ({ children, currentPage }: LayoutProps) => {
  const sidebarCollapsed = useAppStore((state) => state.sidebarCollapsed);
  const setSidebarCollapsed = useAppStore((state) => state.setSidebarCollapsed);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const contentOffset = isMobile ? 'ml-0' : sidebarCollapsed ? 'ml-16' : 'ml-56';

  useEffect(() => {
    if (isMobile) setSidebarCollapsed(true);
  }, [isMobile, setSidebarCollapsed]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar currentPage={currentPage} />
      <div className={`${contentOffset} transition-all duration-300`}>
        <Header />
        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
