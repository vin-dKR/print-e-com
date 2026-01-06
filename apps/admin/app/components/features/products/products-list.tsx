/**
 * Products List Component
 * Displays table of products with actions
 */

'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/app/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/app/components/ui/table';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Spinner, PageLoading } from '@/app/components/ui/loading';
import { Alert } from '@/app/components/ui/alert';
import {
    getProducts,
    deleteProduct,
    type Product,
    type ProductListResponse,
} from '@/lib/api/products.service';
import { formatCurrency, formatDate } from '@/lib/utils/format';
import { Edit, Trash2, Eye } from 'lucide-react';
import Link from 'next/link';
import { useDebouncedValue } from '@/lib/hooks/use-debounced-value';

export function ProductsList() {
    const [products, setProducts] = useState<Product[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [searchInput, setSearchInput] = useState('');
    const debouncedSearch = useDebouncedValue(searchInput, 400);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

    useEffect(() => {
        loadProducts(page, debouncedSearch);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, debouncedSearch]);

    const loadProducts = async (pageParam = 1, searchParam = '') => {
        try {
            setIsLoading(true);
            setError(null);
            const data: ProductListResponse = await getProducts({
                page: pageParam,
                limit: 20,
                search: searchParam || undefined,
            });
            setProducts(data.products);
            setTotalPages(data.pagination.totalPages);
            setTotalItems(data.pagination.total);
            setHasLoadedOnce(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load products');
        } finally {
            setIsLoading(false);
        }
    };

    console.log("products-----", products);
    console.log("error-----", error);
    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this product?')) {
            return;
        }

        try {
            setDeletingId(id);
            await deleteProduct(id);
            setProducts(products.filter((p) => p.id !== id));
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to delete product');
        } finally {
            setDeletingId(null);
        }
    };

    if (!hasLoadedOnce && isLoading) {
        return <PageLoading />;
    }

    return (
        <Card>
            <CardContent className="p-0">
                {/* Header: search + pagination */}
                <div className="flex items-center justify-between px-4 py-3 gap-4">
                    <input
                        className="w-full max-w-sm rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Search products by name or description..."
                        value={searchInput}
                        onChange={(e) => {
                            setPage(1);
                            setSearchInput(e.target.value);
                        }}
                    />
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="mr-2">
                            {totalItems.toLocaleString()} results • Page {page} of {Math.max(totalPages, 1)}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={page <= 1 || isLoading}
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={page >= totalPages || isLoading}
                            onClick={() => setPage((p) => Math.min(totalPages || 1, p + 1))}
                        >
                            Next
                        </Button>
                    </div>
                </div>

                {/* Inline error */}
                {error && (
                    <div className="px-4 pb-2">
                        <Alert variant="error">
                            {error}
                            <Button
                                onClick={() => loadProducts(page, debouncedSearch)}
                                variant="outline"
                                size="sm"
                                className="ml-4"
                            >
                                Retry
                            </Button>
                        </Alert>
                    </div>
                )}

                {/* Table / empty state */}
                <div className="relative">
                    {isLoading && hasLoadedOnce && (
                        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/20 backdrop-blur-[1px] text-xs text-gray-100 transition-opacity">
                            Updating results...
                        </div>
                    )}

                    {products.length === 0 && !isLoading && !error ? (
                        <div className="px-4 pb-6">
                            <Card>
                                <CardContent className="py-8 text-center">
                                    <p className="text-gray-600">
                                        No products found. Try adjusting your search or filters.
                                    </p>
                                    <Link href="/products/new">
                                        <Button className="mt-4">Create your first product</Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Price</TableHead>
                                    <TableHead>Variants</TableHead>
                                    <TableHead>Created</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {products.map((product) => (
                                    <TableRow key={product.id}>
                                        <TableCell className="font-medium">{product.name}</TableCell>
                                        <TableCell>
                                            <Badge variant="secondary">
                                                {typeof product.category === 'string'
                                                    ? product.category
                                                    : product.category.name}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{formatCurrency(product.basePrice)}</TableCell>
                                        <TableCell>{product.variants.length}</TableCell>
                                        <TableCell>{formatDate(product.createdAt)}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Link href={`/products/${product.id}`}>
                                                    <Button variant="ghost" size="icon">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Link href={`/products/${product.id}/edit`}>
                                                    <Button variant="ghost" size="icon">
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDelete(product.id)}
                                                    disabled={deletingId === product.id}
                                                >
                                                    {deletingId === product.id ? (
                                                        <Spinner size="sm" />
                                                    ) : (
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                    )}
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

