import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from "react-redux";
import {
  Users,
  Search,
  Filter,
  Ban,
  Eye,
  CheckCircle,
  XCircle,
  Download,
  ChevronDown
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../components/ui/tabs";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "../../components/ui/table";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from "../../components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "../../components/ui/avatar";
import { fetchUsers } from "../../features/auth/adminSlice";
import adminInstance from "../../features/auth/adminInstance";
import UserProfileModal from "../../components/admin/UserProfileModal"
import { toast } from '../../hooks/use-toast';

const UserManagement = () => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.admin);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [nextPage, setNextPage] = useState(null);
  const [prevPage, setPrevPage] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [activeTab, setActiveTab] = useState('all');
  const pageSize = 5;
  const [exportLoading, setExportLoading] = useState(false);
  // Load users with current filters and page
  const loadUsers = async (page = 1, tab = activeTab, search = searchTerm) => {
    const params = { page, page_size: pageSize };
    if (search) params.search = search;
    if (tab !== 'all') params.status = tab; // status: 'banned' | 'flagged' | 'premium'
    const result = await dispatch(fetchUsers(params));
    if (fetchUsers.fulfilled.match(result)) {
      setUsers(result.payload.results);
      setNextPage(result.payload.next);
      setPrevPage(result.payload.previous);
      setTotalCount(result.payload.count);
      setCurrentPage(page);
    }
  };

  // Initial load
  useEffect(() => {
    loadUsers(1, activeTab, searchTerm);
    // eslint-disable-next-line
  }, []);

  // Handle tab change
  const handleTabChange = (val) => {
    setActiveTab(val);
    setCurrentPage(1);
    loadUsers(1, val, searchTerm);
  };

  // Handle search
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setCurrentPage(1);
    loadUsers(1, activeTab, value);
  };

  // Pagination
  const handlePrevPage = () => {
    if (prevPage && currentPage > 1) {
      loadUsers(currentPage - 1, activeTab, searchTerm);
    }
  };
  const handleNextPage = () => {
    if (nextPage) {
      loadUsers(currentPage + 1, activeTab, searchTerm);
    }
  };

  // Ban/unban logic
  const banUser = async (userId) => {
    try {
      await adminInstance.post(`/users/${userId}/status/`, { action: 'banned' });
      loadUsers(currentPage, activeTab, searchTerm);
    } catch (err) {}
  };
  const unbanUser = async (userId) => {
    try {
      await adminInstance.post(`/users/${userId}/status/`, { action: 'active' });
      loadUsers(currentPage, activeTab, searchTerm);
    } catch (err) {}
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return <span className="bg-neon-green/20 text-neon-green px-2 py-1 rounded">Active</span>;
      case "flagged":
        return <span className="bg-yellow-600/20 text-yellow-500 px-2 py-1 rounded">Flagged</span>;
      case "banned":
        return <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded">Banned</span>;
      default:
        return <span>Unknown</span>;
    }
  };

  const handleViewUser = async (user) => {
    try {
      const res = await adminInstance.get(`/users/${user.id}/`);
      setSelectedUser(res.data);
      setIsModalOpen(true);
    } catch (err) {
      setSelectedUser(null);
      setIsModalOpen(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  // Export functionality
  const handleExport = async (period) => {
    setExportLoading(true);
    try {
      const response = await adminInstance.get(`/users/export/`, {
        params: { period },
        responseType: 'blob' // Important for file download
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `users-${period}-${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast({ 
        title: 'Export Successful', 
        description: `Users exported for ${period} period.` 
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({ 
        title: 'Export Failed', 
        description: 'Failed to export users. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setExportLoading(false);
    }
  };

  // Replace the Export button with this:
  const ExportDropdown = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          className="bg-neon-purple hover:bg-neon-purple/90 text-white"
          disabled={exportLoading}
        >
          {exportLoading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          Export
          <ChevronDown className="h-4 w-4 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-black/90 border-white/10 text-white">
        <DropdownMenuLabel>Export Period</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-white/10" />
        <DropdownMenuItem
          onClick={() => handleExport('this_week')}
          className="hover:bg-white/10 focus:bg-white/10 cursor-pointer"
          disabled={exportLoading}
        >
          <Download className="h-4 w-4 mr-2" />
          This Week
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleExport('last_month')}
          className="hover:bg-white/10 focus:bg-white/10 cursor-pointer"
          disabled={exportLoading}
        >
          <Download className="h-4 w-4 mr-2" />
          Last Month
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleExport('all')}
          className="hover:bg-white/10 focus:bg-white/10 cursor-pointer"
          disabled={exportLoading}
        >
          <Download className="h-4 w-4 mr-2" />
          All Users
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

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
              onChange={handleSearch}
            />
          </div>
          <ExportDropdown />
        </div>
      </div>

      <Tabs
        defaultValue="all"
        value={activeTab}
        onValueChange={handleTabChange}
        className="w-full"
      >
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

        <TabsContent value={activeTab} className="mt-0">
          <Card className="bg-black/30 backdrop-blur-sm border-white/10">
            <CardHeader className="pb-0">
              <CardTitle className="text-lg text-white">Users</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-white">Loading users...</div>
              ) : error ? (
                <div className="text-red-400">{error}</div>
              ) : Array.isArray(users) && users.length > 0 ? (
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
                    {users.map((user) => (
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
                              {user.status === 'banned' ? (
                                <DropdownMenuItem
                                  onClick={() => unbanUser(user.id)}
                                  className="hover:bg-white/10 focus:bg-white/10 cursor-pointer text-neon-green"
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Unban User
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem
                                  onClick={() => banUser(user.id)}
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
              ) : (
                <div className="text-gray-400 text-center py-8">No users found.</div>
              )}
            </CardContent>
          </Card>
              <div className="flex justify-between items-center mt-4">
                      <span className="text-gray-400 text-sm">Page {currentPage} of {Math.ceil(totalCount / pageSize)}</span>
                      <div className="space-x-2">
                        <Button onClick={handlePrevPage} disabled={!prevPage}>Previous</Button>
                        <Button onClick={handleNextPage} disabled={!nextPage}>Next</Button>
                      </div>
                    </div>
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
