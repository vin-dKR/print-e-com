'use client';

import React from 'react';
import { FileText, Image } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PageCountDisplayProps {
    pageCount: number;
    fileType?: 'pdf' | 'image' | 'mixed';
    className?: string;
}

export const PageCountDisplay: React.FC<PageCountDisplayProps> = ({
    pageCount,
    fileType = 'pdf',
    className,
}) => {
    const getIcon = () => {
        if (fileType === 'image') return <Image className="w-5 h-5" />;
        if (fileType === 'mixed') return <FileText className="w-5 h-5" />;
        return <FileText className="w-5 h-5" />;
    };

    const getLabel = () => {
        if (fileType === 'image') return 'images';
        return 'pages';
    };

    return (
        <div className={cn('space-y-2', className)}>
            <label className="block text-sm font-medium text-gray-700 mb-3 font-hkgb">
                Page Count
            </label>
            <div className="flex items-center gap-3 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="text-gray-500">
                    {getIcon()}
                </div>
                <div className="flex-1">
                    <div className="text-2xl sm:text-3xl font-hkgb text-gray-900">
                        {pageCount}
                    </div>
                    <div className="text-sm text-gray-600">
                        {getLabel()}
                    </div>
                </div>
                <div className="text-xs text-gray-500 bg-white px-2 py-1 rounded">
                    Fixed
                </div>
            </div>
            <p className="text-xs text-gray-500">
                Based on uploaded files
            </p>
        </div>
    );
};

