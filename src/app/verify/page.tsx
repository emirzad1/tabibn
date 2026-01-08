"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useTheme } from "@/components/ThemeProvider";

/**
 * OTP VERIFICATION PAGE
 * 
 * BACKEND INTEGRATION NOTES:
 * -------------------------
 * 1. This page receives the phone number via URL query parameter (?phone=...)
 * 2. When the page loads, the backend should have already sent an OTP to this phone number
 * 3. The handleVerify function should:
 *    - Send the entered OTP code to the backend for verification
 *    - On success: Check if user exists
 *      - New user: redirect to /setup for profile creation
 *      - Existing user: redirect to /dashboard
 *    - On failure: show error message and allow retry
 * 4. The handleResend function should:
 *    - Call backend to resend OTP to the same phone number
 *    - Implement rate limiting (e.g., 60 second cooldown)
 * 
 * Current Implementation:
 * - Frontend only, routes to profile setup on any 6-digit code
 * - Replace console.log with actual API calls when backend is ready
 */

export default function OTPVerificationPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const phoneNumber = searchParams.get("phone") || "";
    const { theme } = useTheme();

    const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
    const [error, setError] = useState("");
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Focus first input on mount
    useEffect(() => {
        inputRefs.current[0]?.focus();
    }, []);

    const handleChange = (index: number, value: string) => {
        // Only allow numbers
        if (value && !/^\d$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        setError("");

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        // Handle backspace - move to previous input
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
        if (pastedData) {
            const newOtp = [...otp];
            pastedData.split("").forEach((char, i) => {
                if (i < 6) newOtp[i] = char;
            });
            setOtp(newOtp);
            // Focus last filled input or the next empty one
            const lastIndex = Math.min(pastedData.length, 5);
            inputRefs.current[lastIndex]?.focus();
        }
    };

    const handleVerify = (e: React.FormEvent) => {
        e.preventDefault();
        const otpCode = otp.join("");

        if (otpCode.length !== 6) {
            setError("Please enter the complete 6-digit code");
            return;
        }

        /**
         * TODO: BACKEND INTEGRATION
         * Replace this with actual OTP verification API call:
         * 
         * try {
         *   const response = await verifyOTP(phoneNumber, otpCode);
         *   if (response.success) {
         *     router.push("/dashboard");
         *   } else {
         *     setError("Invalid code. Please try again.");
         *   }
         * } catch (error) {
         *   setError("Verification failed. Please try again.");
         * }
         */

        console.log("Verifying OTP:", otpCode, "for phone:", phoneNumber);
        // Route to profile setup page for new users
        // TODO: Check if user exists - if yes, route to /dashboard instead
        router.push("/setup");
    };

    const handleResend = () => {
        /**
         * TODO: BACKEND INTEGRATION
         * Implement resend OTP functionality:
         * - Call backend to resend OTP
         * - Show success message
         * - Implement cooldown timer (e.g., 60 seconds)
         */
        console.log("Resending OTP to:", phoneNumber);
        alert("OTP resent! (This is a placeholder)");
    };

    const isComplete = otp.every(digit => digit !== "");

    return (
        <main
            className="min-h-screen flex items-center justify-center px-4"
            style={{ backgroundColor: "var(--background)" }}
        >
            {/* Theme Toggle - Top Right Corner */}
            <ThemeToggle />

            {/* OTP Card */}
            <div
                className="w-full max-w-[456px] px-10 py-12 rounded-2xl"
                style={{
                    backgroundColor: "var(--card-bg)",
                    border: "1px solid var(--card-border)",
                    boxShadow: "0 4px 24px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)",
                }}
            >
                {/* Logo - switches based on theme */}
                <div className="flex justify-center mb-10">
                    <img
                        src={theme === "light" ? "/logodark.svg" : "/logolight.svg"}
                        alt="Tabibn Logo"
                        width={396}
                        height={132}
                        className="h-[132px] w-auto"
                    />
                </div>

                {/* Verification Text */}
                <div className="text-center mb-8">
                    <h1
                        className="text-2xl font-semibold mb-2"
                        style={{ color: "var(--foreground)" }}
                    >
                        Verify Your Number
                    </h1>
                    <p
                        className="text-sm"
                        style={{ color: "var(--muted)" }}
                    >
                        Enter the 6-digit code sent to{" "}
                        <span style={{ color: "var(--foreground)" }}>{phoneNumber}</span>
                    </p>
                </div>

                {/* OTP Input Form */}
                <form onSubmit={handleVerify}>
                    <div className="mb-6">
                        <div className="flex justify-center gap-3" onPaste={handlePaste}>
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={(el) => { inputRefs.current[index] = el; }}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleChange(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    className="w-12 h-14 text-center text-xl font-semibold rounded-lg outline-none transition-all duration-200 focus:ring-2 focus:ring-offset-1"
                                    style={{
                                        backgroundColor: "var(--input-bg)",
                                        border: error ? "1px solid #ef4444" : "1px solid var(--input-border)",
                                        color: "var(--foreground)",
                                    }}
                                />
                            ))}
                        </div>
                        {error && (
                            <p className="text-center text-sm mt-3 text-red-500">{error}</p>
                        )}
                    </div>

                    {/* Verify Button */}
                    <button
                        type="submit"
                        disabled={!isComplete}
                        className="w-full py-3 rounded-lg text-sm font-medium transition-all duration-200 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                            backgroundColor: "var(--primary)",
                            color: "var(--background)",
                        }}
                    >
                        Verify
                    </button>
                </form>

                {/* Resend Link */}
                <p
                    className="text-sm text-center mt-6"
                    style={{ color: "var(--muted)" }}
                >
                    Didn&apos;t receive the code?{" "}
                    <button
                        onClick={handleResend}
                        className="underline hover:opacity-80"
                        style={{ color: "var(--foreground)" }}
                    >
                        Resend
                    </button>
                </p>

                {/* Back Link */}
                <button
                    onClick={() => router.back()}
                    className="w-full text-sm text-center mt-4 hover:opacity-80"
                    style={{ color: "var(--muted)" }}
                >
                    ← Back to phone number
                </button>
            </div>
        </main>
    );
}
