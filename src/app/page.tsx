"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useTheme } from "@/components/ThemeProvider";

/**
 * PHONE AUTHENTICATION PAGE
 * 
 * BACKEND INTEGRATION NOTES:
 * -------------------------
 * 1. When user clicks "Continue" with a valid phone number:
 *    - Send phone number to backend to initiate OTP
 *    - Backend should send SMS with OTP code
 *    - On success: redirect to /verify page
 *    - On failure: show error message
 * 
 * Current Implementation:
 * - Frontend only, accepts any valid phone number (digits only)
 * - Routes directly to /verify page without backend call
 * - Replace console.log with actual API call when backend is ready
 */

export default function AuthPage() {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryCode, setCountryCode] = useState("+93");
  const { theme } = useTheme();

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate: only proceed if phone number contains only digits and is not empty
    if (!phoneNumber || !/^\d+$/.test(phoneNumber)) {
      return; // Do nothing if invalid
    }

    const fullPhoneNumber = countryCode + phoneNumber;

    /**
     * TODO: BACKEND INTEGRATION
     * Replace this with actual API call to send OTP:
     * 
     * try {
     *   const response = await sendOTP(fullPhoneNumber);
     *   if (response.success) {
     *     router.push(`/verify?phone=${encodeURIComponent(fullPhoneNumber)}`);
     *   } else {
     *     setError("Failed to send OTP. Please try again.");
     *   }
     * } catch (error) {
     *   setError("Something went wrong. Please try again.");
     * }
     */

    console.log("Sending OTP to:", fullPhoneNumber);
    // Route to OTP verification page with phone number
    router.push(`/verify?phone=${encodeURIComponent(fullPhoneNumber)}`);
  };

  return (
    <main
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: "var(--background)" }}
    >
      {/* Theme Toggle - Top Right Corner */}
      <ThemeToggle />

      {/* Auth Card */}
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

        {/* Welcome Text */}
        <div className="text-center mb-8">
          <h1
            className="text-2xl font-semibold mb-2"
            style={{ color: "var(--foreground)" }}
          >
            Welcome
          </h1>
          <p
            className="text-sm"
            style={{ color: "var(--muted)" }}
          >
            Enter your phone number to continue
          </p>
        </div>

        {/* Phone Input Form */}
        <form onSubmit={handleContinue}>
          <div className="mb-6">
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: "var(--foreground)" }}
            >
              Phone Number
            </label>
            <div className="flex gap-2">
              {/* Country Code Selector */}
              <select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className="w-24 px-3 py-3 rounded-lg text-sm outline-none transition-all duration-200"
                style={{
                  backgroundColor: "var(--input-bg)",
                  border: "1px solid var(--input-border)",
                  color: "var(--foreground)",
                }}
              >
                <option value="+93">+93</option>
                <option value="+1">+1</option>
                <option value="+44">+44</option>
                <option value="+91">+91</option>
                <option value="+971">+971</option>
                <option value="+92">+92</option>
              </select>

              {/* Phone Number Input */}
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
                placeholder="Phone number"
                className="flex-1 px-4 py-3 rounded-lg text-sm outline-none transition-all duration-200"
                style={{
                  backgroundColor: "var(--input-bg)",
                  border: "1px solid var(--input-border)",
                  color: "var(--foreground)",
                }}
                required
              />
            </div>
          </div>

          {/* Continue Button */}
          <button
            type="submit"
            className="w-full py-3 rounded-lg text-sm font-medium transition-all duration-200 hover:opacity-90"
            style={{
              backgroundColor: "var(--primary)",
              color: "var(--background)",
            }}
          >
            Continue
          </button>
        </form>

        {/* Terms Text */}
        <p
          className="text-xs text-center mt-6 leading-relaxed"
          style={{ color: "var(--muted)" }}
        >
          By continuing, you agree to our{" "}
          <a href="#" className="underline hover:opacity-80">Terms of Service</a>
          {" "}and{" "}
          <a href="#" className="underline hover:opacity-80">Privacy Policy</a>
        </p>
      </div>
    </main>
  );
}
