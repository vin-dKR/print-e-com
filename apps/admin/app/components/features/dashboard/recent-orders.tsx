/**
 * Recent Orders Component
 * Displays list of recent orders
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function RecentOrders() {
    // TODO: Fetch real data from API
    const orders: unknown[] = [];

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>Recent Orders</CardTitle>
                    <Link
                        href="/orders"
                        className="text-sm text-primary hover:underline flex items-center gap-1"
                    >
                        View all
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            </CardHeader>
            <CardContent>
                {orders.length === 0 ? (
                    <p className="text-sm text-gray-600 text-center py-8">
                        No orders yet
                    </p>
                ) : (
                    <div className="space-y-4">
                        {/* Order items will be rendered here */}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

