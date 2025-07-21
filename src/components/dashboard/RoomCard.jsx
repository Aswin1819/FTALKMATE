import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '../../components/ui/button';
import { Card, CardHeader, CardContent, CardFooter } from '../../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Mic, Video, Users, Lock, Pencil, Clock, Globe } from 'lucide-react';

const RoomCard = ({
  room,
  index = 0,
  onJoin,
  isHost = false,
  onEdit,
  showEdit = false,
  disabled = false,
  timeAgo = '',
}) => {
  const tags = room.tags ? room.tags.map(tag => typeof tag === 'string' ? tag : tag.name) : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="h-full"
    >
      <Card className="relative h-full flex flex-col overflow-hidden bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105">
        {showEdit && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 z-10"
            onClick={onEdit}
            title="Edit Room"
          >
            <Pencil className="h-5 w-5 text-neon-purple" />
          </Button>
        )}
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <h3 className="text-xl font-semibold text-white group-hover:text-neon-purple transition-colors flex-1 mr-2">
              {room.title}
            </h3>
            {room.is_private && (
              <Lock className="h-4 w-4 text-yellow-400 flex-shrink-0" />
            )}
          </div>
          {room.description && (
            <p className="text-sm text-gray-400 mt-1 line-clamp-2">
              {room.description}
            </p>
          )}
          <div className="flex flex-wrap gap-1 mt-2">
            {room.language_name && (
              <span className="bg-neon-blue/10 border-neon-blue/20 text-neon-blue text-xs px-2 py-1 rounded-full flex items-center">
                <Globe className="h-3 w-3 mr-1" />
                {room.language_name}
              </span>
            )}
            {room.room_type_name && (
              <span className="bg-neon-purple/10 border-neon-purple/20 text-neon-purple text-xs px-2 py-1 rounded-full">
                {room.room_type_name}
              </span>
            )}
            {tags.slice(0, 2).map((tag, i) => (
              <span key={tag + i} className="text-xs px-2 py-1 rounded-full bg-white/5 border-white/10 text-gray-300">
                {tag}
              </span>
            ))}
            {tags.length > 2 && (
              <span className="text-xs px-2 py-1 rounded-full bg-white/5 border-white/10 text-gray-300">
                +{tags.length - 2}
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent className="pb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <Avatar className="h-8 w-8 border border-white/10">
                <AvatarImage src={room.host_avatar || '/default-avatar.png'} />
                <AvatarFallback className="bg-gradient-to-r from-neon-purple to-neon-blue text-white text-xs">
                  {room.host_username?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-gray-400 ml-2">by {room.host_username || 'Unknown'}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                <Users className="h-4 w-4 text-gray-400 mr-1" />
                <span className="text-sm text-gray-400">
                  {room.participant_count || 0}/{room.max_participants}
                </span>
              </div>
              {room.hasVideo ? (
                <Video className="h-4 w-4 text-neon-purple" />
              ) : (
                <Mic className="h-4 w-4 text-neon-blue" />
              )}
            </div>
          </div>
          {timeAgo && (
            <div className="flex items-center text-xs text-gray-500">
              <Clock className="h-3 w-3 mr-1" />
              Started {timeAgo}
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button
            onClick={onJoin}
            disabled={disabled}
            className="w-full bg-gradient-to-r from-neon-blue to-neon-purple text-white hover:from-neon-purple hover:to-neon-blue transition-all hover:glow-purple disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {disabled ? 'Room Full' : 'Join Room'}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default RoomCard;
