import React, { useState } from 'react';
import { SearchIcon, Filter, Users, Mic, Video } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Card, CardContent, CardFooter, CardHeader } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import CreateRoomDialog from '../../../components/dashboard/CreateRoomDialog';

const DashboardExplore = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const rooms = [
    {
      id: '1',
      title: 'English Conversation Practice',
      tags: ['English', 'Casual'],
      creator: {
        name: 'Sarah',
        avatar: 'https://github.com/shadcn.png',
      },
      users: 4,
      hasAudio: true,
      hasVideo: false,
    },
    {
      id: '2',
      title: 'IELTS Speaking Preparation',
      tags: ['English', 'IELTS', 'Exam'],
      creator: {
        name: 'Michael',
        avatar: 'https://github.com/shadcn.png',
      },
      users: 6,
      hasAudio: true,
      hasVideo: true,
    },
    {
      id: '3',
      title: 'Spanish for Beginners',
      tags: ['Spanish', 'Beginner'],
      creator: {
        name: 'Elena',
        avatar: 'https://github.com/shadcn.png',
      },
      users: 3,
      hasAudio: true,
      hasVideo: false,
    },
    {
      id: '4',
      title: 'Japanese Cultural Exchange',
      tags: ['Japanese', 'Culture'],
      creator: {
        name: 'Hiroshi',
        avatar: 'https://github.com/shadcn.png',
      },
      users: 8,
      hasAudio: true,
      hasVideo: true,
    },
    {
      id: '5',
      title: 'French Conversation Club',
      tags: ['French', 'Intermediate'],
      creator: {
        name: 'Sophie',
        avatar: 'https://github.com/shadcn.png',
      },
      users: 5,
      hasAudio: true,
      hasVideo: false,
    },
    {
      id: '6',
      title: 'Mandarin Practice Room',
      tags: ['Mandarin', 'Practice'],
      creator: {
        name: 'Li Wei',
        avatar: 'https://github.com/shadcn.png',
      },
      users: 4,
      hasAudio: true,
      hasVideo: false,
    },
  ];

  const filteredRooms = rooms.filter(
    (room) =>
      room.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleJoinRoom = (roomId) => {
    navigate(`/room/${roomId}`);
  };

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

        <div className="glass-morphism rounded-xl p-4 mb-8 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              placeholder="Search by room name or tags"
              className="pl-10 bg-white/5 border-white/10 focus:border-neon-purple"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex gap-2 flex-wrap md:flex-nowrap">
            <Select>
              <SelectTrigger className="w-[140px] bg-white/5 border-white/10">
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Languages</SelectItem>
                <SelectItem value="english">English</SelectItem>
                <SelectItem value="spanish">Spanish</SelectItem>
                <SelectItem value="french">French</SelectItem>
                <SelectItem value="japanese">Japanese</SelectItem>
                <SelectItem value="mandarin">Mandarin</SelectItem>
              </SelectContent>
            </Select>

            <Select>
              <SelectTrigger className="w-[140px] bg-white/5 border-white/10">
                <SelectValue placeholder="Room Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="casual">Casual</SelectItem>
                <SelectItem value="debate">Debate</SelectItem>
                <SelectItem value="ielts">IELTS</SelectItem>
                <SelectItem value="private">Private</SelectItem>
              </SelectContent>
            </Select>

            <Select>
              <SelectTrigger className="w-[140px] bg-white/5 border-white/10">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popular">Most Popular</SelectItem>
                <SelectItem value="new">Newest</SelectItem>
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
            Explore live rooms and connect with language learners from around the world.
            </p>
        </div>
        {/* <Button className="mt-3 md:mt-0 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 text-white">
            Try a Room Now
        </Button> */}
        </div>


        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRooms.map((room) => (
            <Card
              key={room.id}
              className="backdrop-blur-xl bg-white/5 border border-white/10 hover:border-neon-purple/50 transition-all overflow-hidden group"
            >
              <CardHeader className="pb-2">
                <h3 className="text-xl font-semibold text-white group-hover:text-neon-purple transition-colors">
                  {room.title}
                </h3>
                <div className="flex flex-wrap gap-1 mt-1">
                  {room.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="bg-white/5 border-white/10 text-gray-300">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardHeader>

              <CardContent className="pb-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Avatar className="h-8 w-8 border border-white/10">
                      <AvatarImage src={room.creator.avatar} />
                      <AvatarFallback>{room.creator.name[0]}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-gray-400 ml-2">by {room.creator.name}</span>
                  </div>

                  <div className="flex items-center">
                    <Users className="h-4 w-4 text-gray-400 mr-1" />
                    <span className="text-sm text-gray-400">{room.users}</span>

                    {room.hasAudio && <Mic className="h-4 w-4 text-gray-400 ml-2" />}

                    {room.hasVideo && <Video className="h-4 w-4 text-gray-400 ml-2" />}
                  </div>
                </div>
              </CardContent>

              <CardFooter>
                <Button
                  onClick={() => handleJoinRoom(room.id)}
                  className="w-full bg-gradient-to-r from-neon-purple to-neon-blue text-white hover:from-neon-blue hover:to-neon-purple transition-all hover:glow-purple"
                >
                  Join Room
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
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

      <CreateRoomDialog isOpen={createDialogOpen} onClose={() => setCreateDialogOpen(false)} />
    </>
  );
};

export default DashboardExplore;
