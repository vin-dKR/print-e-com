"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../contexts/AuthContext";

/**
 * AuthGuard Component
 * Redirects authenticated users away from auth pages (login/signup)
 * to prevent logged-in users from accessing authentication pages
 */
export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const { isAuthenticated, loading } = useAuth();

    useEffect(() => {
        // Wait for auth state to be determined
        if (loading) return;

        // If user is authenticated, redirect to home
        if (isAuthenticated) {
            router.replace("/home");
        }
    }, [isAuthenticated, loading, router]);

    // Show loading state while checking authentication
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    // Don't render children if user is authenticated (will redirect)
    if (isAuthenticated) {
        return null;
    }

    return <>{children}</>;
}

