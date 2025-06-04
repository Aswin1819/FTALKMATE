import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardFooter } from '../../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Mic, Video, Users } from 'lucide-react';

const RoomCard = ({ room, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="h-full"
    >
      <Card className="h-full flex flex-col overflow-hidden bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105">
        <CardContent className="p-6 flex flex-col flex-1">
          <div className="flex justify-between items-start mb-3">
            <h3 className="font-bold text-lg text-white">{room.title}</h3>
            <div className="flex items-center gap-1">
              {room.hasVideo ? (
                <Video size={18} className="text-neon-purple" />
              ) : (
                <Mic size={18} className="text-neon-blue" />
              )}
              <Users size={16} className="text-gray-400" />
              <span className="text-xs text-gray-400">{room.userCount}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {room.tags.map((tag) => (
              <span 
                key={tag} 
                className="text-xs px-2 py-1 rounded-full bg-white/10 text-gray-300"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="mt-auto flex items-center">
            <Avatar className="h-8 w-8 mr-2">
              <AvatarImage src={room.creator.avatar} />
              <AvatarFallback>{room.creator.initials}</AvatarFallback>
            </Avatar>
            <span className="text-sm text-gray-300">{room.creator.name}</span>
          </div>
        </CardContent>

        <CardFooter className="p-6 pt-0">
          <Button className="w-full bg-gradient-to-r from-neon-blue to-neon-purple text-white transition-all duration-300 hover:from-neon-purple hover:to-neon-blue">
            Join Room
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default RoomCard;
