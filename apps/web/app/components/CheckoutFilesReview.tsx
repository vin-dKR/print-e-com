"use client";

import { FileText } from "lucide-react";
import { CartItem } from "@/lib/api/cart";

interface CheckoutFilesReviewProps {
    cartItems?: CartItem[];
}

export default function CheckoutFilesReview({ cartItems = [] }: CheckoutFilesReviewProps) {

    // Filter cart items that have uploaded files (customDesignUrl)
    const itemsWithFiles = cartItems.filter(item => {
        const fileUrls = Array.isArray(item.customDesignUrl)
            ? item.customDesignUrl
            : (item.customDesignUrl ? [item.customDesignUrl] : []);
        return fileUrls.length > 0;
    });

    if (itemsWithFiles.length === 0) {
        return null;
    }

    return (
        <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-900">Uploaded Files for Order</h3>
            {itemsWithFiles.map((item) => {
                const productName = item.product?.name || `Product ${item.productId}`;
                const variantName = item.variant?.name;
                const fileUrls = Array.isArray(item.customDesignUrl)
                    ? item.customDesignUrl
                    : (item.customDesignUrl ? [item.customDesignUrl] : []);

                return (
                    <div key={item.id} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                        <div className="text-sm font-medium text-gray-900 mb-2">
                            {productName}
                            {variantName && <span className="text-xs text-gray-600 ml-2">({variantName})</span>}
                        </div>
                        <div className="text-xs text-gray-500 mb-2">
                            Product ID: {item.productId} {item.variantId ? `• Variant ID: ${item.variantId}` : ''}
                        </div>
                        <div className="space-y-2">
                            {fileUrls.map((s3Key, fileIndex) => {
                                // Extract filename from S3 key
                                const filename = s3Key.split('/').pop() || `File ${fileIndex + 1}`;

                                return (
                                    <div key={fileIndex} className="flex items-start gap-2 p-2 bg-white rounded border border-gray-200">
                                        <div className="shrink-0 mt-0.5">
                                            <div className="w-12 h-12 rounded bg-gray-100 flex items-center justify-center">
                                                <FileText className="h-5 w-5 text-gray-600" />
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-medium text-gray-900 truncate">
                                                {filename}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1">
                                                File uploaded to S3
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="mt-2 text-xs text-gray-500">
                            Total: {fileUrls.length} file{fileUrls.length !== 1 ? 's' : ''}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

