import { ReactNode } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

interface LayoutProps {
  children: ReactNode;
  currentPage: string;
}

const Layout = ({ children, currentPage }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar currentPage={currentPage} />
      <div className="ml-56 transition-all duration-300">
        <Header />
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;