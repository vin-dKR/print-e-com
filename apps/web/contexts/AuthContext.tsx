"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';
import { login as apiLogin, register as apiRegister, getProfile, User } from '../lib/api/auth';
import { setAuthToken, getAuthToken } from '../lib/api-client';
import { ApiError } from '../lib/api-client';
import { setUserCookie, getUserCookie, removeUserCookie } from '../lib/cookies';
import { supabase } from '../lib/supabase';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, name?: string, phone?: string) => Promise<void>;
    logout: () => void;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const isCheckingAuthRef = React.useRef(false);

    // Check if user is authenticated on mount
    useEffect(() => {
        checkAuth();
    }, []);

    // Supabase auth state listener - automatically handles token refresh
    useEffect(() => {
        if (!supabase) return;

        console.log('[AuthContext] Setting up Supabase auth listener');

        // Listen for auth state changes (including automatic token refresh)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                console.log('[AuthContext] Supabase auth event:', event);

                if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                    // Update token when signed in or token is refreshed
                    if (session?.access_token) {
                        console.log('[AuthContext] Updating token from Supabase session');
                        setAuthToken(session.access_token);

                        // Fetch user profile with new token
                        try {
                            const response = await getProfile();
                            if (response.success && response.data) {
                                console.log('[AuthContext] Setting user from Supabase event:', response.data);
                                setUser(response.data);
                                setUserCookie(response.data);
                            }
                        } catch (error) {
                            console.error('[AuthContext] Error fetching profile after token refresh:', error);
                        }
                    }
                } else if (event === 'SIGNED_OUT') {
                    // Clear everything on sign out
                    console.log('[AuthContext] User signed out via Supabase');
                    setAuthToken(undefined);
                    setUser(null);
                    removeUserCookie();
                }
            }
        );

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    // Periodic token refresh - refresh every 50 minutes for Supabase (tokens expire in 1 hour)
    useEffect(() => {
        if (!user) return;

        const refreshInterval = setInterval(async () => {
            console.log('[AuthContext] Periodic token refresh check');

            // If using Supabase, let it handle refresh automatically
            if (supabase) {
                const { data: { session }, error } = await supabase.auth.getSession();
                if (session) {
                    console.log('[AuthContext] Supabase session still valid');
                    // Supabase will auto-refresh when needed
                } else if (error) {
                    console.error('[AuthContext] Error getting Supabase session:', error);
                    await refreshUser();
                }
            } else {
                // Fallback to manual refresh for non-Supabase users
                await refreshUser();
            }
        }, 50 * 60 * 1000); // 50 minutes (refresh before 1-hour expiry)

        return () => clearInterval(refreshInterval);
    }, [user]);

    const checkAuth = async () => {
        // Prevent multiple simultaneous calls
        if (isCheckingAuthRef.current) {
            console.log('[AuthContext] checkAuth already in progress, skipping');
            return;
        }

        isCheckingAuthRef.current = true;
        const token = getAuthToken();
        console.log('[AuthContext] Checking auth, token exists:', !!token);

        // Try to get user from cookie first for faster initial load
        const cachedUser = getUserCookie();
        if (cachedUser && !user) {
            // Only set from cache if user is not already set
            setUser(cachedUser as User);
        }

        if (!token) {
            setLoading(false);
            if (!cachedUser && !user) {
                removeUserCookie();
                setUser(null);
            }
            isCheckingAuthRef.current = false;
            return;
        }

        // Preserve current user state during fetch to prevent flickering
        const currentUser = user || cachedUser;

        try {
            const response = await getProfile();
            console.log('[AuthContext] Profile response:', response);

            if (response.success && response.data) {
                console.log('[AuthContext] Setting user:', response.data);
                setUser(response.data);
                // Store user info in cookie for persistence
                setUserCookie(response.data);
            } else {
                console.log('[AuthContext] Invalid response, clearing token');
                // Invalid token, remove it
                setAuthToken(undefined);
                removeUserCookie();
                setUser(null);
            }
        } catch (error) {
            console.error('[AuthContext] Error fetching profile:', error);

            // Only logout on authentication errors (401), not network errors
            const apiError = error as ApiError;
            if (apiError.statusCode === 401) {
                // Invalid token - clear authentication
                console.log('[AuthContext] 401 error - invalid token, logging out');
                setAuthToken(undefined);
                removeUserCookie();
                setUser(null);
            } else if (apiError.statusCode === 0 || !apiError.statusCode) {
                // Network error - don't logout, keep current user if available
                console.log('[AuthContext] Network error - keeping current user');
                // Preserve user state - don't clear it on network errors
                if (!currentUser) {
                    // No user at all - clear state
                    setUser(null);
                }
            } else {
                // Other errors (500, etc.) - don't logout, might be temporary
                console.log('[AuthContext] API error (non-auth) - keeping user state');
                // Keep user state, error might be temporary
                if (!currentUser) {
                    // No user at all - clear state
                    setUser(null);
                }
            }
        } finally {
            setLoading(false);
            isCheckingAuthRef.current = false;
        }
    };

    const login = useCallback(async (email: string, password: string) => {
        const response = await apiLogin({ email, password });
        console.log('[AuthContext] Login response:', response);

        if (!response.success || !response.data) {
            throw new Error(response.error || response.message || 'Login failed');
        }

        const { user: userData, token } = response.data;
        console.log('[AuthContext] Setting token and user after login:', { userData, hasToken: !!token });
        setAuthToken(token);
        setUser(userData);
        // Store user info in cookie for persistence
        setUserCookie(userData);
    }, []);

    const register = useCallback(async (
        email: string,
        password: string,
        name?: string,
        phone?: string
    ) => {
        const response = await apiRegister({ email, password, name, phone });
        if (!response.success || !response.data) {
            throw new Error(response.error || response.message || 'Registration failed');
        }

        const { user: userData, token } = response.data;

        // Only set token and user if token is provided (auto-login after registration)
        if (token && userData) {
            setAuthToken(token);
            setUser(userData);
            // Store user info in cookie for persistence
            setUserCookie(userData);
        } else if (userData) {
            // User registered but needs email confirmation
            setUser(userData);
            setUserCookie(userData);
        }
    }, []);

    const logout = useCallback(() => {
        setAuthToken(undefined);
        setUser(null);
        removeUserCookie();
    }, []);

    const refreshUser = useCallback(async () => {
        try {
            const response = await getProfile();
            if (response.success && response.data) {
                setUser(response.data);
                // Update user info in cookie
                setUserCookie(response.data);
            } else {
                // Invalid response - check if it's an auth error
                const token = getAuthToken();
                if (!token) {
                    // No token means already logged out
                    return;
                }
                // Invalid token response - logout
                console.log('[AuthContext] Refresh failed - invalid token response');
                setAuthToken(undefined);
                setUser(null);
                removeUserCookie();
            }
        } catch (error) {
            const apiError = error as ApiError;

            // Only logout on authentication errors
            if (apiError.statusCode === 401) {
                console.log('[AuthContext] Refresh failed - 401 error, logging out');
                setAuthToken(undefined);
                setUser(null);
                removeUserCookie();
            } else {
                // Network or other errors - don't logout, might be temporary
                console.log('[AuthContext] Refresh failed - non-auth error, keeping user state:', apiError.message);
                // Keep current user state, don't logout on temporary errors
            }
        }
    }, []);

    // Memoize the context value to ensure React detects changes properly
    const contextValue = useMemo(() => ({
        user,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshUser,
    }), [user, loading, login, register, logout, refreshUser]);

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

