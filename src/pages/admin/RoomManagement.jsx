import React, { useState,useEffect} from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "../../components/ui/table";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { 
  Search, 
  Filter, 
  MoreHorizontal, 
  Edit,
  Trash2, 
  MessageSquare,
  Eye
} from 'lucide-react';
import RoomDetailsModal from '../../components/admin/RoomDetailsModal';
import EditRoomModal from '../../components/admin/EditRoomModal';
import ModerationToolsModal from '../../components/admin/ModerationToolsModal';
import DeleteConfirmationModal from '../../components/admin/DeleteConfirmationModal';
import adminInstance from '../../features/auth/adminInstance';
import { toast } from '../../hooks/use-toast';

const RoomManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLanguage, setFilterLanguage] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isModerationModalOpen, setIsModerationModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);


  
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);

   // Fetch all rooms on mount
  useEffect(() => {
    const fetchRooms = async () => {
      setLoading(true);
      try {
        const res = await adminInstance.get('/rooms/');
        setRooms(res.data);
      } catch (err) {
        console.log("Error on Fetching room list",err)
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, []);

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.title.toLowerCase().includes(searchTerm.toLowerCase()) || room.creator.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLanguage = filterLanguage === 'all' || room.language === filterLanguage;
    const matchesType = filterType === 'all' || room.type === filterType;
    const matchesStatus = filterStatus === 'all' || room.status === filterStatus;
    return matchesSearch && matchesLanguage && matchesType && matchesStatus;
  });

  const languages = Array.from(new Set(rooms.map(room => room.language)));
  const types = Array.from(new Set(rooms.map(room => room.type)));
  const statuses = Array.from(new Set(rooms.map(room => room.status)));

  // Fetch full room details for modal
  const handleViewRoom = async (room) => {
    setIsDetailsModalOpen(true);
    try {
      const res = await adminInstance.get(`/rooms/${room.id}/`);
      setSelectedRoom(res.data);
    } catch (err) {
      setIsDetailsModalOpen(false);
      console.log("Error fetching room details:",err)
      // Optionally show toast
    }
  };

  const handleEditRoom = (room) => {
    setSelectedRoom(room);
    setIsEditModalOpen(true);
  };

  // Fixed handleRoomUpdated function
  const handleRoomUpdated = async (updatedRoomId) => {
    try {
      // Fetch the updated room data from the server
      const res = await adminInstance.get(`/rooms/${updatedRoomId}/`);
      const updatedRoom = res.data;
      
      // Update the rooms state with the new data
      setRooms(prevRooms => 
        prevRooms.map(room => 
          room.id === updatedRoom.id ? updatedRoom : room
        )
      );
    } catch (err) {
      console.log("Error fetching updated room data:", err);
      // Optionally show toast for error
    }
  };

  const handleModerateRoom = (room) => {
    setSelectedRoom(room);
    setIsModerationModalOpen(true);
  };

  const handleDeleteRoom = (room) => {
    setSelectedRoom(room);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteRoom = async () => {
    if (selectedRoom) {
      try {
        await adminInstance.delete(`/rooms/${selectedRoom.id}/`);
        setRooms(rooms.filter(room => room.id !== selectedRoom.id));
        toast({
              title: "Room Deleted",
              description: "Room Deleted Successfully.",
              variant: "success", 
        });
      } catch (err) {
        console.log("Error Deleting Room",err);
         toast({
              title: "Error on Room Deletion",
              description: "Backend Error on Room Deletion.",
              variant: "destructive", 
        });
      }
      setIsDeleteModalOpen(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Room Management</h1>
        {/* <Button className="bg-gradient-to-r from-neon-purple to-neon-blue text-white">
          Create New Room
        </Button> */}
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-black/30 backdrop-blur-sm border-white/10 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Total Rooms</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rooms.length}</div>
          </CardContent>
        </Card>

        <Card className="bg-black/30 backdrop-blur-sm border-white/10 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Active Rooms</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rooms.filter(room => room.status === 'active').length}</div>
          </CardContent>
        </Card>

        <Card className="bg-black/30 backdrop-blur-sm border-white/10 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Archived Rooms</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rooms.filter(room => room.status === 'archived').length}</div>
          </CardContent>
        </Card>

        <Card className="bg-black/30 backdrop-blur-sm border-white/10 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Current Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rooms.reduce((sum, room) => sum + room.activeUsers, 0)}</div>
          </CardContent>
        </Card>
      </div>

            {/* Search and Filters */}
      <Card className="bg-black/30 backdrop-blur-sm border-white/10 text-white">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input 
                placeholder="Search rooms by title or creator..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-black/20 border-white/10 text-white placeholder:text-gray-500"
              />
            </div>

            <div className="flex flex-1 md:flex-none flex-wrap gap-2">
              <Select value={filterLanguage} onValueChange={setFilterLanguage}>
                <SelectTrigger className="w-[150px] bg-black/20 border-white/10 text-white">
                  <SelectValue placeholder="Filter by language" />
                </SelectTrigger>
                <SelectContent className="bg-black/90 border-white/10 text-white">
                  <SelectItem value="all" className="hover:bg-white/10 focus:bg-white/10">All Languages</SelectItem>
                  {languages.map(language => (
                    <SelectItem key={language} value={language} className="hover:bg-white/10 focus:bg-white/10">
                      {language}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[150px] bg-black/20 border-white/10 text-white">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent className="bg-black/90 border-white/10 text-white">
                  <SelectItem value="all" className="hover:bg-white/10 focus:bg-white/10">All Types</SelectItem>
                  {types.map(type => (
                    <SelectItem key={type} value={type} className="hover:bg-white/10 focus:bg-white/10">
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[150px] bg-black/20 border-white/10 text-white">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent className="bg-black/90 border-white/10 text-white">
                  <SelectItem value="all" className="hover:bg-white/10 focus:bg-white/10">All Statuses</SelectItem>
                  {statuses.map(status => (
                    <SelectItem key={status} value={status} className="hover:bg-white/10 focus:bg-white/10">
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Room Table */}
      <Card className="bg-black/30 backdrop-blur-sm border-white/10 text-white overflow-hidden">
        <div className="rounded-lg overflow-x-auto">
          <Table>
            <TableHeader className="bg-black/40">
              <TableRow className="border-b border-white/10 hover:bg-transparent">
                <TableHead className="text-gray-400">Room Title</TableHead>
                <TableHead className="text-gray-400">Creator</TableHead>
                <TableHead className="text-gray-400">Type</TableHead>
                <TableHead className="text-gray-400">Language</TableHead>
                <TableHead className="text-gray-400">Active Users</TableHead>
                <TableHead className="text-gray-400">Status</TableHead>
                <TableHead className="text-gray-400">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
                {filteredRooms.length > 0 ? (
                filteredRooms.map((room) => (
                    <TableRow key={room.id} className="border-b border-white/5 hover:bg-white/5">
                    <TableCell className="font-medium text-white">{room.title}</TableCell>
                    <TableCell>{room.creator}</TableCell>
                    <TableCell>
                        <Badge className="bg-white/10 text-white hover:bg-white/20">
                        {room.type.charAt(0).toUpperCase() + room.type.slice(1)}
                        </Badge>
                    </TableCell>
                    <TableCell>{room.language}</TableCell>
                    <TableCell>{room.activeUsers}</TableCell>
                    <TableCell>
                        <Badge className={`${
                        room.status === 'active' 
                            ? 'bg-neon-green/20 text-neon-green hover:bg-neon-green/30' 
                            : 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30'
                        }`}>
                        {room.status.charAt(0).toUpperCase() + room.status.slice(1)}
                        </Badge>
                    </TableCell>
                    <TableCell>
                        <div className="flex space-x-1">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-white/10"
                            onClick={() => handleViewRoom(room)}
                        >
                            <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-white/10"
                            onClick={() => handleEditRoom(room)}
                        >
                            <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-white/10"
                            onClick={() => handleModerateRoom(room)}
                        >
                            <MessageSquare className="h-4 w-4" />
                        </Button>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 p-0 text-gray-400 hover:text-red-400 hover:bg-white/10"
                            onClick={() => handleDeleteRoom(room)}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                        </div>
                    </TableCell>
                    </TableRow>
                ))
                ) : (
                <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-gray-500">
                    No rooms match your search criteria
                    </TableCell>
                </TableRow>
                )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Modals */}
      <RoomDetailsModal 
        isOpen={isDetailsModalOpen} 
        onClose={() => setIsDetailsModalOpen(false)} 
        room={selectedRoom} 
      />
      <EditRoomModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        room={selectedRoom}
        onRoomUpdated={handleRoomUpdated}
        />
      <ModerationToolsModal 
        isOpen={isModerationModalOpen} 
        onClose={() => setIsModerationModalOpen(false)} 
        room={selectedRoom} 
      />
      <DeleteConfirmationModal 
        isOpen={isDeleteModalOpen} 
        onClose={() => setIsDeleteModalOpen(false)} 
        onConfirm={confirmDeleteRoom}
        title="Delete Room"
        description={`Are you sure you want to delete "${selectedRoom?.title}"? This action cannot be undone.`}
      />
    </div>
  );
};

export default RoomManagement;