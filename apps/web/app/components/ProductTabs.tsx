"use client";

import { useState } from "react";

interface Tab {
    id: string;
    label: string;
    content: React.ReactNode;
}

interface ProductTabsProps {
    tabs: Tab[];
}

export default function ProductTabs({ tabs }: ProductTabsProps) {
    const [activeTab, setActiveTab] = useState(tabs[0]?.id || "");

    const activeTabContent = tabs.find((tab) => tab.id === activeTab)?.content;

    return (
        <div className="mt-12">
            {/* Tab Headers */}
            <div className="border-b border-gray-200">
                <div className="flex gap-8">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`pb-4 px-2 font-medium text-sm transition-colors relative ${activeTab === tab.id
                                ? "text-blue-600"
                                : "text-gray-600 hover:text-gray-900"
                                }`}
                        >
                            {tab.label}
                            {activeTab === tab.id && (
                                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#008ECC]"></span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab Content */}
            <div className="mt-8">{activeTabContent}</div>
        </div>
    );
}
