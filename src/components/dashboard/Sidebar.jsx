import { cn } from '../../lib/utils';
import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Home, Compass, PlusSquare, User,Users, Settings, LogOut } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { useSelector } from 'react-redux';
import axiosInstance from '../../features/auth/axiosInstance';
import { SocialListModal } from './SocialListModal';

const Sidebar = ({ collapsed, onToggleCollapse, onLogout }) => {
  const user = useSelector((state) => state.auth.user);
  const [profile, setProfile] = useState(null);
  const [socialModalOpen, setSocialModalOpen] = useState(false);
  const [socialModalTab, setSocialModalTab] = useState('followers');
  const location = useLocation();
  // console.log("Sidebar rendered with user:", user);

  const refreshProfile = () => {
    axiosInstance.get('/profile/')
      .then(res => setProfile(res.data))
  };

  useEffect(() => {
    refreshProfile();
  }, []);

  const navItems = [
    {
      label: "Home",
      icon: Home,
      to: "/dashboard",
      activePattern: /^\/dashboard$/
    },
    {
      label: "Explore",
      icon: Compass,
      to: "/dashboard/explore",
      activePattern: /^\/dashboard\/explore$/
    },

    {
      label: "Profile",
      icon: User,
      to: "/dashboard/profile",
      activePattern: /^\/dashboard\/profile$/
    },
    {
      title: "Social",
      items: [
        {
          name: "Chat",
          href: "/dashboard/chat",
          icon: MessageCircle,
          description: "Chat with friends"
        },
        {
          name: "Friends",
          href: "/dashboard/friends", 
          icon: Users,
          description: "Manage friends"
        }
      ]
    },
    {
      label: "Settings",
      icon: Settings,
      to: "/dashboard/settings",
      activePattern: /^\/dashboard\/settings$/
    }
  ];

  const openSocial = (tab) => {
    setSocialModalTab(tab);
    setSocialModalOpen(true);
  };
  return (
    <aside
      className={cn(
        "bg-[#13071D]/80 backdrop-blur-lg border-r border-white/10 h-screen fixed top-0 left-0 bottom-0 transition-all duration-300 z-40",
        collapsed ? "w-[4.5rem]" : "w-64"
      )}
    >
      {/* Header/Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-white/10">
        {!collapsed && (
          <Link to="/" className="text-xl font-bold text-white">
            <span className="text-neon-purple">Talk</span>Mate
          </Link>
        )}

        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleCollapse}
          className="rounded-full hover:bg-white/5 text-white"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* User profile */}
      <div
        className={cn(
          "p-4 border-b border-white/10",
          collapsed ? "flex justify-center" : "block"
        )}
      >
        <div
          className={cn(
            "flex items-center",
            collapsed ? "flex-col" : "flex-row"
          )}
        >
          <Avatar className={cn("border-2 border-white/10", collapsed ? "h-10 w-10" : "h-12 w-12")}>
            <AvatarImage src={profile?.avatar} />
            <AvatarFallback>
              {user?.username?.slice(0, 2)?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>

          {!collapsed && (
            <div className="ml-3">
              <div className="font-medium text-white">{profile?.user?.username}</div>
              <div className="text-sm text-white/60">Level {profile?.level}</div>
            </div>
          )}
        </div>

        {/* User stats */}
        {!collapsed && profile && (
          <>
            <div className="mt-4 bg-white/5 p-2 rounded-lg">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-white/60">XP</span>
                <span className="text-xs text-white font-medium">{(profile.xp % 1000) || 0}/1000</span>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-neon-purple to-neon-blue" style={{ width: `${((profile.xp % 1000) / 10) || 0}%` }}></div>
              </div>
            </div>

            {/* Social Stats */}
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <button
                type="button"
                className="bg-white/5 p-2 rounded-lg w-full"
                onClick={() => openSocial('followers')}
              >
                <div className="text-sm font-medium text-white">{profile.followers_count || 0}</div>
                <div className="text-xs text-white/60">Followers</div>
              </button>
              <button
                type="button"
                className="bg-white/5 p-2 rounded-lg w-full"
                onClick={() => openSocial('following')}
              >
                <div className="text-sm font-medium text-white">{profile.following_count || 0}</div>
                <div className="text-xs text-white/60">Following</div>
              </button>
              <button
                type="button"
                className="bg-white/5 p-2 rounded-lg w-full"
                onClick={() => openSocial('friends')}
              >
                <div className="text-sm font-medium text-white">{profile.friends_count || 0}</div>
                <div className="text-xs text-white/60">Friends</div>
              </button>
            </div>

            {/* Modal mount */}
            <SocialListModal
              open={socialModalOpen}
              onOpenChange={setSocialModalOpen}
              defaultTab={socialModalTab}
              userId={null} // null = current user
              onCloseProfileRefresh={refreshProfile}
            />
          </>
        )}
      </div>

      {/* Navigation */}
      <nav className="p-2 mt-2">
        {navItems.map((item) => {
          const isActive = item.activePattern.test(location.pathname);

          return (
            <Link
              key={item.label}
              to={item.to}
              className={cn(
                "flex items-center rounded-lg px-3 py-2 mb-1 transition-colors",
                isActive
                  ? "bg-white/10 text-neon-purple"
                  : "text-white/60 hover:text-white hover:bg-white/5",
                collapsed ? "justify-center" : ""
              )}
            >
              <item.icon className={cn("h-5 w-5", isActive ? "text-neon-purple" : "")} />
              {!collapsed && <span className="ml-3">{item.label}</span>}
            </Link>
          );
        })}

        {/* Logout button */}
        <button
          onClick={onLogout}
          className={cn(
            "flex w-full items-center rounded-lg px-3 py-2 text-white/60 hover:text-red-400 hover:bg-white/5 transition-colors mt-4",
            collapsed ? "justify-center" : ""
          )}
        >
          <LogOut className="h-5 w-5" />
          {!collapsed && <span className="ml-3">Logout</span>}
        </button>
      </nav>
    </aside>
  );
};

export default Sidebar;
