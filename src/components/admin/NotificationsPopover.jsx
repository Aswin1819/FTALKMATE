import React from 'react';
import { Bell } from 'lucide-react';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '../../components/ui/popover';
import { Button } from '../../components/ui/button';
import { cn } from '../../lib/utils';
import { ScrollArea } from '../../components/ui/scroll-area';

const getIconForType = (type) => {
  switch (type) {
    case 'alert':
      return (
        <div className="h-8 w-8 rounded-full bg-red-500/20 flex items-center justify-center text-red-400">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 22C13.1 22 14 21.1 14 20H10C10 21.1 10.9 22 12 22ZM18 16V11C18 7.93 16.36 5.36 13.5 4.68V4C13.5 3.17 12.83 2.5 12 2.5C11.17 2.5 10.5 3.17 10.5 4V4.68C7.63 5.36 6 7.92 6 11V16L4 18V19H20V18L18 16Z" fill="currentColor"/>
          </svg>
        </div>
      );
    case 'follow':
      return (
        <div className="h-8 w-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16.5 12.5C17.88 12.5 18.99 11.38 18.99 10C18.99 8.62 17.88 7.5 16.5 7.5C15.12 7.5 14 8.62 14 10C14 11.38 15.12 12.5 16.5 12.5ZM9 11C10.66 11 11.99 9.66 11.99 8C11.99 6.34 10.66 5 9 5C7.34 5 6 6.34 6 8C6 9.66 7.34 11 9 11ZM16.5 14.5C14.67 14.5 11 15.42 11 17.25V19H22V17.25C22 15.42 18.33 14.5 16.5 14.5ZM9 13C6.67 13 2 14.17 2 16.5V19H9V17.25C9 16.18 9.37 15.22 10.03 14.37C9.96 14.36 9.89 14.35 9.82 14.33C9.55 14.3 9.28 14.26 9 14.25V13Z" fill="currentColor"/>
          </svg>
        </div>
      );
    case 'room':
      return (
        <div className="h-8 w-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21ZM8.5 13.5L6.5 11.5L8.5 9.5L10.5 11.5L8.5 13.5ZM15.5 13.5L13.5 11.5L15.5 9.5L17.5 11.5L15.5 13.5ZM12 17.5L10 15.5L12 13.5L14 15.5L12 17.5Z" fill="currentColor"/>
          </svg>
        </div>
      );
    case 'system':
      return (
        <div className="h-8 w-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z" fill="currentColor"/>
          </svg>
        </div>
      );
    default:
      return (
        <div className="h-8 w-8 rounded-full bg-gray-500/20 flex items-center justify-center text-gray-400">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 22C13.1 22 14 21.1 14 20H10C10 21.1 10.9 22 12 22ZM18 16V11C18 7.93 16.36 5.36 13.5 4.68V4C13.5 3.17 12.83 2.5 12 2.5C11.17 2.5 10.5 3.17 10.5 4V4.68C7.63 5.36 6 7.92 6 11V16L4 18V19H20V18L18 16Z" fill="currentColor"/>
          </svg>
        </div>
      );
  }
};

const NotificationsPopover = ({ 
  notifications, 
  onMarkAllAsRead, 
  onSeeAllNotifications,
  className
}) => {
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className={cn("relative", className)}
        >
          <span className="sr-only">Notifications</span>
          <Bell className="h-5 w-5 text-gray-400 hover:text-white" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 h-2 w-2 bg-neon-purple rounded-full" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[350px] p-0 bg-black/80 backdrop-blur-xl border-white/10"
        align="end"
      >
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h3 className="font-medium text-white">Notifications</h3>
          {unreadCount > 0 && (
            <span className="text-xs bg-neon-purple/20 text-neon-purple px-2 py-0.5 rounded-full">
              {unreadCount} new
            </span>
          )}
        </div>

        <ScrollArea className="h-[400px]">
          <div className="p-2">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <div 
                  key={notification.id}
                  className={cn(
                    "flex items-start p-3 rounded-lg mb-1 transition-colors",
                    notification.read 
                      ? "hover:bg-white/5" 
                      : "bg-white/5 hover:bg-white/10"
                  )}
                >
                  {getIconForType(notification.type)}
                  <div className="ml-3 flex-1">
                    <div className="flex items-start justify-between">
                      <h4 className={cn(
                        "text-sm font-medium",
                        notification.read ? "text-gray-300" : "text-white"
                      )}>
                        {notification.title}
                      </h4>
                      <span className="text-xs text-gray-400 ml-2">
                        {notification.time}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {notification.message}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-8 px-4">
                <div className="h-12 w-12 rounded-full bg-white/5 flex items-center justify-center text-gray-400 mb-3">
                  <Bell className="h-6 w-6" />
                </div>
                <p className="text-sm text-gray-400 text-center">
                  No notifications yet
                </p>
              </div>
            )}
          </div>
        </ScrollArea>

        {notifications.length > 0 && (
          <div className="p-3 border-t border-white/10 flex items-center justify-between">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onMarkAllAsRead}
              className="text-xs text-gray-400 hover:text-neon-purple"
            >
              Mark all as read
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onSeeAllNotifications}
              className="text-xs text-neon-purple hover:text-neon-blue hover:bg-white/5"
            >
              See all
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default NotificationsPopover;
