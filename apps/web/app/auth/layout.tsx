"use client";

import { AuthProvider } from "../../contexts/AuthContext";
import { ProductConfigProvider } from "@/contexts/ProductConfigContext";
import { CartProvider } from "@/contexts/CartContext";
import { ToastProvider } from "../components/providers/toast-provider";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ToastProvider>
            <AuthProvider>
                <CartProvider>
                    <ProductConfigProvider>
                        {children}
                    </ProductConfigProvider>
                </CartProvider>
            </AuthProvider>
        </ToastProvider>
    );
}

