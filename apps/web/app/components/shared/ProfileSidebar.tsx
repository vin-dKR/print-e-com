"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function ProfileSidebar() {
  const pathname = usePathname();

  const tabs = [
    { id: "overview", label: "Overview", href: "/profile" },
    { id: "orders", label: "My Orders", href: "/orders" },
    { id: "addresses", label: "Saved Addresses", href: "/addresses" },
    { id: "settings", label: "Settings", href: "/settings" },
  ];

  const isActive = (href: string) => {
    if (href === "/profile") {
      return pathname === "/profile";
    }
    return pathname.startsWith(href);
  };

  return (
    <aside className="w-full lg:w-64 shrink-0">
      {/* Primary Navigation */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <nav className="p-2">
          {tabs.map((tab) => {
            const active = isActive(tab.href);
            return (
              <Link
                key={tab.id}
                href={tab.href}
                className={`block px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                  active
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
