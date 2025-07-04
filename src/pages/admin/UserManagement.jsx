import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  Ban,
  ShieldAlert,
  RefreshCcw,
  Eye,
  CheckCircle,
  XCircle
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { useDispatch, useSelector } from "react-redux";
import { fetchUsers } from "../../features/auth/adminSlice";
import UserProfileModal from '../../components/admin/UserProfileModal';
import adminInstance from '../../features/auth/adminInstance';

const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser,setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [users, setUsers] = useState([]); // Local users state
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.admin);

    // Fetch users only on mount
    // Fetch users only on mount
  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line
  }, []);

  const loadUsers = async () => {
    const result = await dispatch(fetchUsers());
    if (fetchUsers.fulfilled.match(result)) {
      setUsers(result.payload);
    }
  };

  // Ban user API call
  const banUser = async (userId) => {
    try {
      await adminInstance.post(`/users/${userId}/status/`, { action: 'banned' });
      return true;
    } catch (err) {
      return false;
    }
  };

  // Unban user API call
  const unbanUser = async (userId) => {
    try {
      await adminInstance.post(`/users/${userId}/status/`, { action: 'active' });
      return true;
    } catch (err) {
      return false;
    }
  };

  // Handler for ban/unban
  const handleBanUser = async (userId) => {
    const success = await banUser(userId);
    if (success) {
      await loadUsers();
    } else {
      // Optionally show error toast
    }
  };
  const handleUnbanUser = async (userId) => {
    const success = await unbanUser(userId);
    if (success) {
      await loadUsers();
    } else {
      // Optionally show error toast
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return <Badge className="bg-neon-green/20 text-neon-green hover:bg-neon-green/30">Active</Badge>;
      case "flagged":
        return <Badge variant="destructive" className="bg-yellow-600/20 text-yellow-500 hover:bg-yellow-600/30">Flagged</Badge>;
      case "banned":
        return <Badge variant="destructive" className="bg-red-500/20 text-red-400 hover:bg-red-500/30">Banned</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

const handleViewUser = async (user) => {
  try {
    const res = await adminInstance.get(`/users/${user.id}/`);
    setSelectedUser(res.data);
    setIsModalOpen(true);
  } catch (err) {
    // Optionally show error toast
    setSelectedUser(null);
    setIsModalOpen(false);
  }
};

  const handleCloseModal = ()=>{
    setIsModalOpen(false);
    setSelectedUser(null);
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-white">User Management</h1>
          <p className="text-gray-400 mt-1">Manage and monitor user accounts</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Search users..."
              className="pl-9 bg-black/30 border-white/10 text-white w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" className="border-white/10 text-white hover:bg-white/5">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Button className="bg-neon-purple hover:bg-neon-purple/90 text-white">
            <Users className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="bg-black/30 border border-white/10 mb-4">
          <TabsTrigger value="all" className="data-[state=active]:bg-white/10 text-white">
            All Users
          </TabsTrigger>
          <TabsTrigger value="flagged" className="data-[state=active]:bg-white/10 text-white">
            Flagged
          </TabsTrigger>
          <TabsTrigger value="banned" className="data-[state=active]:bg-white/10 text-white">
            Banned
          </TabsTrigger>
          <TabsTrigger value="premium" className="data-[state=active]:bg-white/10 text-white">
            Premium
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-0">
          <Card className="bg-black/30 backdrop-blur-sm border-white/10">
            <CardHeader className="pb-0">
              <CardTitle className="text-lg text-white">All Users</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-white">Loading users...</div>
              ) : error ? (
                <div className="text-red-400">{error}</div>
              ) : (
                <Table>
                  <TableHeader className="bg-black/30">
                    <TableRow className="hover:bg-white/5 border-white/10">
                      <TableHead className="text-gray-400 w-[50px]">ID</TableHead>
                      <TableHead className="text-gray-400">User</TableHead>
                      <TableHead className="text-gray-400">Email</TableHead>
                      <TableHead className="text-gray-400">Joined</TableHead>
                      <TableHead className="text-gray-400">Status</TableHead>
                      <TableHead className="text-gray-400">Level</TableHead>
                      <TableHead className="text-gray-400">Premium</TableHead>
                      <TableHead className="text-right text-gray-400">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users
                      .filter(user =>
                        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        user.email.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map((user) => (
                        <TableRow key={user.id} className="hover:bg-white/5 border-white/10">
                          <TableCell className="text-white">{user.id}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8 border border-white/20">
                                <AvatarImage src={user.avatar} />
                                <AvatarFallback className="bg-neon-purple/20 text-neon-purple">
                                  {user.username?.[0]?.toUpperCase() || "U"}
                                </AvatarFallback>
                              </Avatar>
                              <div className="font-medium text-white">{user.username}</div>
                            </div>
                          </TableCell>
                          <TableCell className="text-gray-300">{user.email}</TableCell>
                          <TableCell className="text-gray-300">{user.date_joined?.slice(0, 10)}</TableCell>
                          <TableCell>{getStatusBadge(user.status)}</TableCell>
                          <TableCell className="text-gray-300">{user.level}</TableCell>
                          <TableCell>
                        {user.is_premium ? 
                          <CheckCircle className="h-5 w-5 text-neon-purple" /> : 
                          <XCircle className="h-5 w-5 text-gray-500" />
                        }
                      </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0 text-gray-300 hover:bg-white/10">
                                  <span className="sr-only">Open menu</span>
                                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4">
                                    <path d="M3.625 7.5C3.625 8.12132 3.12132 8.625 2.5 8.625C1.87868 8.625 1.375 8.12132 1.375 7.5C1.375 6.87868 1.87868 6.375 2.5 6.375C3.12132 6.375 3.625 6.87868 3.625 7.5ZM8.625 7.5C8.625 8.12132 8.12132 8.625 7.5 8.625C6.87868 8.625 6.375 8.12132 6.375 7.5C6.375 6.87868 6.87868 6.375 7.5 6.375C8.12132 6.375 8.625 6.87868 8.625 7.5ZM13.625 7.5C13.625 8.12132 13.1213 8.625 12.5 8.625C11.8787 8.625 11.375 8.12132 11.375 7.5C11.375 6.87868 11.8787 6.375 12.5 6.375C13.1213 6.375 13.625 6.87868 13.625 7.5Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                                  </svg>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-black/90 border-white/10 text-white">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-white/10" />
                                <DropdownMenuItem
                                 className="hover:bg-white/10 focus:bg-white/10 cursor-pointer"
                                 onClick={() => handleViewUser(user)}
                                 >
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Profile
                                </DropdownMenuItem>
                                {/* <DropdownMenuItem className="hover:bg-white/10 focus:bg-white/10 cursor-pointer">
                                  <RefreshCcw className="h-4 w-4 mr-2" />
                                  Reset Password
                                </DropdownMenuItem> */}
                                {user.status === 'banned' ? (
                                  <DropdownMenuItem
                                  onClick={() => handleUnbanUser(user.id)}
                                  className="hover:bg-white/10 focus:bg-white/10 cursor-pointer text-neon-green"
                                  >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Unban User
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem
                                  onClick={() => handleBanUser(user.id)}
                                  className="hover:bg-white/10 focus:bg-white/10 cursor-pointer text-red-400"
                                  >
                                    <Ban className="h-4 w-4 mr-2" />
                                    Ban User
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="flagged">
          <Card className="bg-black/30 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Flagged Users</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400">Displaying only flagged users.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="banned">
          <Card className="bg-black/30 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Banned Users</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400">Displaying only banned users.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="premium">
          <Card className="bg-black/30 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Premium Users</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400">Displaying only users with premium subscriptions.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <UserProfileModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        user={selectedUser}
      />
    </div>
  );
};

export default UserManagement;
