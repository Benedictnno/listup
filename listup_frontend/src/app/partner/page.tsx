'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Copy, Check, Download, TrendingUp, Users, DollarSign, Calendar } from 'lucide-react';
import { toast } from 'sonner';

interface PartnerStats {
    referralCode: string;
    pendingEarnings: number;
    totalPaid: number;
    activatedThisMonth: number;
    recentActivity: Array<
        | {
            type: 'signup';
            vendorName: string;
            signupStatus: string;
            listingStatus: string;
            date: string;
        }
        | {
            type: 'click';
            qualified: boolean;
            status: string;
            date: string;
        }
    >;
    rewardRates?: {
        signup: number;
        listing: number;
        click: number;
    };
    leaderboard?: Array<{
        rank: number;
        name: string;
        successfulReferrals: number;
    }>;
}

export default function PartnerDashboardPage() {
    const [stats, setStats] = useState<PartnerStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);
    const router = useRouter();

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const [statsResponse, leaderboardResponse] = await Promise.all([
                fetch('/api/referrals/partner/dashboard', { credentials: 'include' }),
                fetch('/api/referrals/leaderboard')
            ]);

            if (!statsResponse.ok) {
                if (statsResponse.status === 401) {
                    router.push('/login');
                    return;
                }
                throw new Error('Failed to fetch stats');
            }

            const statsData = await statsResponse.json();
            const leaderboardData = leaderboardResponse.ok ? await leaderboardResponse.json() : { data: [] };

            setStats({ ...statsData.data, leaderboard: leaderboardData.data });
        } catch (error) {
            console.error('Error fetching partner stats:', error);
            toast.error('Failed to load dashboard');
        } finally {
            setLoading(false);
        }
    };

    const copyReferralLink = () => {
        if (!stats?.referralCode) return;

        const link = `${window.location.origin}/r/${stats.referralCode}`;
        navigator.clipboard.writeText(link);
        setCopied(true);
        toast.success('Referral link copied!');

        setTimeout(() => setCopied(false), 2000);
    };

    const downloadQR = () => {
        if (!stats?.referralCode) return;

        const link = `${window.location.origin}/r/${stats.referralCode}`;
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(link)}`;

        const a = document.createElement('a');
        a.href = qrUrl;
        a.download = `referral-qr-${stats.referralCode}.png`;
        a.click();

        toast.success('QR code downloaded!');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const activateAccount = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/referrals/my-code', { credentials: 'include' });
            if (!res.ok) throw new Error('Failed to activate account');

            toast.success('Account activated!');
            fetchStats(); // Reload stats
        } catch (error) {
            console.error('Activation error:', error);
            toast.error('Failed to activate account');
            setLoading(false);
        }
    };

    if (!stats || !stats.referralCode) {
        return (
            <div className="container mx-auto p-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Partner Dashboard</CardTitle>
                        <CardDescription>You don't have a referral code yet.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="mb-4 text-sm text-muted-foreground">
                            Join the ListUp Partner Program to start earning rewards for every vendor you refer.
                        </p>
                        <Button onClick={activateAccount} disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Activate Partner Account
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Partner Dashboard</h1>
                <p className="text-muted-foreground">
                    Track your referrals and earnings
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Earnings</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₦{stats.pendingEarnings.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">
                            Awaiting payout approval
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₦{stats.totalPaid.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">
                            All-time earnings
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active This Month</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.activatedThisMonth}</div>
                        <p className="text-xs text-muted-foreground">
                            Fully activated vendors
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Next Payout</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">1st</div>
                        <p className="text-xs text-muted-foreground">
                            Of next month
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Referral Tools */}
            <Card>
                <CardHeader>
                    <CardTitle>Your Referral Link</CardTitle>
                    <CardDescription>
                        Share this link to earn ₦50 per activated vendor + ₦15 per qualified click
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            readOnly
                            value={`${typeof window !== 'undefined' ? window.location.origin : ''}/r/${stats.referralCode}`}
                            className="flex-1 px-3 py-2 border rounded-md bg-muted"
                        />
                        <Button onClick={copyReferralLink} variant="outline">
                            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                    </div>

                    <div className="flex gap-2">
                        <div className="flex-1 px-3 py-2 border rounded-md bg-muted font-mono">
                            {stats.referralCode}
                        </div>
                        <Button onClick={downloadQR} variant="outline">
                            <Download className="h-4 w-4 mr-2" />
                            QR Code
                        </Button>
                    </div>

                    <div className="text-sm text-muted-foreground">
                        <p>💡 <strong>Tip:</strong> Print the QR code and display it on campus!</p>
                    </div>
                </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Latest vendors you've referred</CardDescription>
                </CardHeader>
                <CardContent>
                    {stats.recentActivity.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-8">
                            No referrals yet. Start sharing your link!
                        </p>
                    ) : (
                        <div className="space-y-4">
                            {stats.recentActivity.map((activity, index) => (
                                <div key={index} className="flex items-center justify-between border-b pb-3 last:border-0">
                                    <div>
                                        <p className="font-medium">
                                            {activity.type === 'click' ? 'Link Click' : activity.vendorName}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {new Date(activity.date).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        {activity.type === 'signup' ? (
                                            <>
                                                <span className={`px-2 py-1 text-xs rounded ${activity.signupStatus === 'QUALIFIED'
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-yellow-100 text-yellow-700'
                                                    }`}>
                                                    Signup: {activity.signupStatus}
                                                </span>
                                                <span className={`px-2 py-1 text-xs rounded ${activity.listingStatus === 'QUALIFIED'
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-gray-100 text-gray-700'
                                                    }`}>
                                                    Listing: {activity.listingStatus}
                                                </span>
                                            </>
                                        ) : (
                                            <span className={`px-2 py-1 text-xs rounded ${activity.qualified
                                                ? 'bg-green-100 text-green-700'
                                                : activity.status === 'STARTED'
                                                    ? 'bg-blue-100 text-blue-700'
                                                    : 'bg-gray-100 text-gray-700'
                                                }`}>
                                                {activity.qualified ? 'Qualified (10s+)' : activity.status === 'STARTED' ? 'Pending' : activity.status}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Earnings Breakdown */}
            <Card>
                <CardHeader>
                    <CardTitle>How You Earn</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-sm">Vendor Signup</span>
                            <span className="font-semibold">₦{stats.rewardRates?.signup ?? 25}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm">First Product Listed</span>
                            <span className="font-semibold">₦{stats.rewardRates?.listing ?? 25}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm">Qualified Click (10s+ engagement)</span>
                            <span className="font-semibold">₦{stats.rewardRates?.click ?? 15}</span>
                        </div>
                        <div className="border-t pt-3 mt-3 flex justify-between items-center">
                            <span className="font-semibold">Total per Activated Vendor</span>
                            <span className="text-lg font-bold text-green-600">
                                ₦{(stats.rewardRates?.signup ?? 25) + (stats.rewardRates?.listing ?? 25)}+
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Leaderboard Section */}
            <Card className="md:col-span-2">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-yellow-500" />
                        Top Partners
                    </CardTitle>
                    <CardDescription>
                        See who's leading the pack!
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {stats?.leaderboard?.map((partner) => (
                            <div key={partner.rank} className="flex items-center justify-between border-b pb-2 last:border-0">
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${partner.rank === 1 ? 'bg-yellow-100 text-yellow-600' :
                                        partner.rank === 2 ? 'bg-gray-100 text-gray-600' :
                                            partner.rank === 3 ? 'bg-orange-100 text-orange-600' :
                                                'bg-slate-50 text-slate-500'
                                        }`}>
                                        {partner.rank}
                                    </div>
                                    <span className="font-medium">{partner.name}</span>
                                </div>
                                <span className="text-sm text-gray-600 font-semibold">{partner.successfulReferrals} Vendors</span>
                            </div>
                        ))}
                        {(!stats?.leaderboard || stats.leaderboard.length === 0) && (
                            <p className="text-center text-muted-foreground py-4">No data yet</p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
