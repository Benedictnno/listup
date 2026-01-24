'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/button';
import Badge from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, AlertTriangle, CheckCircle, XCircle, TrendingUp, Users, DollarSign, Activity, Plus, Settings } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface Partner {
    userId: string;
    name: string;
    email: string;
    phone: string;
    referralCode: string;
    isActive: boolean;
    lifetimeReferrals: number;
    lifetimeActivated: number;
    lifetimeEarnings: number;
    pendingEarnings: number;
    thisMonthSignups: number;
    thisMonthActivated: number;
    thisMonthClicks: number;
    thisMonthEarnings: number;
    conversionRate: number;
    fraudCount: number;
    isSuspicious: boolean;
}

interface ActivityItem {
    type: 'signup' | 'click';
    timestamp: string;
    partnerName: string;
    partnerCode: string;
    vendorName?: string;
    vendorEmail?: string;
    signupStatus?: string;
    listingStatus?: string;
    status?: string;
    qualified?: boolean;
    ipAddress?: string;
}

interface RewardSettings {
    signupRewardAmount: number;
    listingRewardAmount: number;
    clickRewardAmount: number;
    minimumPayoutAmount: number;
}

interface LeaderboardEntry {
    rank: number;
    name: string;
    email: string;
    successfulReferrals: number;
    referralCode: string;
    totalEarnings: number;
}

export default function PartnersPage() {
    const [partners, setPartners] = useState<Partner[]>([]);
    const [activities, setActivities] = useState<ActivityItem[]>([]);
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<'overview' | 'activity' | 'leaderboard'>('overview');

    // Add Partner Modal
    const [isAddPartnerOpen, setIsAddPartnerOpen] = useState(false);
    const [newPartner, setNewPartner] = useState({ name: '', email: '', phone: '' });
    const [isCreating, setIsCreating] = useState(false);

    // Settings Modal
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [settings, setSettings] = useState<RewardSettings>({
        signupRewardAmount: 25,
        listingRewardAmount: 25,
        clickRewardAmount: 15,
        minimumPayoutAmount: 1000
    });
    const [isSavingSettings, setIsSavingSettings] = useState(false);

    const router = useRouter();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [partnersRes, activityRes, settingsRes, leaderboardRes] = await Promise.all([
                fetch(`${process.env.NEXT_PUBLIC_ADMIN_BACKEND_URL}/api/partners/overview`, { credentials: 'include' }),
                fetch(`${process.env.NEXT_PUBLIC_ADMIN_BACKEND_URL}/api/partners/activity-feed?limit=50`, { credentials: 'include' }),
                fetch(`${process.env.NEXT_PUBLIC_ADMIN_BACKEND_URL}/api/settings/rewards`, { credentials: 'include' }),
                fetch(`${process.env.NEXT_PUBLIC_ADMIN_BACKEND_URL}/api/partners/leaderboard`, { credentials: 'include' })
            ]);

            if (!partnersRes.ok || !activityRes.ok || !settingsRes.ok) {
                if (partnersRes.status === 401 || activityRes.status === 401) {
                    router.push('/login');
                    return;
                }
                throw new Error('Failed to fetch data');
            }

            const partnersData = await partnersRes.json();
            const activityData = await activityRes.json();
            const settingsData = await settingsRes.json();
            const leaderboardData = leaderboardRes.ok ? await leaderboardRes.json() : { data: [] };

            setPartners(partnersData.data);
            setActivities(activityData.data);
            setLeaderboard(leaderboardData.data || []);
            if (settingsData.data) setSettings(settingsData.data);
        } catch (error) {
            console.error('Error fetching data:', error);
            alert('Failed to load partner data');
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePartner = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsCreating(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_ADMIN_BACKEND_URL}/api/partners/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newPartner),
                credentials: 'include'
            });
            const data = await res.json();
            if (data.success) {
                alert(`Partner created! Code: ${data.data.referralCode}`);
                setIsAddPartnerOpen(false);
                setNewPartner({ name: '', email: '', phone: '' });
                fetchData();
            } else {
                alert(data.message || 'Failed to create partner');
            }
        } catch (error) {
            console.error(error);
            alert('Error creating partner');
        } finally {
            setIsCreating(false);
        }
    };

    const handleSaveSettings = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSavingSettings(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_ADMIN_BACKEND_URL}/api/settings/rewards`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings),
                credentials: 'include'
            });
            const data = await res.json();
            if (data.success) {
                alert('Settings saved successfully');
                setIsSettingsOpen(false);
            } else {
                alert('Failed to save settings');
            }
        } catch (error) {
            console.error(error);
            alert('Error saving settings');
        } finally {
            setIsSavingSettings(false);
        }
    };

    const togglePartnerActive = async (partnerId: string) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_ADMIN_BACKEND_URL}/api/partners/${partnerId}/toggle-active`, {
                method: 'PATCH',
                credentials: 'include',
            });

            if (!response.ok) throw new Error('Failed to toggle status');

            alert('Partner status updated!');
            fetchData();
        } catch (error) {
            console.error('Error toggling partner:', error);
            alert('Failed to update partner status');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    // Calculate summary stats
    const totalPartners = partners.length;
    const activePartners = partners.filter(p => p.isActive).length;
    const totalPendingEarnings = partners.reduce((sum, p) => sum + p.pendingEarnings, 0);
    const thisMonthSignups = partners.reduce((sum, p) => sum + p.thisMonthSignups, 0);
    const suspiciousPartners = partners.filter(p => p.isSuspicious);

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Partner Analytics</h1>
                    <p className="text-muted-foreground">Monitor partner performance and activity in real-time</p>
                </div>
                <div className="flex gap-2">
                    <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline">
                                <Settings className="h-4 w-4 mr-2" />
                                Settings
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Reward Configuration</DialogTitle>
                                <DialogDescription>
                                    Adjust the reward amounts for partner referrals.
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleSaveSettings} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Signup Reward (₦)</Label>
                                        <Input
                                            type="number"
                                            value={settings.signupRewardAmount}
                                            onChange={(e) => setSettings({ ...settings, signupRewardAmount: parseFloat(e.target.value) })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Listing Reward (₦)</Label>
                                        <Input
                                            type="number"
                                            value={settings.listingRewardAmount}
                                            onChange={(e) => setSettings({ ...settings, listingRewardAmount: parseFloat(e.target.value) })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Click Reward (₦)</Label>
                                        <Input
                                            type="number"
                                            value={settings.clickRewardAmount}
                                            onChange={(e) => setSettings({ ...settings, clickRewardAmount: parseFloat(e.target.value) })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Min Payout (₦)</Label>
                                        <Input
                                            type="number"
                                            value={settings.minimumPayoutAmount}
                                            onChange={(e) => setSettings({ ...settings, minimumPayoutAmount: parseFloat(e.target.value) })}
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button type="submit" disabled={isSavingSettings}>
                                        {isSavingSettings ? 'Saving...' : 'Save Changes'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>

                    <Dialog open={isAddPartnerOpen} onOpenChange={setIsAddPartnerOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Partner
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add New Partner</DialogTitle>
                                <DialogDescription>
                                    Create a new partner account manually. Doing this will send an invite email with credentials.
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleCreatePartner} className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Full Name</Label>
                                    <Input
                                        placeholder="John Doe"
                                        value={newPartner.name}
                                        onChange={(e) => setNewPartner({ ...newPartner, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Email Address</Label>
                                    <Input
                                        type="email"
                                        placeholder="john@example.com"
                                        value={newPartner.email}
                                        onChange={(e) => setNewPartner({ ...newPartner, email: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Phone Number (Optional)</Label>
                                    <Input
                                        placeholder="+234..."
                                        value={newPartner.phone}
                                        onChange={(e) => setNewPartner({ ...newPartner, phone: e.target.value })}
                                    />
                                </div>
                                <DialogFooter>
                                    <Button type="submit" disabled={isCreating}>
                                        {isCreating ? 'Creating...' : 'Create Partner'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
            <div className="space-y-6">

                {/* Summary Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Partners</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalPartners}</div>
                            <p className="text-xs text-muted-foreground">{activePartners} active</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">This Month Signups</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{thisMonthSignups}</div>
                            <p className="text-xs text-muted-foreground">New vendors referred</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending Payouts</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">₦{totalPendingEarnings.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">To be paid this month</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Suspicious Activity</CardTitle>
                            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-orange-600">{suspiciousPartners.length}</div>
                            <p className="text-xs text-muted-foreground">Requires review</p>
                        </CardContent>
                    </Card>
                </div>

                {/* View Tabs */}
                <div className="flex gap-2 border-b">
                    <button
                        className={`px-4 py-2 font-medium transition-colors ${view === 'overview'
                            ? 'border-b-2 border-primary text-primary'
                            : 'text-muted-foreground hover:text-foreground'
                            }`}
                        onClick={() => setView('overview')}
                    >
                        Partners Overview
                    </button>
                    <button
                        className={`px-4 py-2 font-medium transition-colors ${view === 'activity'
                            ? 'border-b-2 border-primary text-primary'
                            : 'text-muted-foreground hover:text-foreground'
                            }`}
                        onClick={() => setView('activity')}
                    >
                        Activity Feed
                    </button>
                    <button
                        className={`px-4 py-2 font-medium transition-colors ${view === 'leaderboard'
                            ? 'border-b-2 border-primary text-primary'
                            : 'text-muted-foreground hover:text-foreground'
                            }`}
                        onClick={() => setView('leaderboard')}
                    >
                        Leaderboard
                    </button>
                </div>

                {/* Partners Overview */}
                {view === 'overview' && (
                    <Card>
                        <CardHeader>
                            <CardTitle>All Partners</CardTitle>
                            <CardDescription>Click on a partner to view detailed stats</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {partners.length === 0 ? (
                                    <p className="text-sm text-muted-foreground text-center py-8">
                                        No partners yet
                                    </p>
                                ) : (
                                    partners.map((partner) => (
                                        <div
                                            key={partner.userId}
                                            className="border rounded-lg p-4 space-y-3 hover:bg-muted/50 transition-colors cursor-pointer"
                                            onClick={() => setSelectedPartner(partner)}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-semibold">{partner.name}</p>
                                                        {partner.isSuspicious && (
                                                            <Badge variant="destructive" className="text-xs">
                                                                <AlertTriangle className="h-3 w-3 mr-1" />
                                                                Suspicious
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">{partner.email}</p>
                                                    <p className="text-xs text-muted-foreground font-mono">Code: {partner.referralCode}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xl font-bold text-green-600">
                                                        ₦{partner.pendingEarnings.toLocaleString()}
                                                    </p>
                                                    <Badge variant={partner.isActive ? "default" : "secondary"} className="mt-1">
                                                        {partner.isActive ? 'Active' : 'Inactive'}
                                                    </Badge>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-4 gap-2 text-sm border-t pt-3">
                                                <div>
                                                    <p className="text-muted-foreground">This Month</p>
                                                    <p className="font-semibold">{partner.thisMonthSignups} signups</p>
                                                </div>
                                                <div>
                                                    <p className="text-muted-foreground">Activated</p>
                                                    <p className="font-semibold">{partner.thisMonthActivated}</p>
                                                </div>
                                                <div>
                                                    <p className="text-muted-foreground">Clicks</p>
                                                    <p className="font-semibold">{partner.thisMonthClicks}</p>
                                                </div>
                                                <div>
                                                    <p className="text-muted-foreground">Conversion</p>
                                                    <p className="font-semibold">{partner.conversionRate}%</p>
                                                </div>
                                            </div>

                                            <div className="flex gap-2 border-t pt-3">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        togglePartnerActive(partner.userId);
                                                    }}
                                                >
                                                    {partner.isActive ? 'Deactivate' : 'Activate'}
                                                </Button>
                                                {partner.fraudCount > 0 && (
                                                    <Badge variant="outline" className="text-orange-600">
                                                        {partner.fraudCount} fraud alerts
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Activity Feed */}
                {view === 'activity' && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Activity</CardTitle>
                            <CardDescription>Live stream of clicks, signups, and listings</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {activities.length === 0 ? (
                                    <p className="text-sm text-muted-foreground text-center py-8">
                                        No activity yet
                                    </p>
                                ) : (
                                    activities.map((activity, index) => (
                                        <div key={index} className="flex items-center gap-3 border-b pb-3 last:border-0">
                                            {activity.type === 'click' ? (
                                                <Activity className={`h-5 w-5 ${activity.qualified ? 'text-green-500' : 'text-gray-400'}`} />
                                            ) : (
                                                <Users className="h-5 w-5 text-blue-500" />
                                            )}

                                            <div className="flex-1">
                                                {activity.type === 'signup' ? (
                                                    <>
                                                        <p className="text-sm font-medium">
                                                            New signup: {activity.vendorName}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            Referred by {activity.partnerName} ({activity.partnerCode})
                                                        </p>
                                                        <div className="flex gap-1 mt-1">
                                                            <Badge variant={activity.signupStatus === 'QUALIFIED' ? 'default' : 'secondary'} className="text-xs">
                                                                Signup: {activity.signupStatus}
                                                            </Badge>
                                                            <Badge variant={activity.listingStatus === 'QUALIFIED' ? 'default' : 'secondary'} className="text-xs">
                                                                Listing: {activity.listingStatus}
                                                            </Badge>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <>
                                                        <p className="text-sm font-medium">
                                                            Click {activity.qualified ? '✓ Qualified' : '⏳ Pending'}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {activity.partnerName} ({activity.partnerCode}) • {activity.ipAddress}
                                                        </p>
                                                    </>
                                                )}
                                            </div>

                                            <p className="text-xs text-muted-foreground">
                                                {new Date(activity.timestamp).toLocaleString()}
                                            </p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Partner Detail Modal (Simple version - could be a proper modal) */}
                {selectedPartner && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedPartner(null)}>
                        <Card className="max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                            <CardHeader>
                                <CardTitle>{selectedPartner.name}</CardTitle>
                                <CardDescription>{selectedPartner.email} • {selectedPartner.referralCode}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Lifetime Referrals</p>
                                        <p className="text-2xl font-bold">{selectedPartner.lifetimeReferrals}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Lifetime Activated</p>
                                        <p className="text-2xl font-bold">{selectedPartner.lifetimeActivated}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Lifetime Earnings</p>
                                        <p className="text-2xl font-bold">₦{selectedPartner.lifetimeEarnings.toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Pending Earnings</p>
                                        <p className="text-2xl font-bold text-green-600">₦{selectedPartner.pendingEarnings.toLocaleString()}</p>
                                    </div>
                                </div>

                                <div className="border-t pt-4">
                                    <h3 className="font-semibold mb-2">This Month Performance</h3>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Signups</p>
                                            <p className="text-xl font-bold">{selectedPartner.thisMonthSignups}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Activated</p>
                                            <p className="text-xl font-bold">{selectedPartner.thisMonthActivated}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Clicks</p>
                                            <p className="text-xl font-bold">{selectedPartner.thisMonthClicks}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-2 pt-4">
                                    <Button onClick={() => setSelectedPartner(null)}>Close</Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            togglePartnerActive(selectedPartner.userId);
                                            setSelectedPartner(null);
                                        }}
                                    >
                                        {selectedPartner.isActive ? 'Deactivate' : 'Activate'} Partner
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
}
