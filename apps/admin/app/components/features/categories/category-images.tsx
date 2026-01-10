'use client';

/**
 * Category Images Management Component
 */

import { useEffect, useState, FormEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Alert } from '@/app/components/ui/alert';
import {
    getCategoryImagesApi,
    createCategoryImageApi,
    updateCategoryImageApi,
    deleteCategoryImageApi,
    uploadCategoryImageApi,
    type CategoryImage,
} from '@/lib/api/categories.service';
import Image from 'next/image';
import { Trash2, Star, StarOff, GripVertical } from 'lucide-react';

interface CategoryImagesProps {
    categoryId: string;
}

export function CategoryImages({ categoryId }: CategoryImagesProps) {
    const [images, setImages] = useState<CategoryImage[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const [uploadMode, setUploadMode] = useState<'url' | 'file'>('file');
    const [uploading, setUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0);

    const [form, setForm] = useState<{
        url: string;
        alt: string;
        isPrimary: boolean;
    }>({
        url: '',
        alt: '',
        isPrimary: false,
    });

    console.log('categoryId', images);

    useEffect(() => {
        loadImages();
    }, [categoryId]);

    const loadImages = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getCategoryImagesApi(categoryId);
            setImages(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load images');
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e: FormEvent) => {
        e.preventDefault();
        if (!selectedFile) {
            setError('Please select a file');
            return;
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
        if (!allowedTypes.includes(selectedFile.type)) {
            setError('Invalid file type. Please upload JPG, PNG, WebP, or GIF images.');
            return;
        }

        // Validate file size (10MB)
        if (selectedFile.size > 10 * 1024 * 1024) {
            setError('File size must be less than 10MB');
            return;
        }

        try {
            setUploading(true);
            setError(null);
            setUploadProgress(0);

            const newImage = await uploadCategoryImageApi(categoryId, selectedFile, {
                alt: form.alt.trim() || undefined,
                isPrimary: form.isPrimary,
            });

            setImages([...images, newImage]);
            setForm({ url: '', alt: '', isPrimary: false });
            setSelectedFile(null);
            setUploadProgress(0);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to upload image');
        } finally {
            setUploading(false);
        }
    };

    const handleUrlSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!form.url.trim()) {
            setError('Image URL is required');
            return;
        }

        try {
            setSaving(true);
            setError(null);
            const newImage = await createCategoryImageApi(categoryId, {
                url: form.url.trim(),
                alt: form.alt.trim() || undefined,
                isPrimary: form.isPrimary,
            });
            setImages([...images, newImage]);
            setForm({ url: '', alt: '', isPrimary: false });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to add image');
        } finally {
            setSaving(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setError(null);
        }
    };

    const handleSetPrimary = async (imageId: string) => {
        try {
            setError(null);
            await updateCategoryImageApi(categoryId, imageId, { isPrimary: true });
            await loadImages(); // Reload to get updated order
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to set primary image');
        }
    };

    const handleDelete = async (imageId: string) => {
        if (!confirm('Are you sure you want to delete this image?')) {
            return;
        }

        try {
            setDeleting(imageId);
            setError(null);
            await deleteCategoryImageApi(categoryId, imageId);
            setImages(images.filter((img) => img.id !== imageId));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete image');
        } finally {
            setDeleting(null);
        }
    };

    const handleUpdateDisplayOrder = async (imageId: string, newOrder: number) => {
        try {
            setError(null);
            await updateCategoryImageApi(categoryId, imageId, { displayOrder: newOrder });
            await loadImages();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update order');
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-[200px] items-center justify-center">
                <p className="text-sm text-gray-500">Loading images...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Category Images</h2>
                <p className="mt-1 text-sm text-gray-600">
                    Upload and manage images for this category. Set a primary image for display in listings.
                </p>
            </div>

            {error && <Alert variant="error">{error}</Alert>}

            {/* Add Image Form */}
            <Card>
                <CardHeader>
                    <CardTitle>Add New Image</CardTitle>
                </CardHeader>
                <CardContent>
                    {/* Upload Mode Toggle */}
                    <div className="mb-4 flex gap-2">
                        <Button
                            type="button"
                            variant={uploadMode === 'file' ? 'default' : 'outline'}
                            onClick={() => setUploadMode('file')}
                            size="sm"
                        >
                            Upload File
                        </Button>
                        <Button
                            type="button"
                            variant={uploadMode === 'url' ? 'default' : 'outline'}
                            onClick={() => setUploadMode('url')}
                            size="sm"
                        >
                            Enter URL
                        </Button>
                    </div>

                    {uploadMode === 'file' ? (
                        <form onSubmit={handleFileUpload} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="image-file">Select Image</Label>
                                <Input
                                    id="image-file"
                                    type="file"
                                    accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                                    onChange={handleFileChange}
                                    required
                                />
                                {selectedFile && (
                                    <div className="mt-2 rounded-md border p-2">
                                        <p className="text-sm text-gray-600">
                                            Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                                        </p>
                                    </div>
                                )}
                                <p className="text-xs text-gray-500">
                                    Supported formats: JPG, PNG, WebP, GIF. Max size: 10MB
                                </p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="image-alt">Alt Text (optional)</Label>
                                <Input
                                    id="image-alt"
                                    placeholder="Description of the image"
                                    value={form.alt || ''}
                                    onChange={(e) => setForm((prev) => ({ ...prev, alt: e.target.value }))}
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    id="is-primary"
                                    type="checkbox"
                                    checked={form.isPrimary}
                                    onChange={(e) => setForm((prev) => ({ ...prev, isPrimary: e.target.checked }))}
                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <Label htmlFor="is-primary">Set as primary image</Label>
                            </div>
                            <Button type="submit" isLoading={uploading} disabled={!selectedFile || uploading}>
                                {uploading ? 'Uploading...' : 'Upload Image'}
                            </Button>
                        </form>
                    ) : (
                        <form onSubmit={handleUrlSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="image-url">Image URL</Label>
                                <Input
                                    id="image-url"
                                    type="url"
                                    placeholder="https://example.com/image.jpg"
                                    value={form.url || ''}
                                    onChange={(e) => setForm((prev) => ({ ...prev, url: e.target.value }))}
                                    required
                                />
                                <p className="text-xs text-gray-500">
                                    Enter the full URL of the image.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="image-alt">Alt Text (optional)</Label>
                                <Input
                                    id="image-alt"
                                    placeholder="Description of the image"
                                    value={form.alt || ''}
                                    onChange={(e) => setForm((prev) => ({ ...prev, alt: e.target.value }))}
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    id="is-primary-url"
                                    type="checkbox"
                                    checked={form.isPrimary}
                                    onChange={(e) => setForm((prev) => ({ ...prev, isPrimary: e.target.checked }))}
                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <Label htmlFor="is-primary-url">Set as primary image</Label>
                            </div>

                            <Button type="submit" isLoading={saving}>
                                Add Image
                            </Button>
                        </form>
                    )}
                </CardContent>
            </Card>

            {/* Images Gallery */}
            <Card>
                <CardHeader>
                    <CardTitle>Images ({images.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    {images.length === 0 ? (
                        <div className="py-8 text-center text-gray-500">
                            <p>No images added yet. Add your first image above.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {images.map((image, index) => (
                                <div
                                    key={image.id || `image-${index}-${image.url || 'temp'}-${index}`}
                                    className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white"
                                >
                                    <div className="relative aspect-video w-full bg-gray-100">
                                        <Image
                                            src={image.url}
                                            alt={image.alt || 'Category image'}
                                            fill
                                            className="object-cover"
                                            unoptimized={image.url?.includes('amazonaws.com') || image.url?.includes('s3.')}
                                        />
                                        {image.isPrimary && (
                                            <div className="absolute top-2 left-2 rounded bg-blue-600 px-2 py-1 text-xs font-medium text-white">
                                                Primary
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-3">
                                        <p className="text-xs text-gray-500">
                                            Order: {image.displayOrder} • {image.alt || 'No alt text'}
                                        </p>
                                        <div className="mt-2 flex gap-2">
                                            {!image.isPrimary && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleSetPrimary(image.id)}
                                                    className="flex-1"
                                                >
                                                    <Star className="mr-1 h-3 w-3" />
                                                    Set Primary
                                                </Button>
                                            )}
                                            {image.isPrimary && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    disabled
                                                    className="flex-1"
                                                >
                                                    <StarOff className="mr-1 h-3 w-3" />
                                                    Primary
                                                </Button>
                                            )}
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleDelete(image.id)}
                                                isLoading={deleting === image.id}
                                                className="text-red-600 hover:text-red-700"
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </div>
                                        {index > 0 && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="mt-1 w-full text-xs"
                                                onClick={() => handleUpdateDisplayOrder(image.id, image.displayOrder - 1)}
                                            >
                                                Move Up
                                            </Button>
                                        )}
                                        {index < images.length - 1 && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="mt-1 w-full text-xs"
                                                onClick={() => handleUpdateDisplayOrder(image.id, image.displayOrder + 1)}
                                            >
                                                Move Down
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

