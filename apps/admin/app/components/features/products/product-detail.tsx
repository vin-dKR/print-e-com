/**
 * Product Detail Component
 * Displays product details
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Alert } from '@/app/components/ui/alert';
import { PageLoading } from '@/app/components/ui/loading';
import { getProduct, type Product } from '@/lib/api/products.service';
import { formatCurrency, formatDate } from '@/lib/utils/format';
import { ArrowLeft, Edit } from 'lucide-react';
import Link from 'next/link';

export function ProductDetail({ productId }: { productId: string }) {
    const router = useRouter();
    const [product, setProduct] = useState<Product | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadProduct();
    }, [productId]);

    const loadProduct = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await getProduct(productId);
            setProduct(data);
        } catch (err) {
            console.log("error-----", err);
            setError(err instanceof Error ? err.message : 'Failed to load product');
            setProduct(null);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return <PageLoading />;
    }

    if (error || !product) {
        return (
            <div className="space-y-4">
                <Button variant="ghost" onClick={() => router.back()}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                </Button>
                <Alert variant="error">{error || 'Product not found'}</Alert>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <Button variant="ghost" onClick={() => router.back()}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                    </Button>
                    <h1 className="mt-4 text-3xl font-bold text-gray-900">{product.name}</h1>
                </div>
                <Link href={`/products/${product.id}/edit`}>
                    <Button>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                    </Button>
                </Link>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Product Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <p className="text-sm text-gray-600">Name</p>
                            <p className="font-medium">{product.name}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Description</p>
                            <p className="font-medium">{product.description}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Category</p>
                            <Badge variant="secondary">
                                {typeof product.category === 'string'
                                    ? product.category
                                    : product.category.name}
                            </Badge>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Base Price</p>
                            <p className="text-2xl font-bold">{formatCurrency(product.basePrice)}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Created</p>
                            <p className="font-medium">{formatDate(product.createdAt)}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Variants</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {product.variants.length === 0 ? (
                            <p className="text-sm text-gray-600">No variants</p>
                        ) : (
                            <div className="space-y-2">
                                {product.variants.map((variant) => (
                                    <div key={variant.id} className="flex justify-between border-b pb-2">
                                        <div>
                                            <p className="font-medium">{variant.name}</p>
                                            <p className="text-sm text-gray-600">
                                                {variant.available ? 'Available' : 'Unavailable'}
                                            </p>
                                        </div>
                                        <p className="font-medium">
                                            {formatCurrency(product.basePrice + variant.priceModifier)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

