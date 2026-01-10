/**
 * Categories Page
 * List and manage categories
 */

import { CategoriesList } from '@/app/components/features/categories/categories-list';
import { Button } from '@/app/components/ui/button';
import Link from 'next/link';
import { Plus } from 'lucide-react';

export default function CategoriesPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
                    <p className="mt-2 text-sm text-gray-600">
                        Manage product categories
                    </p>
                </div>
                <Link href="/categories/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Category
                    </Button>
                </Link>
            </div>

            <CategoriesList />
        </div>
    );
}

