// frontend/frontend/src/components/chat/ChatSidebar.jsx

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { ScrollArea } from '../ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Search, Users, MessageSquare } from 'lucide-react';
import chatWebSocketService from '../../services/chatWebSocketService';

const ChatSidebar = ({ onSelectChat, selectedChatId }) => {
  const [friends, setFriends] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    // Get friends list when component mounts
    chatWebSocketService.on('friends_list', handleFriendsList);
    chatWebSocketService.on('connection', handleConnection);
    
    if (chatWebSocketService.isConnected) {
      chatWebSocketService.getFriendsList();
    }

    return () => {
      chatWebSocketService.off('friends_list', handleFriendsList);
      chatWebSocketService.off('connection', handleConnection);
    };
  }, []);

  const handleConnection = (data) => {
    if (data.status === 'connected') {
      chatWebSocketService.getFriendsList();
    }
  };

  const handleFriendsList = (data) => {
    setFriends(data.friends);
    setLoading(false);
  };

  const filteredFriends = friends.filter(friend =>
    friend.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatLastSeen = (lastSeen) => {
    if (!lastSeen) return 'Never';
    const date = new Date(lastSeen);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="w-80 h-full bg-gray-900 border-r border-gray-800 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare className="h-5 w-5 text-violet-400" />
          <h2 className="text-lg font-semibold text-white">Chats</h2>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search friends..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400"
          />
        </div>
      </div>

      {/* Friends List */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-gray-400">Loading friends...</div>
            </div>
          ) : filteredFriends.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-gray-400">
              <Users className="h-8 w-8 mb-2" />
              <p>No friends found</p>
              <p className="text-sm">Follow people to start chatting</p>
            </div>
          ) : (
            filteredFriends.map((friend) => (
              <div
                key={friend.id}
                onClick={() => onSelectChat(friend)}
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedChatId === friend.id
                    ? 'bg-violet-600/20 border border-violet-500/30'
                    : 'hover:bg-gray-800'
                }`}
              >
                <div className="relative">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={friend.avatar} />
                    <AvatarFallback className="bg-violet-600 text-white">
                      {friend.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {friend.is_online && (
                    <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-gray-900" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-white truncate">
                      {friend.username}
                    </h3>
                    <span className="text-xs text-gray-400">
                      {formatLastSeen(friend.last_seen)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 truncate">
                    {friend.is_online ? 'Online' : 'Offline'}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ChatSidebar;