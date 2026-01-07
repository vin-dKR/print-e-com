'use client';

/**
 * Dashboard Sidebar Component
 * Navigation sidebar for admin dashboard
 */

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils/cn';
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    FolderTree,
    LogOut,
    Users,
    Ticket,
    CreditCard,
    Star,
} from 'lucide-react';
import { logoutAdmin } from '@/lib/api/auth.service';
import { setAuthToken } from '@/lib/api/api-client';

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Products', href: '/products', icon: Package },
    { name: 'Orders', href: '/orders', icon: ShoppingCart },
    { name: 'Categories', href: '/categories', icon: FolderTree },
    { name: 'Users', href: '/users', icon: Users },
    { name: 'Coupons', href: '/coupons', icon: Ticket },
    { name: 'Payments', href: '/payments', icon: CreditCard },
    { name: 'Reviews', href: '/reviews', icon: Star },
]

export function DashboardSidebar() {
    const pathname = usePathname();

    const handleLogout = () => {
        setAuthToken(undefined);
        logoutAdmin();
    };

    return (
        <div className="flex w-64 flex-col bg-white shadow-lg">
            <div className="flex h-16 items-center border-b px-6">
                <h2 className="text-xl font-bold text-gray-900">Admin Panel</h2>
            </div>

            <nav className="flex-1 space-y-1 px-3 py-4">
                {navigation.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                                isActive
                                    ? 'bg-primary text-primary-foreground'
                                    : 'text-gray-700 hover:bg-gray-100'
                            )}
                        >
                            <item.icon className="h-5 w-5" />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            <div className="border-t p-4">
                <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
                >
                    <LogOut className="h-5 w-5" />
                    Logout
                </button>
            </div>
        </div>
    );
}

