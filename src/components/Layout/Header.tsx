import { useEffect, useMemo, useRef, useState } from 'react';
import { Bell, Settings, X, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore, useAppealStore, useExamStore, useGradeStore } from '@/store/useStore';
import { addDays, formatISODate } from '@/utils/academic';

interface Notification {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'success';
  link: string;
}

const Header = () => {
  const { user } = useAuthStore();
  const { grades } = useGradeStore();
  const { appeals } = useAppealStore();
  const { exams } = useExamStore();
  const navigate = useNavigate();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [readIds, setReadIds] = useState<string[]>([]);
  const notificationRef = useRef<HTMLDivElement>(null);

  const notifications = useMemo<Notification[]>(() => {
    if (!user) return [];
    const items: Notification[] = [];
    const today = formatISODate(new Date());
    const soon = formatISODate(addDays(new Date(), 14));

    if (user.role === 'student') {
      const mine = grades.filter((grade) => grade.studentId === user.id);
      const pending = mine.filter((grade) => grade.status === 'pending').length;
      const rejected = mine.filter((grade) => grade.status === 'rejected').length;
      if (pending) items.push({ id: 'stu-pending', title: '成绩复核中', content: `${pending} 门成绩尚未复核`, type: 'info', link: '/grades' });
      if (rejected) items.push({ id: 'stu-rejected', title: '成绩被驳回', content: `${rejected} 门成绩被退回，等待老师重新登记`, type: 'warning', link: '/grades' });
      appeals
        .filter((appeal) => appeal.studentId === user.id && (appeal.status === 'approved' || appeal.status === 'rejected'))
        .forEach((appeal) => {
          items.push({
            id: `appeal-${appeal.id}`,
            title: appeal.status === 'approved' ? '申诉已批准' : '申诉已驳回',
            content: `${appeal.courseName}：${appeal.adminComment || appeal.teacherComment || appeal.homeroomComment || '请查看详情'}`,
            type: appeal.status === 'approved' ? 'success' : 'warning',
            link: '/appeals',
          });
        });
    }

    if (user.role === 'teacher') {
      const rejected = grades.filter((grade) => grade.teacherId === user.id && grade.status === 'rejected').length;
      const waiting = appeals.filter(
        (appeal) => appeal.teacherId === user.id && appeal.status === 'reviewing' && !appeal.teacherComment
      ).length;
      if (rejected) items.push({ id: 'tea-rejected', title: '成绩被驳回', content: `${rejected} 条成绩需要重新登记`, type: 'warning', link: '/grades' });
      if (waiting) items.push({ id: 'tea-appeal', title: '申诉待确认', content: `${waiting} 条申诉等待任课老师确认`, type: 'info', link: '/appeals' });
    }

    if (user.role === 'homeroom_teacher') {
      const pendingGrades = grades.filter((grade) => grade.classId === user.classId && grade.status === 'pending').length;
      const pendingAppeals = appeals.filter((appeal) => appeal.classId === user.classId && appeal.status === 'pending').length;
      if (pendingGrades) items.push({ id: 'home-grade', title: '班级成绩待复核', content: `${pendingGrades} 条成绩等待复核`, type: 'warning', link: '/grades/review' });
      if (pendingAppeals) items.push({ id: 'home-appeal', title: '班级申诉待初审', content: `${pendingAppeals} 条申诉等待初审`, type: 'info', link: '/appeals' });
    }

    if (user.role === 'admin') {
      const pendingGrades = grades.filter((grade) => grade.status === 'pending').length;
      const openAppeals = appeals.filter((appeal) => appeal.status === 'pending' || appeal.status === 'reviewing').length;
      if (pendingGrades) items.push({ id: 'admin-grade', title: '成绩待复核', content: `${pendingGrades} 条成绩等待复核`, type: 'warning', link: '/grades/review' });
      if (openAppeals) items.push({ id: 'admin-appeal', title: '申诉处理中', content: `${openAppeals} 条申诉尚未结束`, type: 'info', link: '/appeals' });
    }

    const upcoming = exams.filter((exam) => {
      if (exam.examDate < today || exam.examDate > soon) return false;
      if (user.role === 'student' || user.role === 'homeroom_teacher') return exam.classId === user.classId;
      if (user.role === 'teacher') return exam.teacherId === user.id;
      return true;
    });
    if (upcoming.length) {
      items.push({ id: 'upcoming-exam', title: '近期考试', content: `${upcoming.length} 场考试在两周内`, type: 'warning', link: '/exam' });
    }

    return items;
  }, [appeals, exams, grades, user]);

  const getRoleLabel = () => {
    switch (user?.role) {
      case 'student':
        return '学生';
      case 'teacher':
        return '任课老师';
      case 'homeroom_teacher':
        return '班主任老师';
      case 'admin':
        return '教务管理员';
      default:
        return '';
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((item) => !readIds.includes(item.id)).length;

  const getNotificationIcon = (type: Notification['type']) => {
    if (type === 'warning') return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    if (type === 'success') return <CheckCircle className="w-4 h-4 text-green-500" />;
    return <FileText className="w-4 h-4 text-blue-500" />;
  };

  const openNotification = (item: Notification) => {
    setReadIds((current) => (current.includes(item.id) ? current : [...current, item.id]));
    setIsNotificationOpen(false);
    navigate(item.link);
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-6 shadow-sm">
      <h1 className="text-lg md:text-xl font-bold text-primary-600 truncate">教务管理系统</h1>
      <div className="flex items-center space-x-2 sm:space-x-4">
        <div className="relative" ref={notificationRef}>
          <button
            className={`relative p-2 transition-colors ${isNotificationOpen ? 'text-primary-600' : 'text-gray-500 hover:text-primary-600'}`}
            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
            title="通知"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[1rem] h-4 px-1 bg-red-500 text-white text-[10px] leading-4 rounded-full text-center">
                {unreadCount}
              </span>
            )}
          </button>

          {isNotificationOpen && (
            <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <h3 className="text-sm font-semibold text-gray-800">通知中心</h3>
                <button onClick={() => setIsNotificationOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <button
                      key={notification.id}
                      onClick={() => openNotification(notification)}
                      className={`w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                        readIds.includes(notification.id) ? '' : 'bg-blue-50/50'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="mt-0.5">{getNotificationIcon(notification.type)}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800">{notification.title}</p>
                          <p className="text-xs text-gray-500 mt-1">{notification.content}</p>
                        </div>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-8 text-center text-gray-400">
                    <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">暂无待办通知</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        <button className="p-2 text-gray-500 hover:text-primary-600 transition-colors" onClick={() => navigate('/profile')} title="个人中心">
          <Settings className="w-5 h-5" />
        </button>
        <div className="flex items-center space-x-3 pl-2 sm:pl-4 border-l border-gray-200">
          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
            <span className="text-primary-600 font-medium">{user?.name?.charAt(0)}</span>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-gray-800">{user?.name}</p>
            <p className="text-xs text-gray-500">{getRoleLabel()}</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
