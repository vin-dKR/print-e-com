/**
 * Product Detail Component
 * Rich summary of a single product and all related data.
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
        void loadProduct();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [productId]);

    const loadProduct = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await getProduct(productId);
            setProduct(data);
        } catch (err) {
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

    const primaryImage =
        product.images.find((img) => img.isPrimary)?.url || product.images[0]?.url;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="space-y-2">
                    <Button variant="ghost" onClick={() => router.back()}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                    </Button>
                    <div>
                        <h1 className="mt-4 text-3xl font-bold text-gray-900 flex items-center gap-2 flex-wrap">
                            {product.name}
                            {product.isFeatured && <Badge>Featured</Badge>}
                            {product.isNewArrival && <Badge variant="outline">New</Badge>}
                            {product.isBestSeller && <Badge variant="outline">Best seller</Badge>}
                        </h1>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-600">
                            <span className="font-mono">
                                slug: {product.slug || '(auto-generated)'}
                            </span>
                            <span>• Category: {product.category?.name || 'Unassigned'}</span>
                            <span>• SKU: {product.sku || '—'}</span>
                            <span>
                                • Created: {formatDate(product.createdAt)} • Updated:{' '}
                                {formatDate(product.updatedAt)}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2 items-center">
                    <Badge variant={product.isActive ? 'success' : 'outline'}>
                        {product.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    <Link href={`/products/${product.id}/edit`}>
                        <Button>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit product
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Main layout */}
            <div className="grid gap-6 lg:grid-cols-[1.1fr,1.5fr,1fr]">
                {/* Images */}
                <Card>
                    <CardHeader>
                        <CardTitle>Images</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="aspect-square w-full overflow-hidden rounded-lg border bg-gray-50 flex items-center justify-center">
                            {primaryImage ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={primaryImage}
                                    alt={product.name}
                                    className="h-full w-full object-contain"
                                />
                            ) : (
                                <span className="text-sm text-gray-400">No primary image</span>
                            )}
                        </div>
                        {product.images.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {product.images.map((img) => (
                                    <div
                                        key={img.id}
                                        className={`h-14 w-14 rounded-md overflow-hidden border ${
                                            img.isPrimary ? 'ring-2 ring-blue-500' : ''
                                        }`}
                                    >
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={img.url}
                                            alt={img.alt || product.name}
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Description, specs, attributes, tags */}
                <div className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Product Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            {product.shortDescription && (
                                <div>
                                    <p className="text-gray-600 font-semibold">Short Description</p>
                                    <p className="text-gray-800">{product.shortDescription}</p>
                                </div>
                            )}
                            {product.description && (
                                <div>
                                    <p className="text-gray-600 font-semibold">Description</p>
                                    <p className="text-gray-800 whitespace-pre-line">
                                        {product.description}
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Specifications</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            {product.specifications.length === 0 ? (
                                <p className="text-gray-500">No specifications configured.</p>
                            ) : (
                                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                                    {product.specifications
                                        .slice()
                                        .sort((a, b) => a.displayOrder - b.displayOrder)
                                        .map((spec) => (
                                            <div key={spec.id}>
                                                <dt className="text-gray-500">{spec.key}</dt>
                                                <dd className="font-medium text-gray-900">
                                                    {spec.value}
                                                </dd>
                                            </div>
                                        ))}
                                </dl>
                            )}
                        </CardContent>
                    </Card>

                    {(product.attributes.length > 0 || product.tags.length > 0) && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Attributes & Tags</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 text-sm">
                                {product.attributes.length > 0 && (
                                    <div>
                                        <p className="mb-2 text-gray-600 font-semibold">
                                            Attributes
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {product.attributes.map((attr) => (
                                                <Badge
                                                    key={attr.id}
                                                    variant="outline"
                                                    className="text-xs"
                                                >
                                                    {attr.attributeType}: {attr.attributeValue}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {product.tags.length > 0 && (
                                    <div>
                                        <p className="mb-2 text-gray-600 font-semibold">Tags</p>
                                        <div className="flex flex-wrap gap-2">
                                            {product.tags.map((tag) => (
                                                <Badge
                                                    key={tag.id}
                                                    variant="outline"
                                                    className="text-xs"
                                                >
                                                    {tag.tag}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Pricing, inventory, stats, variants */}
                <div className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Pricing</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            <div>
                                <p className="text-gray-600">Base Price</p>
                                <p className="text-xl font-semibold">
                                    {formatCurrency(product.basePrice)}
                                </p>
                            </div>
                            <div className="flex flex-col gap-1">
                                <p className="text-gray-600">Selling Price / MRP</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-lg font-semibold text-green-700">
                                        {formatCurrency(
                                            product.sellingPrice || product.basePrice,
                                        )}
                                    </span>
                                    {product.mrp && (
                                        <span className="text-xs text-gray-400 line-through">
                                            {formatCurrency(product.mrp)}
                                        </span>
                                    )}
                                </div>
                            </div>
                            {product.returnPolicy && (
                                <div>
                                    <p className="text-gray-600">Return Policy</p>
                                    <p className="text-gray-800 whitespace-pre-line">
                                        {product.returnPolicy}
                                    </p>
                                </div>
                            )}
                            {product.warranty && (
                                <div>
                                    <p className="text-gray-600">Warranty</p>
                                    <p className="text-gray-800 whitespace-pre-line">
                                        {product.warranty}
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Inventory & Logistics</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <p>Stock: {product.stock}</p>
                            <p>Min order quantity: {product.minOrderQuantity}</p>
                            <p>
                                Max order quantity:{' '}
                                {product.maxOrderQuantity !== null
                                    ? product.maxOrderQuantity
                                    : 'No limit'}
                            </p>
                            <p>Weight: {product.weight ?? '—'} kg</p>
                            <p>Dimensions: {product.dimensions || '—'}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Performance</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <p>Rating: {product.rating ?? '—'}</p>
                            <p>Total reviews: {product.totalReviews}</p>
                            <p>Total sold: {product.totalSold}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Variants</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            {product.variants.length === 0 ? (
                                <p className="text-gray-500">No variants configured.</p>
                            ) : (
                                <div className="space-y-2 max-h-64 overflow-auto">
                                    {product.variants.map((variant) => {
                                        const finalPrice =
                                            Number(product.basePrice) +
                                            Number(variant.priceModifier || 0);
                                        return (
                                            <div
                                                key={variant.id}
                                                className="flex items-center justify-between border rounded-md px-2 py-1"
                                            >
                                                <div className="space-y-0.5">
                                                    <p className="font-medium text-xs">
                                                        {variant.name}
                                                    </p>
                                                    <p className="text-[11px] text-gray-500">
                                                        SKU: {variant.sku || '—'} • Stock:{' '}
                                                        {variant.stock}
                                                    </p>
                                                </div>
                                                <div className="text-right space-y-0.5">
                                                    <p className="text-xs font-semibold">
                                                        {formatCurrency(finalPrice)}
                                                    </p>
                                                    <p className="text-[11px] text-gray-500">
                                                        {variant.available ? 'Available' : 'Hidden'}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}


