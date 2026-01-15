"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTheme } from "@/components/ThemeProvider";
import { supabase } from "@/lib/supabase";

/**
 * ENHANCED OTP VERIFICATION PAGE
 * 
 * Premium features:
 * - Auto-focus between inputs
 * - Auto-submit when complete
 * - Paste support
 * - Countdown timer for resend
 * - Error shake animation
 */

function OTPContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const phone = searchParams.get("phone") || "";
    const { theme, toggleTheme } = useTheme();

    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [error, setError] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);
    const [countdown, setCountdown] = useState(60);
    const [canResend, setCanResend] = useState(false);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Countdown timer
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        } else {
            setCanResend(true);
        }
    }, [countdown]);

    // Auto-submit when all digits entered
    useEffect(() => {
        if (otp.every((digit) => digit !== "")) {
            handleVerify();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [otp]);

    // Handle input change
    const handleChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value.slice(-1);
        setOtp(newOtp);
        setError("");

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    // Handle backspace
    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    // Handle paste
    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
        if (pastedData.length === 6) {
            setOtp(pastedData.split(""));
            inputRefs.current[5]?.focus();
        }
    };

    // Verify OTP
    const handleVerify = async () => {
        const code = otp.join("");
        if (code.length !== 6) return;

        setIsVerifying(true);
        setError("");

        try {
            const { error: verifyError } = await supabase.auth.verifyOtp({
                phone: phone,
                token: code,
                type: 'sms'
            });

            if (verifyError) {
                setError(verifyError.message || "Invalid verification code");
                setIsVerifying(false);
                return;
            }

            // Check if this is signup mode
            const mode = searchParams.get("mode");
            if (mode === "signup") {
                // Redirect back to landing page with verified phone
                router.push(`/?verified_phone=${encodeURIComponent(phone)}`);
            } else {
                // Determine destination
                router.push("/dashboard");
            }
        } catch (err) {
            console.error(err);
            setError("Verification failed");
            setIsVerifying(false);
        }
    };

    // Resend OTP
    const handleResend = async () => {
        if (!canResend) return;
        setCanResend(false);
        setCountdown(60);
        setOtp(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();

        try {
            const { error: resendError } = await supabase.auth.signInWithOtp({
                phone: phone
            });
            if (resendError) {
                alert("Failed to resend code: " + resendError.message);
            }
        } catch (err) {
            console.error("Resend error:", err);
        }
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center"
            style={{ background: "var(--gradient-hero)" }}
        >
            {/* Theme Toggle */}
            <button
                onClick={toggleTheme}
                className="fixed top-6 right-6 p-3 rounded-full transition-all hover:scale-110 z-50"
                style={{
                    background: "var(--card-bg)",
                    border: "1px solid var(--card-border)",
                    boxShadow: "var(--card-shadow)",
                }}
            >
                {theme === "light" ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                    </svg>
                ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="5" />
                        <line x1="12" y1="1" x2="12" y2="3" />
                        <line x1="12" y1="21" x2="12" y2="23" />
                    </svg>
                )}
            </button>

            <div className="w-full max-w-md px-6">
                <div
                    className="p-8 rounded-2xl animate-scale-in"
                    style={{
                        background: "var(--card-bg)",
                        border: "1px solid var(--card-border)",
                        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
                    }}
                >
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div
                            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                            style={{ background: "var(--primary-subtle)" }}
                        >
                            <svg
                                width="32"
                                height="32"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="var(--primary)"
                                strokeWidth="2"
                            >
                                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                            </svg>
                        </div>
                        <h1
                            className="text-2xl font-bold mb-2"
                            style={{ color: "var(--foreground)" }}
                        >
                            Verify Your Phone
                        </h1>
                        <p style={{ color: "var(--muted)" }}>
                            We sent a 6-digit code to
                        </p>
                        <p
                            className="font-semibold"
                            style={{ color: "var(--foreground)" }}
                        >
                            {phone || "+93 700 123 456"}
                        </p>
                    </div>

                    {/* OTP Inputs */}
                    <div
                        className={`flex justify-center gap-3 mb-6 ${error ? "animate-shake" : ""}`}
                        onPaste={handlePaste}
                    >
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
                                className="w-12 h-14 text-center text-xl font-bold rounded-xl outline-none transition-all"
                                style={{
                                    background: "var(--input-bg)",
                                    border: `2px solid ${error ? "var(--accent-danger)" : digit ? "var(--primary)" : "var(--input-border)"}`,
                                    color: "var(--foreground)",
                                }}
                            />
                        ))}
                    </div>

                    {/* Error Message */}
                    {error && (
                        <p
                            className="text-center text-sm mb-4"
                            style={{ color: "var(--accent-danger)" }}
                        >
                            {error}
                        </p>
                    )}

                    {/* Verify Button */}
                    <button
                        onClick={handleVerify}
                        disabled={otp.some((d) => !d) || isVerifying}
                        className="w-full py-3.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
                        style={{
                            background: "var(--gradient-primary)",
                            color: "white",
                        }}
                    >
                        {isVerifying ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                Verifying...
                            </span>
                        ) : (
                            "Verify Code"
                        )}
                    </button>

                    {/* Resend Section */}
                    <div className="text-center mt-6">
                        {canResend ? (
                            <button
                                onClick={handleResend}
                                className="text-sm font-medium transition-all hover:opacity-80"
                                style={{ color: "var(--primary)" }}
                            >
                                Resend Code
                            </button>
                        ) : (
                            <p className="text-sm" style={{ color: "var(--muted)" }}>
                                Resend code in{" "}
                                <span style={{ color: "var(--primary)", fontWeight: 600 }}>
                                    {countdown}s
                                </span>
                            </p>
                        )}
                    </div>

                    {/* Back Link */}
                    <button
                        onClick={() => router.push("/")}
                        className="w-full mt-4 py-2 text-sm transition-all hover:opacity-80"
                        style={{ color: "var(--muted)" }}
                    >
                        ← Back to signup
                    </button>
                </div>
            </div>

            {/* Shake Animation CSS */}
            <style jsx>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    20%, 60% { transform: translateX(-8px); }
                    40%, 80% { transform: translateX(8px); }
                }
                .animate-shake {
                    animation: shake 0.4s ease-in-out;
                }
            `}</style>
        </div>
    );
}

export default function VerifyPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--gradient-hero)" }}>
                <div className="animate-pulse text-center">
                    <div className="w-16 h-16 rounded-2xl bg-gray-200 mx-auto mb-4" />
                    <div className="w-48 h-6 bg-gray-200 rounded mx-auto" />
                </div>
            </div>
        }>
            <OTPContent />
        </Suspense>
    );
}
