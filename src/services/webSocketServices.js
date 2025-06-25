import { fetchAccessToken } from "../api/auth";

// services/WebSocketService.js
class WebSocketService {
  constructor() {
    this.socket = null;
    this.roomId = null;
    this.isConnected = false;
    this.messageHandlers = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectInterval = 3000;
  }

  async connect(roomId) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.disconnect();
    }

    this.roomId = roomId;
    const token = await fetchAccessToken();
    if(!token){
        console.error("Cannot connect : token not found");
        return;
    }

    const wsUrl = `ws://127.0.0.1:8000/ws/room/${roomId}/?token=${token}`;
    
    try {
      this.socket = new WebSocket(wsUrl);
      this.setupEventListeners();
    } catch (error) {
      console.error('WebSocket connection error:', error);
      throw error;
    }
  }

  setupEventListeners() {
    this.socket.onopen = () => {
      console.log('WebSocket connected');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.triggerHandler('connection', { status: 'connected' });
    };

    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('WebSocket message received:', data);
        this.handleMessage(data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    this.socket.onclose = async (event) => {
      console.log('WebSocket disconnected:', event.code, event.reason);
      this.isConnected = false;
      this.triggerHandler('connection', { status: 'disconnected' });
      
      // Auto-reconnect logic
      if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
        setTimeout(async () => {
          this.reconnectAttempts++;
          console.log(`Reconnecting... Attempt ${this.reconnectAttempts}`);
          const token = await fetchAccessToken();     
          if (token && this.roomId) {
            const wsUrl = `ws://127.0.0.1:8000/ws/room/${this.roomId}/?token=${token}`;
            this.socket = new WebSocket(wsUrl);
            this.setupEventListeners();
         }
        }, this.reconnectInterval);
      }
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.triggerHandler('error', { error });
    };
  }

  handleMessage(data) {
    const { type } = data;
    
    switch (type) {
      case 'room_state':
        this.triggerHandler('room_state', data);
        break;
      case 'user_joined':
        this.triggerHandler('user_joined', data);
        break;
      case 'user_left':
        this.triggerHandler('user_left', data);
        break;
      case 'chat_message':
        this.triggerHandler('chat_message', data);
        break;
      case 'webrtc_offer':
        this.triggerHandler('webrtc_offer', data);
        break;
      case 'webrtc_answer':
        this.triggerHandler('webrtc_answer', data);
        break;
      case 'ice_candidate':
        this.triggerHandler('ice_candidate', data);
        break;
      case 'user_mute_toggle':
        this.triggerHandler('user_mute_toggle', data);
        break;
      case 'hand_raised':
        this.triggerHandler('hand_raised', data);
        break;
      default:
        console.log('Unknown message type:', type, data);
    }
  }

  // Register event handlers
  on(event, handler) {
    if (!this.messageHandlers.has(event)) {
      this.messageHandlers.set(event, []);
    }
    this.messageHandlers.get(event).push(handler);
  }

  // Remove event handlers
  off(event, handler) {
    if (this.messageHandlers.has(event)) {
      const handlers = this.messageHandlers.get(event);
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  // Trigger event handlers
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

  // Send messages
  send(data) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(data));
    } else {
      console.error('WebSocket is not connected');
    }
  }

  // Chat message
  sendChatMessage(message) {
    this.send({
      type: 'chat_message',
      message: message
    });
  }

  // WebRTC signaling
  sendWebRTCOffer(targetUserId, offer) {
    this.send({
      type: 'webrtc_offer',
      target_user_id: targetUserId,
      offer: offer
    });
  }

  sendWebRTCAnswer(targetUserId, answer) {
    this.send({
      type: 'webrtc_answer',
      target_user_id: targetUserId,
      answer: answer
    });
  }

  sendICECandidate(targetUserId, candidate) {
    this.send({
      type: 'webrtc_ice_candidate',
      target_user_id: targetUserId,
      candidate: candidate
    });
  }

  // User actions
  toggleMute(isMuted) {
    this.send({
      type: 'toggle_mute',
      is_muted: isMuted
    });
  }

  raiseHand(handRaised) {
    this.send({
      type: 'raise_hand',
      hand_raised: handRaised
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.close(1000, 'User disconnected');
      this.socket = null;
      this.isConnected = false;
      this.roomId = null;
    }
  }

  getConnectionStatus() {
    return this.isConnected;
  }
}

// Create singleton instance
const webSocketService = new WebSocketService();
export default webSocketService;