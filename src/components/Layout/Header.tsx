import { useMemo, useState, useEffect, useRef } from 'react';
import { Bell, Settings, X, FileText, AlertCircle, CheckCircle, Menu } from 'lucide-react';
import { useAuthStore, useAppStore, useUIStore } from '@/store/useStore';
import { useNavigate } from 'react-router-dom';
import { ROLE_LABELS } from '@/utils/labels';

interface Notification {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'success';
  time: string;
  read: boolean;
  link?: string;
}

const Header = () => {
  const { user } = useAuthStore();
  const { grades, appeals, exams, setMobileOpen } = {
    ...useAppStore(),
    setMobileOpen: useUIStore((s) => s.setMobileOpen),
  };
  const navigate = useNavigate();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [readIds, setReadIds] = useState<string[]>([]);
  const notificationRef = useRef<HTMLDivElement>(null);

  const notifications = useMemo<Notification[]>(() => {
    if (!user) return [];
    const items: Notification[] = [];

    if (user.role === 'student') {
      const mine = grades.filter((g) => g.studentId === user.id);
      const pending = mine.filter((g) => g.status === 'pending').length;
      const reviewed = mine.filter((g) => g.status === 'reviewed').length;
      const myAppeals = appeals.filter((a) => a.studentId === user.id && a.status === 'pending').length;
      const upcoming = exams.filter((e) => e.classId === user.classId && e.examDate >= new Date().toISOString().slice(0, 10));
      if (pending) {
        items.push({
          id: 's-pending',
          title: '成绩待复核',
          content: `您有 ${pending} 条成绩正在复核中`,
          type: 'info',
          time: '刚刚',
          read: false,
          link: '/grades',
        });
      }
      if (reviewed) {
        items.push({
          id: 's-reviewed',
          title: '已发布成绩',
          content: `已有 ${reviewed} 条成绩完成复核，可查看或申诉`,
          type: 'success',
          time: '今天',
          read: false,
          link: '/grades',
        });
      }
      if (myAppeals) {
        items.push({
          id: 's-appeal',
          title: '申诉处理中',
          content: `您有 ${myAppeals} 条申诉等待审核`,
          type: 'warning',
          time: '今天',
          read: false,
          link: '/appeals',
        });
      }
      upcoming.slice(0, 2).forEach((exam) => {
        items.push({
          id: `s-exam-${exam.id}`,
          title: '即将考试',
          content: `${exam.courseName} · ${exam.examDate} ${exam.startTime} ${exam.classroom}`,
          type: 'warning',
          time: exam.examDate,
          read: false,
          link: '/exam',
        });
      });
    } else if (user.role === 'teacher') {
      const pendingAppeals = appeals.filter((a) => a.teacherId === user.id && a.status !== 'approved' && a.status !== 'rejected').length;
      const pendingGrades = grades.filter((g) => g.teacherId === user.id && g.status === 'pending').length;
      if (pendingGrades) {
        items.push({
          id: 't-grades',
          title: '成绩待复核',
          content: `您登记的 ${pendingGrades} 条成绩尚未复核`,
          type: 'info',
          time: '今天',
          read: false,
          link: '/grades',
        });
      }
      if (pendingAppeals) {
        items.push({
          id: 't-appeals',
          title: '学生申诉待处理',
          content: `有 ${pendingAppeals} 条成绩申诉需要您审核`,
          type: 'warning',
          time: '今天',
          read: false,
          link: '/appeals',
        });
      }
    } else if (user.role === 'homeroom_teacher') {
      const classGrades = grades.filter((g) => g.classId === user.classId && g.status === 'pending').length;
      const classAppeals = appeals.filter((a) => a.classId === user.classId && a.status === 'pending').length;
      if (classGrades) {
        items.push({
          id: 'h-review',
          title: '班级成绩待复核',
          content: `本班有 ${classGrades} 条成绩等待复核`,
          type: 'warning',
          time: '今天',
          read: false,
          link: '/grades/review',
        });
      }
      if (classAppeals) {
        items.push({
          id: 'h-appeals',
          title: '班级申诉待审核',
          content: `本班有 ${classAppeals} 条申诉待处理`,
          type: 'info',
          time: '今天',
          read: false,
          link: '/appeals',
        });
      }
    } else {
      const pending = grades.filter((g) => g.status === 'pending').length;
      const pendingAppeals = appeals.filter((a) => a.status === 'pending' || a.status === 'reviewing').length;
      if (pending) {
        items.push({
          id: 'a-review',
          title: '成绩复核待处理',
          content: `全校有 ${pending} 条成绩待复核`,
          type: 'warning',
          time: '今天',
          read: false,
          link: '/grades/review',
        });
      }
      if (pendingAppeals) {
        items.push({
          id: 'a-appeals',
          title: '申诉汇总',
          content: `当前有 ${pendingAppeals} 条申诉待处理`,
          type: 'info',
          time: '今天',
          read: false,
          link: '/appeals',
        });
      }
    }

    if (items.length === 0) {
      items.push({
        id: 'empty',
        title: '暂无新通知',
        content: '系统运行正常',
        type: 'success',
        time: '刚刚',
        read: true,
      });
    }

    return items.map((item) => ({ ...item, read: readIds.includes(item.id) || item.read }));
  }, [user, grades, appeals, exams, readIds]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'info':
        return <FileText className="w-4 h-4 text-blue-500" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-6 shadow-sm sticky top-0 z-30">
      <div className="flex items-center space-x-3">
        <button
          type="button"
          className="md:hidden p-2 text-gray-600 hover:text-primary-600"
          onClick={() => setMobileOpen(true)}
          aria-label="打开菜单"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-lg md:text-xl font-bold text-primary-600">教务管理系统</h1>
      </div>
      <div className="flex items-center space-x-3 md:space-x-6">
        <div className="relative" ref={notificationRef}>
          <button
            type="button"
            className={`relative p-2 transition-colors ${isNotificationOpen ? 'text-primary-600' : 'text-gray-500 hover:text-primary-600'}`}
            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>}
          </button>

          {isNotificationOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <h3 className="text-sm font-semibold text-gray-800">通知中心</h3>
                <button type="button" onClick={() => setIsNotificationOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="max-h-80 overflow-y-auto">
                {notifications.map((notification) => (
                  <button
                    type="button"
                    key={notification.id}
                    className={`w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                      !notification.read ? 'bg-blue-50/50' : ''
                    }`}
                    onClick={() => {
                      setReadIds((ids) => (ids.includes(notification.id) ? ids : [...ids, notification.id]));
                      if (notification.link) {
                        navigate(notification.link);
                        setIsNotificationOpen(false);
                      }
                    }}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="mt-0.5">{getNotificationIcon(notification.type)}</div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${!notification.read ? 'text-gray-800' : 'text-gray-600'}`}>
                          {notification.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">{notification.content}</p>
                        <p className="text-xs text-gray-400 mt-2">{notification.time}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        <button
          type="button"
          className="p-2 text-gray-500 hover:text-primary-600 transition-colors"
          onClick={() => navigate('/profile')}
        >
          <Settings className="w-5 h-5" />
        </button>
        <div className="flex items-center space-x-3 pl-3 md:pl-4 border-l border-gray-200">
          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
            <span className="text-primary-600 font-medium">{user?.name?.charAt(0)}</span>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-gray-800">{user?.name}</p>
            <p className="text-xs text-gray-500">{user ? ROLE_LABELS[user.role] : ''}</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
