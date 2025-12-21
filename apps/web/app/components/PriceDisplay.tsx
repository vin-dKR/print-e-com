interface PriceDisplayProps {
  currentPrice: number;
  originalPrice?: number;
  discount?: number;
  currency?: string;
}

export default function PriceDisplay({
  currentPrice,
  originalPrice,
  discount,
  currency = "$",
}: PriceDisplayProps) {
  return (
    <div className="flex items-center gap-4">
      <span className="text-3xl font-bold text-gray-900">
        {currency}
        {currentPrice.toFixed(2)}
      </span>
      {originalPrice && originalPrice > currentPrice && (
        <>
          <span className="text-xl text-gray-500 line-through">
            {currency}
            {originalPrice.toFixed(2)}
          </span>
          {discount && (
            <span className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-sm font-semibold">
              -{discount}%
            </span>
          )}
        </>
      )}
    </div>
  );
}
