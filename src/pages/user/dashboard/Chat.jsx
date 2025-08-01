// frontend/frontend/src/pages/user/dashboard/Chat.jsx

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import ChatSidebar from '../../../components/chat/ChatSidebar';
import ChatWindow from '../../../components/chat/ChatWindow';
import globalWebSocketManager from '../../../services/globalWebSocketManager';

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

  const handleBack = () => {
    setSelectedFriend(null);
  };

  return (
    <div className="flex h-full bg-gray-950">
      {selectedFriend ? (
        <ChatWindow selectedFriend={selectedFriend} onBack={handleBack} />
      ) : (
        <ChatSidebar onSelectChat={handleSelectChat} selectedChatId={selectedFriend?.id} />
      )}
    </div>
  );
};

export default Chat;