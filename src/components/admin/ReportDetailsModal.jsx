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
import { formatDistanceToNow } from 'date-fns';

const ReportDetailsModal = ({ isOpen, onClose, report }) => {
  if (!report) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#1A0E29]/90 border-white/10 backdrop-blur-xl text-white max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white flex items-center">
            <Badge className="mr-2 bg-red-500/20 text-red-400 hover:bg-red-500/30">
              {report.reason}
            </Badge>
            Report Details
          </DialogTitle>
          <DialogDescription className="text-gray-300">
            Report #{report.id} from {report.roomName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Reporter & Reported Users */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-black/20 p-3 rounded-lg">
              <p className="text-sm text-gray-400 mb-2">Reporter</p>
              <div className="flex items-center">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={`https://i.pravatar.cc/150?u=${report.reporter}`} />
                  <AvatarFallback>{report.reporter[0]}</AvatarFallback>
                </Avatar>
                <div className="ml-3">
                  <p className="font-medium">{report.reporter}</p>
                </div>
              </div>
            </div>
            <div className="bg-black/20 p-3 rounded-lg">
              <p className="text-sm text-gray-400 mb-2">Reported User</p>
              <div className="flex items-center">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={`https://i.pravatar.cc/150?u=${report.reported}`} />
                  <AvatarFallback>{report.reported[0]}</AvatarFallback>
                </Avatar>
                <div className="ml-3">
                  <p className="font-medium">{report.reported}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div>
            <p className="text-sm text-gray-400 mb-2">Reported Content</p>
            <div className="bg-black/20 p-4 rounded-lg border border-white/10">
              <p className="italic">{report.content}</p>
            </div>
          </div>

          {/* Additional Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-400">Room</p>
              <p className="font-medium">{report.roomName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Timestamp</p>
              <p className="font-medium">{formatDistanceToNow(report.timestamp, { addSuffix: true })}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Status</p>
              <Badge className={`${
                report.status === 'pending' 
                  ? 'bg-amber-500/20 text-amber-400' 
                  : report.status === 'resolved'
                    ? 'bg-neon-green/20 text-neon-green'
                    : 'bg-gray-500/20 text-gray-400'
              }`}>
                {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
              </Badge>
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

export default ReportDetailsModal;
