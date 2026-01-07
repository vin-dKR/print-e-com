import type { Metadata } from "next";
import "./globals.css";
import Header from "./components/shared/Header";
import Footer from "./components/shared/Footer";
import { AuthProvider } from "../contexts/AuthContext";
import { ProductConfigProvider } from "@/contexts/ProductConfigContext";
import { CartProvider } from "@/contexts/CartContext";

export const metadata: Metadata = {
    title: "PAGZ - Custom Printing Solutions",
    description: "Your trusted partner for custom printing solutions. Quality products, fast delivery.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`flex flex-col min-h-screen font-hkgr`}>
                <AuthProvider>
                    <CartProvider>
                        <ProductConfigProvider>
                            <Header />
                            <main className="flex-1 bg-white">
                                {children}
                            </main>
                            <Footer />
                        </ProductConfigProvider>
                    </CartProvider>
                </AuthProvider>
            </body>
        </html>
    );
}
