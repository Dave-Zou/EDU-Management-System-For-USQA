import { useState, useEffect, useRef } from 'react';
import { Bell, Settings, X, FileText, AlertCircle, CheckCircle, Menu } from 'lucide-react';
import { useAuthStore, useAppStore } from '@/store/useStore';
import { useNavigate } from 'react-router-dom';
import { roleLabels } from '@/utils/labels';
import useMediaQuery from '@/hooks/useMediaQuery';
import { AppNotification } from '@/types';

const Header = () => {
  const { user } = useAuthStore();
  const {
    getNotificationsForUser,
    markNotificationRead,
    markAllNotificationsRead,
    setSidebarCollapsed,
    sidebarCollapsed,
  } = useAppStore();
  const navigate = useNavigate();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const notifications = getNotificationsForUser(user);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((item) => !item.read).length;

  const getNotificationIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <FileText className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-6 shadow-sm">
      <div className="flex items-center space-x-3">
        {isMobile && (
          <button
            className="p-2 text-gray-600 hover:text-primary-600"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            aria-label="打开菜单"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <h1 className="text-lg md:text-xl font-bold text-primary-600">教务管理系统</h1>
      </div>
      <div className="flex items-center space-x-4 md:space-x-6">
        <div className="relative" ref={notificationRef}>
          <button
            className={`relative p-2 transition-colors ${
              isNotificationOpen ? 'text-primary-600' : 'text-gray-500 hover:text-primary-600'
            }`}
            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-0.5 right-0.5 min-w-[16px] h-4 px-1 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
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
                    <button
                      key={notification.id}
                      onClick={() => markNotificationRead(notification.id)}
                      className={`w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                        !notification.read ? 'bg-blue-50/50' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="mt-0.5">{getNotificationIcon(notification.type)}</div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium ${!notification.read ? 'text-gray-800' : 'text-gray-600'}`}>
                            {notification.title}
                          </p>
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{notification.content}</p>
                          <p className="text-xs text-gray-400 mt-2">{notification.time}</p>
                        </div>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-8 text-center text-gray-400">
                    <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">暂无通知</p>
                  </div>
                )}
              </div>

              <div className="px-4 py-2 border-t border-gray-100">
                <button
                  className="w-full text-sm text-primary-600 hover:text-primary-700 font-medium"
                  onClick={() => markAllNotificationsRead(user)}
                >
                  全部标为已读
                </button>
              </div>
            </div>
          )}
        </div>
        <button
          className="p-2 text-gray-500 hover:text-primary-600 transition-colors"
          onClick={() => navigate('/profile')}
        >
          <Settings className="w-5 h-5" />
        </button>
        <div className="flex items-center space-x-3 pl-4 border-l border-gray-200">
          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
            <span className="text-primary-600 font-medium">{user?.name?.charAt(0)}</span>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-gray-800">{user?.name}</p>
            <p className="text-xs text-gray-500">{user ? roleLabels[user.role] : ''}</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
