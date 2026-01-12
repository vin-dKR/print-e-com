/**
 * Coupons List Component
 * Displays table of coupons with actions
 */

'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/app/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/app/components/ui/table';
import { Badge } from '@/app/components/ui/badge';
import { PageLoading } from '@/app/components/ui/loading';
import { Alert } from '@/app/components/ui/alert';
import { Button } from '@/app/components/ui/button';
import { getCoupons, deleteCoupon, type Coupon } from '@/lib/api/coupons.service';
import { formatDate } from '@/lib/utils/format';
import { Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useConfirm } from '@/lib/hooks/use-confirm';
import { toastPromise } from '@/lib/utils/toast';

export function CouponsList() {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const { confirm, ConfirmDialog } = useConfirm();

    useEffect(() => {
        loadCoupons();
    }, []);

    const loadCoupons = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await getCoupons();
            setCoupons(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load coupons');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        const confirmed = await confirm({
            title: 'Delete Coupon',
            description: 'Are you sure you want to delete this coupon? This action cannot be undone.',
            confirmText: 'Delete',
            cancelText: 'Cancel',
            variant: 'destructive',
            onConfirm: async () => {
                try {
                    setDeletingId(id);
                    await toastPromise(
                        deleteCoupon(id),
                        {
                            loading: 'Deleting coupon...',
                            success: 'Coupon deleted successfully',
                            error: 'Failed to delete coupon',
                        }
                    );
                    setCoupons(coupons.filter((c) => c.id !== id));
                } catch (err) {
                    // Error handled by toastPromise
                } finally {
                    setDeletingId(null);
                }
            },
        });
    };

    if (isLoading) {
        return (
            <>
                {ConfirmDialog}
                <PageLoading />
            </>
        );
    }

    if (error) {
        return (
            <>
                {ConfirmDialog}
                <Alert variant="error">
                    {error}
                    <Button onClick={loadCoupons} variant="outline" className="ml-4">
                        Retry
                    </Button>
                </Alert>
            </>
        );
    }

    if (coupons.length === 0) {
        return (
            <>
                {ConfirmDialog}
                <Card>
                    <CardContent className="py-12 text-center">
                        <p className="text-gray-600">No coupons found.</p>
                        <Link href="/coupons/new">
                            <Button className="mt-4">Create your first coupon</Button>
                        </Link>
                    </CardContent>
                </Card>
            </>
        );
    }

    return (
        <>
            {ConfirmDialog}
            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Code</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Discount</TableHead>
                                <TableHead>Valid Until</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {coupons.map((coupon) => {
                                const discountText =
                                    coupon.discountType === 'PERCENTAGE'
                                        ? `${coupon.discountValue}%`
                                        : `₹${coupon.discountValue}`;

                                const isValid = new Date(coupon.validUntil) > new Date();

                                return (
                                    <TableRow key={coupon.id}>
                                        <TableCell className="font-mono font-medium">
                                            {coupon.code}
                                        </TableCell>
                                        <TableCell>{coupon.name}</TableCell>
                                        <TableCell>{discountText}</TableCell>
                                        <TableCell>{formatDate(coupon.validUntil)}</TableCell>
                                        <TableCell>
                                            <Badge variant={coupon.isActive && isValid ? 'success' : 'secondary'}>
                                                {coupon.isActive && isValid ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Link href={`/coupons/${coupon.id}/edit`}>
                                                    <Button variant="ghost" size="icon">
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDelete(coupon.id)}
                                                    disabled={deletingId === coupon.id}
                                                >
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </>
    );
}

