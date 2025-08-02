import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { ScrollArea } from '../ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Send, MoreVertical } from 'lucide-react';
import chatWebSocketService from '../../services/chatWebSocketService';

const ChatWindow = ({ selectedFriend }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [pendingMessages, setPendingMessages] = useState(new Map()); // Track pending messages
  const messagesEndRef = useRef(null);
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    if (selectedFriend) {
      loadChatHistory();
      setupMessageListeners();
    }

    return () => {
      cleanupMessageListeners();
      // Clear pending messages when switching chats
      setPendingMessages(new Map());
    };
  }, [selectedFriend]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const setupMessageListeners = () => {
    chatWebSocketService.on('chat_message', handleIncomingMessage);
    chatWebSocketService.on('typing_indicator', handleTypingIndicator);
    chatWebSocketService.on('chat_history', handleChatHistory);
    chatWebSocketService.on('message_sent', handleMessageSent);
    chatWebSocketService.on('error', handleError);
  };

  const cleanupMessageListeners = () => {
    chatWebSocketService.off('chat_message', handleIncomingMessage);
    chatWebSocketService.off('typing_indicator', handleTypingIndicator);
    chatWebSocketService.off('chat_history', handleChatHistory);
    chatWebSocketService.off('message_sent', handleMessageSent);
    chatWebSocketService.off('error', handleError);
  };

  const handleIncomingMessage = (data) => {
    // Handle messages from the selected friend OR from the current user
    if (data.sender_id === selectedFriend.id || data.sender_id === user?.id) {
      const message = data.message;
      
      console.log('Received message:', message); // Debug log
      
      // Remove from pending if it exists (for user's own messages)
      if (data.sender_id === user?.id) {
        setPendingMessages(prev => {
          const newPending = new Map(prev);
          // Find and remove pending message with same content
          for (let [key, pendingMsg] of newPending.entries()) {
            if (pendingMsg.content === message.content && 
                pendingMsg.sender_id === message.sender_id) {
              console.log('Removing pending message:', key); // Debug log
              newPending.delete(key);
              break;
            }
          }
          return newPending;
        });
      }
      
      // Add message to the list if it's not already there
      setMessages(prev => {
        const exists = prev.some(msg => 
          msg.id === message.id || 
          (msg.content === message.content && 
           msg.sender_id === message.sender_id &&
           Math.abs(new Date(msg.sent_at) - new Date(message.sent_at)) < 5000) // Within 5 seconds
        );
        
        if (!exists) {
          console.log('Adding new message to list'); // Debug log
          return [...prev, message];
        }
        return prev;
      });
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
    // Clear any pending messages since we're loading fresh history
    setPendingMessages(new Map());
  };

  const handleMessageSent = (data) => {
    // Message was successfully sent and saved to database
    console.log('Message sent confirmation:', data);
    
    // Remove all pending messages since we got confirmation
    // The actual message should come through handleIncomingMessage
    setPendingMessages(prev => {
      console.log('Clearing pending messages after confirmation');
      return new Map();
    });
  };

  const handleError = (data) => {
    console.error('Chat error:', data);
    // Handle errors (e.g., show notification to user)
  };

  const loadChatHistory = () => {
    setLoading(true);
    setMessages([]); // Clear existing messages
    setPendingMessages(new Map()); // Clear pending messages
    chatWebSocketService.getChatHistory(selectedFriend.id);
  };

  const sendMessage = () => {
    if (newMessage.trim() && selectedFriend && chatWebSocketService.isConnected) {
      const messageContent = newMessage.trim();
      const tempId = `temp_${Date.now()}_${Math.random()}`; // More unique temp ID
      
      // Create optimistic message
      const optimisticMessage = {
        id: tempId,
        content: messageContent,
        sender_id: user.id,
        sender_username: user.username,
        sent_at: new Date().toISOString(),
        message_type: 'text',
        isPending: true
      };
      
      console.log('Creating optimistic message:', optimisticMessage); // Debug log
      
      // Add to pending messages
      setPendingMessages(prev => new Map(prev.set(tempId, optimisticMessage)));
      
      // Send message through WebSocket
      const success = chatWebSocketService.sendChatMessage(selectedFriend.id, messageContent);
      
      if (!success) {
        // Remove pending message if send failed
        setPendingMessages(prev => {
          const newPending = new Map(prev);
          newPending.delete(tempId);
          return newPending;
        });
        console.error('Failed to send message');
        return;
      }
      
      setNewMessage('');
      
      // Clear typing indicator
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
      chatWebSocketService.sendTyping(selectedFriend.id, false);
      
      // Set a timeout to remove pending message if no confirmation received
      setTimeout(() => {
        setPendingMessages(prev => {
          if (prev.has(tempId)) {
            console.log('Timeout: removing pending message', tempId);
            const newPending = new Map(prev);
            newPending.delete(tempId);
            return newPending;
          }
          return prev;
        });
      }, 10000); // 10 second timeout
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    
    // Send typing indicator
    if (selectedFriend && chatWebSocketService.isConnected) {
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
      
      chatWebSocketService.sendTyping(selectedFriend.id, true);
      
      const timeout = setTimeout(() => {
        chatWebSocketService.sendTyping(selectedFriend.id, false);
      }, 1000);
      
      setTypingTimeout(timeout);
    }
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

  // Combine real messages with pending messages for display
  const allMessages = [
    ...messages,
    ...Array.from(pendingMessages.values())
  ].sort((a, b) => new Date(a.sent_at) - new Date(b.sent_at));

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      {/* Chat Header - Fixed at top */}
      <div className="flex items-center gap-3 p-4 border-b border-gray-800 bg-gray-900 flex-shrink-0">
        <div className="relative">
          <Avatar className="h-10 w-10">
            <AvatarImage src={selectedFriend?.avatar} />
            <AvatarFallback className="bg-violet-600 text-white">
              {selectedFriend?.username?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {selectedFriend?.is_online && (
            <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-gray-900 shadow-lg" />
          )}
        </div>
        
        <div className="flex-1">
          <h3 className="font-semibold text-white text-lg">{selectedFriend?.username}</h3>
          <p className="text-sm text-gray-400">
            {selectedFriend?.is_online ? 'Online' : 'Offline'}
          </p>
        </div>
        
        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:bg-gray-800">
          <MoreVertical className="h-5 w-5" />
        </Button>
      </div>

      {/* Messages Area - Takes remaining height, scrollable */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="text-gray-400">Loading messages...</div>
              </div>
            ) : (
              <div className="space-y-4">
                {allMessages.map((message, index) => (
                  <div
                    key={message.id || index}
                    className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-lg ${
                        message.sender_id === user?.id
                          ? `bg-gradient-to-r from-violet-600 to-purple-600 text-white ${
                              message.isPending ? 'opacity-70' : ''
                            }`
                          : 'bg-gray-700 text-white border border-gray-600'
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{message.content}</p>
                      <div className="flex items-center justify-end gap-1 mt-2">
                        <p className="text-xs opacity-70">
                          {formatTime(message.sent_at)}
                        </p>
                        {message.isPending && (
                          <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin opacity-70"></div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-gray-700 text-white px-4 py-3 rounded-2xl border border-gray-600">
                      <div className="flex items-center space-x-1">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                        <span className="text-sm italic ml-2">typing...</span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Message Input - Fixed at bottom */}
      <div className="p-4 border-t border-gray-800 bg-gray-900 flex-shrink-0">
        <div className="flex gap-3">
          <Input
            value={newMessage}
            onChange={handleTyping}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-violet-500 focus:ring-violet-500/20 rounded-xl"
          />
          <Button
            onClick={sendMessage}
            disabled={!newMessage.trim() || !chatWebSocketService.isConnected}
            className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 disabled:opacity-50 rounded-xl px-4"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;