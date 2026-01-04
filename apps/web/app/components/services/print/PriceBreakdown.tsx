import React from 'react';
import { cn } from '@/lib/utils';
import { Receipt } from 'lucide-react';

interface PriceBreakdownItem {
    label: string;
    value: number;
    description?: string;
}

interface PriceBreakdownProps {
    items: PriceBreakdownItem[];
    total: number;
    currency?: string;
    quantity?: number;
    className?: string;
}

export const PriceBreakdown: React.FC<PriceBreakdownProps> = ({
    items,
    total,
    currency = '₹',
    quantity = 1,
    className,
}) => {
    return (
        <div className={cn('space-y-4', className)}>
            <h3 className="font-hkgb text-lg sm:text-xl text-gray-900 flex items-center gap-2">
                <Receipt className="w-5 h-5" />
                Price Breakdown
            </h3>

            <div className="space-y-3">
                {items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                        <div>
                            <div className="text-gray-700 text-sm sm:text-base">{item.label}</div>
                            {item.description && (
                                <div className="text-gray-500 text-xs mt-1">{item.description}</div>
                            )}
                        </div>
                        <div className="font-medium text-gray-900 text-sm sm:text-base">
                            {currency}{item.value.toFixed(2)}
                        </div>
                    </div>
                ))}

                <div className="pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                        <div className="font-hkgb text-gray-900 text-lg sm:text-xl">Total Amount</div>
                        <div className="text-right">
                            <div className="font-hkgb text-[#008ECC] text-2xl sm:text-3xl">
                                {currency}{total.toFixed(2)}
                            </div>
                            {quantity > 1 && (
                                <div className="text-gray-600 text-sm mt-1">
                                    {currency}{(total / quantity).toFixed(2)} per unit
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
