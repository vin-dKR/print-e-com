/**
 * Edit Coupon Page
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { CouponForm } from '@/app/components/features/coupons/coupon-form';
import { getCoupon, type Coupon } from '@/lib/api/coupons.service';
import { PageLoading } from '@/app/components/ui/loading';
import { Alert } from '@/app/components/ui/alert';
import { Button } from '@/app/components/ui/button';

export default function EditCouponPage() {
    const router = useRouter();
    const params = useParams();
    const [coupon, setCoupon] = useState<Coupon | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (params.id) {
            loadCoupon();
        }
    }, [params.id]);

    const loadCoupon = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getCoupon(params.id as string);
            setCoupon(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load coupon');
        } finally {
            setLoading(false);
        }
    };

    const handleSuccess = () => {
        router.push('/coupons');
    };

    if (loading) {
        return <PageLoading />;
    }

    if (error) {
        return (
            <div className="space-y-4">
                <Alert variant="error">
                    {error}
                    <Button onClick={loadCoupon} variant="outline" className="ml-4">
                        Retry
                    </Button>
                </Alert>
            </div>
        );
    }

    if (!coupon) {
        return null;
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Edit Coupon</h1>
                <p className="mt-2 text-sm text-gray-600">
                    Update coupon details and settings
                </p>
            </div>

            <CouponForm initialData={coupon} onSuccess={handleSuccess} />
        </div>
    );
}

