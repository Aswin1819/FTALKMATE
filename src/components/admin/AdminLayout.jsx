import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  MessageSquare, 
  Flag, 
  CreditCard, 
  Settings, 
  LogOut, 
  Tag,
  Menu,
  X
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { cn } from '../../lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "../../components/ui/dialog";
import NotificationsPopover from './NotificationsPopover';
import { useDispatch } from 'react-redux';
import { adminLogout } from '../../features/auth/adminSlice';

const adminNotifications = [
  {
    id: '1',
    title: 'New Report',
    message: 'A new moderation report has been submitted',
    time: '5m ago',
    read: false,
    type: 'alert'
  },
  {
    id: '2',
    title: 'New User Registration',
    message: '5 new users registered in the last hour',
    time: '1h ago',
    read: false,
    type: 'follow'
  },
  {
    id: '3',
    title: 'System Update',
    message: 'Platform update completed successfully',
    time: '2h ago',
    read: true,
    type: 'system'
  }
];

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notifications, setNotifications] = useState(adminNotifications);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const dispatch = useDispatch();
  
  const sidebarItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/admin/dashboard" },
    { icon: Users, label: "User Management", path: "/admin/users" },
    { icon: MessageSquare, label: "Room Management", path: "/admin/rooms" },
    { icon: Flag, label: "Moderation & Reports", path: "/admin/moderation" },
    { icon: CreditCard, label: "Subscriptions", path: "/admin/subscriptions" },
    { icon: Tag, label: "Taxonomy", path: "/admin/taxonomy" },
    { icon: Settings, label: "Settings", path: "/admin/settings" },
  ];

  const getCurrentPageTitle = () => {
    const currentItem = sidebarItems.find(item => 
      location.pathname.startsWith(item.path)
    );
    return currentItem?.label || "Admin";
  };

  const handleLogout = () => {
    setShowLogoutDialog(true);
  };

const confirmLogout = async () => {
  await dispatch(adminLogout());
  navigate('/admin/login');
  setShowLogoutDialog(false);
};

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleMarkAllAsRead = () => {
    setNotifications(
      notifications.map(notification => ({ ...notification, read: true }))
    );
  };

  const handleSeeAllNotifications = () => {
    console.log('Navigate to all notifications');
  };

  return (
    <div className="min-h-screen bg-[#13071D] flex relative">
      <Button
        variant="ghost" 
        size="icon" 
        onClick={toggleSidebar}
        className="lg:hidden fixed top-4 left-4 z-50 text-white bg-black/20 backdrop-blur-md border border-white/10"
      >
        {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
      </Button>

      <aside 
        className={cn(
          "w-64 bg-black/40 backdrop-blur-xl border-r border-white/10 fixed inset-y-0 left-0 z-40 transition-transform duration-300 lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="h-16 flex items-center px-6 border-b border-white/10">
          <div className="text-xl font-bold text-white">
            <span className="text-neon-purple">Talk</span>Mate
            <span className="ml-2 text-xs font-medium bg-white/10 px-2 py-1 rounded text-gray-300">Admin</span>
          </div>
        </div>
        
        <nav className="flex flex-col p-4 space-y-1">
          {sidebarItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.path}
              onClick={() => window.innerWidth < 1024 && setSidebarOpen(false)}
              className={({ isActive }) => cn(
                "flex items-center py-2 px-4 rounded-md text-sm font-medium transition-all duration-200",
                isActive 
                  ? "bg-white/10 text-neon-purple" 
                  : "text-gray-400 hover:bg-white/5 hover:text-neon-purple"
              )}
            >
              <item.icon className="h-5 w-5 mr-3" />
              {item.label}
            </NavLink>
          ))}
          
          <Button
            variant="ghost"
            className="flex items-center justify-start py-2 px-4 rounded-md text-sm font-medium text-gray-400 hover:bg-white/5 hover:text-red-400 mt-4"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5 mr-3" />
            Logout
          </Button>
        </nav>
      </aside>

      <div 
        className={cn(
          "flex-1 flex flex-col transition-all duration-300",
          sidebarOpen ? "lg:ml-64" : "ml-0"
        )}
      >
        <header className="h-16 bg-black/40 backdrop-blur-xl border-b border-white/10 flex items-center justify-between px-6 sticky top-0 z-30">
          <div className="flex items-center">
            <h1 className="text-lg font-semibold text-white ml-8 lg:ml-0">
              {getCurrentPageTitle()}
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <NotificationsPopover 
              notifications={notifications}
              onMarkAllAsRead={handleMarkAllAsRead}
              onSeeAllNotifications={handleSeeAllNotifications}
            />
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center space-x-2 cursor-pointer">
                  <Avatar className="h-8 w-8 border border-white/20">
                    <AvatarImage src="/placeholder.svg" />
                    <AvatarFallback className="bg-neon-purple/20 text-neon-purple">AD</AvatarFallback>
                  </Avatar>
                  <div className="text-sm font-medium text-gray-300 hidden md:block">Admin User</div>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-black/90 border-white/10 text-white">
                <DropdownMenuLabel>Admin Account</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem className="hover:bg-white/10 hover:text-neon-purple focus:bg-white/10 focus:text-neon-purple cursor-pointer">
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-white/10 hover:text-neon-purple focus:bg-white/10 focus:text-neon-purple cursor-pointer">
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem 
                  className="hover:bg-white/10 hover:text-red-400 focus:bg-white/10 focus:text-red-400 cursor-pointer"
                  onClick={handleLogout}
                >
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>

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

export default AdminLayout;
