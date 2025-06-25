import React, { useState, useEffect } from 'react';
import { Search, Filter, Users, Mic, Video, Clock, Globe, Lock } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Card, CardContent, CardFooter, CardHeader } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { roomApi } from '../../../api/roomApi';
import CreateRoomDialog from '../../../components/dashboard/CreateRoomDialog';

const DashboardExplore = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [roomTypes, setRoomTypes] = useState([]);
  const [tags, setTags] = useState([]);
  const [languages, setLanguages] = useState([]);
  
  // Filter states
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [selectedRoomType, setSelectedRoomType] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Load initial data
  useEffect(() => {
    loadRoomData();
    loadFilterData();
  }, []);

  // Filter and sort rooms when dependencies change
  useEffect(() => {
    filterAndSortRooms();
  }, [rooms, searchTerm, selectedLanguage, selectedRoomType, sortBy]);

  const loadRoomData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await roomApi.getLiveRooms();
      setRooms(response);
    } catch (err) {
      setError('Failed to load rooms. Please try again.');
      console.error('Error loading rooms:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadFilterData = async () => {
    try {
      const [roomTypesData, tagsData, languageData] = await Promise.all([
        roomApi.getRoomTypes(),
        roomApi.getTags(),
        roomApi.getLanguages()
      ]);
      setRoomTypes(roomTypesData);
      setTags(tagsData);
      setLanguages(languageData);
    } catch (err) {
      console.error('Error loading filter data:', err);
    }
  };

  const filterAndSortRooms = () => {
    let filtered = [...rooms];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(room =>
        room.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.tags?.some(tag => tag.name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Language filter
    if (selectedLanguage !== 'all') {
      filtered = filtered.filter(room => room.language === parseInt(selectedLanguage));
    }

    // Room type filter
    if (selectedRoomType !== 'all') {
      filtered = filtered.filter(room => room.room_type === parseInt(selectedRoomType));
    }

    // Sort
    switch (sortBy) {
      case 'popular':
        filtered.sort((a, b) => (b.participant_count || 0) - (a.participant_count || 0));
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      case 'active':
        filtered.sort((a, b) => new Date(b.started_at) - new Date(a.started_at));
        break;
      default:
        break;
    }

    setFilteredRooms(filtered);
  };

  const handleJoinRoom = async (room) => {
    try {
      if (room.is_private) {
        // For private rooms, we might need password - you can implement a password dialog
        const password = prompt('This room is private. Enter password:');
        if (!password) return;
        
        await roomApi.joinRoom(room.id, password);
      } else {
        await roomApi.joinRoom(room.id);
      }
      
      navigate(`/room/${room.id}`);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to join room');
    }
  };

  const handleRoomCreated = (newRoom) => {
    setRooms(prev => [newRoom, ...prev]);
    setCreateDialogOpen(false);
    // Optionally navigate to the new room
    console.log("New room id:",newRoom.id)
    navigate(`/room/${newRoom.id}`);
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getAvatarFallback = (name) => {
    return name ? name.charAt(0).toUpperCase() : 'U';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-purple"></div>
      </div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">Explore Global Conversations</h2>
          <p className="text-gray-400">Join live language exchange rooms with speakers from around the world.</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6">
            {error}
            <Button 
              onClick={loadRoomData} 
              variant="outline" 
              size="sm" 
              className="ml-4 border-red-500/20 hover:bg-red-500/10"
            >
              Retry
            </Button>
          </div>
        )}

        <div className="glass-morphism rounded-xl p-4 mb-8 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              placeholder="Search by room name, description, or tags"
              className="pl-10 bg-white/5 border-white/10 focus:border-neon-purple"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex gap-2 flex-wrap md:flex-nowrap">
            <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
              <SelectTrigger className="w-[140px] bg-white/5 border-white/10">
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Languages</SelectItem>
                {languages.map(type => (
                  <SelectItem key={type.id} value={type.id.toString()}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedRoomType} onValueChange={setSelectedRoomType}>
              <SelectTrigger className="w-[140px] bg-white/5 border-white/10">
                <SelectValue placeholder="Room Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {roomTypes.map(type => (
                  <SelectItem key={type.id} value={type.id.toString()}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[140px] bg-white/5 border-white/10">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popular">Most Popular</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="active">Most Active</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="ghost" className="bg-white/5 border-white/10 border" size="icon">
              <Filter className="h-5 w-5" />
            </Button>

            <Button
              onClick={() => setCreateDialogOpen(true)}
              className="bg-gradient-to-r from-neon-purple to-neon-blue text-white hover:from-neon-purple/90 hover:to-neon-blue/90 md:flex hidden"
            >
              Create Room
            </Button>
          </div>
        </div>

        <div className="bg-gradient-to-r from-neon-purple/20 to-neon-blue/20 p-4 rounded-xl mb-8 flex flex-col md:flex-row justify-between items-center">
          <div>
            <h3 className="font-semibold text-white">Jump Into the Conversation</h3>
            <p className="text-sm text-gray-300">
              {filteredRooms.length} live rooms available • Connect with language learners worldwide
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRooms.map((room) => (
            <Card
              key={room.id}
              className="backdrop-blur-xl bg-white/5 border border-white/10 hover:border-neon-purple/50 transition-all overflow-hidden group"
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <h3 className="text-xl font-semibold text-white group-hover:text-neon-purple transition-colors flex-1 mr-2">
                    {room.title}
                  </h3>
                  {room.is_private && (
                    <Lock className="h-4 w-4 text-yellow-400 flex-shrink-0" />
                  )}
                </div>
                
                {room.description && (
                  <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                    {room.description}
                  </p>
                )}

                <div className="flex flex-wrap gap-1 mt-2">
                  {room.language_name && (
                    <Badge variant="outline" className="bg-neon-blue/10 border-neon-blue/20 text-neon-blue">
                      <Globe className="h-3 w-3 mr-1" />
                      {room.language_name}
                    </Badge>
                  )}
                  {room.room_type_name && (
                    <Badge variant="outline" className="bg-neon-purple/10 border-neon-purple/20 text-neon-purple">
                      {room.room_type_name}
                    </Badge>
                  )}
                  {room.tags?.slice(0, 2).map((tag) => (
                    <Badge key={tag.id} variant="outline" className="bg-white/5 border-white/10 text-gray-300">
                      {tag.name}
                    </Badge>
                  ))}
                  {room.tags?.length > 2 && (
                    <Badge variant="outline" className="bg-white/5 border-white/10 text-gray-300">
                      +{room.tags.length - 2}
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className="pb-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <Avatar className="h-8 w-8 border border-white/10">
                      <AvatarFallback className="bg-gradient-to-r from-neon-purple to-neon-blue text-white text-xs">
                        {getAvatarFallback(room.host_username)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-gray-400 ml-2">by {room.host_username}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 text-gray-400 mr-1" />
                      <span className="text-sm text-gray-400">
                        {room.participant_count || 0}/{room.max_participants}
                      </span>
                    </div>
                    <Mic className="h-4 w-4 text-green-400" />
                    <Video className="h-4 w-4 text-blue-400" />
                  </div>
                </div>

                <div className="flex items-center text-xs text-gray-500">
                  <Clock className="h-3 w-3 mr-1" />
                  Started {formatTimeAgo(room.started_at)}
                </div>
              </CardContent>

              <CardFooter>
                <Button
                  onClick={() => handleJoinRoom(room)}
                  disabled={room.participant_count >= room.max_participants}
                  className="w-full bg-gradient-to-r from-neon-purple to-neon-blue text-white hover:from-neon-blue hover:to-neon-purple transition-all hover:glow-purple disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {room.participant_count >= room.max_participants ? 'Room Full' : 'Join Room'}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {filteredRooms.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              {searchTerm || selectedLanguage !== 'all' || selectedRoomType !== 'all' 
                ? 'No rooms match your filters' 
                : 'No live rooms available at the moment'
              }
            </div>
            <Button
              onClick={() => setCreateDialogOpen(true)}
              className="bg-gradient-to-r from-neon-purple to-neon-blue text-white hover:from-neon-purple/90 hover:to-neon-blue/90"
            >
              Create the First Room
            </Button>
          </div>
        )}
      </motion.div>

      <Button
        onClick={() => setCreateDialogOpen(true)}
        className="fixed bottom-6 right-6 md:hidden rounded-full h-14 w-14 p-0 bg-gradient-to-r from-neon-purple to-neon-blue text-white hover:from-neon-blue hover:to-neon-purple hover:glow-purple shadow-lg"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      </Button>

      <CreateRoomDialog 
        isOpen={createDialogOpen} 
        onClose={() => setCreateDialogOpen(false)}
        onRoomCreated={handleRoomCreated}
        roomTypes={roomTypes}
        tags={tags}
        languages={languages}
      />
    </>
  );
};

export default DashboardExplore;