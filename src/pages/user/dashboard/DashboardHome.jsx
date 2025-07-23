import React, { useState, useEffect } from 'react';
import axiosInstance from '../../../features/auth/axiosInstance'; // Use your axios instance
import roomApi from '../../../api/roomApi'; 
import { motion } from 'framer-motion';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Search, Star, TrendingUp, Users } from 'lucide-react';
import RoomCard from '../../../components/dashboard/RoomCard';
import CreateRoomDialog from '../../../components/dashboard/CreateRoomDialog';
import { useSelector } from 'react-redux';
import { useRoomActions } from './useRoomActions';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../../../components/ui/dialog';


const DashboardHome = () => {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    daily_xp: 0,
    current_streak: 0,
    weekly_practice_hours: 0,
  });
  const [roomTypes, setRoomTypes] = useState([]);
  const [tags, setTags] = useState([]);
  const [languages, setLanguages] = useState([]);

  const [recentRooms, setRecentRooms] = useState([]);
  const [suggestedRooms, setSuggestedRooms] = useState([]);
  const [loadingRecent, setLoadingRecent] = useState(true);
  const [loadingSuggested, setLoadingSuggested] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const user = useSelector((state)=> state.auth.user)
  // Use shared room actions
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


  const fetchRooms = () => {
    setLoadingRecent(true);
    roomApi.getRecentlyJoinedRooms()
      .then(data => setRecentRooms(data))
      .catch(() => setRecentRooms([]))
      .finally(() => setLoadingRecent(false));
  
    setLoadingSuggested(true);
    roomApi.getSuggestedRooms()
      .then(data => setSuggestedRooms(data))
      .catch(() => setSuggestedRooms([]))
      .finally(() => setLoadingSuggested(false));
  };

  useEffect(() => {
    axiosInstance.get('/profile/') // Adjust endpoint if needed
      .then(res => {
        setStats({
          daily_xp: res.data.daily_xp ?? 0,
          current_streak: res.data.current_streak ?? 0,
          weekly_practice_hours: res.data.weekly_practice_hours ?? 0,
        });
        setIsPremium(res.data.is_premium);
        console.log("ispremium:",isPremium);
      })
      .catch(err => {
        console.log(err)
      });
  }, []);

  // Fetch recent rooms
  useEffect(() => {
    setLoadingRecent(true);
    roomApi.getRecentlyJoinedRooms()
      .then(data => setRecentRooms(data))
      .catch(() => setRecentRooms([]))
      .finally(() => setLoadingRecent(false));
  }, []);

  // Fetch suggested rooms
  useEffect(() => {
    setLoadingSuggested(true);
    roomApi.getSuggestedRooms()
      .then(data => setSuggestedRooms(data))
      .catch(() => setSuggestedRooms([]))
      .finally(() => setLoadingSuggested(false));
  }, []);

    // Fetch modal data
    useEffect(() => {
      const fetchFilters = async () => {
        try {
          const [roomTypesData, tagsData, languagesData] = await Promise.all([
            roomApi.getRoomTypes(),
            roomApi.getTags(),
            roomApi.getLanguages(),
          ]);
          setRoomTypes(roomTypesData);
          setTags(tagsData);
          setLanguages(languagesData);
        } catch (err) {
          // Optionally handle error
        }
      };
      fetchFilters();
    }, []);

  return (
    <>
      {/* Dashboard Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              type="text"
              placeholder="Search your rooms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500 w-full"
            />
          </div>

          <Button
            onClick={() => setCreateDialogOpen(true)}
            className="bg-gradient-to-r from-neon-purple to-neon-blue text-white hover:from-neon-purple/90 hover:to-neon-blue/90 transition-all flex items-center gap-2"
          >
            <span>Create Room</span>
          </Button>
        </div>
      </div>

      {/* User Stats Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
      >
        {/* XP Stats */}
        <div className="glass-morphism p-4 rounded-xl flex items-center justify-between">
          <div>
            <h3 className="text-gray-400 text-sm">Daily XP</h3>
            <p className="text-2xl font-bold text-white">{stats.daily_xp ?? 0} XP</p>
            {/* Optionally show % change if you add it to backend */}
            <p className="text-xs text-neon-purple"></p>
          </div>
          <div className="h-12 w-12 rounded-full bg-neon-purple/20 flex items-center justify-center">
            <TrendingUp className="h-6 w-6 text-neon-purple" />
          </div>
        </div>

        {/* Streak Stats */}
        <div className="glass-morphism p-4 rounded-xl flex items-center justify-between">
          <div>
            <h3 className="text-gray-400 text-sm">Current Streak</h3>
            <p className="text-2xl font-bold text-white">{stats.current_streak ?? 0} Days</p>
            <p className="text-xs text-neon-blue">Keep it up!</p>
          </div>
          <div className="h-12 w-12 rounded-full bg-neon-blue/20 flex items-center justify-center">
            <Star className="h-6 w-6 text-neon-blue" />
          </div>
        </div>

        {/* Language Practice */}
        <div className="glass-morphism p-4 rounded-xl flex items-center justify-between">
          <div>
            <h3 className="text-gray-400 text-sm">Practice Hours</h3>
            <p className="text-2xl font-bold text-white">{stats.weekly_practice_hours ?? 0} hrs</p>
            <p className="text-xs text-green-400">This week</p>
          </div>
          <div className="h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center">
            <Users className="h-6 w-6 text-green-400" />
          </div>
        </div>
      </motion.div>

      {/* Recent Rooms Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mb-8"
      >
        <h2 className="text-xl font-bold text-white mb-4">Recently Joined Rooms</h2>
        {loadingRecent ? (
          <div className="text-gray-400">Loading...</div>
        ) : recentRooms.length === 0 ? (
          <div className="text-gray-400">There is no room recently joined.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentRooms.map((room, index) => (
              <RoomCard
                key={room.id}
                room={room}
                index={index}
                onJoin={() => handleJoinRoom(room)}
                isHost={user && room.host === user.user_id}
                onEdit={() => handleEditRoom(room)}
                showEdit={user && room.host === user.user_id}
                disabled={room.participant_count >= room.max_participants}
                timeAgo={formatTimeAgo(room.started_at)}
              />
            ))}
          </div>
        )}
      </motion.div>

      {/* Suggested Rooms Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h2 className="text-xl font-bold text-white mb-4">Suggested For You</h2>
        {loadingSuggested ? (
          <div className="text-gray-400">Loading...</div>
        ) : suggestedRooms.length === 0 ? (
          <div className="text-gray-400">No suggestions.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {suggestedRooms.map((room, index) => (
              <RoomCard
                key={room.id}
                room={room}
                index={index}
                onJoin={() => handleJoinRoom(room)}
                isHost={user && room.host === user.user_id}
                onEdit={() => handleEditRoom(room)}
                showEdit={user && room.host === user.user_id}
                disabled={room.participant_count >= room.max_participants}
                timeAgo={formatTimeAgo(room.started_at)}
              />
            ))}
          </div>
        )}
      </motion.div>

      {/* Mobile floating action button */}
      <Button
        onClick={() => setCreateDialogOpen(true)}
        className="fixed right-6 bottom-6 rounded-full h-16 w-16 shadow-lg md:hidden flex items-center justify-center bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple text-white glow-purple"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      </Button>

      {/* Create Room Dialog */}
      <CreateRoomDialog
        isOpen={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        isPremium={isPremium}
        roomTypes={roomTypes}
        tags={tags}
        languages={languages}
      />

      {/* Edit Room Dialog */}
      <CreateRoomDialog
        isOpen={editDialogOpen}
        onClose={closeEditDialog}
        onRoomCreated={() => {
          closeEditDialog();
          fetchRooms();
        }}
        initialRoom={editingRoom}
        mode="edit"
        isPremium={isPremium}
        roomTypes={roomTypes}
        tags={tags}
        languages={languages}
      />

      {/* Private Room Password Modal */}
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

export default DashboardHome;
