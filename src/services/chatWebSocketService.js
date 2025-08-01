import { fetchAccessToken } from "../api/auth";

class ChatWebSocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.messageHandlers = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  async connect() {
    const token = await fetchAccessToken();
    if (!token) {
      console.error("Cannot connect: token not found");
      return;
    }

    const wsUrl = `wss://api.talkmate.aswinskumar.space/ws/chat/?token=${token}`;
    
    try {
      this.socket = new WebSocket(wsUrl);
      this.setupEventListeners();
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
      this.triggerHandler('connection', { status: 'connected' });
    };

    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.handleMessage(data);
      } catch (error) {
        console.error('Error parsing Chat WebSocket message:', error);
      }
    };

    this.socket.onclose = async (event) => {
      console.log('Chat WebSocket disconnected:', event.code, event.reason);
      this.isConnected = false;
      this.triggerHandler('connection', { status: 'disconnected' });
      
      // Auto-reconnect logic
      if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
        setTimeout(async () => {
          this.reconnectAttempts++;
          await this.connect();
        }, 3000);
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
      this.messageHandlers.get(event).forEach(handler => handler(data));
    }
  }

  // Message sending methods
  sendChatMessage(recipientId, content, messageType = 'text') {
    this.send({
      type: 'chat_message',
      recipient_id: recipientId,
      content: content,
      message_type: messageType
    });
  }

  sendTyping(recipientId, isTyping) {
    this.send({
      type: 'typing',
      recipient_id: recipientId,
      is_typing: isTyping
    });
  }

  sendReadReceipt(messageId) {
    this.send({
      type: 'read_receipt',
      message_id: messageId
    });
  }

  getChatHistory(userId) {
    this.send({
      type: 'get_chat_history',
      user_id: userId
    });
  }

  getFriendsList() {
    this.send({
      type: 'get_friends_list'
    });
  }

  send(data) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(data));
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.isConnected = false;
  }
}

export default new ChatWebSocketService();