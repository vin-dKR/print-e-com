"use client";

export default function BrandLogos() {
  const brands = [
    { name: "NIVEA", logo: "/brands/nivea.svg" },
    { name: "Himalaya", subtitle: "SINCE 1930", logo: "/brands/himalaya.svg" },
    { name: "Xiaomi", logo: "/brands/xiaomi.svg" },
    { name: "Bata", logo: "/brands/bata.svg" },
    { name: "WOW", subtitle: "SKIN SCIENCE", logo: "/brands/wow.svg" },
    { name: "mamaearth", logo: "/brands/mamaearth.svg" },
    { name: "WILD STONE", logo: "/brands/wildstone.svg" },
    { name: "pl%m", logo: "/brands/plum.svg" },
  ];

  return (
    <section className="py-8 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex gap-4" style={{ minWidth: "max-content" }}>
            {brands.map((brand, index) => (
              <div
                key={index}
                className="flex-shrink-0 w-48 h-24 bg-gray-100 rounded-lg flex flex-col items-center justify-center p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="text-center">
                  <p className="text-sm font-bold text-gray-900">{brand.name}</p>
                  {brand.subtitle && (
                    <p className="text-xs text-gray-600 mt-1">{brand.subtitle}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
