import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import {
  User,
  Mail,
  Hash,
  FileText,
  Shield,
  CheckCircle,
  XCircle,
  Crown,
  Wifi,
  Trophy,
  Target,
  Flame,
  MessageSquare,
  Clock,
  Users,
  UserPlus,
  X
} from 'lucide-react';

const UserProfileModal = ({ isOpen, onClose, user, loading }) => {
  if (!isOpen) return null;
  if (loading) return (
    <Dialog open={isOpen}><DialogContent>Loading...</DialogContent></Dialog>
  );
  if (!user) return null;

  const formatSpeakTime = (duration) => {
    if (!duration) return "00:00:00";
    // duration is "HH:MM:SS"
    return duration;
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return <Badge className="bg-neon-green/20 text-neon-green hover:bg-neon-green/30">Active</Badge>;
      case "flagged":
        return <Badge variant="destructive" className="bg-yellow-600/20 text-yellow-500 hover:bg-yellow-600/30">Flagged</Badge>;
      case "banned":
        return <Badge variant="destructive" className="bg-red-500/20 text-red-400 hover:bg-red-500/30">Banned</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl bg-black/40 backdrop-blur-xl border border-white/10 text-white max-h-[90vh] overflow-y-auto">
        <DialogHeader className="relative">
          <DialogTitle className="text-2xl font-bold text-white mb-2">User Profile</DialogTitle>
          {/* <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute right-0 top-0 text-gray-400 hover:text-white hover:bg-white/10"
          >
            <X className="h-4 w-4" />
          </Button> */}
        </DialogHeader>

        <div className="space-y-6">
          {/* Profile Header */}
          <div className="flex flex-col sm:flex-row items-center gap-4 p-6 bg-white/5 rounded-lg border border-white/10">
            <Avatar className="h-20 w-20 border-2 border-neon-purple/50">
              <AvatarImage src={user.avatar} />
              <AvatarFallback className="bg-neon-purple/20 text-neon-purple text-xl">
                {user.username?.[0]?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="text-center sm:text-left">
              <h3 className="text-2xl font-bold text-white">{user.username}</h3>
              <p className="text-neon-purple">@{user.unique_id}</p>
              <div className="flex items-center gap-2 mt-2 justify-center sm:justify-start">
                {getStatusBadge(user.status)}
                {user.is_premium && <Crown className="h-4 w-4 text-neon-purple" />}
                {user.is_verified && <CheckCircle className="h-4 w-4 text-neon-green" />}
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Info */}
            <div className="space-y-4 p-6 bg-white/5 rounded-lg border border-white/10">
              <h4 className="text-lg font-semibold text-neon-purple flex items-center gap-2">
                <User className="h-5 w-5" />
                Basic Information
              </h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-300">{user.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Hash className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-300">ID: {user.user_id}</span>
                </div>
                <div className="flex items-start gap-3">
                  <FileText className="h-4 w-4 text-gray-400 mt-1" />
                  <span className="text-gray-300">{user.bio}</span>
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="space-y-4 p-6 bg-white/5 rounded-lg border border-white/10">
              <h4 className="text-lg font-semibold text-neon-purple flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Account Status
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Status</span>
                  {getStatusBadge(user.status)}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Verified</span>
                  {user.is_verified ?
                    <CheckCircle className="h-5 w-5 text-neon-green" /> :
                    <XCircle className="h-5 w-5 text-gray-500" />
                  }
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Premium</span>
                  {user.is_premium ?
                    <Crown className="h-5 w-5 text-neon-purple" /> :
                    <XCircle className="h-5 w-5 text-gray-500" />
                  }
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Online Status</span>
                  <div className="flex items-center gap-2">
                    <Wifi className={`h-4 w-4 ${user.is_online ? 'text-neon-green' : 'text-gray-500'}`} />
                    <span className="text-sm text-gray-300">
                      {user.is_online ? 'Online now' : user.last_seen ? `Last seen: ${user.last_seen}` : 'Offline'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress */}
            <div className="space-y-4 p-6 bg-white/5 rounded-lg border border-white/10">
              <h4 className="text-lg font-semibold text-neon-purple flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Progress & Activity
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-400">XP</span>
                  </div>
                  <span className="text-neon-green font-semibold">{user.xp}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-400">Level</span>
                  </div>
                  <span className="text-neon-purple font-semibold">{user.level}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Flame className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-400">Streak</span>
                  </div>
                  <span className="text-orange-400 font-semibold">{user.streak} days</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-400">Rooms Joined</span>
                  </div>
                  <span className="text-gray-300">{user.total_rooms_joined}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-400">Total Speak Time</span>
                  </div>
                  <span className="text-gray-300 font-mono">{formatSpeakTime(user.total_speak_time)}</span>
                </div>
              </div>
            </div>

            {/* Social */}
            <div className="space-y-4 p-6 bg-white/5 rounded-lg border border-white/10">
              <h4 className="text-lg font-semibold text-neon-purple flex items-center gap-2">
                <Users className="h-5 w-5" />
                Social
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-400">Followers</span>
                  </div>
                  <span className="text-gray-300 font-semibold">{user.followers_count}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-400">Following</span>
                  </div>
                  <span className="text-gray-300 font-semibold">{user.following_count}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-400">Member Since</span>
                  </div>
                  <span className="text-gray-300">{user.date_joined?.slice(0, 10)}</span>
                </div>
              </div>
            </div>

            {/* Languages */}
            <div className="space-y-4 p-6 bg-white/5 rounded-lg border border-white/10">
              <h4 className="text-lg font-semibold text-neon-purple flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Languages
              </h4>
              <div className="space-y-2">
                {user.languages && user.languages.length > 0 ? (
                  user.languages.map((lang, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Badge className="bg-neon-purple/20 text-neon-purple">{lang.language} ({lang.code})</Badge>
                      <span className="text-gray-400 text-sm">{lang.is_learning ? 'Learning' : 'Known'} - {lang.proficiency}</span>
                    </div>
                  ))
                ) : (
                  <span className="text-gray-400">No languages listed.</span>
                )}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <Button
              variant="outline"
              onClick={onClose}
              className="border-white/20 text-white hover:bg-white/10"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserProfileModal;
