/**
 * Review Detail Page
 * View comprehensive review information
 */

import { ReviewDetail } from '@/app/components/features/reviews/review-detail';

export default async function ReviewDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <ReviewDetail reviewId={id} />;
}

