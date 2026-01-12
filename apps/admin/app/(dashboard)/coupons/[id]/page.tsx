/**
 * Coupon Detail Page
 * Shows coupon details, analytics, and usage history
 */

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { PageLoading } from '@/app/components/ui/loading';
import { Alert } from '@/app/components/ui/alert';
import {
    getCoupon,
    getCouponAnalytics,
    getCouponUsages,
    type Coupon,
    type CouponAnalytics,
    type CouponUsage,
} from '@/lib/api/coupons.service';
import { formatDate, formatCurrency } from '@/lib/utils/format';
import { formatDiscount } from '@/lib/utils/coupon-utils';
import { Edit, ArrowLeft, Users, TrendingUp, DollarSign } from 'lucide-react';
import Link from 'next/link';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/app/components/ui/table';

export default function CouponDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [coupon, setCoupon] = useState<Coupon | null>(null);
    const [analytics, setAnalytics] = useState<CouponAnalytics | null>(null);
    const [usages, setUsages] = useState<CouponUsage[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [usagePage, setUsagePage] = useState(1);
    const [usageTotalPages, setUsageTotalPages] = useState(1);

    useEffect(() => {
        if (params.id) {
            loadData();
        }
    }, [params.id, usagePage]);

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);
            const [couponData, analyticsData, usagesData] = await Promise.all([
                getCoupon(params.id as string),
                getCouponAnalytics(params.id as string),
                getCouponUsages(params.id as string, usagePage, 20).catch((err) => {
                    console.error('Failed to load usages:', err);
                    // Return empty data structure if usages fail to load
                    return {
                        data: [],
                        pagination: {
                            page: 1,
                            limit: 20,
                            total: 0,
                            totalPages: 0,
                        },
                    };
                }),
            ]);
            setCoupon(couponData);
            setAnalytics(analyticsData);
            setUsages(usagesData?.data || []);
            setUsageTotalPages(usagesData?.pagination?.totalPages || 0);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load coupon data');
            // Ensure usages is always an array even on error
            setUsages([]);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <PageLoading />;
    }

    if (error || !coupon) {
        return (
            <div className="space-y-4">
                <Alert variant="error">
                    {error || 'Coupon not found'}
                    <Button onClick={loadData} variant="outline" className="ml-4">
                        Retry
                    </Button>
                </Alert>
            </div>
        );
    }

    const isValid = new Date(coupon.validUntil) > new Date();
    const isActive = coupon.isActive && isValid;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{coupon.name}</h1>
                        <p className="mt-1 text-sm text-gray-600">Coupon Code: {coupon.code}</p>
                    </div>
                </div>
                <Link href={`/coupons/${coupon.id}/edit`}>
                    <Button>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Coupon
                    </Button>
                </Link>
            </div>

            {/* Coupon Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Coupon Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <p className="text-sm text-gray-600">Code</p>
                            <p className="font-mono font-bold text-lg">{coupon.code}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Discount</p>
                            <p className="text-2xl font-bold text-blue-600">
                                {formatDiscount(coupon.discountType, Number(coupon.discountValue))}
                            </p>
                        </div>
                        {coupon.description && (
                            <div>
                                <p className="text-sm text-gray-600">Description</p>
                                <p>{coupon.description}</p>
                            </div>
                        )}
                        <div>
                            <p className="text-sm text-gray-600">Status</p>
                            <Badge variant={isActive ? 'success' : 'secondary'}>
                                {isActive ? 'Active' : 'Inactive'}
                            </Badge>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Valid From</p>
                            <p>{formatDate(coupon.validFrom)}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Valid Until</p>
                            <p>{formatDate(coupon.validUntil)}</p>
                        </div>
                        {coupon.minPurchaseAmount && (
                            <div>
                                <p className="text-sm text-gray-600">Minimum Purchase</p>
                                <p>{formatCurrency(Number(coupon.minPurchaseAmount))}</p>
                            </div>
                        )}
                        {coupon.maxDiscountAmount && (
                            <div>
                                <p className="text-sm text-gray-600">Maximum Discount</p>
                                <p>{formatCurrency(Number(coupon.maxDiscountAmount))}</p>
                            </div>
                        )}
                        <div>
                            <p className="text-sm text-gray-600">Usage Limit</p>
                            <p>
                                {coupon.usageLimit
                                    ? `${(coupon as any)._count?.usages || 0} / ${coupon.usageLimit}`
                                    : 'Unlimited'}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Usage Limit Per User</p>
                            <p>{coupon.usageLimitPerUser}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Applicable To</p>
                            <p>{coupon.applicableTo}</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Analytics */}
                {analytics && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Analytics</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-blue-50 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <TrendingUp className="h-5 w-5 text-blue-600" />
                                        <p className="text-sm text-gray-600">Total Uses</p>
                                    </div>
                                    <p className="text-2xl font-bold text-gray-900">{analytics.totalUses}</p>
                                </div>
                                <div className="p-4 bg-green-50 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Users className="h-5 w-5 text-green-600" />
                                        <p className="text-sm text-gray-600">Unique Users</p>
                                    </div>
                                    <p className="text-2xl font-bold text-gray-900">{analytics.uniqueUsers}</p>
                                </div>
                                <div className="p-4 bg-purple-50 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <DollarSign className="h-5 w-5 text-purple-600" />
                                        <p className="text-sm text-gray-600">Total Discount</p>
                                    </div>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {formatCurrency(analytics.totalDiscount)}
                                    </p>
                                </div>
                                <div className="p-4 bg-orange-50 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <DollarSign className="h-5 w-5 text-orange-600" />
                                        <p className="text-sm text-gray-600">Average Discount</p>
                                    </div>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {formatCurrency(analytics.averageDiscount)}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Usage History */}
            <Card>
                <CardHeader>
                    <CardTitle>Usage History</CardTitle>
                </CardHeader>
                <CardContent>
                    {usages.length === 0 ? (
                        <p className="text-center text-gray-600 py-8">No usage history yet</p>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>User</TableHead>
                                            <TableHead>Email</TableHead>
                                            <TableHead>Order ID</TableHead>
                                            <TableHead>Discount Amount</TableHead>
                                            <TableHead>Used At</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {usages.map((usage) => (
                                            <TableRow key={usage.id}>
                                                <TableCell>{usage.user.name || 'N/A'}</TableCell>
                                                <TableCell>{usage.user.email}</TableCell>
                                                <TableCell className="font-mono text-sm">
                                                    {usage.orderId || 'N/A'}
                                                </TableCell>
                                                <TableCell>{formatCurrency(usage.discountAmount)}</TableCell>
                                                <TableCell>{formatDate(usage.usedAt)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                            {usageTotalPages > 1 && (
                                <div className="flex items-center justify-between mt-4">
                                    <p className="text-sm text-gray-600">
                                        Page {usagePage} of {usageTotalPages}
                                    </p>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setUsagePage((p) => Math.max(1, p - 1))}
                                            disabled={usagePage === 1}
                                        >
                                            Previous
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                setUsagePage((p) => Math.min(usageTotalPages, p + 1))
                                            }
                                            disabled={usagePage === usageTotalPages}
                                        >
                                            Next
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

