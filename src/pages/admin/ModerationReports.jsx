import React, { useState } from 'react';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "../../components/ui/tabs";
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
  Flag, 
  Search, 
  ShieldCheck,
  Ban, 
  CheckCircle, 
  XCircle,
  Eye
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import ReportDetailsModal from '../../components/admin/ReportDetailsModal';
import { toast } from '../../hooks/use-toast';

const ModerationReports = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterReason, setFilterReason] = useState('all');
  const [selectedReport, setSelectedReport] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const [reports, setReports] = useState([
    {
      id: 1,
      reason: "Inappropriate language",
      reporter: "Alex Thompson",
      reported: "James Wilson",
      content: "This message contained offensive language directed at another user",
      roomId: 4,
      roomName: "French Beginners",
      timestamp: new Date("2023-04-18T15:30:00Z"),
      status: "pending"
    },
    {
      id: 2,
      reason: "Harassment",
      reporter: "Emma Wilson",
      reported: "Mike Peterson",
      content: "User was sending repeated unwanted messages despite being asked to stop",
      roomId: 1,
      roomName: "English Casual Conversation",
      timestamp: new Date("2023-04-17T12:45:00Z"),
      status: "resolved"
    },
    {
      id: 3,
      reason: "Spam",
      reporter: "Sarah Johnson",
      reported: "Liu Wei",
      content: "User was repeatedly posting advertisements in the chat",
      roomId: 2,
      roomName: "Japanese Study Group",
      timestamp: new Date("2023-04-16T09:20:00Z"),
      status: "pending"
    },
    {
      id: 4,
      reason: "Offensive content",
      reporter: "Hans Mueller",
      reported: "Sarah Johnson",
      content: "User shared inappropriate image in the chat",
      roomId: 3,
      roomName: "Spanish Debate Club",
      timestamp: new Date("2023-04-15T16:10:00Z"),
      status: "pending"
    },
    {
      id: 5,
      reason: "Off-topic",
      reporter: "Liu Wei",
      reported: "Hans Mueller",
      content: "User keeps changing the subject and disrupting serious language practice",
      roomId: 5,
      roomName: "Mandarin Practice",
      timestamp: new Date("2023-04-14T10:35:00Z"),
      status: "dismissed"
    },
    {
      id: 6,
      reason: "Impersonation",
      reporter: "Mike Peterson",
      reported: "Alex Thompson",
      content: "This user is pretending to be a staff member",
      roomId: 6,
      roomName: "German Grammar Workshop",
      timestamp: new Date("2023-04-13T14:25:00Z"),
      status: "resolved"
    },
  ]);

  const pendingReports = reports.filter(report => report.status === "pending");
  const resolvedReports = reports.filter(report => report.status === "resolved");
  const dismissedReports = reports.filter(report => report.status === "dismissed");
  const reasons = Array.from(new Set(reports.map(report => report.reason)));

  const filterReports = (reports) => {
    return reports.filter(report => {
      const matchesSearch = 
        report.reporter.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.reported.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.roomName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesReason = filterReason === 'all' || report.reason === filterReason;

      return matchesSearch && matchesReason;
    });
  };

  const handleViewDetails = (report) => {
    setSelectedReport(report);
    setIsDetailsModalOpen(true);
  };

  const handleResolveReport = (id) => {
    setReports(reports.map(report => 
      report.id === id 
        ? { ...report, status: "resolved" } 
        : report
    ));

    toast({
      title: "Report Resolved",
      description: `Report #${id} has been marked as resolved`,
    });
  };

  const handleDismissReport = (id) => {
    setReports(reports.map(report => 
      report.id === id 
        ? { ...report, status: "dismissed" } 
        : report
    ));

    toast({
      title: "Report Dismissed",
      description: `Report #${id} has been marked as dismissed`,
    });
  };

  const handleSuspendUser = (username) => {
    toast({
      title: "User Suspended",
      description: `${username} has been temporarily suspended`,
    });
  };

  const ReportTable = ({ reports }) => {
    const filteredReports = filterReports(reports);
    
    return (
      <Table>
        <TableHeader className="bg-black/40">
          <TableRow className="border-b border-white/10 hover:bg-transparent">
            <TableHead className="text-gray-400">Reason</TableHead>
            <TableHead className="text-gray-400">Reporter</TableHead>
            <TableHead className="text-gray-400">Reported User</TableHead>
            <TableHead className="text-gray-400">Room</TableHead>
            <TableHead className="text-gray-400">Time</TableHead>
            <TableHead className="text-gray-400">Status</TableHead>
            <TableHead className="text-gray-400">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredReports.length > 0 ? (
            filteredReports.map((report) => (
              <TableRow key={report.id} className="border-b border-white/5 hover:bg-white/5">
                <TableCell>
                  <Badge className="bg-red-500/20 text-red-400 hover:bg-red-500/30">
                    {report.reason}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium text-white">{report.reporter}</TableCell>
                <TableCell className="font-medium text-white">{report.reported}</TableCell>
                <TableCell>{report.roomName}</TableCell>
                <TableCell className="text-gray-400">
                  {formatDistanceToNow(report.timestamp, { addSuffix: true })}
                </TableCell>
                <TableCell>
                  <Badge className={`${
                    report.status === 'pending' 
                      ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30' 
                      : report.status === 'resolved'
                        ? 'bg-neon-green/20 text-neon-green hover:bg-neon-green/30'
                        : 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30'
                  }`}>
                    {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-1">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-white/10"
                      onClick={() => handleViewDetails(report)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {report.status === 'pending' && (
                      <>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0 text-gray-400 hover:text-neon-green hover:bg-white/10"
                          onClick={() => handleResolveReport(report.id)}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0 text-gray-400 hover:text-red-400 hover:bg-white/10"
                          onClick={() => handleDismissReport(report.id)}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0 text-gray-400 hover:text-amber-400 hover:bg-white/10"
                          onClick={() => handleSuspendUser(report.reported)}
                        >
                          <Ban className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center text-gray-500">
                No reports match your search criteria
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Moderation & Reports</h1>
      </div>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-black/30 backdrop-blur-sm border-white/10 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Total Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reports.length}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-black/30 backdrop-blur-sm border-white/10 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-400">{pendingReports.length}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-black/30 backdrop-blur-sm border-white/10 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Resolved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-neon-green">{resolvedReports.length}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-black/30 backdrop-blur-sm border-white/10 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Dismissed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-400">{dismissedReports.length}</div>
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
                placeholder="Search reports..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-black/20 border-white/10 text-white placeholder:text-gray-500"
              />
            </div>
            
            <div className="flex flex-1 md:flex-none flex-wrap gap-2">
              <Select value={filterReason} onValueChange={setFilterReason}>
                <SelectTrigger className="w-[180px] bg-black/20 border-white/10 text-white">
                  <SelectValue placeholder="Filter by reason" />
                </SelectTrigger>
                <SelectContent className="bg-black/90 border-white/10 text-white">
                  <SelectItem value="all" className="hover:bg-white/10 focus:bg-white/10">All Reasons</SelectItem>
                  {reasons.map(reason => (
                    <SelectItem 
                      key={reason} 
                      value={reason}
                      className="hover:bg-white/10 focus:bg-white/10"
                    >
                      {reason}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Reports Tabs and Table */}
      <Card className="bg-black/30 backdrop-blur-sm border-white/10 text-white overflow-hidden">
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="w-full bg-black/30 border-b border-white/10 rounded-none p-0">
            <TabsTrigger 
              value="pending" 
              className="flex-1 rounded-none data-[state=active]:bg-white/10 data-[state=active]:shadow-none data-[state=active]:text-neon-purple"
            >
              <Flag className="h-4 w-4 mr-2" />
              Pending ({pendingReports.length})
            </TabsTrigger>
            <TabsTrigger 
              value="resolved" 
              className="flex-1 rounded-none data-[state=active]:bg-white/10 data-[state=active]:shadow-none data-[state=active]:text-neon-green"
            >
              <ShieldCheck className="h-4 w-4 mr-2" />
              Resolved ({resolvedReports.length})
            </TabsTrigger>
            <TabsTrigger 
              value="dismissed" 
              className="flex-1 rounded-none data-[state=active]:bg-white/10 data-[state=active]:shadow-none data-[state=active]:text-gray-400"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Dismissed ({dismissedReports.length})
            </TabsTrigger>
          </TabsList>
          
          <div className="rounded-lg overflow-x-auto">
            <TabsContent value="pending" className="m-0">
              <ReportTable reports={pendingReports} />
            </TabsContent>
            
            <TabsContent value="resolved" className="m-0">
              <ReportTable reports={resolvedReports} />
            </TabsContent>
            
            <TabsContent value="dismissed" className="m-0">
              <ReportTable reports={dismissedReports} />
            </TabsContent>
          </div>
        </Tabs>
      </Card>
      
      {/* AI Moderation Insights (Placeholder) */}
      <Card className="bg-black/30 backdrop-blur-sm border-white/10 text-white overflow-hidden">
        <CardHeader className="border-b border-white/10">
          <CardTitle className="text-lg font-medium flex items-center">
            <ShieldCheck className="h-5 w-5 mr-2 text-neon-purple" />
            AI Moderation Insights
          </CardTitle>
          <CardDescription className="text-gray-400">
            Automatically identified potential issues that may need moderation
          </CardDescription>
        </CardHeader>
        <CardContent className="py-6">
          <div className="flex items-center justify-center h-20 text-gray-400">
            <p>AI moderation features coming soon</p>
          </div>
        </CardContent>
      </Card>

      {/* Report Details Modal */}
      <ReportDetailsModal 
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        report={selectedReport}
      />
    </div>
  );
};

export default ModerationReports;
