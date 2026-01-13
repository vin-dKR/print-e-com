/**
 * Dashboard Overview Page
 * Main dashboard with statistics and recent activity
 * Server Component – data fetched on the server via helper.
 */

import { DashboardStats } from '@/app/components/features/dashboard/dashboard-stats';
import { RecentOrders } from '@/app/components/features/dashboard/recent-orders';
import { RevenueChart } from '@/app/components/features/dashboard/revenue-chart';
import { OrdersTrendChart } from '@/app/components/features/dashboard/orders-trend-chart';
import { TopProducts } from '@/app/components/features/dashboard/top-products';
import { RecentCustomers } from '@/app/components/features/dashboard/recent-customers';
import { RecentCoupons } from '@/app/components/features/dashboard/recent-coupons';
import { getDashboardOverview } from '@/lib/server/dashboard-data';

export default async function DashboardPage() {
    const data = await getDashboardOverview();

    return (
        <div className="space-y-6">
            <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                    <p className="mt-2 text-sm text-gray-600">
                        Overview of your e-print store
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <p className="text-xs text-gray-500">Loaded at {new Date().toLocaleString()}</p>
                </div>
            </header>

            {/* Top stats */}
            <DashboardStats
                stats={data?.stats}
                loading={!data}
            />

            {/* Charts row */}
            <div className="grid gap-6 md:grid-cols-2">
                <RevenueChart
                    data={data?.timeSeries.revenueLast30Days || []}
                    loading={!data}
                />
                <OrdersTrendChart
                    data={data?.timeSeries.ordersLast30Days || []}
                    loading={!data}
                />
            </div>

            {/* Tables / lists row */}
            <div className="grid gap-6 md:grid-cols-2">
                <RecentOrders
                    recentOrders={data?.recentOrders || []}
                    loading={!data}
                />
                <TopProducts
                    topProducts={data?.topProducts || []}
                    loading={!data}
                />
            </div>

            {/* Secondary row */}
            <div className="grid gap-6 md:grid-cols-2">
                <RecentCustomers
                    recentCustomers={data?.recentCustomers || []}
                    loading={!data}
                />
                <RecentCoupons
                    recentCoupons={data?.recentCoupons || []}
                    loading={!data}
                />
            </div>
        </div>
    );
}

