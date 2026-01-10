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
            <h3 className="font-semibold text-lg text-gray-900 flex items-center gap-2">
                <Receipt className="w-5 h-5 text-gray-600" />
                Price Breakdown
            </h3>

            <div className="space-y-3">
                {items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                        <div>
                            <div className="text-gray-700 text-sm">{item.label}</div>
                            {item.description && (
                                <div className="text-gray-500 text-xs mt-0.5">{item.description}</div>
                            )}
                        </div>
                        <div className="font-medium text-gray-900 text-sm">
                            {currency}{item.value.toFixed(2)}
                        </div>
                    </div>
                ))}

                <div className="pt-3 mt-3 border-t-2 border-gray-200">
                    <div className="flex justify-between items-center">
                        <div className="font-semibold text-gray-900 text-lg">Total Amount</div>
                        <div className="text-right">
                            <div className="font-semibold text-blue-500 text-2xl">
                                {currency}{total.toFixed(2)}
                            </div>
                            {quantity > 1 && (
                                <div className="text-gray-500 text-xs mt-1">
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
