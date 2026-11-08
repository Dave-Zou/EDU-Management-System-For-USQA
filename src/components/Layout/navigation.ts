import {
  LayoutDashboard,
  GraduationCap,
  BookOpen,
  ClipboardList,
  Calendar,
  User,
  FileText,
  Users,
  Clock,
  type LucideIcon,
} from 'lucide-react';
import type { UserRole } from '@/types';

export interface NavItem {
  path: string;
  label: string;
  icon: LucideIcon;
}

export const getNavItems = (role?: UserRole): NavItem[] => {
  const items: NavItem[] = [
    { path: '/dashboard', label: '首页', icon: LayoutDashboard },
    { path: '/grades', label: '成绩管理', icon: GraduationCap },
  ];

  if (role === 'admin' || role === 'teacher') {
    items.push({ path: '/grades/register', label: '登记成绩', icon: ClipboardList });
  }
  if (role === 'admin' || role === 'homeroom_teacher') {
    items.push({ path: '/grades/review', label: '复核成绩', icon: BookOpen });
  }

  items.push(
    { path: '/appeals', label: '申诉管理', icon: FileText },
    { path: '/schedule', label: '课表管理', icon: Calendar }
  );

  if (role === 'admin') {
    items.push({ path: '/schedule/arrange', label: '课程安排', icon: Calendar });
  }

  items.push({ path: '/exam', label: '考试安排', icon: Clock });

  if (role === 'admin') {
    items.push({ path: '/users', label: '用户管理', icon: Users });
  }

  items.push({ path: '/profile', label: '个人中心', icon: User });
  return items;
};
