import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Mic, MicOff, Video, VideoOff, MessageCircle, X, Send, LogOut, HandMetal, PhoneOff, Users } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { toast } from '../../../hooks/use-toast';
import roomApi from '../../../api/roomApi';
import { fetchAccessToken } from '../../../api/auth';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "../../../components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../../components/ui/dialog";
import { Textarea } from "../../../components/ui/textarea";

const LiveRoom = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();

  // WebSocket and WebRTC refs
  const wsRef = useRef(null);
  const localStreamRef = useRef(null);
  const localVideoRef = useRef(null);
  const peerConnectionsRef = useRef({}); // userId -> RTCPeerConnection
  const remoteStreamsRef = useRef({}); // userId -> MediaStream
  const iceCandidateQueueRef = useRef({}); // userId -> ICE candidates array
  const connectionStatesRef = useRef({}); // userId -> connection state

  const processedMessages = useRef(new Set()); // For deduplication
  const connectionStates = useRef({}); // For connection state tracking

  // Room state
  const [room, setRoom] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Media controls
  const [isMuted, setIsMuted] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(false);
  const [isVideoMode, setIsVideoMode] = useState(false);
  const [mediaReady, setMediaReady] = useState(false);

  // UI state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isWebSocketOpen, setIsWebSocketOpen] = useState(false);

  // Report user state
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportTarget, setReportTarget] = useState(null);
  const [reportReason, setReportReason] = useState("");

  // WebRTC configuration
  const rtcConfiguration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' }
    ]
  };

  // Initialize room data
  const initializeRoom = useCallback(async () => {
    try {
      setLoading(true);
      const roomData = await roomApi.getRoomDetails(roomId);
      setRoom(roomData);

      const participantsData = await roomApi.getRoomParticipants(roomId);
      setParticipants(participantsData);

      const messagesData = await roomApi.getRoomMessages(roomId);
      setChatMessages(messagesData.reverse());

      const token = await fetchAccessToken();
      if (token) {
        console.log("Token in LiveRoom:", token);
        const userData = JSON.parse(atob(token.split('.')[1]));
        setCurrentUser({
          id: userData.user_id,
          username: userData.username
        });
      }
    } catch (err) {
      console.error('Error initializing room:', err);
      setError('Failed to load room data');
      toast({
        title: "Error",
        description: "Failed to load room data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  // Initialize media stream
  const initializeMedia = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true
      });

      localStreamRef.current = stream;

      // Set initial states
      stream.getAudioTracks().forEach(track => {
        track.enabled = !isMuted;
      });

      stream.getVideoTracks().forEach(track => {
        track.enabled = videoEnabled;
      });

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        localVideoRef.current.play().catch(e => console.log('Video play failed:', e));
      }

      setMediaReady(true);
      console.log('Media initialized successfully');
    } catch (err) {
      console.error('Error accessing media devices:', err);
      setMediaReady(false);
      toast({
        title: "Media Access Error",
        description: "Could not access camera/microphone. Please check permissions.",
        variant: "destructive"
      });
    }
  }, []);

  // --- Fix WebSocket connection multiplicity ---
  const connectWebSocket = useCallback(async () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected');
      return;
    }
    if (wsRef.current) {
      wsRef.current.close();
    }
    try {
      const token = await fetchAccessToken();
      if (!token) {
        throw new Error('No access token available');
      }
      const wsUrl = `ws://localhost:8000/ws/room/${roomId}/?token=${token}`;
      wsRef.current = new WebSocket(wsUrl);
      wsRef.current.onopen = () => {
        console.log('WebSocket connected');
        setIsWebSocketOpen(true);
      };
      wsRef.current.onmessage = (event) => {
        let data;
        try {
          data = JSON.parse(event.data);
        } catch (e) {
          console.error('Invalid WebSocket message:', event.data);
          return;
        }
        // --- Message deduplication ---
        const messageId = data.message_id || data.id || (data.type + '-' + (data.from_user_id || data.user_id || '') + '-' + (data.timestamp || ''));
        if (processedMessages.current.has(messageId)) {
          //console.log('Duplicate message, skipping:', messageId);
          return;
        }
        processedMessages.current.add(messageId);
        handleWebSocketMessage(data);
      };
      wsRef.current.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        setIsWebSocketOpen(false);
        if (event.code !== 1000) {
          setTimeout(connectWebSocket, 3000);
        }
      };
      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsWebSocketOpen(false);
        toast({
          title: "Connection Error",
          description: "Lost connection to room. Attempting to reconnect...",
          variant: "destructive"
        });
      };
    } catch (err) {
      console.error('Error connecting WebSocket:', err);
      setError('Failed to connect to room');
    }
  }, [roomId]);

  // Send WebSocket message safely
  const sendWebSocketMessage = useCallback((message) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
      return true;
    }
    console.warn('WebSocket not ready, message not sent:', message);
    return false;
  }, []);

  // --- Enhanced createPeerConnection with improved ontrack handler and signaling guards ---
  const createPeerConnection = useCallback((userId) => {
    console.log(`Creating peer connection for user ${userId}`);

    const peerConnection = new RTCPeerConnection(rtcConfiguration);

    // Set connection state
    connectionStatesRef.current[userId] = 'creating';

    // Add local stream tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        console.log(`Adding ${track.kind} track to peer connection for user ${userId}`);
        peerConnection.addTrack(track, localStreamRef.current);
      });
    }

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        console.log(`Sending ICE candidate to user ${userId}`);
        sendWebSocketMessage({
          type: 'webrtc_ice_candidate',
          target_user_id: userId,
          candidate: event.candidate
        });
      }
    };

    // Enhanced ontrack handler: aggregate all tracks for a user
    peerConnection.ontrack = (event) => {
      let remoteStream = remoteStreamsRef.current[userId];
      if (!remoteStream) {
        remoteStream = new MediaStream();
        remoteStreamsRef.current[userId] = remoteStream;
      }
      event.streams[0].getTracks().forEach(track => {
        if (!remoteStream.getTracks().some(t => t.id === track.id)) {
          remoteStream.addTrack(track);
        }
      });
      setParticipants(prev => [...prev]); // Force re-render
    };

    // Connection state monitoring
    peerConnection.onconnectionstatechange = () => {
      const state = peerConnection.connectionState;
      console.log(`Peer connection state for user ${userId}: ${state}`);
      connectionStatesRef.current[userId] = state;

      if (state === 'failed' || state === 'disconnected') {
        console.log(`Connection failed for user ${userId}, cleaning up`);
        cleanupPeerConnection(userId);
      }
    };

    peerConnection.oniceconnectionstatechange = () => {
      console.log(`ICE connection state for user ${userId}: ${peerConnection.iceConnectionState}`);
    };

    peerConnection.onsignalingstatechange = () => {
      console.log(`Signaling state for user ${userId}: ${peerConnection.signalingState}`);
    };

    peerConnectionsRef.current[userId] = peerConnection;
    return peerConnection;
  }, [sendWebSocketMessage]);

  // --- Enhanced cleanupPeerConnection ---
  const cleanupPeerConnection = useCallback((userId) => {
    console.log(`Cleaning up peer connection for user ${userId}`);

    if (peerConnectionsRef.current[userId]) {
      peerConnectionsRef.current[userId].close();
      delete peerConnectionsRef.current[userId];
    }

    if (remoteStreamsRef.current[userId]) {
      remoteStreamsRef.current[userId].getTracks().forEach(track => track.stop());
      delete remoteStreamsRef.current[userId];
    }

    delete iceCandidateQueueRef.current[userId];
    delete connectionStatesRef.current[userId];

    setParticipants(prev => [...prev]);
  }, []);

  // --- Fix shouldInitiateConnection logic ---
  const shouldInitiateConnection = useCallback((userId) => {
    // Only the user with HIGHER ID should initiate
    return currentUser && currentUser.id > userId;
  }, [currentUser]);

  // --- Add proper cleanup before creating new connection ---
  const cleanupAndCreateConnection = async (userId) => {
    if (peerConnectionsRef.current[userId]) {
      peerConnectionsRef.current[userId].close();
      delete peerConnectionsRef.current[userId];
    }
    if (remoteStreamsRef.current[userId]) {
      remoteStreamsRef.current[userId].getTracks().forEach(track => track.stop());
      delete remoteStreamsRef.current[userId];
    }
    if (iceCandidateQueueRef.current[userId]) {
      iceCandidateQueueRef.current[userId] = [];
    }
    connectionStates.current[userId] = 'new';
    await createPeerConnection(userId);
  };

  // --- Enhanced initiateWebRTCConnection with connectionStates and signaling state validation ---
  const initiateWebRTCConnection = useCallback(async (userId) => {
    if (connectionStates.current[userId] === 'connecting' || connectionStates.current[userId] === 'connected') {
      return;
    }
    connectionStates.current[userId] = 'connecting';
    try {
      // Clean up before creating new connection
      await cleanupAndCreateConnection(userId);
      const peerConnection = peerConnectionsRef.current[userId] || createPeerConnection(userId);
      // --- Signaling state guard before offer ---
      const isValidStateForOffer = ['stable', 'have-local-offer'].includes(peerConnection.signalingState);
      if (!isValidStateForOffer) {
        console.warn(`Cannot create offer, signaling state is ${peerConnection.signalingState}`);
        cleanupPeerConnection(userId);
        connectionStates.current[userId] = 'failed';
        return;
      }
      const offer = await peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      });
      await peerConnection.setLocalDescription(offer);
      const success = sendWebSocketMessage({
        type: 'webrtc_offer',
        target_user_id: userId,
        offer: offer
      });
      if (success) {
        console.log(`Sent WebRTC offer to user ${userId}`);
      } else {
        throw new Error('Failed to send WebRTC offer');
      }
    } catch (err) {
      console.error(`Error initiating WebRTC connection to user ${userId}:`, err);
      cleanupPeerConnection(userId);
      connectionStates.current[userId] = 'failed';
    }
  }, [shouldInitiateConnection, createPeerConnection, sendWebSocketMessage, cleanupPeerConnection]);

  // --- Enhanced handleWebRTCOffer with signaling state validation ---
  const handleWebRTCOffer = useCallback(async (data) => {
    try {
      const { from_user_id, offer } = data;
      console.log(`Received WebRTC offer from user ${from_user_id}`);
      if (shouldInitiateConnection(from_user_id)) {
        console.log(`Waiting for user ${from_user_id} to initiate connection`);
        return;
      }
      let peerConnection = peerConnectionsRef.current[from_user_id];
      if (peerConnection) {
        const signalingState = peerConnection.signalingState;
        if (signalingState !== 'stable') {
          console.log(`Cleaning up existing connection in state: ${signalingState}`);
          cleanupPeerConnection(from_user_id);
          peerConnection = null;
        }
      }
      if (!peerConnection) {
        peerConnection = createPeerConnection(from_user_id);
      }
      // --- Signaling state guard before setRemoteDescription ---
      const isValidStateForOffer = ['stable', 'have-local-offer'].includes(peerConnection.signalingState);
      if (!isValidStateForOffer) {
        console.warn(`Cannot set remote description, signaling state is ${peerConnection.signalingState}`);
        cleanupPeerConnection(from_user_id);
        connectionStates.current[from_user_id] = 'failed';
        return;
      }
      await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
      console.log(`Set remote description for user ${from_user_id}`);
      const answer = await peerConnection.createAnswer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      });
      await peerConnection.setLocalDescription(answer);
      const success = sendWebSocketMessage({
        type: 'webrtc_answer',
        target_user_id: from_user_id,
        answer: answer
      });
      if (success) {
        console.log(`Sent WebRTC answer to user ${from_user_id}`);
      }
      const queuedCandidates = iceCandidateQueueRef.current[from_user_id] || [];
      for (const candidate of queuedCandidates) {
        try {
          await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
          console.log(`Added queued ICE candidate for user ${from_user_id}`);
        } catch (err) {
          console.error('Error adding queued ICE candidate:', err);
        }
      }
      iceCandidateQueueRef.current[from_user_id] = [];
      connectionStates.current[from_user_id] = 'connected';
    } catch (err) {
      console.error(`Error handling WebRTC offer from ${data.from_user_id}:`, err);
      cleanupPeerConnection(data.from_user_id);
      connectionStates.current[data.from_user_id] = 'failed';
    }
  }, [shouldInitiateConnection, createPeerConnection, sendWebSocketMessage, cleanupPeerConnection]);

  // --- Enhanced handleWebRTCAnswer with signaling state validation ---
  const handleWebRTCAnswer = useCallback(async (data) => {
    try {
      const { from_user_id, answer } = data;
      console.log(`Received WebRTC answer from user ${from_user_id}`);
      const peerConnection = peerConnectionsRef.current[from_user_id];
      if (!peerConnection) {
        console.error(`No peer connection found for user ${from_user_id}`);
        return;
      }
      const signalingState = peerConnection.signalingState;
      console.log(`Current signaling state: ${signalingState}`);
      // Only handle answer if we're expecting one
      const isValidStateForAnswer = ['have-remote-offer', 'have-local-offer'].includes(signalingState);
      if (!isValidStateForAnswer) {
        console.warn(`Received answer in wrong signaling state: ${signalingState}`);
        return;
      }
      await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
      console.log(`Set remote description (answer) for user ${from_user_id}`);
      const queuedCandidates = iceCandidateQueueRef.current[from_user_id] || [];
      for (const candidate of queuedCandidates) {
        try {
          await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
          console.log(`Added queued ICE candidate for user ${from_user_id}`);
        } catch (err) {
          console.error('Error adding queued ICE candidate:', err);
        }
      }
      iceCandidateQueueRef.current[from_user_id] = [];
      connectionStates.current[from_user_id] = 'connected';
    } catch (err) {
      console.error(`Error handling WebRTC answer from ${data.from_user_id}:`, err);
      connectionStates.current[data.from_user_id] = 'failed';
    }
  }, []);

  // Handle ICE candidate
  const handleICECandidate = useCallback(async (data) => {
    try {
      const { from_user_id, candidate } = data;

      const peerConnection = peerConnectionsRef.current[from_user_id];
      if (!peerConnection) {
        console.warn(`No peer connection found for ICE candidate from user ${from_user_id}`);
        return;
      }

      const iceCandidate = new RTCIceCandidate(candidate);

      // Check if we can add the candidate now
      if (peerConnection.remoteDescription && peerConnection.remoteDescription.type) {
        await peerConnection.addIceCandidate(iceCandidate);
        console.log(`Added ICE candidate for user ${from_user_id}`);
      } else {
        // Queue the candidate
        if (!iceCandidateQueueRef.current[from_user_id]) {
          iceCandidateQueueRef.current[from_user_id] = [];
        }
        iceCandidateQueueRef.current[from_user_id].push(candidate);
        console.log(`Queued ICE candidate for user ${from_user_id}`);
      }
    } catch (err) {
      console.error('Error handling ICE candidate:', err);
    }
  }, []);

  // --- Connection retry tracking ---
  const retryConnection = useRef({});

  // --- Establish WebRTC connections for all participants (mesh) ---
  const establishWebRTCConnections = useCallback(async () => {
    if (!currentUser || !participants.length) return;
    console.log('=== Establishing WebRTC Connections ===');
    console.log('Current user:', currentUser.id);
    console.log('All participants:', participants.map(p => p.user_id));

    for (const participant of participants) {
      if (participant.user_id === currentUser.id) continue;
      const existingConnection = peerConnectionsRef.current[participant.user_id];
      if (existingConnection &&
          existingConnection.connectionState === 'connected' &&
          existingConnection.signalingState === 'stable') {
        console.log(`Connection to user ${participant.user_id} already stable`);
        continue;
      }
      const shouldInitiate = currentUser.id > participant.user_id;
      try {
        if (shouldInitiate) {
          console.log(`Initiating connection to user ${participant.user_id}`);
          await initiateWebRTCConnection(participant.user_id);
        } else {
          console.log(`Waiting for user ${participant.user_id} to initiate connection`);
        }
      } catch (error) {
        console.error(`Failed to connect to user ${participant.user_id}:`, error);
        // Retry after delay
        const retryCount = retryConnection.current[participant.user_id] || 0;
        if (retryCount < 3) {
          retryConnection.current[participant.user_id] = retryCount + 1;
          setTimeout(() => {
            establishWebRTCConnections();
          }, 2000 * (retryCount + 1));
        }
      }
    }
  }, [currentUser, participants, initiateWebRTCConnection]);

  // --- Connection status debugging ---
  const logConnectionStatus = useCallback(() => {
    if (!currentUser || !participants.length) return;
    console.log('=== Connection Status ===');
    console.log('Current user:', currentUser.id);
    console.log('Participants:', participants.map(p => p.user_id));
    participants.forEach(participant => {
      if (participant.user_id === currentUser.id) return;
      const connection = peerConnectionsRef.current[participant.user_id];
      const stream = remoteStreamsRef.current[participant.user_id];
      console.log(`User ${participant.user_id}:`, {
        hasConnection: !!connection,
        connectionState: connection?.connectionState,
        signalingState: connection?.signalingState,
        hasStream: !!stream,
        streamTracks: stream?.getTracks()?.length || 0
      });
    });
  }, [currentUser, participants]);

  // --- Enhanced WebSocket message handler for user_joined and room_state ---
  const handleWebSocketMessage = useCallback((data) => {
    switch (data.type) {
      case 'room_state':
        setParticipants(data.participants || []);
        // Force connection refresh for all users
        setTimeout(() => {
          establishWebRTCConnections();
        }, 1000);
        break;
      case 'user_joined': {
        // Always update with the full participant list from backend
        if (data.participants) {
          setParticipants(data.participants);
          setTimeout(() => {
            establishWebRTCConnections();
          }, 1000);
        } else {
          setParticipants(prev => {
            const exists = prev.find(p => p.user_id === data.user_id);
            if (!exists) {
              const newParticipant = {
                user_id: data.user_id,
                username: data.username,
                role: 'participant',
                is_muted: true,
                hand_raised: false,
                video_enabled: false,
                joined_at: new Date().toISOString()
              };
              return [...prev, newParticipant];
            }
            return prev;
          });
          setTimeout(() => {
            establishWebRTCConnections();
          }, 1000);
        }
        toast({
          title: "User Joined",
          description: data.message,
          variant: "default"
        });
        break;
      }
      case 'user_left': {
        setParticipants(prev => prev.filter(p => p.user_id !== data.user_id));
        cleanupPeerConnection(data.user_id);
        setTimeout(() => {
          establishWebRTCConnections();
        }, 1000);
        toast({
          title: "User Left",
          description: data.message,
          variant: "default"
        });
        break;
      }
      case 'chat_message':
        setChatMessages(prev => {
          const messageExists = prev.some(msg =>
            msg.id === data.message_id ||
            (msg.content === data.message &&
              msg.username === data.username &&
              Math.abs(new Date(msg.sent_at) - new Date(data.timestamp)) < 1000)
          );
          if (messageExists) {
            return prev;
          }
          const newMessage = {
            id: data.message_id || Date.now(),
            user: data.user_id,
            username: data.username,
            content: data.message,
            sent_at: data.timestamp
          };
          if (!isChatOpen && data.user_id !== currentUser?.id) {
            setUnreadCount(count => count + 1);
          }
          return [...prev, newMessage];
        });
        break;

      case 'user_mute_toggle':
        setParticipants(prev =>
          prev.map(p =>
            p.user_id === data.user_id
              ? { ...p, is_muted: data.is_muted }
              : p
          )
        );
        break;

      case 'user_video_toggle':
        setParticipants(prev =>
          prev.map(p =>
            p.user_id === data.user_id
              ? { ...p, video_enabled: data.video_enabled }
              : p
          )
        );
        break;

      case 'hand_raised':
        setParticipants(prev =>
          prev.map(p =>
            p.user_id === data.user_id
              ? { ...p, hand_raised: data.hand_raised }
              : p
          )
        );
        break;

      case 'webrtc_offer':
        handleWebRTCOffer(data);
        break;

      case 'webrtc_answer':
        handleWebRTCAnswer(data);
        break;

      case 'ice_candidate':
        handleICECandidate(data);
        break;

      case 'audio_connection_request':
        // Handle any specific audio connection logic if needed
        console.log('Audio connection request from:', data.from_user_id);
        break;

      default:
        console.log('Unknown message type:', data.type);
    }
  }, [isChatOpen, currentUser, establishWebRTCConnections, cleanupPeerConnection]);

  // Establish WebRTC connections when participants change
  useEffect(() => {
    if (currentUser && participants.length > 1 && mediaReady && isWebSocketOpen) {
      console.log('=== WebRTC Connection Setup ===');
      console.log('Current user:', currentUser.id);
      console.log('All participants:', participants.map(p => p.user_id));

      // Add delay to ensure all participants are ready
      const connectionTimer = setTimeout(() => {
        participants.forEach(participant => {
          if (participant.user_id !== currentUser.id) {
            console.log(`Checking connection with user ${participant.user_id}`);

            const existingConnection = peerConnectionsRef.current[participant.user_id];
            const connectionState = connectionStatesRef.current[participant.user_id];

            let shouldConnect = false;

            if (!existingConnection) {
              shouldConnect = true;
              console.log(`No existing connection to user ${participant.user_id}`);
            } else if (['closed', 'failed', 'disconnected'].includes(connectionState)) {
              shouldConnect = true;
              console.log(`Connection to user ${participant.user_id} failed: ${connectionState}`);
            } else {
              console.log(`Connection to user ${participant.user_id} exists: ${connectionState}`);
            }

            if (shouldConnect && shouldInitiateConnection(participant.user_id)) {
              // Add random delay to prevent simultaneous connections
              const delay = Math.random() * 2000 + 1000; // 1-3 seconds
              setTimeout(() => {
                initiateWebRTCConnection(participant.user_id);
              }, delay);
            }
          }
        });
      }, 1000); // Initial delay for setup

      return () => clearTimeout(connectionTimer);
    }
  }, [participants, currentUser, initiateWebRTCConnection, shouldInitiateConnection, mediaReady, isWebSocketOpen]);

  // Media control handlers
  const handleMuteToggle = useCallback(() => {
    const newMutedState = !isMuted;

    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach(track => {
        track.enabled = !newMutedState;
      });
    }

    setIsMuted(newMutedState);

    sendWebSocketMessage({
      type: 'toggle_mute',
      is_muted: newMutedState
    });
  }, [isMuted, sendWebSocketMessage]);

  const handleVideoToggle = useCallback(async () => {
    const newVideoState = !videoEnabled;

    try {
      if (localStreamRef.current) {
        const videoTracks = localStreamRef.current.getVideoTracks();
        videoTracks.forEach(track => {
          track.enabled = newVideoState;
        });

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = localStreamRef.current;
        }
      }

      setVideoEnabled(newVideoState);

      sendWebSocketMessage({
        type: 'toggle_video',
        video_enabled: newVideoState
      });
    } catch (err) {
      console.error('Error toggling video:', err);
      toast({
        title: "Video Error",
        description: "Could not toggle video. Please check camera permissions.",
        variant: "destructive"
      });
    }
  }, [videoEnabled, sendWebSocketMessage]);

  const handleRaiseHand = useCallback(() => {
    const newHandState = !isHandRaised;
    setIsHandRaised(newHandState);

    sendWebSocketMessage({
      type: 'raise_hand',
      hand_raised: newHandState
    });

    toast({
      title: newHandState ? "Hand Raised" : "Hand Lowered",
      description: newHandState ? "Others have been notified" : "Hand lowered",
      variant: "default"
    });
  }, [isHandRaised, sendWebSocketMessage]);

  const handleSendMessage = useCallback((e) => {
    e.preventDefault();

    if (messageInput.trim()) {
      sendWebSocketMessage({
        type: 'chat_message',
        message: messageInput.trim()
      });
      setMessageInput('');
    }
  }, [messageInput, sendWebSocketMessage]);

  const handleChatToggle = useCallback(() => {
    setIsChatOpen(prev => {
      if (!prev) {
        setUnreadCount(0);
      }
      return !prev;
    });
  }, []);

  const toggleVideoMode = useCallback(() => {
    const newVideoMode = !isVideoMode;
    setIsVideoMode(newVideoMode);

    if (newVideoMode) {
      toast({
        title: "Video Mode Enabled",
        description: "Video calling is now active",
        variant: "default"
      });
    } else {
      setVideoEnabled(false);
      if (localStreamRef.current) {
        localStreamRef.current.getVideoTracks().forEach(track => {
          track.enabled = false;
        });
      }
      toast({
        title: "Audio Mode",
        description: "Switched to audio-only mode",
        variant: "default"
      });
    }
  }, [isVideoMode]);

  const handleLeaveRoom = useCallback(async () => {
    try {
      // Close WebSocket
      if (wsRef.current) {
        wsRef.current.close(1000, 'User left room');
      }

      // Stop local media
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }

      // Clean up all peer connections
      Object.keys(peerConnectionsRef.current).forEach(userId => {
        cleanupPeerConnection(userId);
      });

      // Leave room via API
      await roomApi.leaveRoom(roomId);

      navigate('/dashboard/explore');
    } catch (err) {
      console.error('Error leaving room:', err);
      navigate('/dashboard');
    }
  }, [roomId, navigate, cleanupPeerConnection]);

  // --- Enhanced renderRemoteVideo to always update srcObject and use remoteStreamsRef ---
  const renderRemoteVideo = useCallback((participant) => {
    const remoteStream = remoteStreamsRef.current[participant.user_id];

    if (remoteStream && participant.video_enabled && isVideoMode) {
      return (
        <video
          key={`remote-${participant.user_id}`}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
          ref={videoEl => {
            if (videoEl && remoteStream) {
              if (videoEl.srcObject !== remoteStream) {
                videoEl.srcObject = remoteStream;
              }
            }
          }}
        />
      );
    }

    return (
      <div className="w-full h-full bg-gradient-to-br from-black/80 to-black/40 flex items-center justify-center">
        <Avatar className="h-20 w-20 border-2 border-white/10">
          <AvatarImage src={`https://i.pravatar.cc/150?u=${participant.user_id}`} />
          <AvatarFallback>
            {participant.username?.[0]?.toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </div>
    );
  }, [isVideoMode]);

  const formatTime = useCallback((dateString) => {
    return new Date(dateString).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  }, []);

  // --- Enhanced logConnectionStates to use remoteStreamsRef ---
  const logConnectionStates = useCallback(() => {
    console.log('=== WebRTC Connection States ===');
    console.log('Current user:', currentUser?.id);
    console.log('All participants:', participants.map(p => p.user_id));

    Object.entries(peerConnectionsRef.current).forEach(([userId, pc]) => {
      console.log(`User ${userId}: ${pc.connectionState} (signaling: ${pc.signalingState}, ice: ${pc.iceConnectionState})`);
    });

    console.log('=== Remote Streams ===');
    Object.keys(remoteStreamsRef.current).forEach(userId => {
      const stream = remoteStreamsRef.current[userId];
      console.log(`User ${userId}: ${stream ? `${stream.getTracks().length} tracks` : 'no stream'}`);
    });
  }, [currentUser, participants]);

  // Initialize on mount
  useEffect(() => {
    initializeRoom();
    initializeMedia();
    connectWebSocket();

    return () => {
      // Cleanup WebSocket
      if (wsRef.current) {
        wsRef.current.close();
      }

      // Cleanup local stream
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }

      // Cleanup all peer connections
      Object.values(peerConnectionsRef.current).forEach(pc => {
        if (pc && pc.connectionState !== 'closed') {
          pc.close();
        }
      });
      peerConnectionsRef.current = {};

      // Cleanup remote streams
      Object.values(remoteStreamsRef.current).forEach(stream => {
        if (stream && stream.getTracks) {
          stream.getTracks().forEach(track => track.stop());
        }
      });
      remoteStreamsRef.current = {};

      // Clear ICE candidate queues
      iceCandidateQueueRef.current = {};
    };
  }, [initializeRoom, initializeMedia, connectWebSocket]);

  // Fixed WebRTC connection establishment
  useEffect(() => {
    if (currentUser && participants.length > 1 && mediaReady && isWebSocketOpen) {
      console.log('=== Establishing WebRTC Connections ===');
      console.log('Current user:', currentUser.id);
      console.log('All participants:', participants.map(p => p.user_id));

      // Add delay to ensure all participants are ready
      const connectionTimer = setTimeout(() => {
        participants.forEach(participant => {
          if (participant.user_id !== currentUser.id) {
            console.log(`Checking connection with user ${participant.user_id}`);

            const existingConnection = peerConnectionsRef.current[participant.user_id];
            let shouldConnect = false;

            if (!existingConnection) {
              shouldConnect = true;
              console.log(`No existing connection to user ${participant.user_id}`);
            } else {
              const state = existingConnection.connectionState;
              const signalingState = existingConnection.signalingState;

              if (['closed', 'failed', 'disconnected'].includes(state)) {
                shouldConnect = true;
                console.log(`Connection to user ${participant.user_id} failed: ${state}`);
                // Clean up the failed connection
                existingConnection.close();
                delete peerConnectionsRef.current[participant.user_id];
                delete remoteStreamsRef.current[participant.user_id];
                delete iceCandidateQueueRef.current[participant.user_id];
              } else {
                console.log(`Connection to user ${participant.user_id} exists: ${state}/${signalingState}`);
              }
            }

            if (shouldConnect) {
              // FIXED: Only user with higher ID initiates to prevent race conditions
              if (currentUser.id > participant.user_id) {
                console.log(`Initiating connection to user ${participant.user_id} (higher ID rule)`);
                // Add random delay to prevent simultaneous offers
                const delay = Math.random() * 1000 + 500;
                setTimeout(() => {
                  initiateWebRTCConnection(participant.user_id);
                }, delay);
              } else {
                console.log(`User ${participant.user_id} should initiate connection (higher ID rule)`);
              }
            }
          }
        });
      }, 1000); // Increased delay for better stability

      return () => clearTimeout(connectionTimer);
    }
  }, [participants, currentUser, initiateWebRTCConnection, mediaReady, isWebSocketOpen]);

  // Monitor connection states and attempt reconnection
  useEffect(() => {
    if (!mediaReady || !isWebSocketOpen) return;

    const monitorConnections = setInterval(() => {
      if (currentUser && participants.length > 1) {
        participants.forEach(participant => {
          if (participant.user_id !== currentUser.id) {
            const connection = peerConnectionsRef.current[participant.user_id];

            if (connection) {
              const state = connection.connectionState;

              // Reconnect if connection failed
              if (state === 'failed' || state === 'disconnected') {
                console.log(`Reconnecting to user ${participant.user_id} due to ${state} state`);
                connection.close();
                delete peerConnectionsRef.current[participant.user_id];
                delete remoteStreamsRef.current[participant.user_id];
                delete iceCandidateQueueRef.current[participant.user_id];

                // Only reconnect if we have higher ID
                if (currentUser.id > participant.user_id) {
                  setTimeout(() => {
                    initiateWebRTCConnection(participant.user_id);
                  }, 2000);
                }
              }
            }
          }
        });
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(monitorConnections);
  }, [currentUser, participants, mediaReady, isWebSocketOpen, initiateWebRTCConnection]);

  // Debug connection states periodically
  useEffect(() => {
    const debugTimer = setInterval(() => {
      if (currentUser && participants.length > 1) {
        logConnectionStates();
      }
    }, 15000); // Log every 15 seconds

    return () => clearInterval(debugTimer);
  }, [currentUser, participants, logConnectionStates]);

  // Handle participant changes and cleanup
  useEffect(() => {
    // Clean up connections for participants who left
    const currentParticipantIds = participants.map(p => p.user_id);
    const connectedUserIds = Object.keys(peerConnectionsRef.current).map(id => parseInt(id));

    connectedUserIds.forEach(userId => {
      if (!currentParticipantIds.includes(userId)) {
        console.log(`Cleaning up connection to user ${userId} who left`);

        const connection = peerConnectionsRef.current[userId];
        if (connection) {
          connection.close();
          delete peerConnectionsRef.current[userId];
        }

        const stream = remoteStreamsRef.current[userId];
        if (stream && stream.getTracks) {
          stream.getTracks().forEach(track => track.stop());
          delete remoteStreamsRef.current[userId];
        }

        delete iceCandidateQueueRef.current[userId];
      }
    });
  }, [participants]);

  // Handle media track changes
  useEffect(() => {
    if (localStreamRef.current && mediaReady) {
      // Update all peer connections with new media tracks
      Object.values(peerConnectionsRef.current).forEach(pc => {
        if (pc && pc.connectionState !== 'closed') {
          const senders = pc.getSenders();

          // Update audio track
          const audioTrack = localStreamRef.current.getAudioTracks()[0];
          const audioSender = senders.find(s => s.track && s.track.kind === 'audio');

          if (audioSender && audioTrack) {
            audioSender.replaceTrack(audioTrack).catch(console.error);
          }

          // Update video track
          const videoTrack = localStreamRef.current.getVideoTracks()[0];
          const videoSender = senders.find(s => s.track && s.track.kind === 'video');

          if (videoSender && videoTrack) {
            videoSender.replaceTrack(videoTrack).catch(console.error);
          }
        }
      });
    }
  }, [isMuted, videoEnabled, mediaReady]);

  // Error boundary for WebRTC operations
  const handleWebRTCError = useCallback((error, userId, operation) => {
    console.error(`WebRTC ${operation} error for user ${userId}:`, error);

    // Clean up failed connection
    if (peerConnectionsRef.current[userId]) {
      peerConnectionsRef.current[userId].close();
      delete peerConnectionsRef.current[userId];
    }

    delete remoteStreamsRef.current[userId];
    delete iceCandidateQueueRef.current[userId];

    // Show user-friendly error message
    toast({
      title: "Connection Error",
      description: `Failed to connect to user. Retrying...`,
      variant: "destructive"
    });

    // Attempt reconnection after delay if we have higher ID
    if (currentUser && currentUser.id > userId) {
      setTimeout(() => {
        connectionStates.current[userId] = 'new';
        initiateWebRTCConnection(userId);
      }, 3000);
    }
  }, [currentUser, initiateWebRTCConnection]);

  // Handler to open modal
const handleOpenReport = (user) => {
  setReportTarget(user);
  setReportReason("");
  setReportDialogOpen(true);
};

// Handler to submit report
const handleSubmitReport = async () => {
  if (!reportReason.trim()) {
    toast({ title: "Reason required", description: "Please enter a reason.", variant: "destructive" });
    return;
  }
  try {
    await roomApi.reportUser(room.id, reportTarget.user_id, reportReason);
    toast({ title: "Reported", description: "User has been reported.", variant: "default" });
    setReportDialogOpen(false);
  } catch (err) {
    toast({ title: "Error", description: "Failed to report user.", variant: "destructive" });
  }
};

  // Loading and error states
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-black via-gray-900 to-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading room...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-black via-gray-900 to-black">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <Button onClick={() => navigate('/dashboard/explore')} variant="outline">
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden relative">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
      </div>

      {/* Top Header Bar */}
      <motion.div
        className="h-16 flex items-center justify-between px-6 backdrop-blur-xl bg-black/20 border-b border-white/10 z-20 relative"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="h-3 w-3 bg-red-500 rounded-full animate-pulse"></div>
            <h1 className="font-bold text-white text-xl bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
              {room?.title || 'Loading...'}
            </h1>
          </div>

          {/* Participants Avatars */}
          <div className="flex items-center">
            {participants.slice(0, 4).map((participant, index) => (
              <motion.div
                key={participant.user_id}
                className="relative"
                style={{ marginLeft: index > 0 ? '-12px' : '0', zIndex: 4 - index }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <Avatar className="h-10 w-10 border-3 border-white/20 hover:border-purple-400 transition-all duration-300 hover:scale-110">
                  <AvatarImage src={`https://i.pravatar.cc/150?u=${participant.user_id}`} />
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white font-semibold">
                    {participant.username?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {participant.is_muted && (
                  <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center">
                    <MicOff className="h-2 w-2 text-white" />
                  </div>
                )}
              </motion.div>
            ))}

            {participants.length > 4 && (
              <motion.div
                className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-sm text-white font-bold border-3 border-white/20 ml-2"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4 }}
              >
                +{participants.length - 4}
              </motion.div>
            )}

            <div className="ml-4 px-3 py-1 bg-white/10 rounded-full backdrop-blur-sm">
              <span className="text-white text-sm font-medium flex items-center">
                <Users className="h-4 w-4 mr-1" />
                {participants.length}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {room?.is_recording && (
            <motion.div
              className="flex items-center px-3 py-1 bg-red-500/20 border border-red-500/50 rounded-full backdrop-blur-sm"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="h-2 w-2 bg-red-400 rounded-full mr-2 animate-pulse"></div>
              <span className="text-red-400 text-sm font-medium">REC</span>
            </motion.div>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={handleLeaveRoom}
            className="bg-red-500/20 text-red-400 hover:bg-red-500/40 hover:text-white border border-red-500/30 hover:border-red-500/60 transition-all duration-300 hover:scale-105"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Leave
          </Button>
        </div>
      </motion.div>

      {/* Main Content Area */}
      <div className="flex-1 flex relative overflow-hidden">
        {/* Participants Grid/Audio View */}
        <div className="flex-1 p-6 overflow-y-auto relative z-10">
        {isVideoMode ? (
          /* Video Grid Layout */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 h-full">
            {participants.map((participant, index) => (
              <motion.div
                key={participant.user_id}
                className="relative rounded-2xl overflow-hidden group hover:scale-[1.02] transition-all duration-300"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                style={{
                  background: 'linear-gradient(135deg, rgba(139, 69, 19, 0.3) 0%, rgba(0, 0, 0, 0.8) 100%)'
                }}
              >
                {/* Video Content */}
                <div className="aspect-video bg-gradient-to-br from-purple-900/50 to-black/80 relative overflow-hidden">
                  {participant.user_id === currentUser?.id ? (
                    <video
                      ref={localVideoRef}
                      autoPlay
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    renderRemoteVideo(participant)
                  )}

                  {/* Video Overlay Effects */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

                  {/* Participant Info Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="px-2 py-1 bg-black/60 rounded-lg backdrop-blur-sm">
                          <span className="text-white font-semibold text-sm">
                            {participant.user_id === currentUser?.id ? 'You' : participant.username}
                          </span>
                        </div>
                        {participant.role === 'host' && (
                          <div className="px-2 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg">
                            <span className="text-white text-xs font-bold">HOST</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center space-x-1">
                        {participant.is_muted && (
                          <div className="p-1 bg-red-500/80 rounded-full">
                            <MicOff className="h-3 w-3 text-white" />
                          </div>
                        )}
                        {participant.hand_raised && (
                          <motion.div
                            className="p-1 bg-yellow-500/80 rounded-full"
                            animate={{ rotate: [0, -10, 10, -10, 0] }}
                            transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                          >
                            <HandMetal className="h-3 w-3 text-white" />
                          </motion.div>
                        )}
                        {!participant.video_enabled && (
                          <div className="p-1 bg-gray-500/80 rounded-full">
                            <VideoOff className="h-3 w-3 text-white" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          /* Audio-Only Flexbox Layout */
          <div className="flex flex-wrap gap-6 items-center justify-center py-6">
            {participants.map((participant) => (
              <motion.div
                key={participant.user_id}
                className="relative group"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <div>
                      <Avatar className="h-20 w-20 border-2 border-white/10 shadow-lg transition-all duration-300 group-hover:scale-105">
                        <AvatarImage src={`https://i.pravatar.cc/150?u=${participant.user_id}`} />
                        <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white font-semibold">
                          {participant.username?.[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      {/* Audio Visualizer Ring for current user */}
                      {participant.user_id === currentUser?.id && (
                        <motion.div
                          className="absolute inset-0 rounded-full border-2 border-purple-400"
                          animate={{
                            scale: isMuted ? 1 : [1, 1.1, 1],
                            opacity: isMuted ? 0.3 : [0.3, 0.8, 0.3]
                          }}
                          transition={{ duration: 1, repeat: Infinity }}
                        />
                      )}

                      {/* Speaking Animation for other participants */}
                      {participant.user_id !== currentUser?.id && !participant.is_muted && (
                        <motion.div
                          className="absolute inset-0 rounded-full border-2 border-green-400"
                          animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.3, 0.8, 0.3]
                          }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        />
                      )}

                      {/* Status Indicators */}
                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex space-x-1">
                        {participant.is_muted && (
                          <div className="h-6 w-6 bg-red-500 rounded-full flex items-center justify-center">
                            <MicOff className="h-3 w-3 text-white" />
                          </div>
                        )}
                        {participant.hand_raised && (
                          <motion.div
                            className="h-6 w-6 bg-yellow-500 rounded-full flex items-center justify-center"
                            animate={{ rotate: [0, -10, 10, -10, 0] }}
                            transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                          >
                            <HandMetal className="h-3 w-3 text-white" />
                          </motion.div>
                        )}
                      </div>

                      {/* Username and role */}
                      <div className="mt-2 text-center">
                        <span className="text-white font-semibold text-sm">
                          {participant.user_id === currentUser?.id ? "You" : participant.username}
                        </span>
                        {participant.role === "host" && (
                          <span className="ml-2 px-2 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg text-white text-xs font-bold">
                            HOST
                          </span>
                        )}
                      </div>
                    </div>
                  </DropdownMenuTrigger>
                  {/* Only show dropdown for others */}
                  {participant.user_id !== currentUser?.id && (
                    <DropdownMenuContent className="z-50">
                      <DropdownMenuItem onClick={() => handleOpenReport(participant)}>
                        Report
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  )}
                </DropdownMenu>
              </motion.div>
            ))}
          </div>
        )}
      </div>

        {/* Enhanced Chat Panel */}
        <AnimatePresence>
          {isChatOpen && (
            <motion.div
              className="w-full sm:w-80 md:w-96 h-full flex flex-col backdrop-blur-xl bg-black/40 border-l border-white/10 relative z-20"
              initial={{ x: 400, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 400, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
            >
              {/* Chat Header */}
              <div className="p-4 border-b border-white/10 bg-black/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <MessageCircle className="h-5 w-5 text-purple-400" />
                    <h3 className="font-semibold text-white">Live Chat</h3>
                    <div className="px-2 py-1 bg-purple-500/20 rounded-full">
                      <span className="text-purple-300 text-xs">{chatMessages.length}</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsChatOpen(false)}
                    className="h-8 w-8 text-white hover:bg-white/10"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-purple-500/50">
                <AnimatePresence>
                  {chatMessages.map((message, index) => (
                    <motion.div
                      key={message.id || index}
                      className={`flex ${message.user === currentUser?.id ? "justify-end" : "justify-start"}`}
                      initial={{ opacity: 0, y: 20, scale: 0.8 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      {message.user !== currentUser?.id && (
                        <Avatar className="h-8 w-8 mr-2 mt-1 flex-shrink-0">
                          <AvatarImage src={`https://i.pravatar.cc/150?u=${message.user}`} />
                          <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500">
                            {message.username?.[0]?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      )}

                      <div className={`max-w-[75%] ${message.user === currentUser?.id
                        ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                        : "bg-white/10 text-white border border-white/10"
                        } rounded-2xl p-3 backdrop-blur-sm shadow-lg`}>
                        {message.user !== currentUser?.id && (
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-semibold text-sm text-purple-300">{message.username}</span>
                            <span className="text-xs opacity-60">{formatTime(message.sent_at)}</span>
                          </div>
                        )}
                        <p className="text-sm leading-relaxed">{message.content}</p>
                        {message.user === currentUser?.id && (
                          <div className="text-xs opacity-70 text-right mt-1">
                            {formatTime(message.sent_at)}
                          </div>
                        )}
                      </div>

                      {message.user === currentUser?.id && (
                        <Avatar className="h-8 w-8 ml-2 mt-1 flex-shrink-0">
                          <AvatarImage src={`https://i.pravatar.cc/150?u=${message.user}`} />
                          <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500">
                            {currentUser.username?.[0]?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Message Input */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-white/10 bg-black/20">
                <div className="flex items-center space-x-2">
                  <Input
                    type="text"
                    placeholder="Type your message..."
                    className="flex-1 bg-white/5 border-white/20 text-white placeholder:text-white/50 rounded-xl focus:border-purple-400 focus:ring-1 focus:ring-purple-400"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                  />
                  <Button
                    type="submit"
                    size="icon"
                    disabled={!messageInput.trim()}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 rounded-xl h-10 w-10 shadow-lg hover:shadow-purple-500/25 transition-all duration-300"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Enhanced Bottom Control Bar */}
      <motion.div
        className="h-20 px-6 backdrop-blur-xl bg-black/30 border-t border-white/10 flex justify-between items-center relative z-20"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {/* Left Controls */}
        <div className="flex items-center space-x-3">
          {/* Video Mode Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={toggleVideoMode}
            className={`px-4 py-2 rounded-xl border-2 transition-all duration-300 hover:scale-105 ${isVideoMode
              ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white border-blue-500/50 shadow-lg shadow-blue-500/25"
              : "bg-white/5 text-white border-white/20 hover:border-purple-400 hover:bg-white/10"
              }`}
          >
            {isVideoMode ? <VideoOff className="h-4 w-4 mr-2" /> : <Video className="h-4 w-4 mr-2" />}
            {isVideoMode ? 'Audio Only' : 'Start Video'}
          </Button>
        </div>

        {/* Center Controls */}
        <div className="flex items-center space-x-4">
          {/* Mute Toggle */}
          <motion.button
            onClick={handleMuteToggle}
            className={`relative h-14 w-14 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl ${isMuted
              ? "bg-gradient-to-r from-red-600 to-red-500 shadow-red-500/50"
              : "bg-gradient-to-r from-green-600 to-green-500 shadow-green-500/50"
              }`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            {isMuted ? <MicOff className="h-6 w-6 text-white" /> : <Mic className="h-6 w-6 text-white" />}
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-white/30"
              animate={{
                scale: isMuted ? 1 : [1, 1.2, 1],
                opacity: isMuted ? 0.3 : [0.3, 0.8, 0.3]
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </motion.button>

          {/* Video Toggle */}
          <motion.button
            onClick={handleVideoToggle}
            disabled={!isVideoMode}
            className={`relative h-12 w-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${videoEnabled && isVideoMode
              ? "bg-gradient-to-r from-blue-600 to-purple-600 shadow-blue-500/50"
              : "bg-white/10 text-white/70 shadow-white/10"
              } ${!isVideoMode ? "opacity-50 cursor-not-allowed" : "hover:scale-110"}`}
            whileHover={isVideoMode ? { scale: 1.1 } : {}}
            whileTap={isVideoMode ? { scale: 0.95 } : {}}
          >
            {videoEnabled ? <Video className="h-5 w-5 text-white" /> : <VideoOff className="h-5 w-5" />}
          </motion.button>

          {/* Raise Hand */}
          <motion.button
            onClick={handleRaiseHand}
            className={`relative h-12 w-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${isHandRaised
              ? "bg-gradient-to-r from-yellow-500 to-orange-500 shadow-yellow-500/50"
              : "bg-white/10 text-white hover:bg-white/20 shadow-white/10"
              }`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            animate={isHandRaised ? { rotate: [0, -10, 10, -10, 0] } : {}}
            transition={isHandRaised ? { duration: 0.5, repeat: Infinity, repeatDelay: 2 } : {}}
          >
            <HandMetal className="h-5 w-5" />
          </motion.button>

          {/* Chat Toggle */}
          <motion.button
            onClick={handleChatToggle}
            className={`relative h-12 w-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${isChatOpen
              ? "bg-gradient-to-r from-purple-600 to-pink-600 shadow-purple-500/50"
              : "bg-white/10 text-white hover:bg-white/20 shadow-white/10"
              }`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <MessageCircle className="h-5 w-5" />
            {unreadCount > 0 && !isChatOpen && (
              <motion.div
                className="absolute -top-1 -right-1 h-5 w-5 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <span className="text-xs text-white font-bold">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              </motion.div>
            )}
          </motion.button>
        </div>

        {/* Right Info */}
        <div className="flex items-center space-x-4">
          {/* Connection Status */}
          <div className="flex items-center space-x-2 px-3 py-2 bg-white/10 rounded-xl backdrop-blur-sm">
            <motion.div
              className="h-2 w-2 bg-green-400 rounded-full"
              animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="text-white text-sm font-medium">
              {participants.length} online
            </span>
          </div>

          {/* Leave Room */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLeaveRoom}
            className="bg-red-500/20 text-red-400 hover:bg-red-500/40 hover:text-white border border-red-500/30 hover:border-red-500/60 transition-all duration-300 hover:scale-105 rounded-xl px-4 py-2"
          >
            <PhoneOff className="h-4 w-4 mr-2" />
            End Call
          </Button>
        </div>
      </motion.div>

      {/* Mobile Chat Overlay */}
      <AnimatePresence>
        {isChatOpen && (
          <div className="sm:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex">
            <motion.div
              className="w-full h-full flex flex-col bg-gradient-to-br from-slate-900 to-purple-900 backdrop-blur-xl"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
            >
              <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/20">
                <div className="flex items-center space-x-2">
                  <MessageCircle className="h-5 w-5 text-purple-400" />
                  <h3 className="font-semibold text-white text-lg">Chat</h3>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsChatOpen(false)}
                  className="text-white hover:bg-white/10 rounded-xl"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {chatMessages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={cn(
                      "flex items-start",
                      message.user === currentUser?.id ? "justify-end" : ""
                    )}
                  >
                    {message.user !== currentUser?.id && (
                      <Avatar className="h-8 w-8 mr-3 mt-1 ring-2 ring-purple-400/20">
                        <AvatarImage src={`https://i.pravatar.cc/150?u=${message.user}`} />
                        <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-xs">
                          {message.username?.[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    )}

                    <div className={cn(
                      "max-w-[75%] rounded-2xl p-3 shadow-lg",
                      message.user === currentUser?.id
                        ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                        : "bg-white/10 backdrop-blur-sm text-white border border-white/5"
                    )}>
                      {message.user !== currentUser?.id && (
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium text-sm text-purple-300">
                            {message.username}
                          </span>
                          <span className="text-xs opacity-70 text-gray-300">
                            {formatTime(message.sent_at)}
                          </span>
                        </div>
                      )}
                      <p className="text-sm leading-relaxed">{message.content}</p>
                      {message.user === currentUser?.id && (
                        <div className="text-xs opacity-80 text-right mt-2">
                          {formatTime(message.sent_at)}
                        </div>
                      )}
                    </div>

                    {message.user === currentUser?.id && (
                      <Avatar className="h-8 w-8 ml-3 mt-1 ring-2 ring-purple-400/20">
                        <AvatarImage src={`https://i.pravatar.cc/150?u=${message.user}`} />
                        <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-xs">
                          {currentUser.username?.[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </motion.div>
                ))}

                {chatMessages.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <MessageCircle className="h-12 w-12 text-purple-400/50 mb-4" />
                    <p className="text-white/70 text-lg font-medium mb-2">No messages yet</p>
                    <p className="text-white/50 text-sm">Be the first to say something!</p>
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-white/10 bg-black/20">
                <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
                  <div className="flex-1 relative">
                    <Input
                      type="text"
                      placeholder="Type your message..."
                      className="w-full bg-white/5 border-white/10 text-white placeholder:text-white/50 rounded-xl pr-12 py-3 focus:ring-2 focus:ring-purple-500/50 focus:border-transparent"
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                    />
                  </div>
                  <Button
                    type="submit"
                    size="icon"
                    disabled={!messageInput.trim()}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 disabled:from-gray-600 disabled:to-gray-700 rounded-xl h-12 w-12 shadow-lg transition-all duration-200 transform hover:scale-105"
                  >
                    <Send className="h-5 w-5" />
                  </Button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Report User Modal */}
      <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report {reportTarget?.username}</DialogTitle>
          </DialogHeader>
          <Textarea
            className="w-full min-h-[100px] mt-4"
            placeholder="Describe the reason for reporting this user..."
            value={reportReason}
            onChange={e => setReportReason(e.target.value)}
          />
          <DialogFooter>
            <Button
              className="bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl px-6 py-2"
              onClick={handleSubmitReport}
              disabled={!reportReason.trim()}
            >
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LiveRoom;