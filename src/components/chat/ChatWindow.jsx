import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  const [pendingMessages, setPendingMessages] = useState(new Map());
  const messagesEndRef = useRef(null);
  const currentMessageRef = useRef(''); 
  const userString = useSelector((state) => state.auth.user);
  const user = useMemo(() => {
    if(!userString) return null;
    try{
        const userData = typeof userString === 'string' ? JSON.parse(userString): userString;
        console.log("Parsed user data:",userData)
        return userData;
    }catch(error){
      console.error("Error on parsing userData",error)
      return null;
    }
  },[userString]);


  useEffect(() => {
    if (selectedFriend) {
      loadChatHistory();
      setupMessageListeners();
    }

    return () => {
      cleanupMessageListeners();
      setPendingMessages(new Map());
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
    };
  }, [selectedFriend]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, pendingMessages]);

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
    // Only handle messages from the selected friend (not from current user)
    if (data.sender_id === selectedFriend?.id) {
      const message = data.message;
      console.log('Received message from friend:', message);

      setMessages(prev => {
        // Check if message already exists
        const exists = prev.some(msg => msg.id === message.id);
        if (!exists) {
          return [...prev, message];
        }
        return prev;
      });
    }
  };

  const handleTypingIndicator = (data) => {
    if (data.sender_id === selectedFriend?.id) {
      setIsTyping(data.is_typing);
    }
  };

  const handleChatHistory = (data) => {
    console.log('Received chat history:', data.messages);
    setMessages(data.messages || []);
    setLoading(false);
    setPendingMessages(new Map());
  };

  const handleMessageSent = (data) => {
    console.log('Message sent confirmation:', data);

    // Convert pending message to real message
    const realMessage = {
      id: data.message_id,
      content: currentMessageRef.current,
      sender_id: user.id,
      sender_username: user.username,
      sent_at: data.timestamp,
      message_type: 'text',
      is_read: false
    };

    // Add the confirmed message to messages
    setMessages(prev => {
      // Check if message already exists
      const exists = prev.some(msg => msg.id === realMessage.id);
      if (!exists) {
        return [...prev, realMessage];
      }
      return prev;
    });

    // Clear pending messages
    setPendingMessages(new Map());
    currentMessageRef.current = '';
  };

  const handleError = (data) => {
    console.error('Chat error:', data);

    // Clear pending messages on error
    setPendingMessages(new Map());
    currentMessageRef.current = '';

    // You can show error notification here
    // showNotification('Error sending message', 'error');
  };

  const loadChatHistory = () => {
    if (!selectedFriend) return;

    setLoading(true);
    setMessages([]);
    setPendingMessages(new Map());

    const success = chatWebSocketService.getChatHistory(selectedFriend.id);
    if (!success) {
      setLoading(false);
      console.error('Failed to load chat history');
    }
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedFriend || !chatWebSocketService.isConnected) {
      return;
    }

    const messageContent = newMessage.trim();
    const tempId = `temp_${Date.now()}_${Math.random()}`;

    // Store current message for confirmation
    currentMessageRef.current = messageContent;

    // Create optimistic message for immediate display
    const optimisticMessage = {
      id: tempId,
      content: messageContent,
      sender_id: user.id,
      sender_username: user.username,
      sent_at: new Date().toISOString(),
      message_type: 'text',
      isPending: true
    };

    console.log('Creating optimistic message:', optimisticMessage);

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
      currentMessageRef.current = '';
      console.error('Failed to send message');
      return;
    }

    // Clear input
    setNewMessage('');

    // Clear typing indicator
    if (typingTimeout) {
      clearTimeout(typingTimeout);
      setTypingTimeout(null);
    }
    chatWebSocketService.sendTyping(selectedFriend.id, false);

    // Set timeout to remove pending message if no confirmation received
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
      currentMessageRef.current = '';
    }, 15000); // 15 second timeout
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

  console.log('Debug message display:', {
    currentUserId: user?.id,
    selectedFriendId: selectedFriend?.id,
    allMessages: allMessages.map(msg => ({
      id: msg.id,
      senderId: msg.sender_id,
      content: msg.content,
      isFromCurrentUser: msg.sender_id === user?.id
    }))
  });

  if (!selectedFriend) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-gray-400 text-lg">Select a friend to start chatting</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      {/* Chat Header */}
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

      {/* Messages Area */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="text-gray-400">Loading messages...</div>
              </div>
            ) : (
              <div className="space-y-4">
                {allMessages.length === 0 ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="text-gray-500 text-center">
                      <p>No messages yet</p>
                      <p className="text-sm">Start a conversation with {selectedFriend?.username}</p>
                    </div>
                  </div>
                ) : (
                  allMessages.map((message, index) => {
                    const currentUserId = user?.user_id || user?.id;
                    const isFromCurrentUser = Number(message.sender_id) === Number(currentUserId);

                    // Debug logging (remove this in production)
                    console.log(`Message ${message.id}: sender_id=${message.sender_id} (${typeof message.sender_id}), user.id=${user?.id} (${typeof user?.id}), isFromCurrentUser=${isFromCurrentUser}`);

                    return (
                      <div
                        key={message.id || index}
                        className={`flex ${isFromCurrentUser ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className="flex flex-col">
                          {/* Message bubble */}
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-lg ${isFromCurrentUser
                                ? `bg-gradient-to-r from-violet-600 to-purple-600 text-white ${message.isPending ? 'opacity-70' : ''
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

                          {/* Debug info - remove this in production */}
                          <div className={`text-xs opacity-50 mt-1 ${isFromCurrentUser ? 'text-right' : 'text-left'}`}>
                            From: {message.sender_username} (ID: {message.sender_id}) - {isFromCurrentUser ? 'You' : 'Friend'}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}

                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-gray-700 text-white px-4 py-3 rounded-2xl border border-gray-600">
                      <div className="flex items-center space-x-1">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        <span className="text-sm italic ml-2">{selectedFriend?.username} is typing...</span>
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

      {/* Message Input */}
      <div className="p-4 border-t border-gray-800 bg-gray-900 flex-shrink-0">
        <div className="flex gap-3">
          <Input
            value={newMessage}
            onChange={handleTyping}
            onKeyPress={handleKeyPress}
            placeholder={`Message ${selectedFriend?.username}...`}
            disabled={!chatWebSocketService.isConnected}
            className="flex-1 bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-violet-500 focus:ring-violet-500/20 rounded-xl disabled:opacity-50"
          />
          <Button
            onClick={sendMessage}
            disabled={!newMessage.trim() || !chatWebSocketService.isConnected}
            className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 disabled:opacity-50 rounded-xl px-4"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>

        {!chatWebSocketService.isConnected && (
          <div className="text-xs text-red-400 mt-2 text-center">
            Connection lost. Trying to reconnect...
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatWindow;