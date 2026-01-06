/**
 * Order Detail Page
 * View and manage individual order
 */

import { OrderDetail } from '@/app/components/features/orders/order-detail';

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <OrderDetail orderId={id} />;
}

