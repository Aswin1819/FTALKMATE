// frontend/frontend/src/components/chat/ChatWindow.jsx

import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { ScrollArea } from '../ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Send, ArrowLeft, MoreVertical } from 'lucide-react';
import chatWebSocketService from '../../services/chatWebSocketService';

const ChatWindow = ({ selectedFriend, onBack }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const messagesEndRef = useRef(null);
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    if (selectedFriend) {
      loadChatHistory();
      setupMessageListeners();
    }

    return () => {
      cleanupMessageListeners();
    };
  }, [selectedFriend]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const setupMessageListeners = () => {
    chatWebSocketService.on('chat_message', handleIncomingMessage);
    chatWebSocketService.on('typing_indicator', handleTypingIndicator);
    chatWebSocketService.on('chat_history', handleChatHistory);
  };

  const cleanupMessageListeners = () => {
    chatWebSocketService.off('chat_message', handleIncomingMessage);
    chatWebSocketService.off('typing_indicator', handleTypingIndicator);
    chatWebSocketService.off('chat_history', handleChatHistory);
  };

  const handleIncomingMessage = (data) => {
    if (data.sender_id === selectedFriend.id) {
      setMessages(prev => [...prev, data.message]);
    }
  };

  const handleTypingIndicator = (data) => {
    if (data.sender_id === selectedFriend.id) {
      setIsTyping(data.is_typing);
    }
  };

  const handleChatHistory = (data) => {
    setMessages(data.messages);
    setLoading(false);
  };

  const loadChatHistory = () => {
    setLoading(true);
    chatWebSocketService.getChatHistory(selectedFriend.id);
  };

  const sendMessage = () => {
    if (newMessage.trim() && selectedFriend) {
      chatWebSocketService.sendChatMessage(selectedFriend.id, newMessage.trim());
      setNewMessage('');
      
      // Clear typing indicator
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
      chatWebSocketService.sendTyping(selectedFriend.id, false);
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    
    // Send typing indicator
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    
    chatWebSocketService.sendTyping(selectedFriend.id, true);
    
    const timeout = setTimeout(() => {
      chatWebSocketService.sendTyping(selectedFriend.id, false);
    }, 1000);
    
    setTypingTimeout(timeout);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Chat Header */}
      <div className="flex items-center gap-3 p-4 border-b border-gray-800 bg-gray-900">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="text-gray-400 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        
        <div className="relative">
          <Avatar className="h-8 w-8">
            <AvatarImage src={selectedFriend?.avatar} />
            <AvatarFallback className="bg-violet-600 text-white">
              {selectedFriend?.username?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {selectedFriend?.is_online && (
            <div className="absolute -bottom-1 -right-1 h-2.5 w-2.5 bg-green-500 rounded-full border border-gray-900" />
          )}
        </div>
        
        <div className="flex-1">
          <h3 className="font-medium text-white">{selectedFriend?.username}</h3>
          <p className="text-sm text-gray-400">
            {selectedFriend?.is_online ? 'Online' : 'Offline'}
          </p>
        </div>
        
        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-gray-400">Loading messages...</div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={message.id || index}
                className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.sender_id === user?.id
                      ? 'bg-violet-600 text-white'
                      : 'bg-gray-700 text-white'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {formatTime(message.sent_at)}
                  </p>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-700 text-white px-4 py-2 rounded-lg">
                  <p className="text-sm italic">typing...</p>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-800">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={handleTyping}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 bg-gray-800 border-gray-700 text-white placeholder-gray-400"
          />
          <Button
            onClick={sendMessage}
            disabled={!newMessage.trim()}
            className="bg-violet-600 hover:bg-violet-700"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;