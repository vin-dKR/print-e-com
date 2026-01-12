/**
 * Coupon Statistics Component
 * Displays key metrics about coupons
 */

'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/app/components/ui/card';
import { getCouponStats, type CouponStats } from '@/lib/api/coupons.service';
import { TrendingUp, Users, Calendar, DollarSign } from 'lucide-react';
import { PageLoading } from '@/app/components/ui/loading';
import { Alert } from '@/app/components/ui/alert';

export function CouponStats() {
    const [stats, setStats] = useState<CouponStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getCouponStats();
            setStats(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load stats');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <PageLoading />;
    }

    if (error) {
        return (
            <Alert variant="error">
                {error}
                <button onClick={loadStats} className="ml-4 underline">
                    Retry
                </button>
            </Alert>
        );
    }

    if (!stats) {
        return null;
    }

    const statCards = [
        {
            title: 'Active Coupons',
            value: stats.totalActive,
            icon: TrendingUp,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
        },
        {
            title: 'Total Usage',
            value: stats.totalUsage.toLocaleString(),
            icon: Users,
            color: 'text-green-600',
            bgColor: 'bg-green-50',
        },
        {
            title: 'Total Discount Given',
            value: `₹${stats.totalDiscount.toLocaleString()}`,
            icon: DollarSign,
            color: 'text-purple-600',
            bgColor: 'bg-purple-50',
        },
        {
            title: 'Expiring Soon',
            value: stats.expiringSoon,
            icon: Calendar,
            color: 'text-orange-600',
            bgColor: 'bg-orange-50',
        },
    ];

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {statCards.map((stat, index) => {
                const Icon = stat.icon;
                return (
                    <Card key={index}>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                                    <p className="mt-2 text-2xl font-bold text-gray-900">{stat.value}</p>
                                </div>
                                <div className={`rounded-full p-3 ${stat.bgColor}`}>
                                    <Icon className={`h-6 w-6 ${stat.color}`} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}

