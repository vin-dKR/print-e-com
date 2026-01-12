"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";
import Footer from "./Footer";

export default function ConditionalLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const isAuthPage = pathname?.startsWith("/auth");

    return (
        <>
            <Header />
            <main className={`flex-1 bg-white ${!isAuthPage ? "pb-20 md:pb-24 lg:pb-32 xl:pb-40" : ""}`}>
                {children}
            </main>
            {!isAuthPage && <Footer />}
        </>
    );
}

