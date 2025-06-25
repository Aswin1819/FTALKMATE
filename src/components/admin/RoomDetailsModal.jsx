import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';

const RoomDetailsModal = ({ isOpen, onClose, room }) => {
  if (!room) return null;

  // Sample members for display
  const dummyMembers = [
    { id: 1, name: "Sarah Johnson", avatar: "https://i.pravatar.cc/150?u=sarah", status: "active" },
    { id: 2, name: "Mike Peterson", avatar: "https://i.pravatar.cc/150?u=mike", status: "active" },
    { id: 3, name: "Emma Wilson", avatar: "https://i.pravatar.cc/150?u=emma", status: "inactive" },
    { id: 4, name: "Alex Thompson", avatar: "https://i.pravatar.cc/150?u=alex", status: "active" },
  ];

  // Sample tags
  const roomTags = ["beginners", "conversation", "friendly", room.language.toLowerCase()];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#1A0E29]/90 border-white/10 backdrop-blur-xl text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white">{room.title}</DialogTitle>
          <DialogDescription className="text-gray-300">
            Created by {room.creator} on {new Date(room.createdAt).toLocaleDateString()}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Room Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-400">Type</p>
              <p className="font-medium text-white">{room.type.charAt(0).toUpperCase() + room.type.slice(1)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Language</p>
              <p className="font-medium text-white">{room.language}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Status</p>
              <Badge className={`${
                room.status === 'active' 
                  ? 'bg-neon-green/20 text-neon-green' 
                  : 'bg-gray-500/20 text-gray-400'
              }`}>
                {room.status.charAt(0).toUpperCase() + room.status.slice(1)}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-gray-400">Active Users</p>
              <p className="font-medium text-white">{room.activeUsers}</p>
            </div>
          </div>

          {/* Tags */}
          <div>
            <p className="text-sm text-gray-400 mb-2">Tags</p>
            <div className="flex flex-wrap gap-2">
              {roomTags.map(tag => (
                <Badge key={tag} className="bg-white/10 hover:bg-white/20">
                  #{tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Members */}
          <div>
            <p className="text-sm text-gray-400 mb-2">Members</p>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-2 scrollbar-none">
              {dummyMembers.map(member => (
                <div key={member.id} className="flex items-center justify-between bg-black/20 p-2 rounded-lg">
                  <div className="flex items-center">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={member.avatar} alt={member.name} />
                      <AvatarFallback>{member.name[0]}</AvatarFallback>
                    </Avatar>
                    <span className="ml-2 font-medium">{member.name}</span>
                  </div>
                  <Badge className={member.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}>
                    {member.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button 
            onClick={onClose}
            className="bg-white/5 hover:bg-white/10 text-white"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RoomDetailsModal;
