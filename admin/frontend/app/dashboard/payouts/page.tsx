'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Lock, CheckCircle, DollarSign } from 'lucide-react';

interface PayoutPeriod {
    id: string;
    month: number;
    year: number;
    status: string;
    totalPayoutAmount: number;
    totalPartnersPaid: number;
    startDate: string;
    endDate: string;
}

interface Statement {
    id: string;
    userId: string;
    totalEarned: number;
    status: string;
    vendorsActivatedCount: number;
    vendorsReferredCount: number;
    clicksCount: number;
    user: {
        name: string;
        email: string;
        phone: string;
    };
}

export default function AdminPayoutsPage() {
    const [periods, setPeriods] = useState<PayoutPeriod[]>([]);
    const [selectedPeriod, setSelectedPeriod] = useState<PayoutPeriod | null>(null);
    const [statements, setStatements] = useState<Statement[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const router = useRouter();

    const getAuthHeaders = () => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
        return {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        };
    };

    useEffect(() => {
        fetchPeriods();
    }, []);

    const fetchPeriods = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_ADMIN_BACKEND_URL}/api/payouts/periods`, {
                headers: getAuthHeaders(),
            });

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    router.push('/login');
                    return;
                }
                throw new Error('Failed to fetch periods');
            }

            const data = await response.json();
            setPeriods(data.data);
        } catch (error) {
            console.error('Error fetching periods:', error);
            alert('Failed to load payout periods');
        } finally {
            setLoading(false);
        }
    };

    const fetchStatements = async (periodId: string) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_ADMIN_BACKEND_URL}/api/payouts/statements/${periodId}`, {
                headers: getAuthHeaders(),
            });

            if (!response.ok) throw new Error('Failed to fetch statements');

            const data = await response.json();
            setStatements(data.data);
        } catch (error) {
            console.error('Error fetching statements:', error);
            alert('Failed to load statements');
        }
    };

    const lockMonth = async () => {
        if (!confirm('Lock the current month and generate statements? This cannot be undone.')) {
            return;
        }

        setActionLoading(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_ADMIN_BACKEND_URL}/api/payouts/lock-month`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({}),
            });

            if (!response.ok) throw new Error('Failed to lock month');

            alert('Month locked and statements generated!');
            fetchPeriods();
        } catch (error) {
            console.error('Error locking month:', error);
            alert('Failed to lock month');
        } finally {
            setActionLoading(false);
        }
    };

    const approveStatement = async (statementId: string) => {
        setActionLoading(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_ADMIN_BACKEND_URL}/api/payouts/statements/${statementId}/approve`, {
                method: 'PATCH',
                headers: getAuthHeaders(),
            });

            if (!response.ok) throw new Error('Failed to approve');

            alert('Statement approved!');
            if (selectedPeriod) fetchStatements(selectedPeriod.id);
        } catch (error) {
            console.error('Error approving statement:', error);
            alert('Failed to approve statement');
        } finally {
            setActionLoading(false);
        }
    };

    const markPaid = async (statementId: string) => {
        const reference = prompt('Enter payment reference:');
        if (!reference) return;

        setActionLoading(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_ADMIN_BACKEND_URL}/api/payouts/statements/${statementId}/mark-paid`, {
                method: 'PATCH',
                headers: getAuthHeaders(),
                body: JSON.stringify({ paymentReference: reference }),
            });

            if (!response.ok) throw new Error('Failed to mark paid');

            alert('Statement marked as paid!');
            if (selectedPeriod) fetchStatements(selectedPeriod.id);
        } catch (error) {
            console.error('Error marking paid:', error);
            alert('Failed to mark as paid');
        } finally {
            setActionLoading(false);
        }
    };

    const selectPeriod = (period: PayoutPeriod) => {
        setSelectedPeriod(period);
        fetchStatements(period.id);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Affiliate Payouts</h1>
                    <p className="text-muted-foreground">Manage monthly payout periods and partner statements</p>
                </div>
                <Button onClick={lockMonth} disabled={actionLoading}>
                    {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Lock className="h-4 w-4 mr-2" />}
                    Lock Current Month
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card className="md:col-span-1">
                    <CardHeader>
                        <CardTitle>Payout Periods</CardTitle>
                        <CardDescription>Select a period to view statements</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {periods.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">
                                No periods yet. Lock a month to get started.
                            </p>
                        ) : (
                            periods.map((period) => (
                                <button
                                    key={period.id}
                                    onClick={() => selectPeriod(period)}
                                    className={`w-full text-left p-3 rounded-lg border transition-colors ${selectedPeriod?.id === period.id
                                        ? 'bg-primary text-primary-foreground border-primary'
                                        : 'hover:bg-muted'
                                        }`}
                                >
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="font-medium">
                                                {new Date(period.year, period.month - 1).toLocaleDateString('en-US', {
                                                    month: 'long',
                                                    year: 'numeric',
                                                })}
                                            </p>
                                            <p className="text-xs opacity-75">{period.status}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-semibold">₦{period.totalPayoutAmount.toLocaleString()}</p>
                                            <p className="text-xs opacity-75">{period.totalPartnersPaid} paid</p>
                                        </div>
                                    </div>
                                </button>
                            ))
                        )}
                    </CardContent>
                </Card>

                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Partner Statements</CardTitle>
                        <CardDescription>
                            {selectedPeriod
                                ? `${new Date(selectedPeriod.year, selectedPeriod.month - 1).toLocaleDateString('en-US', {
                                    month: 'long',
                                    year: 'numeric',
                                })}`
                                : 'Select a period to view'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {!selectedPeriod ? (
                            <p className="text-sm text-muted-foreground text-center py-8">
                                Select a payout period from the left
                            </p>
                        ) : statements.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-8">
                                No statements for this period
                            </p>
                        ) : (
                            <div className="space-y-4">
                                {statements.map((statement) => (
                                    <div key={statement.id} className="border rounded-lg p-4 space-y-3">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-semibold">{statement.user.name}</p>
                                                <p className="text-sm text-muted-foreground">{statement.user.email}</p>
                                                <p className="text-sm text-muted-foreground">{statement.user.phone}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-2xl font-bold text-green-600">
                                                    ₦{statement.totalEarned.toLocaleString()}
                                                </p>
                                                <span
                                                    className={`inline-block px-2 py-1 text-xs rounded mt-1 ${statement.status === 'PAID'
                                                        ? 'bg-green-100 text-green-700'
                                                        : statement.status === 'APPROVED'
                                                            ? 'bg-blue-100 text-blue-700'
                                                            : 'bg-yellow-100 text-yellow-700'
                                                        }`}
                                                >
                                                    {statement.status}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-3 gap-2 text-sm">
                                            <div>
                                                <p className="text-muted-foreground">Referred</p>
                                                <p className="font-semibold">{statement.vendorsReferredCount}</p>
                                            </div>
                                            <div>
                                                <p className="text-muted-foreground">Activated</p>
                                                <p className="font-semibold">{statement.vendorsActivatedCount}</p>
                                            </div>
                                            <div>
                                                <p className="text-muted-foreground">Clicks</p>
                                                <p className="font-semibold">{statement.clicksCount}</p>
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            {statement.status === 'DRAFT' && (
                                                <Button
                                                    size="sm"
                                                    onClick={() => approveStatement(statement.id)}
                                                    disabled={actionLoading}
                                                >
                                                    <CheckCircle className="h-4 w-4 mr-1" />
                                                    Approve
                                                </Button>
                                            )}
                                            {statement.status === 'APPROVED' && (
                                                <Button
                                                    size="sm"
                                                    onClick={() => markPaid(statement.id)}
                                                    disabled={actionLoading}
                                                >
                                                    <DollarSign className="h-4 w-4 mr-1" />
                                                    Mark Paid
                                                </Button>
                                            )}
                                            {statement.status === 'PAID' && (
                                                <span className="text-sm text-green-600 flex items-center">
                                                    <CheckCircle className="h-4 w-4 mr-1" />
                                                    Payment Complete
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
