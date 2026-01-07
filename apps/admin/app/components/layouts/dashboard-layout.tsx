/**
 * Dashboard Layout Component
 * Main layout for admin dashboard with sidebar navigation
 */

import { DashboardSidebar } from '@/app/components/features/dashboard/dashboard-sidebar';
import { DashboardHeader } from '@/app/components/features/dashboard/dashboard-header';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex h-screen overflow-hidden bg-gray-100">
            <DashboardSidebar />
            <div className="flex flex-1 flex-col overflow-hidden">
                <DashboardHeader />
                <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}

