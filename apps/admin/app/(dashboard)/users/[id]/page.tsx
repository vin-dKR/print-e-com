/**
 * User Detail Page
 * Comprehensive user management page
 */

import { UserDetail } from '@/app/components/features/users/user-detail';

export default async function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <UserDetail userId={id} />;
}

