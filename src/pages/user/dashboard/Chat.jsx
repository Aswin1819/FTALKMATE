// frontend/frontend/src/pages/user/dashboard/Chat.jsx

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import ChatSidebar from '../../../components/chat/ChatSidebar';
import ChatWindow from '../../../components/chat/ChatWindow';
import globalWebSocketManager from '../../../services/globalWebSocketManager';
import { MessageSquare } from 'lucide-react';

const Chat = () => {
  const [selectedFriend, setSelectedFriend] = useState(null);
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    // Initialize WebSocket connections
    if (!globalWebSocketManager.isInitialized) {
        globalWebSocketManager.initialize();
      }
      
  }, []);

  const handleSelectChat = (friend) => {
    setSelectedFriend(friend);
  };

  return (
    <div className="flex h-screen bg-gray-950">
      {/* Persistent ChatSidebar - Fixed width, full height */}
      <ChatSidebar onSelectChat={handleSelectChat} selectedChatId={selectedFriend?.id} />
      
      {/* Chat Window Area - Takes remaining width, full height */}
      <div className="flex-1 flex flex-col h-full">
        {selectedFriend ? (
          <ChatWindow selectedFriend={selectedFriend} />
        ) : (
          // Placeholder when no friend is selected
          <div className="flex-1 flex flex-col items-center justify-center bg-gray-900">
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-violet-600/20 rounded-full flex items-center justify-center mx-auto">
                <MessageSquare className="h-10 w-10 text-violet-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Select a chat to start messaging</h3>
                <p className="text-gray-400">Choose a friend from the sidebar to begin your conversation</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;