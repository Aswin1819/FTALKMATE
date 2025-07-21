import React, { useState, useEffect } from 'react';
import { Search, Filter, Users, Mic, Video, Clock, Globe, Lock, Pencil } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Card, CardContent, CardFooter, CardHeader } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { roomApi } from '../../../api/roomApi';
import CreateRoomDialog from '../../../components/dashboard/CreateRoomDialog';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import { toast } from '../../../hooks/use-toast';
import { useRoomActions } from './useRoomActions';
import RoomCard from '../../../components/dashboard/RoomCard';


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

  const {
    handleJoinRoom,
    handleEditRoom,
    closeEditDialog,
    editingRoom,
    editDialogOpen,
    setEditDialogOpen,
    formatTimeAgo,
    showPasswordModal,
    setShowPasswordModal,
    passwordInput,
    setPasswordInput,
    joiningRoom,
    setJoiningRoom,
    handlePasswordSubmit,
  } = useRoomActions();

  const reduxUser = useSelector((state) => state.auth.user);
  let user = null;
  if (reduxUser) {
    if (typeof reduxUser === "string") {
      try {
        user = JSON.parse(reduxUser);
      } catch {
        user = null;
      }
    } else {
      user = reduxUser;
    }
  }
  const isPremium = user?.is_premium;





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

  const handleRoomCreated = (newRoom) => {
    setRooms(prev => [newRoom, ...prev]);
    setCreateDialogOpen(false);

  };



  // Update room in list after edit
  const handleRoomEdited = (updatedRoom) => {
    setRooms(prev =>
      prev.map(r => (r.id === updatedRoom.id ? updatedRoom : r))
    );
    setEditDialogOpen(false);
    setEditingRoom(null);
    toast({
      title: "Room updated",
      description: "Your room has been updated successfully.",
      variant: "default"
    });
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
          {filteredRooms.map((room, index) => {
            const isHost = user && room.host === user.user_id;
            return (
              <RoomCard
                key={room.id}
                room={room}
                index={index}
                onJoin={() => handleJoinRoom(room)}
                isHost={isHost}
                onEdit={() => handleEditRoom(room)}
                showEdit={isHost}
                disabled={room.participant_count >= room.max_participants}
                timeAgo={formatTimeAgo(room.started_at)}
              />
            );
          })}
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
        isPremium={isPremium}
      />

      <CreateRoomDialog
        isOpen={editDialogOpen}
        onClose={closeEditDialog}
        onRoomCreated={() => {
          closeEditDialog();
          loadRoomData(); 
        }}
        initialRoom={editingRoom}
        mode="edit"
        isPremium={isPremium}
        roomTypes={roomTypes}
        tags={tags}
        languages={languages}
      />

      <Dialog open={showPasswordModal} onOpenChange={setShowPasswordModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter Room Password</DialogTitle>
          </DialogHeader>
          <Input
            type="password"
            placeholder="Password"
            value={passwordInput}
            onChange={e => setPasswordInput(e.target.value)}
            className="mb-4"
          />
          <DialogFooter>
            <Button
              onClick={handlePasswordSubmit}
              disabled={!passwordInput.trim()}
            >
              Join Room
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setShowPasswordModal(false);
                setPasswordInput('');
                setJoiningRoom(null);
              }}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DashboardExplore;