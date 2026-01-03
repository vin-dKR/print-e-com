import Image from "next/image";
import LoginIllustration from "../LoginIllustration";
import SocialLoginButton from "../SocialLoginButton";

interface AuthLayoutProps {
    children: React.ReactNode;
    title: string;
    subtitle?: string;
    socialLogin?: boolean;
    onGoogleAuth?: () => void;
    onFacebookAuth?: () => void;
    error?: string | null;
}

export default function AuthLayout({
    children,
    title,
    subtitle,
    socialLogin = true,
    onGoogleAuth,
    onFacebookAuth,
    error
}: AuthLayoutProps) {
    return (
        <div className="bg-white flex items-center justify-center px-1 md:px-6 pt-0 mb-20 md:pb-40">
            <div className="bg-[#F4F4F4] w-full rounded-2xl overflow-hidden">
                <div className="flex flex-col lg:flex-row min-h-[600px] md:min-h-[700px]">
                    {/* Left Side - Illustration - Hidden on mobile */}
                    <div className="hidden lg:flex lg:w-1/2 p-6 md:p-8 lg:p-12 items-center justify-center">
                        <div className="w-full max-w-lg mx-auto">
                            <div className="relative w-full aspect-square lg:aspect-[4/3] max-h-[500px] flex items-center justify-center">
                                <Image
                                    src="/images/auth-illustration.svg"
                                    alt="Authentication illustration showing secure login"
                                    fill
                                    className="object-contain"
                                    sizes="(max-width: 768px) 90vw, 40vw"
                                    priority
                                />
                            </div>
                            {/* Optional decorative elements */}
                            <div className="mt-8 text-center">
                                <h3 className="text-xl font-semibold text-gray-800 mb-2">Welcome to PrintEcom</h3>
                                <p className="text-gray-600 max-w-md mx-auto">
                                    Create custom designs and bring your imagination to life
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Form - Full width on mobile, half on desktop */}
                    <div className="w-full lg:w-1/2 p-6 md:p-8 lg:p-12 flex items-center justify-center bg-[#F4F4F4]">
                        <div className="w-full max-w-md bg-white p-6 md:p-8 rounded-xl shadow-sm">
                            {/* Header */}
                            <div className="text-center mb-8">
                                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{title}</h1>
                                {subtitle && <h2 className="text-lg text-gray-600">{subtitle}</h2>}
                            </div>

                            {/* Social Login Buttons */}
                            {socialLogin && onGoogleAuth && onFacebookAuth && (
                                <>
                                    <div className="space-y-3 mb-6">
                                        <SocialLoginButton provider="google" onClick={onGoogleAuth} />
                                        <SocialLoginButton provider="facebook" onClick={onFacebookAuth} />
                                    </div>

                                    {/* Separator */}
                                    <div className="relative mb-6">
                                        <div className="absolute inset-0 flex items-center">
                                            <div className="w-full border-t border-gray-300"></div>
                                        </div>
                                        <div className="relative flex justify-center text-sm">
                                            <span className="px-4 bg-white text-gray-500">OR</span>
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Error Message */}
                            {error && (
                                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                                    {error}
                                </div>
                            )}

                            {/* Form Content */}
                            <div className="space-y-4">
                                {children}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
