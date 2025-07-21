import React, { useState, useEffect } from 'react';
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../components/ui/tooltip"
import { formatDistanceToNow } from 'date-fns';
import ReportDetailsModal from '../../components/admin/ReportDetailsModal';
import { toast } from '../../hooks/use-toast';
import adminModerationApi from '../../api/adminModerationApi';

const ModerationReports = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterReason, setFilterReason] = useState('all');
  const [selectedReport, setSelectedReport] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [nextPage, setNextPage] = useState(null);
  const [prevPage, setPrevPage] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 5;

  const fetchReports = async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        page_size: pageSize,
        search: searchTerm,
        reason: filterReason !== 'all' ? filterReason : undefined,
      };
      const res = await adminModerationApi.fetchReports(params);
      setReports(res.results);
      setNextPage(res.next);
      setPrevPage(res.previous);
      setTotalCount(res.count);
      setCurrentPage(page);
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to fetch reports', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports(1);
  }, [searchTerm, filterReason]);

  const handleNextPage = () => {
    if (nextPage) fetchReports(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (prevPage && currentPage > 1) fetchReports(currentPage - 1);
  };

  const handleViewDetails = (report) => {
    setSelectedReport(report);
    setIsDetailsModalOpen(true);
  };

  const handleResolveReport = async (id) => {
    try {
      await adminModerationApi.updateReportStatus(id, 'resolved');
      setReports((r) => r.map((rep) => (rep.id === id ? { ...rep, status: 'resolved' } : rep)));
      toast({ title: 'Report Resolved', description: `Report #${id} has been resolved.` });
    } catch {
      toast({ title: 'Error', description: 'Failed to resolve report', variant: 'destructive' });
    }
  };

  const handleDismissReport = async (id) => {
    try {
      await adminModerationApi.updateReportStatus(id, 'dismissed');
      setReports((r) => r.map((rep) => (rep.id === id ? { ...rep, status: 'dismissed' } : rep)));
      toast({ title: 'Report Dismissed', description: `Report #${id} has been dismissed.` });
    } catch {
      toast({ title: 'Error', description: 'Failed to dismiss report', variant: 'destructive' });
    }
  };

  const handleSuspendUser = async (id) => {
    try {
      await adminModerationApi.updateReportStatus(id, 'suspend')
      setReports((r) => r.map((rep) => (rep.id === id ? { ...rep, status: 'resolved' } : rep)))
      toast({ title: 'Success', description: `Report #${id} has been resolved.` });
    } catch {
      toast({ title: "Error", description: "Failed to Suspend User", variant: "destructive" });
    }

  };

  const reasons = Array.from(new Set(reports.map((r) => r.reason)));
  const pendingReports = reports.filter((r) => r.status === 'pending');
  const resolvedReports = reports.filter((r) => r.status === 'resolved');
  const dismissedReports = reports.filter((r) => r.status === 'dismissed');

  const ReportTable = ({ reports }) => (
    <Table>
      <TableHeader className="bg-black/40">
        <TableRow>
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
        {reports.length > 0 ? (
          reports.map((report) => (
            <TableRow key={report.id}>
              <TableCell><span className="text-red-400">{report.reason}</span></TableCell>
              <TableCell>{report.reporter}</TableCell>
              <TableCell>{report.reported}</TableCell>
              <TableCell>{report.roomName}</TableCell>
              <TableCell>{formatDistanceToNow(new Date(report.timestamp), { addSuffix: true })}</TableCell>
              <TableCell>{report.status}</TableCell>
              <TableCell>
                <div className="flex space-x-1">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm" onClick={() => handleViewDetails(report)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>View</TooltipContent>
                    </Tooltip>
                    {report.status === 'pending' && (
                      <>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="sm" onClick={() => handleResolveReport(report.id)}>
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Resolve</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="sm" onClick={() => handleDismissReport(report.id)}>
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Reject</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="sm" onClick={() => handleSuspendUser(report.id)}>
                              <Ban className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Suspend</TooltipContent>
                        </Tooltip>
                      </>
                    )}
                  </TooltipProvider>
                </div>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={7} className="text-center text-gray-500">No reports found</TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Moderation & Reports</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardHeader><CardTitle>Total Reports</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{totalCount}</div></CardContent></Card>
        <Card><CardHeader><CardTitle>Pending</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-amber-400">{pendingReports.length}</div></CardContent></Card>
        <Card><CardHeader><CardTitle>Resolved</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-neon-green">{resolvedReports.length}</div></CardContent></Card>
        <Card><CardHeader><CardTitle>Dismissed</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-gray-400">{dismissedReports.length}</div></CardContent></Card>
      </div>

      <Card><CardContent>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" />
          </div>
          <Select value={filterReason} onValueChange={setFilterReason}>
            <SelectTrigger><SelectValue placeholder="Filter by Reason" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {reasons.map((reason) => (<SelectItem key={reason} value={reason}>{reason}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>
      </CardContent></Card>

      <Card>
        <Tabs defaultValue="pending">
          <TabsList>
            <TabsTrigger value="pending">Pending ({pendingReports.length})</TabsTrigger>
            <TabsTrigger value="resolved">Resolved ({resolvedReports.length})</TabsTrigger>
            <TabsTrigger value="dismissed">Dismissed ({dismissedReports.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="pending"><ReportTable reports={pendingReports} /></TabsContent>
          <TabsContent value="resolved"><ReportTable reports={resolvedReports} /></TabsContent>
          <TabsContent value="dismissed"><ReportTable reports={dismissedReports} /></TabsContent>
        </Tabs>
      </Card>

      <div className="flex justify-between items-center mt-4">
        <span className="text-gray-400 text-sm">Page {currentPage} of {Math.ceil(totalCount / pageSize)}</span>
        <div className="space-x-2">
          <Button onClick={handlePrevPage} disabled={!prevPage}>Previous</Button>
          <Button onClick={handleNextPage} disabled={!nextPage}>Next</Button>
        </div>
      </div>

      <ReportDetailsModal isOpen={isDetailsModalOpen} onClose={() => setIsDetailsModalOpen(false)} report={selectedReport} />
    </div>
  );
};

export default ModerationReports;

