import Link from "next/link";

export default function PrintedBestProduct() {
  // This would typically come from an API
  const products = Array(4).fill(null);

  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Printed Best Product</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((_, index) => (
            <div
              key={index}
              className="bg-gray-900 rounded-lg p-6 relative overflow-hidden group"
            >
              {/* Product Images Collage */}
              <div className="grid grid-cols-3 gap-2 mb-6">
                {/* Thermal Bottles */}
                <div className="col-span-2 row-span-2 bg-white rounded p-2 flex items-center justify-center">
                  <div className="w-full h-full bg-gradient-to-br from-blue-50 to-blue-100 rounded flex items-center justify-center">
                    <span className="text-xs text-gray-600 font-semibold">BOTTLE</span>
                  </div>
                </div>
                <div className="bg-gray-800 rounded p-2 flex items-center justify-center">
                  <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900 rounded flex items-center justify-center">
                    <span className="text-xs text-white font-semibold">BOTTLE</span>
                  </div>
                </div>

                {/* Calendar */}
                <div className="bg-yellow-50 rounded p-1 flex items-center justify-center">
                  <div className="w-full h-full bg-yellow-100 rounded text-center">
                    <div className="text-[6px] text-gray-700 font-bold">CAL</div>
                  </div>
                </div>

                {/* Notebooks */}
                <div className="bg-white rounded p-1 flex items-center justify-center">
                  <div className="w-full h-full bg-blue-50 rounded"></div>
                </div>
                <div className="bg-amber-50 rounded p-1 flex items-center justify-center">
                  <div className="w-full h-full bg-amber-100 rounded"></div>
                </div>

                {/* Stamps */}
                <div className="bg-red-100 rounded p-1 flex items-center justify-center">
                  <div className="w-full h-full bg-red-200 rounded"></div>
                </div>
                <div className="bg-gray-800 rounded p-1 flex items-center justify-center">
                  <div className="w-full h-full bg-gray-900 rounded"></div>
                </div>

                {/* Box */}
                <div className="col-span-2 bg-white rounded p-1 flex items-center justify-center">
                  <div className="w-full h-full bg-gray-50 rounded text-center">
                    <div className="text-[5px] text-gray-600 font-semibold px-1">BOX</div>
                  </div>
                </div>
              </div>

              {/* See More Deals Button */}
              <Link
                href="/products?featured=true"
                className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-3 rounded-lg font-medium transition-colors"
              >
                See more deals
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
