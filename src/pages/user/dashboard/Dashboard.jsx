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
import { logoutUser } from '../../../features/auth/authThunks';
import { useDispatch , useSelector } from 'react-redux';
import { toast } from '../../../hooks/use-toast';
import { fetchNotifications } from '../../../api/notificationsApi';

const Dashboard = () => {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user); 
  

  useEffect(() => {
    const getNotifications = async () => {
      try {
        const data = await fetchNotifications();
        setNotifications(data);
      } catch (err) {
        setNotifications([]);
      }
    };
    getNotifications();
  }, []);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleMarkAllAsRead = () => {
    setNotifications(
      notifications.map(notification => ({ ...notification, read: true }))
    );
  };

  const handleSeeAllNotifications = () => {
    // console.log('Navigate to all notifications');
    
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
      // console.log("User log out")
      navigate('/auth')
    }catch (err){
      toast({
        title:"Logout Failed",
        description:"Somehting went wrong!!",
        variant:"error"
      })
      // console.log("logout failed")
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
            {/* Notifications Popover */}
            <NotificationsPopover
              notifications={notifications}
              onMarkAllAsRead={handleMarkAllAsRead}
              onSeeAllNotifications={handleSeeAllNotifications}
            />

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
