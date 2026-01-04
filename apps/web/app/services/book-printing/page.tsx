'use client';

import React, { useState, useEffect } from 'react';
import { ProductPageTemplate } from '@/app/components/services/ProductPageTemplate';
import { OptionSelector } from '@/app/components/services/print/OptionSelector';
import { QuantitySelector } from '@/app/components/services/QuantitySelector';
import { BOOK_PRINTOUTS, BOOK_BINDING_PRODUCTS } from "@/constant/services/book-printing"
import { ProductData } from '@/types';

type BookPaperSize = 'A5' | 'B5' | 'A4' | 'A3';
type BookPaperType = '70 Gsm';
type BookBindingType = 'Glue Binding' | 'Hard Binding';
type ColorType = 'bw' | 'color';
type SideType = 'single' | 'both';
type BookBindingPages = 'Upto 50 Pages' | 'Upto 100 Pages' | 'Upto 150 Pages' | 'Upto 200 Pages' | 'Upto 250 Pages' | 'Upto 300 Pages';

const BOOK_BINDING_PAGES_OPTIONS: BookBindingPages[] = [
    'Upto 50 Pages',
    'Upto 100 Pages',
    'Upto 150 Pages',
    'Upto 200 Pages',
    'Upto 250 Pages',
    'Upto 300 Pages'
];

export default function BookPrintingPage() {
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [selectedPaperSize, setSelectedPaperSize] = useState<BookPaperSize>('A4');
    const [selectedBindingType, setSelectedBindingType] = useState<BookBindingType>('Glue Binding');
    const [selectedColor, setSelectedColor] = useState<ColorType>('bw');
    const [selectedSide, setSelectedSide] = useState<SideType>('single');
    const [selectedBindingPages, setSelectedBindingPages] = useState<BookBindingPages>('Upto 50 Pages');
    const [quantity, setQuantity] = useState<number>(1);
    const [priceBreakdown, setPriceBreakdown] = useState<Array<{ label: string; value: number }>>([]);
    const [totalPrice, setTotalPrice] = useState<number>(0);

    // Get selected book data
    const selectedBookData = BOOK_PRINTOUTS.find(book => book.paperSize === selectedPaperSize);

    // Calculate price whenever any selection changes
    useEffect(() => {
        calculatePrice();
    }, [
        selectedPaperSize,
        selectedBindingType,
        selectedColor,
        selectedSide,
        selectedBindingPages,
        quantity
    ]);

    const calculatePrice = () => {
        const breakdown: Array<{ label: string; value: number }> = [];
        let total = 0;

        // 1. Calculate printing price
        if (selectedBookData) {
            // Determine which price to use based on color and side
            let priceKey: 'bwSingle' | 'bwBoth' | 'colorSingle' | 'colorBoth';

            if (selectedColor === 'bw') {
                priceKey = selectedSide === 'single' ? 'bwSingle' : 'bwBoth';
            } else {
                priceKey = selectedSide === 'single' ? 'colorSingle' : 'colorBoth';
            }

            const printPrice = selectedBookData.prices[priceKey] * quantity;
            breakdown.push({
                label: `${selectedPaperSize} Book ${selectedColor === 'bw' ? 'B&W' : 'Color'} ${selectedSide === 'single' ? 'Single Side' : 'Both Sides'} (${quantity} pages)`,
                value: printPrice
            });
            total += printPrice;
        }

        // 2. Calculate binding price
        const binding = BOOK_BINDING_PRODUCTS.find(b => b.type === selectedBindingType);
        if (binding) {
            const priceObj = binding.prices.find(p =>
                'pages' in p && p.pages === selectedBindingPages
            );

            if (priceObj) {
                const bindingPrice = priceObj.price;
                breakdown.push({
                    label: `${selectedBindingType} (${selectedBindingPages})`,
                    value: bindingPrice
                });
                total += bindingPrice;
            }
        }

        setPriceBreakdown(breakdown);
        setTotalPrice(Number(total.toFixed(2)));
    };

    // Get book size options
    const getBookSizeOptions = () => {
        return BOOK_PRINTOUTS.map(book => ({
            id: book.paperSize.toLowerCase(),
            label: book.paperSize,
            value: book.paperSize,
            description: `${book.paperType} paper`
        }));
    };

    // Get binding price options
    const getBindingPriceOptions = () => {
        const binding = BOOK_BINDING_PRODUCTS.find(b => b.type === selectedBindingType);
        if (!binding) return [];

        return binding.prices.map(price => ({
            id: price.pages.toLowerCase().replace(/ /g, '-'),
            label: price.pages,
            value: price.pages,
            price: price.price
        }));
    };

    const productData: Partial<ProductData> = {
        category: 'book-printing',
        title: 'Professional Book Printing Service',
        description: 'Print your books with professional quality, perfect for novels, textbooks, manuals, and more.',
        basePrice: 0.90, // A4 B&W Single starting price
        features: [
            'Perfect for novels, textbooks, and manuals',
            'Multiple book size options (A5, B5, A4, A3)',
            '70 Gsm professional book paper',
            'Black & white or color printing',
            'Single or double-sided printing',
            'Glue binding or hard binding options',
            'Custom cover design available',
            'Bulk printing discounts available',
            'Proofreading and formatting assistance',
            'Fast turnaround time',
        ],
    };

    const breadcrumbItems = [
        { label: 'Home', href: '/' },
        { label: 'Printing Services', href: '/printing' },
        { label: 'Book Printing', href: '/book-printing', isActive: true },
    ];

    const handleAddToCart = () => {
        const orderData = {
            bookSize: selectedPaperSize,
            bindingType: selectedBindingType,
            color: selectedColor,
            side: selectedSide,
            bindingPages: selectedBindingPages,
            quantity,
            totalPrice,
            uploadedFile: uploadedFile?.name
        };

        console.log('Adding to cart:', orderData);
        // Add to cart logic here
    };

    const handleBuyNow = () => {
        const orderData = {
            bookSize: selectedPaperSize,
            bindingType: selectedBindingType,
            color: selectedColor,
            side: selectedSide,
            bindingPages: selectedBindingPages,
            quantity,
            totalPrice,
            uploadedFile: uploadedFile?.name
        };

        console.log('Buying now:', orderData);
        // Buy now logic here
    };

    return (
        <ProductPageTemplate
            productData={productData}
            breadcrumbItems={breadcrumbItems}
            uploadedFile={uploadedFile}
            onFileSelect={setUploadedFile}
            onFileRemove={() => setUploadedFile(null)}
            priceItems={priceBreakdown}
            totalPrice={totalPrice}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
        >
            {/* Configuration options */}
            <div className="space-y-8">
                {/* Book Size Selection */}
                <OptionSelector
                    title="Book Size"
                    options={getBookSizeOptions()}
                    selectedValue={selectedPaperSize}
                    onSelect={(value) => setSelectedPaperSize(value as BookPaperSize)}
                    layout="grid"
                    columns={4}
                    showPrice={false}
                />

                {/* Paper Type Info (Fixed for book printing) */}
                <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700 font-hkgb">
                        Paper Type
                    </label>
                    <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
                        <div className="font-medium text-gray-900">70 Gsm Professional Book Paper</div>
                        <div className="text-sm text-gray-600 mt-1">
                            Standard paper weight for professional book printing
                        </div>
                    </div>
                </div>

                {/* Color Selection */}
                <OptionSelector
                    title="Print Color"
                    options={[
                        { id: 'bw', label: 'Black & White', value: 'bw' },
                        { id: 'color', label: 'Color', value: 'color' },
                    ]}
                    selectedValue={selectedColor}
                    onSelect={(value) => setSelectedColor(value as ColorType)}
                    layout="inline"
                />

                {/* Side Selection */}
                <OptionSelector
                    title="Print Sides"
                    options={[
                        { id: 'single', label: 'Single Side', value: 'single' },
                        { id: 'both', label: 'Both Sides', value: 'both' },
                    ]}
                    selectedValue={selectedSide}
                    onSelect={(value) => setSelectedSide(value as SideType)}
                    layout="inline"
                />

                {/* Binding Type Selection */}
                <div className="space-y-4">
                    <label className="block text-sm font-medium text-gray-700 mb-3 font-hkgb">
                        Binding Options
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {BOOK_BINDING_PRODUCTS.map((binding) => (
                            <button
                                key={binding.type}
                                type="button"
                                onClick={() => setSelectedBindingType(binding.type as BookBindingType)}
                                className={`
                                    p-4 rounded-xl border text-center transition-all duration-200
                                    ${selectedBindingType === binding.type
                                        ? 'border-[#008ECC] bg-blue-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                    }
                                `}
                            >
                                <div className="font-medium text-gray-900 text-base mb-2">
                                    {binding.type}
                                </div>
                                <div className="text-sm text-gray-600">
                                    From ₹{binding.prices[0].price.toFixed(2)}
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* Binding Pages Selection */}
                    <div className="mt-4">
                        <OptionSelector
                            title="Number of Pages for Binding"
                            options={getBindingPriceOptions()}
                            selectedValue={selectedBindingPages}
                            onSelect={(value) => setSelectedBindingPages(value as BookBindingPages)}
                            layout="grid"
                            columns={3}
                            showPrice={true}
                        />
                    </div>
                </div>

                {/* Quantity Selection */}
                <QuantitySelector
                    value={quantity}
                    onChange={setQuantity}
                    label="Quantity (Books)"
                    unit="books"
                    min={1}
                    max={100}
                />

                {/* Note about book printing */}
                <div className="p-4 bg-yellow-50 border border-yellow-100 rounded-xl">
                    <div className="flex items-start">
                        <div className="text-yellow-800 text-sm">
                            <strong>Note:</strong> Book printing includes both content pages and cover.
                            Minimum quantity may apply for certain binding types.
                            For custom cover designs, please contact our design team.
                        </div>
                    </div>
                </div>
            </div>
        </ProductPageTemplate>
    );
}
