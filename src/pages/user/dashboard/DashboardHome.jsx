import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Search, Star, TrendingUp, Users } from 'lucide-react';
import RoomCard from '../../../components/dashboard/RoomCard';
import CreateRoomDialog from '../../../components/dashboard/CreateRoomDialog';

// Sample room data
const recentRooms = [
  {
    id: '1',
    title: 'IELTS Speaking Practice',
    tags: ['English', 'IELTS', 'Practice'],
    userCount: 4,
    creator: { 
      name: 'Sarah Johnson', 
      avatar: 'https://i.pravatar.cc/150?img=1',
      initials: 'SJ'
    },
    hasVideo: false
  },
  {
    id: '2',
    title: 'Spanish Conversation Club',
    tags: ['Spanish', 'Beginner', 'Casual'],
    userCount: 3,
    creator: { 
      name: 'Miguel Ramos', 
      avatar: 'https://i.pravatar.cc/150?img=2',
      initials: 'MR'
    },
    hasVideo: true
  },
];

const suggestedRooms = [
  {
    id: '3',
    title: 'English Debate Night',
    tags: ['English', 'Debate', 'Advanced'],
    userCount: 6,
    creator: { 
      name: 'Alex Chen', 
      avatar: 'https://i.pravatar.cc/150?img=3',
      initials: 'AC'
    },
    hasVideo: false
  },
  {
    id: '4',
    title: 'French for Beginners',
    tags: ['French', 'Beginner', 'Learning'],
    userCount: 2,
    creator: { 
      name: 'Claire Dubois', 
      avatar: 'https://i.pravatar.cc/150?img=4',
      initials: 'CD'
    },
    hasVideo: true
  },
];

const DashboardHome = () => {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

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
            <p className="text-2xl font-bold text-white">125 XP</p>
            <p className="text-xs text-neon-purple">+15% from yesterday</p>
          </div>
          <div className="h-12 w-12 rounded-full bg-neon-purple/20 flex items-center justify-center">
            <TrendingUp className="h-6 w-6 text-neon-purple" />
          </div>
        </div>
        
        {/* Streak Stats */}
        <div className="glass-morphism p-4 rounded-xl flex items-center justify-between">
          <div>
            <h3 className="text-gray-400 text-sm">Current Streak</h3>
            <p className="text-2xl font-bold text-white">12 Days</p>
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
            <p className="text-2xl font-bold text-white">8.5 hrs</p>
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentRooms.map((room, index) => (
            <RoomCard key={room.id} room={room} index={index} />
          ))}
        </div>
      </motion.div>
      
      {/* Suggested Rooms Section */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h2 className="text-xl font-bold text-white mb-4">Suggested For You</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {suggestedRooms.map((room, index) => (
            <RoomCard key={room.id} room={room} index={index} />
          ))}
        </div>
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
      />
    </>
  );
};

export default DashboardHome;
