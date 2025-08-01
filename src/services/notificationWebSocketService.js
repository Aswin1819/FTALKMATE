import { fetchAccessToken } from "../api/auth";

class NotificationWebSocketService {
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

    const wsUrl = `wss://api.talkmate.aswinskumar.space/ws/notifications/?token=${token}`;
    
    try {
      this.socket = new WebSocket(wsUrl);
      this.setupEventListeners();
    } catch (error) {
      console.error('Notification WebSocket connection error:', error);
      throw error;
    }
  }

  setupEventListeners() {
    this.socket.onopen = () => {
      console.log('Notification WebSocket connected');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.triggerHandler('connection', { status: 'connected' });
    };

    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.handleMessage(data);
      } catch (error) {
        console.error('Error parsing Notification WebSocket message:', error);
      }
    };

    this.socket.onclose = async (event) => {
      console.log('Notification WebSocket disconnected:', event.code, event.reason);
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
      console.error('Notification WebSocket error:', error);
      this.triggerHandler('error', { error });
    };
  }

  handleMessage(data) {
    const { type } = data;
    
    switch (type) {
      case 'notification':
        this.triggerHandler('notification', data);
        break;
      case 'notification_count_update':
        this.triggerHandler('notification_count_update', data);
        break;
      case 'notifications_list':
        this.triggerHandler('notifications_list', data);
        break;
      case 'notification_count':
        this.triggerHandler('notification_count', data);
        break;
      case 'notification_marked_read':
        this.triggerHandler('notification_marked_read', data);
        break;
      case 'error':
        this.triggerHandler('error', data);
        break;
      default:
        console.log('Unknown notification message type:', type, data);
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
  markAsRead(notificationId) {
    this.send({
      type: 'mark_as_read',
      notification_id: notificationId
    });
  }

  getNotifications(limit = 20) {
    this.send({
      type: 'get_notifications',
      limit: limit
    });
  }

  getNotificationCount() {
    this.send({
      type: 'get_notification_count'
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

export default new NotificationWebSocketService();