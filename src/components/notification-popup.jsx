'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Clock,
  AlertCircle,
  Calendar,
  Users,
  Loader2,
} from 'lucide-react';
import { notificationService } from '@/services';

// Simple time formatting function
const formatDistanceToNow = (date) => {
  const now = new Date();
  const diffInMs = now - new Date(date);
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 1) return 'just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInDays < 7) return `${diffInDays}d ago`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)}w ago`;
  return `${Math.floor(diffInDays / 30)}mo ago`;
};

export default function NotificationPopup() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [markAllLoading, setMarkAllLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobileView(typeof window !== 'undefined' && window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Load notifications when popup opens
  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen]);

  // Load unread count periodically
  useEffect(() => {
    loadUnreadCount();
    const interval = setInterval(loadUnreadCount, 30000); // Every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const result = await notificationService.getNotifications({
        limit: 20,
        order_by: 'created_at',
        order_direction: 'DESC'
      });

      if (result.success) {
        setNotifications(result.data || []);
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
    setLoading(false);
  };

  const loadUnreadCount = async () => {
    try {
      const result = await notificationService.getUnreadCount();
      if (result.success) {
        setUnreadCount(result.count || 0);
      }
    } catch (error) {
      console.error('Failed to load unread count:', error);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      const result = await notificationService.markAsRead(notificationId);
      if (result.success) {
        // Update local state
        setNotifications(prev =>
          prev.map(notif =>
            notif.id === notificationId
              ? { ...notif, is_read: true }
              : notif
          )
        );
        loadUnreadCount(); // Refresh unread count
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    setMarkAllLoading(true);
    try {
      const result = await notificationService.markAllAsRead();
      if (result.success) {
        // Update local state: mark all as read
        setNotifications(prev =>
          prev.map(notif => ({ ...notif, is_read: true }))
        );
        await loadUnreadCount();
      }
    } catch (error) {
      // Optionally handle error
    } finally {
      setMarkAllLoading(false);
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      const result = await notificationService.deleteNotification(notificationId);
      if (result.success) {
        setNotifications(prev =>
          prev.filter(notif => notif.id !== notificationId)
        );
        loadUnreadCount(); // Refresh unread count
      }
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'reminder':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'overdue':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'deadline_shared':
        return <Users className="h-4 w-4 text-green-500" />;
      case 'deadline_updated':
        return <Calendar className="h-4 w-4 text-orange-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'high':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300';
      case 'normal':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'low':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="glassmorphism-button relative"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-xs text-white font-bold">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            </div>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-[calc(100vw-2rem)] max-w-md md:w-96 p-0 glassmorphism-modal border-1 border-gray-800 mt-4"
        align={isMobileView ? 'center' : 'end'}
        sideOffset={isMobileView ? 0 : 8}
        style={isMobileView ? { left: '0%', transform: 'translateX(-4%)' } : undefined}
      >
        <Card className="border-0 shadow-none bg-transparent">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm md:text-lg font-semibold">
                Notifications
              </CardTitle>
              {notifications.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  className="text-xs"
                  disabled={markAllLoading}
                >
                  {markAllLoading ? (
                    <span className="flex items-center">
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      <span className="hidden sm:inline">Marking...</span>
                      <span className="inline sm:hidden">...</span>
                    </span>
                  ) : (
                    <>
                      <CheckCheck className="h-4 w-4 mr-1" />
                      <span className="hidden sm:inline">Mark all read</span>
                    </>
                  )}
                </Button>
              )}
            </div>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="w-fit text-xs md:text-sm">
                {unreadCount > 9 ? '9+' : unreadCount}
                <span className="hidden md:inline"> unread</span>
              </Badge>
            )}
          </CardHeader>

          <CardContent className="p-0">
            {/* Responsive scroll area: shorter on small screens, taller on md+ */}
            <ScrollArea className="h-64 md:h-96">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-xs md:text-sm text-gray-500">Loading notifications...</div>
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Bell className="h-12 w-12 text-gray-300 mb-2" />
                  <div className="text-xs md:text-sm text-gray-500">No notifications yet</div>
                </div>
              ) : (
                <div className="space-y-1">
                  {notifications.map((notification, index) => (
                    <div key={notification.id}>
                      <div
                        className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${!notification.is_read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                          }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 mt-1">
                            {getNotificationIcon(notification.type)}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="text-xs md:text-sm font-medium text-gray-900 dark:text-gray-100">
                                  {notification.title}
                                </p>
                                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mt-1">
                                  {notification.message}
                                </p>

                                <div className="flex items-center space-x-2 mt-2">
                                  {notification.priority && (
                                    <Badge
                                      variant="secondary"
                                      className={`text-xs ${getPriorityColor(notification.priority)}`}
                                    >
                                      {notification.priority}
                                    </Badge>
                                  )}
                                  <span className="text-[10px] md:text-xs text-gray-500">
                                    {formatDistanceToNow(notification.created_at)}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center space-x-1 ml-2">
                                {!notification.is_read && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleMarkAsRead(notification.id)}
                                    className="h-8 w-8 p-0"
                                  >
                                    <Check className="h-3 w-3" />
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteNotification(notification.id)}
                                  className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      {index < notifications.length - 1 && <Separator />}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
}