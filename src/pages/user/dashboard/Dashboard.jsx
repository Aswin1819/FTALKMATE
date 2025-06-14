import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from '../../../components/dashboard/Sidebar';
import NotificationsPopover from '../../../components/dashboard/NotificationsPopover';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '../../../components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import { Button } from '../../../components/ui/button';
import { BellIcon } from 'lucide-react';
import { Badge } from '../../../components/ui/badge';
import { getCurrentUser, logoutUser } from '../../../features/auth/authSlice';
import { useDispatch , useSelector } from 'react-redux';
import { toast } from '../../../hooks/use-toast';

// Sample notifications data
const sampleNotifications = [
  {
    id: '1',
    title: 'New Follower',
    message: 'Sarah started following you',
    time: '2m ago',
    read: false,
    type: 'follow'
  },
  {
    id: '2',
    title: 'Room Invitation',
    message: 'You have been invited to join "Spanish Practice" room',
    time: '1h ago',
    read: false,
    type: 'room'
  },
  {
    id: '3',
    title: 'Level Up!',
    message: 'Congratulations! You reached Level 5',
    time: '3h ago',
    read: true,
    type: 'system'
  },
  {
    id: '4',
    title: 'New Message',
    message: 'Michael sent you a message',
    time: '5h ago',
    read: true,
    type: 'alert'
  }
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [notifications, setNotifications] = useState(sampleNotifications);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user); 
  

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleMarkAllAsRead = () => {
    setNotifications(
      notifications.map(notification => ({ ...notification, read: true }))
    );
  };

  const handleSeeAllNotifications = () => {
    console.log('Navigate to all notifications');
    setShowNotificationsDropdown(false);
    // Implementation would navigate to a notifications page
  };

  const handleLogout = () => {
    setShowLogoutDialog(true);

  };

  const confirmLogout = async ()=>{
    try{
      await dispatch(logoutUser()).unwrap();
      toast({
        title:"Logout successfully",
        description:"You are always welcome",
        variant:"success"
      })
      console.log("User log out")
      navigate('/auth')
    }catch (err){
      toast({
        title:"Logout Failed",
        description:"Somehting went wrong!!",
        variant:"error"
      })
      console.log("logout failed")
    }finally{
      setShowLogoutDialog(false);
    }
  }


  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

 

  return (
    <div className="min-h-screen bg-[#13071D] flex">
      {/* Sidebar */}
      <Sidebar 
        collapsed={sidebarCollapsed} 
        onToggleCollapse={toggleSidebar} 
        onLogout={handleLogout}
      />

      {/* Main content */}
      <main 
        className={`flex-1 transition-all duration-300 ease-in-out ${
          sidebarCollapsed ? 'ml-[4.5rem]' : 'ml-64'
        }`}
      >
        {/* Top navbar */}
        <header className="h-16 px-6 flex items-center justify-between border-b border-white/10 bg-[#13071D]/80 backdrop-blur-lg sticky top-0 z-30">
          {/* Left Section */}
          <div>
            <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          </div>
          
          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Notifications Dropdown */}
            <DropdownMenu 
              open={showNotificationsDropdown}
              onOpenChange={setShowNotificationsDropdown}
            >
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="relative h-10 w-10 rounded-full bg-white/5 hover:bg-white/10"
                >
                  <BellIcon className="h-5 w-5 text-white" />
                  {unreadNotificationsCount > 0 && (
                    <Badge 
                      className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-neon-purple text-white text-xs"
                    >
                      {unreadNotificationsCount}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className="w-80 bg-[#1A0E29]/95 backdrop-blur-xl border-white/10 text-white"
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                  <h3 className="text-base font-medium">Notifications</h3>
                  {unreadNotificationsCount > 0 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-xs text-neon-purple hover:text-neon-purple/90 hover:bg-white/5"
                      onClick={handleMarkAllAsRead}
                    >
                      Mark all as read
                    </Button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <DropdownMenuItem 
                        key={notification.id}
                        className={`p-3 focus:bg-white/5 focus:text-white cursor-default ${
                          !notification.read ? 'bg-white/5' : ''
                        }`}
                      >
                        <div className="w-full">
                          <div className="flex justify-between items-start">
                            <span className="font-medium">
                              {notification.title}
                              {!notification.read && (
                                <span className="inline-block h-2 w-2 rounded-full bg-neon-purple ml-2"></span>
                              )}
                            </span>
                            <span className="text-xs text-gray-400">{notification.time}</span>
                          </div>
                          <p className="text-sm text-gray-300 mt-1">{notification.message}</p>
                        </div>
                      </DropdownMenuItem>
                    ))
                  ) : (
                    <div className="p-4 text-center text-gray-400">
                      No notifications
                    </div>
                  )}
                </div>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem 
                  className="p-3 text-center text-neon-purple hover:bg-white/5 hover:text-neon-purple/90 cursor-pointer"
                  onClick={handleSeeAllNotifications}
                >
                  See all notifications
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center text-white font-medium">
              {user?.username?.slice(0, 2)?.toUpperCase() || "U"}
            </div>
          </div>
        </header>

        {/* Main dashboard content - renders the active route */}
        <div className="p-6">
          <Outlet />
        </div>
      </main>

      {/* Logout confirmation dialog */}
      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent className="bg-[#1A0E29]/90 border-white/10 backdrop-blur-xl text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Logout Confirmation</DialogTitle>
            <DialogDescription className="text-gray-300">
              Are you sure you want to logout?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 flex gap-2">
            <Button 
              variant="ghost" 
              onClick={() => setShowLogoutDialog(false)}
              className="bg-white/5 hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button 
              onClick={confirmLogout}
              className="bg-neon-purple hover:bg-neon-purple/90 hover:glow-purple"
            >
              Logout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
