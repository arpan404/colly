'use client';

import { useState, useEffect } from 'react';
import { Bell, X, Check, CheckCheck, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { trpc } from '@/lib/trpc-client';
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';

interface NotificationItemProps {
  notification: {
    id: string;
    title: string;
    message: string;
    type: string;
    isRead: boolean;
    actionUrl: string | null;
    actionText: string | null;
    createdAt: string;
  };
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}

function NotificationItem({ notification, onMarkAsRead, onDelete }: NotificationItemProps) {
  const router = useRouter();

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'error': return 'text-red-600 dark:text-red-400';
      case 'warning': return 'text-yellow-600 dark:text-yellow-400';
      case 'success': return 'text-green-600 dark:text-green-400';
      default: return 'text-blue-600 dark:text-blue-400';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'error': return '🚨';
      case 'warning': return '⚠️';
      case 'success': return '✅';
      default: return 'ℹ️';
    }
  };

  const handleActionClick = () => {
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    }
    if (!notification.isRead) {
      onMarkAsRead(notification.id);
    }
  };

  return (
    <div className={`p-4 border-b border-border/50 last:border-b-0 ${!notification.isRead ? 'bg-primary/5' : ''}`}>
      <div className="flex items-start gap-3">
        <div className="shrink-0 mt-1">
          <span className="text-lg">{getTypeIcon(notification.type)}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className={`font-semibold text-sm ${!notification.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>
              {notification.title}
            </h4>
            <div className="flex items-center gap-1 shrink-0">
              {!notification.isRead && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onMarkAsRead(notification.id)}
                  className="h-6 w-6 p-0 hover:bg-primary/10"
                  title="Mark as read"
                >
                  <Check className="h-3 w-3" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(notification.id)}
                className="h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive"
                title="Delete notification"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
          <p className={`text-sm mt-1 ${!notification.isRead ? 'text-foreground/80' : 'text-muted-foreground'}`}>
            {notification.message}
          </p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
            </span>
            {notification.actionUrl && notification.actionText && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleActionClick}
                className="h-7 text-xs px-2 py-1"
              >
                {notification.actionText}
                <ExternalLink className="h-3 w-3 ml-1" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function NotificationsDropdown() {
  const [isOpen, setIsOpen] = useState(false);

  const { data: notifications, refetch } = trpc.notifications.getAll.useQuery();
  const { data: unreadCount } = trpc.notifications.getUnreadCount.useQuery();
  const markAsReadMutation = trpc.notifications.markAsRead.useMutation();
  const markAllAsReadMutation = trpc.notifications.markAllAsRead.useMutation();
  const deleteMutation = trpc.notifications.delete.useMutation();

  const handleMarkAsRead = async (id: string) => {
    await markAsReadMutation.mutateAsync({ id });
    refetch();
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsReadMutation.mutateAsync();
    refetch();
  };

  const handleDelete = async (id: string) => {
    await deleteMutation.mutateAsync({ id });
    refetch();
  };

  const unreadNotifications = notifications?.filter(n => !n.isRead) || [];

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 hover:bg-primary/5 hover:border-primary/30 transition-all duration-200">
          <Bell className="w-4 h-4" />
          Notifications
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96 p-0 max-h-96">
        <div className="p-4 border-b border-border/50">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">Notifications</h3>
            {unreadNotifications.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="text-xs h-7 px-2"
              >
                <CheckCheck className="w-3 h-3 mr-1" />
                Mark all read
              </Button>
            )}
          </div>
          {notifications && notifications.length > 0 && (
            <p className="text-sm text-muted-foreground mt-1">
              {unreadCount} unread • {notifications.length} total
            </p>
          )}
        </div>

        <ScrollArea className="max-h-80">
          {notifications && notifications.length > 0 ? (
            notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={handleMarkAsRead}
                onDelete={handleDelete}
              />
            ))
          ) : (
            <div className="p-8 text-center">
              <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground font-medium">No notifications</p>
              <p className="text-xs text-muted-foreground mt-1">You're all caught up!</p>
            </div>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}