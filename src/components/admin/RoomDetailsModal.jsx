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

  
  // Sample tags
  

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
              {room.tags && room.tags.length > 0 ? (
                room.tags.map(tag => (
                  <Badge key={tag.id} className="bg-white/10 hover:bg-white/20">
                    #{tag.name}
                  </Badge>
                ))
              ) : (
                <span className="text-gray-500">No tags</span>
              )}
            </div>
          </div>

          {/* Members */}
          <div>
            <p className="text-sm text-gray-400 mb-2">Members</p>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-2 scrollbar-none">
              {room.members && room.members.length > 0 ? (
                room.members.map(member => (
                  <div key={member.user_id} className="flex items-center justify-between bg-black/20 p-2 rounded-lg">
                    <div className="flex items-center">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={`https://i.pravatar.cc/150?u=${member.user_id}`} alt={member.username} />
                        <AvatarFallback>{member.username?.[0]?.toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <span className="ml-2 font-medium">{member.username}</span>
                    </div>
                    <Badge className={member.left_at ? 'bg-gray-500/20 text-gray-400' : 'bg-green-500/20 text-green-400'}>
                      {member.left_at ? 'inactive' : 'active'}
                    </Badge>
                  </div>
                ))
              ) : (
                <span className="text-gray-500">No members</span>
              )}
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
