import { fetchAccessToken } from "../api/auth";

class ChatWebSocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.messageHandlers = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectTimer = null;
  }

  async connect() {
    const token = await fetchAccessToken();
    if (!token) {
      console.error("Cannot connect: token not found");
      return false;
    }

    const wsUrl = `wss://api.talkmate.aswinskumar.space/ws/chat/?token=${token}`;
    
    try {
      this.socket = new WebSocket(wsUrl);
      this.setupEventListeners();
      return true;
    } catch (error) {
      console.error('Chat WebSocket connection error:', error);
      throw error;
    }
  }

  setupEventListeners() {
    this.socket.onopen = () => {
      console.log('Chat WebSocket connected');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = null;
      }
      this.triggerHandler('connection', { status: 'connected' });
    };

    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('Received WebSocket message:', data); // Debug log
        this.handleMessage(data);
      } catch (error) {
        console.error('Error parsing Chat WebSocket message:', error);
      }
    };

    this.socket.onclose = async (event) => {
      console.log('Chat WebSocket disconnected:', event.code, event.reason);
      this.isConnected = false;
      this.triggerHandler('connection', { status: 'disconnected' });
      
      // Auto-reconnect logic for non-normal closures
      if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectTimer = setTimeout(async () => {
          this.reconnectAttempts++;
          console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
          await this.connect();
        }, Math.min(3000 * this.reconnectAttempts, 30000)); // Exponential backoff, max 30s
      }
    };

    this.socket.onerror = (error) => {
      console.error('Chat WebSocket error:', error);
      this.triggerHandler('error', { error });
    };
  }

  handleMessage(data) {
    const { type } = data;
    
    switch (type) {
      case 'chat_message':
        this.triggerHandler('chat_message', data);
        break;
      case 'typing_indicator':
        this.triggerHandler('typing_indicator', data);
        break;
      case 'read_receipt':
        this.triggerHandler('read_receipt', data);
        break;
      case 'chat_history':
        this.triggerHandler('chat_history', data);
        break;
      case 'friends_list':
        this.triggerHandler('friends_list', data);
        break;
      case 'message_sent':
        this.triggerHandler('message_sent', data);
        break;
      case 'error':
        console.error('WebSocket error:', data);
        this.triggerHandler('error', data);
        break;
      default:
        console.log('Unknown chat message type:', type, data);
    }
  }

  // Event handling methods
  on(event, handler) {
    if (!this.messageHandlers.has(event)) {
      this.messageHandlers.set(event, []);
    }
    this.messageHandlers.get(event).push(handler);
  }

  off(event, handler) {
    if (this.messageHandlers.has(event)) {
      const handlers = this.messageHandlers.get(event);
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  triggerHandler(event, data) {
    if (this.messageHandlers.has(event)) {
      this.messageHandlers.get(event).forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error in ${event} handler:`, error);
        }
      });
    }
  }

  // Message sending methods
  sendChatMessage(recipientId, content, messageType = 'text') {
    if (!this.isConnected) {
      console.error('Cannot send message: WebSocket not connected');
      this.triggerHandler('error', { error: 'Connection lost. Please wait while we reconnect...' });
      return false;
    }

    const messageData = {
      type: 'chat_message',
      recipient_id: recipientId,
      content: content,
      message_type: messageType
    };

    console.log('Sending message:', messageData); // Debug log
    return this.send(messageData);
  }

  sendTyping(recipientId, isTyping) {
    if (!this.isConnected) {
      return false;
    }

    return this.send({
      type: 'typing',
      recipient_id: recipientId,
      is_typing: isTyping
    });
  }

  sendReadReceipt(messageId) {
    if (!this.isConnected) {
      return false;
    }

    return this.send({
      type: 'read_receipt',
      message_id: messageId
    });
  }

  getChatHistory(userId) {
    if (!this.isConnected) {
      console.error('Cannot get chat history: WebSocket not connected');
      return false;
    }

    return this.send({
      type: 'get_chat_history',
      user_id: userId
    });
  }

  getFriendsList() {
    if (!this.isConnected) {
      console.error('Cannot get friends list: WebSocket not connected');
      return false;
    }

    return this.send({
      type: 'get_friends_list'
    });
  }

  send(data) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      try {
        this.socket.send(JSON.stringify(data));
        return true;
      } catch (error) {
        console.error('Error sending WebSocket message:', error);
        return false;
      }
    } else {
      console.error('Cannot send: WebSocket is not open');
      return false;
    }
  }

  disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    if (this.socket) {
      this.socket.close(1000); // Normal closure
      this.socket = null;
    }
    this.isConnected = false;
    this.reconnectAttempts = 0;
  }

  // Utility method to check connection status
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      readyState: this.socket ? this.socket.readyState : WebSocket.CLOSED,
      reconnectAttempts: this.reconnectAttempts
    };
  }
}

export default new ChatWebSocketService();