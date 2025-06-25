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
import { MicOff, UserX, Lock } from 'lucide-react';
import { toast } from '../../hooks/use-toast';

const ModerationToolsModal = ({ isOpen, onClose, room }) => {
  if (!room) return null;

  const handleMuteAll = () => {
    toast({
      title: "All users muted",
      description: `All users in ${room.title} have been muted`,
    });
  };

  const handleKickAll = () => {
    toast({
      title: "All users removed",
      description: `All users in ${room.title} have been kicked out`,
    });
  };

  const handleCloseRoom = () => {
    toast({
      title: "Room closed",
      description: `${room.title} has been closed and archived`,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#1A0E29]/90 border-white/10 backdrop-blur-xl text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white">Moderation Tools</DialogTitle>
          <DialogDescription className="text-gray-300">
            Moderate the room: {room.title}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Button
            onClick={handleMuteAll}
            className="w-full justify-start bg-white/5 hover:bg-white/10 text-white"
          >
            <MicOff className="mr-2 h-4 w-4" />
            Mute All Users
          </Button>

          <Button
            onClick={handleKickAll}
            className="w-full justify-start bg-white/5 hover:bg-white/10 text-white"
          >
            <UserX className="mr-2 h-4 w-4" />
            Kick All Users
          </Button>

          <Button
            onClick={handleCloseRoom}
            className="w-full justify-start bg-red-500/20 text-red-400 hover:bg-red-500/30"
          >
            <Lock className="mr-2 h-4 w-4" />
            Close Room
          </Button>
        </div>

        <DialogFooter>
          <Button
            onClick={onClose}
            className="bg-white/5 hover:bg-white/10 text-white"
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ModerationToolsModal;
