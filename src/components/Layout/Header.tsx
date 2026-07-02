import { useState, useEffect, useRef } from 'react';
import { Bell, Settings, X, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuthStore } from '@/store/useStore';
import { useNavigate } from 'react-router-dom';

interface Notification {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'success';
  time: string;
  read: boolean;
}

const getNotificationsByRole = (role: string): Notification[] => {
  switch (role) {
    case 'student':
      return [
        { id: 's1', title: '成绩已更新', content: '您的高等数学成绩已发布，请及时查看', type: 'info', time: '5分钟前', read: false },
        { id: 's2', title: '课表调整通知', content: '下周一的计算机基础课程调整至B202教室', type: 'warning', time: '1小时前', read: false },
        { id: 's3', title: '申诉审核结果', content: '您的成绩申诉已被批准，成绩已更新', type: 'success', time: '昨天', read: true },
        { id: 's4', title: '新学期选课', content: '请在本周内完成新学期课程选择', type: 'info', time: '2天前', read: true },
      ];
    case 'teacher':
      return [
        { id: 't1', title: '成绩登记提醒', content: '您有3门课程的成绩尚未登记，请及时完成', type: 'warning', time: '10分钟前', read: false },
        { id: 't2', title: '课程安排更新', content: '您下周一的课程调整至B202教室', type: 'info', time: '30分钟前', read: false },
        { id: 't3', title: '学生申诉待处理', content: '有2条学生成绩申诉需要您审核', type: 'info', time: '2小时前', read: true },
        { id: 't4', title: '教学评估通知', content: '请在本周内完成学生教学评估', type: 'info', time: '3天前', read: true },
      ];
    case 'homeroom_teacher':
      return [
        { id: 'h1', title: '班级成绩汇总', content: '您班级的期末成绩已全部提交，请复核', type: 'info', time: '15分钟前', read: false },
        { id: 'h2', title: '学生申诉待审核', content: '有3条学生成绩申诉需要您审核', type: 'warning', time: '1小时前', read: false },
        { id: 'h3', title: '班会通知', content: '请于周五下午组织班级会议', type: 'info', time: '昨天', read: true },
        { id: 'h4', title: '学生考勤提醒', content: '本周有5名学生迟到，请关注', type: 'warning', time: '2天前', read: true },
      ];
    case 'admin':
      return [
        { id: 'a1', title: '成绩复核待处理', content: '有5条成绩需要您复核确认', type: 'warning', time: '5分钟前', read: false },
        { id: 'a2', title: '课程安排完成', content: '新学期课表已全部安排完毕', type: 'success', time: '30分钟前', read: false },
        { id: 'a3', title: '学生申诉汇总', content: '本周共收到8条成绩申诉', type: 'info', time: '1天前', read: true },
        { id: 'a4', title: '系统维护通知', content: '系统将于本周日晚进行维护升级', type: 'warning', time: '3天前', read: true },
      ];
    default:
      return [];
  }
};

const Header = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const notificationRef = useRef<HTMLDivElement>(null);

  const getRoleLabel = () => {
    if (!user) return '';
    switch (user.role) {
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
    if (user) {
      setNotifications(getNotificationsByRole(user.role));
    }
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

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
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm">
      <div className="flex items-center space-x-4">
        <h1 className="text-xl font-bold text-primary-600">教务管理系统</h1>
      </div>
      <div className="flex items-center space-x-6">
        <div className="relative" ref={notificationRef}>
          <button 
            className={`relative p-2 transition-colors ${isNotificationOpen ? 'text-primary-600' : 'text-gray-500 hover:text-primary-600'}`}
            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            )}
          </button>
          
          {isNotificationOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <h3 className="text-sm font-semibold text-gray-800">通知中心</h3>
                <button onClick={() => setIsNotificationOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="max-h-80 overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <div 
                      key={notification.id} 
                      className={`px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${!notification.read ? 'bg-blue-50/50' : ''}`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="mt-0.5">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium ${!notification.read ? 'text-gray-800' : 'text-gray-600'}`}>
                            {notification.title}
                          </p>
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                            {notification.content}
                          </p>
                          <p className="text-xs text-gray-400 mt-2">
                            {notification.time}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-8 text-center text-gray-400">
                    <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">暂无通知</p>
                  </div>
                )}
              </div>
              
              <div className="px-4 py-2 border-t border-gray-100">
                <button className="w-full text-sm text-primary-600 hover:text-primary-700 font-medium">
                  查看全部通知
                </button>
              </div>
            </div>
          )}
        </div>
        <button className="p-2 text-gray-500 hover:text-primary-600 transition-colors" onClick={() => navigate('/profile')}>
          <Settings className="w-5 h-5" />
        </button>
        <div className="flex items-center space-x-3 pl-4 border-l border-gray-200">
          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
            <span className="text-primary-600 font-medium">
              {user?.name?.charAt(0)}
            </span>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-gray-800">{user?.name}</p>
            <p className="text-xs text-gray-500">{getRoleLabel()}</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;