import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Mic, MicOff, Video, VideoOff, MessageCircle, X, Send, LogOut, HandMetal } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { toast } from '../../../hooks/use-toast';
import roomApi from '../../../api/roomApi';
import { fetchAccessToken } from '../../../api/auth';

const LiveRoom = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  
  // WebSocket and WebRTC refs
  const wsRef = useRef(null);
  const localStreamRef = useRef(null);
  const localVideoRef = useRef(null);
  const peerConnectionsRef = useRef({});
  const remoteVideosRef = useRef({});
  
  // Room state
  const [room, setRoom] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Media controls
  const [isMuted, setIsMuted] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(false);
  const [isVideoMode, setIsVideoMode] = useState(false);
  const [mediaReady, setMediaReady] = useState(false);
  
  // UI state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [isHandRaised, setIsHandRaised] = useState(false);

  // WebRTC configuration
  const rtcConfiguration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  };

  // Initialize room data
  const initializeRoom = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch room details
      const roomData = await roomApi.getRoomDetails(roomId);
      setRoom(roomData);
      
      // Fetch participants
      const participantsData = await roomApi.getRoomParticipants(roomId);
      setParticipants(participantsData);
      
      // Fetch recent messages
      const messagesData = await roomApi.getRoomMessages(roomId);
      setChatMessages(messagesData.reverse()); // Reverse to show newest at bottom
      
      // Get current user from token or context
      const token = await fetchAccessToken();
      if (token) {
        const userData = JSON.parse(atob(token.split('.')[1])); // Decode JWT payload
        setCurrentUser({ id: userData.user_id, username: userData.username });
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
        // Request both audio and video permissions upfront
        const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true // Request video permission initially
        });
        
        localStreamRef.current = stream;
        
        // Mute audio by default
        stream.getAudioTracks().forEach(track => {
        track.enabled = !isMuted;
        });
        
        // Disable video by default (but keep the track)
        stream.getVideoTracks().forEach(track => {
        track.enabled = false;
        });
        
        // Set local video immediately if we have video ref
        if (localVideoRef.current && stream) {
        localVideoRef.current.srcObject = stream;
        }
        
        setMediaReady(true);
        
    } catch (err) {
        console.error('Error accessing media devices:', err);
        setMediaReady(false);
        toast({
        title: "Media Access Error",
        description: "Could not access camera/microphone. Please check permissions.",
        variant: "destructive"
        });
    }
    }, [isMuted]);

  // WebSocket connection
  const connectWebSocket = useCallback(async () => {
    try {
      const token = await fetchAccessToken();
      if (!token) {
        throw new Error('No access token available');
      }

      const wsUrl = `ws://localhost:8000/ws/room/${roomId}/?token=${token}`;
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('WebSocket connected');
      };

      wsRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        handleWebSocketMessage(data);
      };

      wsRef.current.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        if (event.code !== 1000) { // Not a normal closure
          // Attempt to reconnect after 3 seconds
          setTimeout(connectWebSocket, 3000);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
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

  // Handle WebSocket messages
  const handleWebSocketMessage = useCallback((data) => {
    switch (data.type) {
      case 'room_state':
        setParticipants(data.participants || []);
        break;
        
      case 'user_joined':
        setParticipants(prev => {
          const exists = prev.find(p => p.user_id === data.user_id);
          if (!exists) {
            return [...prev, {
              user_id: data.user_id,
              username: data.username,
              role: 'participant',
              is_muted: false,
              hand_raised: false,
              joined_at: new Date().toISOString()
            }];
          }
          return prev;
        });
        
        toast({
          title: "User Joined",
          description: data.message,
          variant: "default"
        });
        break;
        
      case 'user_left':
        setParticipants(prev => prev.filter(p => p.user_id !== data.user_id));
        toast({
          title: "User Left",
          description: data.message,
          variant: "default"
        });
        break;
        
      case 'chat_message':
        setChatMessages(prev => [...prev, {
          id: data.message_id,
          user: data.user_id,
          username: data.username,
          content: data.message,
          sent_at: data.timestamp
        }]);
        break;
        
      case 'user_mute_toggle':
        setParticipants(prev => prev.map(p => 
          p.user_id === data.user_id 
            ? { ...p, is_muted: data.is_muted }
            : p
        ));
        break;
        
      case 'hand_raised':
        setParticipants(prev => prev.map(p => 
          p.user_id === data.user_id 
            ? { ...p, hand_raised: data.hand_raised }
            : p
        ));
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
        
      default:
        console.log('Unknown message type:', data.type);
    }
  }, []);

  // WebRTC Peer Connection Management
  const createPeerConnection = useCallback((userId) => {
    const peerConnection = new RTCPeerConnection(rtcConfiguration);
    
    // Add local stream to peer connection
    if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStreamRef.current);
        });
    }
    
    // Handle ICE candidates
  peerConnection.onicecandidate = (event) => {
    if (event.candidate && wsRef.current) {
      wsRef.current.send(JSON.stringify({
        type: 'webrtc_ice_candidate',
        target_user_id: userId,
        candidate: event.candidate
      }));
    }
  };
    
    // Handle remote stream
    peerConnection.ontrack = (event) => {
        console.log('Received remote stream from user:', userId);
        const [remoteStream] = event.streams;
        
        // Create or update remote video element
        if (remoteStream) {
        // Store the stream for this user
        remoteVideosRef.current[userId] = remoteStream;
        
        // Update participants to trigger re-render
        setParticipants(prev => [...prev]);
        }
    };
    
    peerConnectionsRef.current[userId] = peerConnection;
    return peerConnection;
    }, []);


  const handleWebRTCOffer = useCallback(async (data) => {
    try {
      const peerConnection = createPeerConnection(data.from_user_id);
      await peerConnection.setRemoteDescription(data.offer);
      
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      
      if (wsRef.current) {
        wsRef.current.send(JSON.stringify({
          type: 'webrtc_answer',
          target_user_id: data.from_user_id,
          answer: answer
        }));
      }
    } catch (err) {
      console.error('Error handling WebRTC offer:', err);
    }
  }, [createPeerConnection]);

  const handleWebRTCAnswer = useCallback(async (data) => {
    try {
      const peerConnection = peerConnectionsRef.current[data.from_user_id];
      if (peerConnection) {
        await peerConnection.setRemoteDescription(data.answer);
      }
    } catch (err) {
      console.error('Error handling WebRTC answer:', err);
    }
  }, []);

  const handleICECandidate = useCallback(async (data) => {
    try {
      const peerConnection = peerConnectionsRef.current[data.from_user_id];
      if (peerConnection) {
        await peerConnection.addIceCandidate(data.candidate);
      }
    } catch (err) {
      console.error('Error handling ICE candidate:', err);
    }
  }, []);

  // Initialize WebRTC connection to a user
  const initiateWebRTCConnection = useCallback(async (userId) => {
    try {
      const peerConnection = createPeerConnection(userId);
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      
      if (wsRef.current) {
        wsRef.current.send(JSON.stringify({
          type: 'webrtc_offer',
          target_user_id: userId,
          offer: offer
        }));
      }
    } catch (err) {
      console.error('Error initiating WebRTC connection:', err);
    }
  }, [createPeerConnection]);

  // Media control handlers
  const handleMuteToggle = useCallback(() => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    
    // Update local stream
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach(track => {
        track.enabled = !newMutedState;
      });
    }
    
    // Send to WebSocket
    if (wsRef.current) {
      wsRef.current.send(JSON.stringify({
        type: 'toggle_mute',
        is_muted: newMutedState
      }));
    }
  }, [isMuted]);

  // handle Video Toogle
  const handleVideoToggle = useCallback(async () => {
  const newVideoState = !videoEnabled;
  setVideoEnabled(newVideoState);
  
  try {
    if (localStreamRef.current) {
      const videoTracks = localStreamRef.current.getVideoTracks();
      
      if (newVideoState && isVideoMode) {
        // Enable existing video track
        videoTracks.forEach(track => {
          track.enabled = true;
        });
        
        // If no video track exists, get a new one
        if (videoTracks.length === 0) {
          const videoStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false
          });
          
          const videoTrack = videoStream.getVideoTracks()[0];
          localStreamRef.current.addTrack(videoTrack);
          
          // Update peer connections with new video track
          Object.values(peerConnectionsRef.current).forEach(pc => {
            pc.addTrack(videoTrack, localStreamRef.current);
          });
        }
        
        // Update local video display
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = localStreamRef.current;
        }
      } else {
        // Disable video tracks
        videoTracks.forEach(track => {
          track.enabled = false;
        });
      }
    }
  } catch (err) {
    console.error('Error toggling video:', err);
    setVideoEnabled(false);
    toast({
      title: "Video Error",
      description: "Could not toggle video. Please check camera permissions.",
      variant: "destructive"
    });
  }
}, [videoEnabled, isVideoMode]);



  const handleRaiseHand = useCallback(() => {
    const newHandState = !isHandRaised;
    setIsHandRaised(newHandState);
    
    if (wsRef.current) {
      wsRef.current.send(JSON.stringify({
        type: 'raise_hand',
        hand_raised: newHandState
      }));
    }
    
    toast({
      title: newHandState ? "Hand Raised" : "Hand Lowered",
      description: newHandState ? "Others have been notified" : "Hand lowered",
      variant: "default"
    });
  }, [isHandRaised]);


  const handleSendMessage = useCallback((e) => {
    e.preventDefault();
    if (messageInput.trim() && wsRef.current) {
      wsRef.current.send(JSON.stringify({
        type: 'chat_message',
        message: messageInput.trim()
      }));
      setMessageInput('');
    }
  }, [messageInput]);

  //Function to remote render video
  const renderRemoteVideo = (participant) => {
    const remoteStream = remoteVideosRef.current[participant.user_id];
    
    if (remoteStream && isVideoMode) {
      return (
        <video
          key={`remote-${participant.user_id}`}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
          ref={(videoEl) => {
            if (videoEl && remoteStream) {
              videoEl.srcObject = remoteStream;
            }
          }}
        />
      );
    }
    
    // Fallback to avatar
    return (
      <div className="w-full h-full bg-gradient-to-br from-black/80 to-black/40 flex items-center justify-center">
        <Avatar className="h-20 w-20 border-2 border-white/10">
          <AvatarImage src={`https://i.pravatar.cc/150?u=${participant.user_id}`} />
          <AvatarFallback>{participant.username?.[0]?.toUpperCase()}</AvatarFallback>
        </Avatar>
      </div>
    );
  };

  const handleLeaveRoom = useCallback(async () => {
    try {
      // Close WebSocket connection
      if (wsRef.current) {
        wsRef.current.close(1000, 'User left room');
      }
      
      // Stop media streams
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
      
      // Close peer connections
      Object.values(peerConnectionsRef.current).forEach(pc => pc.close());
      peerConnectionsRef.current = {};
      
      // Call API to leave room
      await roomApi.leaveRoom(roomId);
      
      // Navigate back
      navigate('/dashboard/explore');
    } catch (err) {
      console.error('Error leaving room:', err);
      // Navigate anyway
      navigate('/dashboard');
    }
  }, [roomId, navigate]);

  const toggleVideoMode = useCallback(() => {
    const newVideoMode = !isVideoMode;
    setIsVideoMode(newVideoMode);
    
    if (newVideoMode) {
      // Enable video for everyone
      setVideoEnabled(true);
      toast({
        title: "Video Mode Enabled",
        description: "Video calling is now active",
        variant: "default"
      });
    } else {
      setVideoEnabled(false);
      toast({
        title: "Audio Mode",
        description: "Switched to audio-only mode",
        variant: "default"
      });
    }
  }, [isVideoMode]);

  

  // Format time helper
  const formatTime = useCallback((dateString) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }, []);

  // Initialize on mount
  useEffect(() => {
    initializeRoom();
    initializeMedia();
    connectWebSocket();
    
    return () => {
    // Cleanup on unmount
    if (wsRef.current) {
      wsRef.current.close();
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    Object.values(peerConnectionsRef.current).forEach(pc => pc.close());
    
    // Clean up remote video streams
    Object.values(remoteVideosRef.current).forEach(stream => {
      stream.getTracks().forEach(track => track.stop());
    });
    remoteVideosRef.current = {};
  };
}, [initializeRoom, initializeMedia, connectWebSocket]);

  // Initiate WebRTC connections when participants join
  useEffect(() => {
    if (currentUser && participants.length > 1 && mediaReady) {
      participants.forEach(participant => {
        if (participant.user_id !== currentUser.id && 
            !peerConnectionsRef.current[participant.user_id]) {
          initiateWebRTCConnection(participant.user_id);
        }
      });
    }
  }, [participants, currentUser, initiateWebRTCConnection, mediaReady]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-b from-background to-background/90">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-purple"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gradient-to-b from-background to-background/90">
        <p className="text-red-400 mb-4">{error}</p>
        <Button onClick={() => navigate('/dashboard/explore')}>
          Back to Rooms
        </Button>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-gradient-to-b from-background to-background/90 overflow-hidden">
      {/* Top Bar */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-white/10 glass-morphism z-10">
        <div className="flex items-center">
          <h1 className="font-bold text-white text-xl">{room?.title || 'Loading...'}</h1>

          <div className="flex ml-4">
            {participants.slice(0, 3).map((participant, index) => (
              <div 
                key={participant.user_id} 
                className="flex items-center" 
                style={{ marginLeft: index > 0 ? '-8px' : '0' }}
              >
                <Avatar className="h-8 w-8 border-2 border-background">
                  <AvatarImage src={`https://i.pravatar.cc/150?u=${participant.user_id}`} />
                  <AvatarFallback>{participant.username?.[0]?.toUpperCase()}</AvatarFallback>
                </Avatar>
              </div>
            ))}

            {participants.length > 3 && (
              <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center text-xs text-white font-medium ml-1">
                +{participants.length - 3}
              </div>
            )}
          </div>
        </div>

        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleLeaveRoom}
          className="bg-red-500/20 text-red-400 hover:bg-red-500/30 hover:text-white hover:glow-red"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Leave Room
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex relative overflow-hidden">
        {/* Participants Grid */}
        <div className="flex-1 p-4 overflow-y-auto">
          {isVideoMode ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-full">
              {participants.map(participant => (
                <div 
                    key={participant.user_id} 
                    className={cn(
                    "relative rounded-xl overflow-hidden transition-all duration-300",
                    "ring-2 ring-transparent"
                    )}
                >
                    {participant.user_id === currentUser?.id ? (
                    <div className="bg-black h-full w-full">
                        <video 
                        ref={localVideoRef}
                        autoPlay 
                        muted 
                        playsInline
                        className="w-full h-full object-cover"
                        />
                    </div>
                    ) : (
                    renderRemoteVideo(participant)
                    )}

                    <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                    <div className="flex items-center justify-between">
                        <span className="text-white font-medium">
                        {participant.user_id === currentUser?.id ? 'You' : participant.username}
                        </span>
                        <div className="flex items-center space-x-2">
                        {participant.is_muted && (
                            <MicOff className="h-4 w-4 text-red-400" />
                        )}
                        {participant.hand_raised && (
                            <HandMetal className="h-4 w-4 text-yellow-400" />
                        )}
                        </div>
                    </div>
                    </div>
                </div>
                ))}
            </div>
          ) : (
            <div className="flex flex-wrap justify-center items-center h-full gap-8">
              {participants.map((participant) => (
                <motion.div 
                  key={participant.user_id}
                  className="flex flex-col items-center"
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <div className="relative">
                    <Avatar className="h-28 w-28 sm:h-32 sm:w-32 border-4 border-white/10">
                      <AvatarImage src={`https://i.pravatar.cc/150?u=${participant.user_id}`} />
                      <AvatarFallback className="text-4xl">
                        {participant.username?.[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="absolute -bottom-1 -right-1 flex space-x-1">
                      <div className={cn(
                        "h-6 w-6 rounded-full flex items-center justify-center",
                        participant.is_muted 
                          ? "bg-red-500 text-white" 
                          : "bg-green-500 text-white"
                      )}>
                        {participant.is_muted ? (
                          <MicOff className="h-3 w-3" />
                        ) : (
                          <Mic className="h-3 w-3" />
                        )}
                      </div>

                      {participant.hand_raised && (
                        <div className="h-6 w-6 rounded-full bg-yellow-500 text-white flex items-center justify-center">
                          <HandMetal className="h-3 w-3" />
                        </div>
                      )}
                    </div>
                  </div>

                  <p className="mt-3 font-medium text-white">
                    {participant.user_id === currentUser?.id ? 'You' : participant.username}
                    {participant.role === 'host' && (
                      <span className="ml-1 text-xs bg-gradient-to-r from-neon-purple to-neon-blue text-transparent bg-clip-text">
                        HOST
                      </span>
                    )}
                  </p>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Chat Panel */}
        <AnimatePresence>
          {isChatOpen && (
            <motion.div 
              className="w-full sm:w-80 md:w-96 h-full flex flex-col border-l border-white/10 glass-morphism"
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 300, opacity: 0 }}
              transition={{ type: "spring", damping: 20 }}
            >
              <div className="p-3 border-b border-white/10 flex items-center justify-between">
                <h3 className="font-medium">Chat</h3>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setIsChatOpen(false)}
                  className="h-7 w-7"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {chatMessages.map((message) => (
                  <div 
                    key={message.id} 
                    className={cn(
                      "flex items-start",
                      message.user === currentUser?.id ? "justify-end" : ""
                    )}
                  >
                    {message.user !== currentUser?.id && (
                      <Avatar className="h-8 w-8 mr-2 mt-1">
                        <AvatarImage src={`https://i.pravatar.cc/150?u=${message.user}`} />
                        <AvatarFallback>{message.username?.[0]?.toUpperCase()}</AvatarFallback>
                      </Avatar>
                    )}

                    <div className={cn(
                      "max-w-[70%] rounded-xl p-3",
                      message.user === currentUser?.id 
                        ? "bg-neon-purple text-white" 
                        : "bg-white/10 text-white"
                    )}>
                      {message.user !== currentUser?.id && (
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-medium text-sm">{message.username}</span>
                          <span className="text-xs opacity-70">{formatTime(message.sent_at)}</span>
                        </div>
                      )}
                      <p>{message.content}</p>
                      {message.user === currentUser?.id && (
                        <div className="text-xs opacity-70 text-right mt-1">
                          {formatTime(message.sent_at)}
                        </div>
                      )}
                    </div>

                    {message.user === currentUser?.id && (
                      <Avatar className="h-8 w-8 ml-2 mt-1">
                        <AvatarImage src={`https://i.pravatar.cc/150?u=${message.user}`} />
                        <AvatarFallback>{currentUser.username?.[0]?.toUpperCase()}</AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
              </div>

              <form onSubmit={handleSendMessage} className="p-3 border-t border-white/10">
                <div className="flex items-center">
                  <Input 
                    type="text" 
                    placeholder="Type a message..." 
                    className="flex-1 bg-white/5 border-white/10"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                  />
                  <Button 
                    type="submit" 
                    size="icon" 
                    disabled={!messageInput.trim()}
                    className="ml-2 bg-neon-purple text-white hover:glow-purple"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Control Bar */}
      <div className="h-16 px-4 border-t border-white/10 glass-morphism flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleVideoMode}
            className={cn(
              "mr-2 border-white/10 hover:border-neon-blue hover:bg-white/10",
              isVideoMode
                ? "bg-neon-blue/20 text-neon-blue border-neon-blue/30"
                : "bg-white/5"
            )}
          >
            {isVideoMode ? <VideoOff className="h-4 w-4 mr-2" /> : <Video className="h-4 w-4 mr-2" />}
            {isVideoMode ? 'Switch to Audio' : 'Start Video Call'}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleMuteToggle}
            className={cn(
              "rounded-full h-10 w-10",
              isMuted
                ? "bg-red-500/20 text-white border-red-500/50 hover:bg-red-500/30"
                : "bg-white/5 text-white border-white/10 hover:border-neon-purple"
            )}
          >
            {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </Button>
          <Button 
            variant="outline" 
            size="icon"
            onClick={handleVideoToggle}
            disabled={!isVideoMode}
            className={cn(
              "rounded-full h-10 w-10",
              videoEnabled && isVideoMode
                ? "bg-neon-blue/20 text-neon-blue border-neon-blue/50 hover:bg-neon-blue/30" 
                : "bg-white/5 text-white border-white/10 hover:border-neon-purple",
              !isVideoMode && "opacity-50 cursor-not-allowed"
            )}
          >
            {videoEnabled ? (
              <Video className="h-5 w-5" />
            ) : (
              <VideoOff className="h-5 w-5" />
            )}
          </Button>

          <Button 
            variant="outline" 
            size="icon"
            onClick={handleRaiseHand}
            className={cn(
              "rounded-full h-10 w-10",
              isHandRaised 
                ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/50 hover:bg-yellow-500/30" 
                : "bg-white/5 text-white border-white/10 hover:border-yellow-400"
            )}
          >
            <HandMetal className="h-5 w-5" />
          </Button>

          <Button 
            variant="outline" 
            size="icon"
            onClick={() => setIsChatOpen(!isChatOpen)}
            className={cn(
              "rounded-full h-10 w-10 relative",
              isChatOpen 
                ? "bg-neon-purple/20 text-neon-purple border-neon-purple/50" 
                : "bg-white/5 text-white border-white/10 hover:border-neon-purple"
            )}
          >
            <MessageCircle className="h-5 w-5" />
            {chatMessages.length > 0 && !isChatOpen && (
              <div className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-xs text-white font-medium">
                  {chatMessages.length > 9 ? '9+' : chatMessages.length}
                </span>
              </div>
            )}
          </Button>
        </div>

        {/* Room Info */}
        <div className="hidden sm:flex items-center space-x-4 text-sm text-white/70">
          <div className="flex items-center">
            <div className="h-2 w-2 bg-green-400 rounded-full mr-2"></div>
            {participants.length} participant{participants.length !== 1 ? 's' : ''}
          </div>
          
          {room?.is_recording && (
            <div className="flex items-center text-red-400">
              <div className="h-2 w-2 bg-red-400 rounded-full mr-2 animate-pulse"></div>
              Recording
            </div>
          )}
        </div>
      </div>

      {/* Mobile Chat Overlay */}
      {isChatOpen && (
        <div className="sm:hidden fixed inset-0 bg-black/50 z-50 flex">
          <motion.div 
            className="w-full h-full flex flex-col bg-background/95 backdrop-blur-xl"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 20 }}
          >
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <h3 className="font-medium text-white text-lg">Chat</h3>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsChatOpen(false)}
                className="text-white"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatMessages.map((message) => (
                <div 
                  key={message.id} 
                  className={cn(
                    "flex items-start",
                    message.user === currentUser?.id ? "justify-end" : ""
                  )}
                >
                  {message.user !== currentUser?.id && (
                    <Avatar className="h-8 w-8 mr-2 mt-1">
                      <AvatarImage src={`https://i.pravatar.cc/150?u=${message.user}`} />
                      <AvatarFallback>{message.username?.[0]?.toUpperCase()}</AvatarFallback>
                    </Avatar>
                  )}

                  <div className={cn(
                    "max-w-[70%] rounded-xl p-3",
                    message.user === currentUser?.id 
                      ? "bg-neon-purple text-white" 
                      : "bg-white/10 text-white"
                  )}>
                    {message.user !== currentUser?.id && (
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium text-sm">{message.username}</span>
                        <span className="text-xs opacity-70">{formatTime(message.sent_at)}</span>
                      </div>
                    )}
                    <p>{message.content}</p>
                    {message.user === currentUser?.id && (
                      <div className="text-xs opacity-70 text-right mt-1">
                        {formatTime(message.sent_at)}
                      </div>
                    )}
                  </div>

                  {message.user === currentUser?.id && (
                    <Avatar className="h-8 w-8 ml-2 mt-1">
                      <AvatarImage src={`https://i.pravatar.cc/150?u=${message.user}`} />
                      <AvatarFallback>{currentUser.username?.[0]?.toUpperCase()}</AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
            </div>

            <form onSubmit={handleSendMessage} className="p-4 border-t border-white/10">
              <div className="flex items-center">
                <Input 
                  type="text" 
                  placeholder="Type a message..." 
                  className="flex-1 bg-white/5 border-white/10 text-white"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                />
                <Button 
                  type="submit" 
                  size="icon" 
                  disabled={!messageInput.trim()}
                  className="ml-2 bg-neon-purple text-white hover:glow-purple"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Connection Status Indicator */}
      {wsRef.current?.readyState !== WebSocket.OPEN && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50">
          <motion.div 
            className="bg-red-500/20 border border-red-500/50 text-red-400 px-4 py-2 rounded-lg backdrop-blur-sm"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="flex items-center">
              <div className="h-2 w-2 bg-red-400 rounded-full mr-2 animate-pulse"></div>
              Reconnecting...
            </div>
          </motion.div>
        </div>
      )}

      {/* Screen Share Indicator (if implemented) */}
      {room?.screen_sharing_active && (
        <div className="fixed top-20 right-4 z-50">
          <motion.div 
            className="bg-green-500/20 border border-green-500/50 text-green-400 px-3 py-2 rounded-lg backdrop-blur-sm"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="flex items-center">
              <div className="h-2 w-2 bg-green-400 rounded-full mr-2"></div>
              Screen sharing active
            </div>
          </motion.div>
        </div>
      )}

      {/* Participants List Modal (for mobile) */}
      <AnimatePresence>
        {participants.length > 6 && (
          <div className="sm:hidden">
            {/* This would be triggered by a participants button - implementation depends on your needs */}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LiveRoom;