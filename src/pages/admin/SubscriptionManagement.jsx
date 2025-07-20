import React, { useState, useEffect } from 'react';
import {
    CreditCard,
    Users,
    Clock,
    DollarSign,
    Search,
    Plus,
    Eye,
    Filter,
    Pencil,
    Edit
} from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "../../components/ui/table";
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "../../components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "../../components/ui/dropdown-menu";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
} from "../../components/ui/tabs";
import { Label } from '../../components/ui/label';
import { Switch } from '../../components/ui/switch';
import { useToast } from "../../hooks/use-toast";
import SubscriptionDetailsModal from '../../components/admin/SubscriptionDetailsModal';
import adminInstance from '../../features/auth/adminInstance';
import { Textarea } from '../../components/ui/textarea';

const SubscriptionManagement = () => {
    const [subscriptions, setSubscriptions] = useState([]);
    const [subscriptionsPagination, setSubscriptionsPagination] = useState({ page: 1, count: 0 });

    const [subscriptionPlans, setSubscriptionPlans] = useState([]);
    const [plansPagination, setPlansPagination] = useState({ page: 1, count: 0 });

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [planFilter, setPlanFilter] = useState('all');
    const [isCreatePlanOpen, setIsCreatePlanOpen] = useState(false);
    const [isUserDetailModalOpen, setIsUserDetailModalOpen] = useState(false);
    const [selectedUserSubscription, setSelectedUserSubscription] = useState(null);
    const [newPlan, setNewPlan] = useState({ name: '', price: '', duration_days: '', features: '' });
    const [isEditPlanOpen, setIsEditPlanOpen] = useState(false);
    const [editPlan, setEditPlan] = useState(null);
    const [editErrors, setEditErrors] = useState({});
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    // Fetch plans and user subscriptions
useEffect(() => {
  fetchSubscriptions(1); // reset to page 1 when filters/search change
  fetchPlans(1);
}, [searchTerm, statusFilter, planFilter]);


    const fetchPlans = async (page = 1) => {
    setLoading(true);
    try {
        const res = await adminInstance.get(`/subscription/?page=${page}`);
        setSubscriptionPlans(res.data.results);
        setPlansPagination({ page, count: res.data.count });
    } catch (err) {
        toast({ title: 'Error', description: 'Failed to fetch plans', variant: 'destructive' });
    } finally {
        setLoading(false);
    }
    };

    const fetchSubscriptions = async (page = 1) => {
    setLoading(true);
    try {
        const res = await adminInstance.get(`/user-subscriptions/?page=${page}`);
        console.log('User subscriptions API response:', res.data);
        setSubscriptions(res.data.results || []);
        setSubscriptionsPagination({ page, count: res.data.count || 0 });
    } catch (err) {
        console.error('Error fetching user subscriptions:', err);
        toast({ title: 'Error', description: 'Failed to fetch subscriptions', variant: 'destructive' });
        setSubscriptions([]);
        setSubscriptionsPagination({ page: 1, count: 0 });
    } finally {
        setLoading(false);
    }
    };


    // KPI calculations
    const totalSubscriptions = subscriptions.length;
    const activeSubscriptions = subscriptions.filter(sub => sub.status === 'active').length;
    const expiredSubscriptions = subscriptions.filter(sub => sub.status === 'expired').length;
    
    // Debug logging for subscription data
    console.log('Subscriptions data:', subscriptions);
    console.log('Active subscriptions:', subscriptions.filter(sub => sub.status === 'active'));
    
    const estimatedRevenue = subscriptions
        .filter(sub => sub.status === 'active')
        .reduce((total, sub) => {
            // Remove ₹ symbol and parse the price
            const amountStr = sub.amount || '';
            const price = parseFloat(amountStr.replace('₹', '').replace(/[^\d.]/g, ''));
            console.log(`Subscription ${sub.id}: amount="${amountStr}", parsed price=${price}`);
            
            // Additional validation
            if (isNaN(price) || price < 0) {
                console.warn(`Invalid price for subscription ${sub.id}: ${amountStr}`);
                return total;
            }
            
            return total + price;
        }, 0);
    
    console.log('Total estimated revenue:', estimatedRevenue);

    // Filter subscriptions based on search term and filters
    const filteredSubscriptions = subscriptions.filter(sub => {
        const matchesSearch =
            (sub.username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (sub.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (sub.plan || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || sub.status === statusFilter;
        const matchesPlan = planFilter === 'all' || (sub.plan || '').toLowerCase() === planFilter.toLowerCase();
        return matchesSearch && matchesStatus && matchesPlan;
    });

    // Create Plan
    const handleCreatePlan = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                name: newPlan.name,
                price: newPlan.price,
                duration_days: newPlan.duration_days,
                features: newPlan.features, // backend expects string
                is_active: true
            };
            await adminInstance.post('/subscription/', payload);
            toast({ title: 'Plan Created', description: `New ${newPlan.name} plan created successfully.` });
            setIsCreatePlanOpen(false);
            setNewPlan({ name: '', price: '', duration_days: '', features: '' });
            fetchPlans();
        } catch (err) {
            toast({ title: 'Error', description: 'Failed to create plan', variant: 'destructive' });
        }
    };

    // Open edit modal
    const handleEditPlan = (plan) => {
        setEditPlan({ ...plan });
        setEditErrors({});
        setIsEditPlanOpen(true);
    };

    // Handle edit field changes
    const handleEditFieldChange = (field, value) => {
        setEditPlan((prev) => ({ ...prev, [field]: value }));
        setEditErrors((prev) => ({ ...prev, [field]: undefined }));
    };

    // Validate and save changes (persist to backend)
    const handleSaveEditPlan = async (e) => {
        e.preventDefault();
        let errors = {};
        if (!editPlan.name?.trim()) errors.name = 'Plan name required';
        if (!editPlan.duration_days || isNaN(editPlan.duration_days) || Number(editPlan.duration_days) <= 0) errors.duration_days = 'Duration must be > 0';
        if (!editPlan.price || isNaN(editPlan.price) || Number(editPlan.price) < 0) errors.price = 'Price must be ≥ 0';
        if (!editPlan.features?.trim()) errors.features = 'At least one feature required';
        setEditErrors(errors);
        if (Object.keys(errors).length > 0) return;
        try {
            setLoading(true);
            const payload = {
                name: editPlan.name,
                duration_days: editPlan.duration_days,
                price: editPlan.price,
                features: editPlan.features,
                is_active: editPlan.is_active
            };
            await adminInstance.patch(`/subscription/${editPlan.id}/`, payload);
            setIsEditPlanOpen(false);
            toast({ title: 'Plan Updated', description: `${editPlan.name} updated successfully.` });
            fetchPlans();
        } catch (err) {
            toast({ title: 'Error', description: 'Failed to update plan', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    // View User Subscription Details
    const handleViewUserDetails = (subscription) => {
        setSelectedUserSubscription(subscription);
        setIsUserDetailModalOpen(true);
    };

    // Status badge
    const getStatusBadge = (status) => {
        switch (status) {
            case 'active':
                return <span className="px-2 py-1 rounded bg-green-500/20 text-green-500 text-xs font-semibold">Active</span>;
            case 'expired':
                return <span className="px-2 py-1 rounded bg-red-500/20 text-red-400 text-xs font-semibold">Expired</span>;
            case 'canceled':
                return <span className="px-2 py-1 rounded bg-amber-500/20 text-amber-400 text-xs font-semibold">Canceled</span>;
            default:
                return <span className="px-2 py-1 rounded bg-gray-500/20 text-gray-400 text-xs font-semibold">Unknown</span>;
        }
    };

    // Features for a plan
    const getFeatures = (plan) => {
        if (!plan || !plan.features) return [];
        if (Array.isArray(plan.features)) return plan.features;
        return plan.features.split(/\r?\n|,/).map(f => f.trim()).filter(Boolean);
    };

    const PaginationControls = ({ page, count, pageSize = 5, onPageChange }) => {
        const totalPages = Math.ceil(count / pageSize);

        if (totalPages <= 1) return null;

        return (
            <div className="flex justify-end items-center gap-2 mt-4">
            <Button variant="ghost" disabled={page === 1} onClick={() => onPageChange(page - 1)}>Previous</Button>
            <span className="text-white">
                Page {page} of {totalPages}
            </span>
            <Button variant="ghost" disabled={page === totalPages} onClick={() => onPageChange(page + 1)}>Next</Button>
            </div>
        );
        };


    return (
        <div className="space-y-6 p-6 pb-16">
            <div className="flex flex-col gap-2">
                <h2 className="text-3xl font-bold tracking-tight text-white">Subscription Management</h2>
                <p className="text-muted-foreground">Manage subscription plans and monitor user subscriptions.</p>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-black/40 backdrop-blur-xl border border-white/10">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-white">Total Subscriptions</CardTitle>
                        <CreditCard className="h-4 w-4 text-neon-purple" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{totalSubscriptions}</div>
                        <p className="text-xs text-muted-foreground">All subscription plans</p>
                    </CardContent>
                </Card>

                <Card className="bg-black/40 backdrop-blur-xl border border-white/10">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-white">Active Subscribers</CardTitle>
                        <Users className="h-4 w-4 text-neon-blue" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{activeSubscriptions}</div>
                        <p className="text-xs text-muted-foreground">Current premium users</p>
                    </CardContent>
                </Card>

                <Card className="bg-black/40 backdrop-blur-xl border border-white/10">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-white">Expired Plans</CardTitle>
                        <Clock className="h-4 w-4 text-neon-pink" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{expiredSubscriptions}</div>
                        <p className="text-xs text-muted-foreground">Need renewal follow-up</p>
                    </CardContent>
                </Card>

                <Card className="bg-black/40 backdrop-blur-xl border border-white/10">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-white">Est. Monthly Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-neon-green" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">₹{estimatedRevenue.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">From active subscriptions</p>
                    </CardContent>
                </Card>
            </div>

            {/* Tabbed Interface */}
            <Tabs defaultValue="plans" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-black/30 border border-white/10">
                    <TabsTrigger
                        value="plans"
                        className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-neon-purple data-[state=active]:to-neon-blue data-[state=active]:text-white"
                    >
                        Subscription Plans
                    </TabsTrigger>
                    <TabsTrigger
                        value="users"
                        className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-neon-purple data-[state=active]:to-neon-blue data-[state=active]:text-white"
                    >
                        User Subscriptions
                    </TabsTrigger>
                </TabsList>

                {/* Subscription Plans Tab */}
                <TabsContent value="plans" className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-semibold text-white">Subscription Plans</h3>
                        <Dialog open={isCreatePlanOpen} onOpenChange={setIsCreatePlanOpen}>
                            <DialogTrigger asChild>
                                <Button className="bg-gradient-to-r from-neon-purple to-neon-blue hover:opacity-90">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create Plan
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-black/80 backdrop-blur-xl border border-white/10 text-white">
                                <DialogHeader>
                                    <DialogTitle>Create New Subscription Plan</DialogTitle>
                                    <DialogDescription className="text-gray-400">
                                        Set up a new subscription plan for your platform.
                                    </DialogDescription>
                                </DialogHeader>

                                <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="name" className="text-right">Plan Name</Label>
                                        <Input
                                            id="name"
                                            value={newPlan.name}
                                            onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
                                            className="col-span-3 bg-black/40 border-white/10"
                                        />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="price" className="text-right">Price</Label>
                                        <Input
                                            id="price"
                                            value={newPlan.price}
                                            onChange={(e) => setNewPlan({ ...newPlan, price: e.target.value })}
                                            className="col-span-3 bg-black/40 border-white/10"
                                            placeholder="e.g. $9.99"
                                        />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="duration" className="text-right">Duration (days)</Label>
                                        <Input
                                            id="duration"
                                            value={newPlan.duration_days}
                                            onChange={(e) => setNewPlan({ ...newPlan, duration_days: e.target.value })}
                                            className="col-span-3 bg-black/40 border-white/10"
                                            placeholder="e.g. 30"
                                        />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="features" className="text-right">Features</Label>
                                        <Input
                                            id="features"
                                            value={newPlan.features}
                                            onChange={(e) => setNewPlan({ ...newPlan, features: e.target.value })}
                                            className="col-span-3 bg-black/40 border-white/10"
                                            placeholder="Comma-separated features"
                                        />
                                    </div>
                                </div>

                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setIsCreatePlanOpen(false)} className="bg-black/30 border-white/10">
                                        Cancel
                                    </Button>
                                    <Button onClick={handleCreatePlan} className="bg-gradient-to-r from-neon-purple to-neon-blue hover:opacity-90">
                                        Create Plan
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <div className="rounded-md border border-white/10 backdrop-blur-xl bg-black/30 overflow-hidden">
                        <Table>
                            <TableHeader className="bg-black/40">
                                <TableRow className="border-white/10 hover:bg-white/5">
                                    <TableHead className="text-white">Plan ID</TableHead>
                                    <TableHead className="text-white">Plan Name</TableHead>
                                    <TableHead className="text-white">Duration (days)</TableHead>
                                    <TableHead className="text-white">Status</TableHead>
                                    <TableHead className="text-white">Price</TableHead>
                                    <TableHead className="text-white">Features</TableHead>
                                    <TableHead className="text-white">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {subscriptionPlans.length > 0 ?(
                                    subscriptionPlans.map((plan) => (
                                        <TableRow key={plan.id} className="border-white/10 hover:bg-white/5 transition-colors">
                                            <TableCell className="text-white font-mono text-sm">{plan.id}</TableCell>
                                            <TableCell className="text-white font-medium">{plan.name}</TableCell>
                                            <TableCell className="text-white">{plan.duration_days}</TableCell>
                                            <TableCell>
                                                {plan.is_active ? (
                                                    <Badge className="bg-neon-green/70 hover:bg-neon-green/90 text-black">Active</Badge>
                                                ) : (
                                                    <Badge className="bg-red-500/70 hover:bg-red-500/90 text-black">Inactive</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-white font-medium">{plan.price}</TableCell>
                                            <TableCell className="text-white">
                                                <div className="max-w-xs">
                                                    {plan.features.split(',').map((feature, index) => (
                                                        <div key={index} className="py-0.5 text-sm">
                                                            {feature.trim()}
                                                        </div>
                                                    ))}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-white hover:text-neon-purple hover:bg-white/10"
                                                    onClick={() => handleEditPlan(plan)}
                                                    aria-label="Edit Plan"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))

                                ):(
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-24 text-center text-gray-400">
                                            No subscription plans found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                                <PaginationControls
                    page={plansPagination.page}
                    count={plansPagination.count}
                    onPageChange={(newPage) => fetchPlans(newPage)}
                    />
                    </div>

                    {/* Edit Plan Modal */}
                    <Dialog open={isEditPlanOpen} onOpenChange={setIsEditPlanOpen}>
                        <DialogContent className="bg-black/80 border border-neon-purple/40 shadow-xl rounded-2xl max-w-lg text-white backdrop-blur-xl animate-in fade-in zoom-in-95">
                            <DialogHeader>
                                <DialogTitle className="text-xl font-bold text-white">Edit Subscription Plan</DialogTitle>
                                <DialogDescription className="text-gray-300">
                                    Update the details for this plan. All changes are local (demo mode).
                                </DialogDescription>
                            </DialogHeader>
                            {editPlan && (
                                <form onSubmit={handleSaveEditPlan} className="space-y-5 mt-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="edit-name" className="text-neon-purple">Plan Name</Label>
                                        <Input
                                            id="edit-name"
                                            className={`bg-black/40 border-white/20 text-white focus:border-neon-purple ${editErrors.name ? 'border-red-500' : ''}`}
                                            value={editPlan.name}
                                            onChange={e => handleEditFieldChange('name', e.target.value)}
                                        />
                                        {editErrors.name && <div className="text-red-400 text-xs mt-1">{editErrors.name}</div>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="edit-duration" className="text-neon-purple">Duration (days)</Label>
                                        <Input
                                            id="edit-duration"
                                            type="number"
                                            min={1}
                                            className={`bg-black/40 border-white/20 text-white focus:border-neon-purple ${editErrors.duration_days ? 'border-red-500' : ''}`}
                                            value={editPlan.duration_days}
                                            onChange={e => handleEditFieldChange('duration_days', e.target.value)}
                                        />
                                        {editErrors.duration_days && <div className="text-red-400 text-xs mt-1">{editErrors.duration_days}</div>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="edit-price" className="text-neon-purple">Price ($)</Label>
                                        <Input
                                            id="edit-price"
                                            type="number"
                                            min={0}
                                            step="0.01"
                                            className={`bg-black/40 border-white/20 text-white focus:border-neon-purple ${editErrors.price ? 'border-red-500' : ''}`}
                                            value={editPlan.price}
                                            onChange={e => handleEditFieldChange('price', e.target.value)}
                                        />
                                        {editErrors.price && <div className="text-red-400 text-xs mt-1">{editErrors.price}</div>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="edit-features" className="text-neon-purple">Features</Label>
                                        <Textarea
                                            id="edit-features"
                                            rows={3}
                                            className={`bg-black/40 border-white/20 text-white focus:border-neon-purple ${editErrors.features ? 'border-red-500' : ''}`}
                                            value={editPlan.features}
                                            onChange={e => handleEditFieldChange('features', e.target.value)}
                                            placeholder="Enter features separated by commas or new lines"
                                        />
                                        {editErrors.features && <div className="text-red-400 text-xs mt-1">{editErrors.features}</div>}
                                    </div>
                                    <div className="flex items-center gap-3 mt-2">
                                        <Switch
                                            id="edit-active"
                                            checked={!!editPlan.is_active}
                                            onCheckedChange={v => handleEditFieldChange('is_active', v)}
                                        />
                                        <Label htmlFor="edit-active" className="text-neon-purple">Active</Label>
                                    </div>
                                    <DialogFooter className="mt-4">
                                        <Button type="button" variant="outline" onClick={() => setIsEditPlanOpen(false)} className="bg-black/30 border-white/10 text-white">Cancel</Button>
                                        <Button type="submit" className="bg-gradient-to-r from-neon-purple to-neon-blue text-white shadow-neon-purple/30 hover:opacity-90">
                                            Save Changes
                                        </Button>
                                    </DialogFooter>
                                </form>
                            )}
                        </DialogContent>
                    </Dialog>
                </TabsContent>
        


                {/* User Subscriptions Tab */}
                <TabsContent value="users" className="space-y-4">
                    {/* Search and Filters */}
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="flex flex-1 items-center space-x-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search subscriptions..."
                                    className="pl-8 bg-black/20 border-white/10 text-white"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm" className="bg-black/30 border-white/10">
                                        <Filter className="mr-2 h-4 w-4" />
                                        Status
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="bg-black/90 border-white/10">
                                    <DropdownMenuItem
                                        className="hover:bg-white/10 hover:text-neon-purple"
                                        onClick={() => setStatusFilter('all')}
                                    >
                                        All
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        className="hover:bg-white/10 hover:text-neon-purple"
                                        onClick={() => setStatusFilter('active')}
                                    >
                                        Active
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        className="hover:bg-white/10 hover:text-neon-purple"
                                        onClick={() => setStatusFilter('expired')}
                                    >
                                        Expired
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        className="hover:bg-white/10 hover:text-neon-purple"
                                        onClick={() => setStatusFilter('canceled')}
                                    >
                                        Canceled
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm" className="bg-black/30 border-white/10">
                                        <Filter className="mr-2 h-4 w-4" />
                                        Plan
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="bg-black/90 border-white/10">
                                    <DropdownMenuItem
                                        className="hover:bg-white/10 hover:text-neon-purple"
                                        onClick={() => setPlanFilter('all')}
                                    >
                                        All Plans
                                    </DropdownMenuItem>
                                    {subscriptionPlans.map(plan => (
                                        <DropdownMenuItem
                                            key={plan.id}
                                            className="hover:bg-white/10 hover:text-neon-purple"
                                            onClick={() => setPlanFilter(plan.name)}
                                        >
                                            {plan.name}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>

                    {/* User Subscriptions Table */}
                    <div className="rounded-md border border-white/10 backdrop-blur-xl bg-black/30 overflow-hidden">
                        <Table>
                            <TableHeader className="bg-black/40">
                                <TableRow className="border-white/10 hover:bg-white/5">
                                    <TableHead className="text-white">User</TableHead>
                                    <TableHead className="text-white">Plan Type</TableHead>
                                    <TableHead className="text-white">Start Date</TableHead>
                                    <TableHead className="text-white">Expiry Date</TableHead>
                                    <TableHead className="text-white">Payment Method</TableHead>
                                    <TableHead className="text-white">Status</TableHead>
                                    <TableHead className="text-white">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredSubscriptions.length > 0 ? (
                                    filteredSubscriptions.map((subscription) => (
                                        <TableRow
                                            key={subscription.id}
                                            className="border-white/10 hover:bg-white/5 transition-colors"
                                        >
                                            <TableCell className="font-medium text-white">
                                                <div className="flex flex-col">
                                                    <span>{subscription.username}</span>
                                                    <span className="text-xs text-gray-400">{subscription.email}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-white">{subscription.plan}</TableCell>
                                            <TableCell className="text-white">{subscription.startDate}</TableCell>
                                            <TableCell className="text-white">{subscription.endDate}</TableCell>
                                            <TableCell className="text-white">{subscription.paymentMethod}</TableCell>
                                            <TableCell>{getStatusBadge(subscription.status)}</TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-white hover:text-neon-blue hover:bg-white/10"
                                                    onClick={() => handleViewUserDetails(subscription)}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-24 text-center text-gray-400">
                                            No subscriptions found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                        <PaginationControls
                        page={subscriptionsPagination.page}
                        count={subscriptionsPagination.count}
                        onPageChange={(newPage) => fetchSubscriptions(newPage)}
                        />

                    </div>
                </TabsContent>
            </Tabs>

            {/* User Detail Modal */}
            <SubscriptionDetailsModal
                isOpen={isUserDetailModalOpen}
                onClose={() => setIsUserDetailModalOpen(false)}
                subscription={selectedUserSubscription ? {
                    ...selectedUserSubscription,
                    features: getFeatures(selectedUserSubscription.planId)
                } : null}
            />
        </div>
    );
};

export default SubscriptionManagement;