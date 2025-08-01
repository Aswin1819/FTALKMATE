import chatWebSocketService from './chatWebSocketService';
import notificationWebSocketService from './notificationWebSocketService';
import { toast } from '../hooks/use-toast';

class GlobalWebSocketManager {
  constructor() {
    this.isInitialized = false;
    this.connectionStatus = {
      chat: false,
      notifications: false
    };
  }

  async initialize() {
    if (this.isInitialized) return;

    try {
      // Connect to both services
      await Promise.all([
        chatWebSocketService.connect(),
        notificationWebSocketService.connect()
      ]);

      this.setupEventListeners();
      this.isInitialized = true;
      console.log('Global WebSocket Manager initialized');
    } catch (error) {
      console.error('Failed to initialize Global WebSocket Manager:', error);
    }
  }

  setupEventListeners() {
    // Chat WebSocket events
    chatWebSocketService.on('connection', (data) => {
      this.connectionStatus.chat = data.status === 'connected';
      console.log('Chat WebSocket status:', data.status);
    });

    // Notification WebSocket events
    notificationWebSocketService.on('connection', (data) => {
      this.connectionStatus.notifications = data.status === 'connected';
      console.log('Notification WebSocket status:', data.status);
    });

    // Handle notifications
    notificationWebSocketService.on('notification', (data) => {
      this.handleNewNotification(data.notification);
    });

    // Handle chat messages
    chatWebSocketService.on('chat_message', (data) => {
      this.handleNewChatMessage(data);
    });
  }

  handleNewNotification(notification) {
    // Show toast notification
    toast({
      title: notification.title,
      description: notification.message,
      variant: "default"
    });

    // Update notification count in UI
    window.dispatchEvent(new CustomEvent('newNotification', {
      detail: notification
    }));
  }

  handleNewChatMessage(data) {
    // Show chat notification if user is not in chat
    toast({
      title: `New message from ${data.sender_username}`,
      description: data.message.content,
      variant: "default"
    });

    // Update chat UI
    window.dispatchEvent(new CustomEvent('newChatMessage', {
      detail: data
    }));
  }

  disconnect() {
    chatWebSocketService.disconnect();
    notificationWebSocketService.disconnect();
    this.isInitialized = false;
  }

  getConnectionStatus() {
    return this.connectionStatus;
  }
}

export default new GlobalWebSocketManager();