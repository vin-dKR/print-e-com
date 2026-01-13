'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Alert } from '@/app/components/ui/alert';
import {
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

interface CouponDetailClientProps {
    couponId: string;
    initialCoupon?: Coupon;
    initialAnalytics?: CouponAnalytics;
    initialUsages?: CouponUsage[];
    initialUsagePagination?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export function CouponDetailClient({
    couponId,
    initialCoupon,
    initialAnalytics,
    initialUsages = [],
    initialUsagePagination = { page: 1, limit: 20, total: 0, totalPages: 0 },
}: CouponDetailClientProps) {
    const router = useRouter();
    const [coupon] = useState<Coupon | null>(initialCoupon || null);
    const [analytics] = useState<CouponAnalytics | null>(initialAnalytics || null);
    const [usages, setUsages] = useState<CouponUsage[]>(initialUsages);
    const [usagePage, setUsagePage] = useState(initialUsagePagination.page);
    const [usageTotalPages, setUsageTotalPages] = useState(initialUsagePagination.totalPages);
    const [loadingUsages, setLoadingUsages] = useState(false);

    useEffect(() => {
        if (usagePage > 1 || !initialUsages.length) {
            loadUsages();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [usagePage]);

    const loadUsages = async () => {
        try {
            setLoadingUsages(true);
            const usagesData = await getCouponUsages(couponId, usagePage, 20);
            setUsages(usagesData.data || []);
            setUsageTotalPages(usagesData.pagination?.totalPages || 0);
        } catch (err) {
            console.error('Failed to load usages:', err);
        } finally {
            setLoadingUsages(false);
        }
    };

    if (!coupon) {
        return (
            <div className="space-y-4">
                <Alert variant="error">Coupon not found</Alert>
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
                    {loadingUsages ? (
                        <p className="text-center text-gray-600 py-8">Loading...</p>
                    ) : usages.length === 0 ? (
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

