"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/components/ThemeProvider";

/**
 * TABIBN LANDING & AUTH PAGE
 * 
 * Premium design with:
 * - Animated splash screen
 * - Hero section with value proposition
 * - Tabbed authentication (Phone / Email)
 * - Feature highlights
 * - Theme toggle
 */

// Feature highlights
const features = [
  {
    icon: "💊",
    title: "Smart Prescriptions",
    description: "Create professional prescriptions in seconds with drug database",
  },
  {
    icon: "👥",
    title: "Patient Management",
    description: "Complete patient records with visit timeline and history",
  },
  {
    icon: "🔒",
    title: "Secure & Private",
    description: "Your data is encrypted and stored securely",
  },
  {
    icon: "📊",
    title: "Analytics",
    description: "Track your practice with insightful statistics",
  },
];

// Country codes
const countryCodes = [
  { code: "+93", country: "AF", flag: "🇦🇫" },
  { code: "+1", country: "US", flag: "🇺🇸" },
  { code: "+44", country: "UK", flag: "🇬🇧" },
  { code: "+91", country: "IN", flag: "🇮🇳" },
  { code: "+971", country: "AE", flag: "🇦🇪" },
  { code: "+92", country: "PK", flag: "🇵🇰" },
  { code: "+98", country: "IR", flag: "🇮🇷" },
];

export default function LandingPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [showSplash, setShowSplash] = useState(true);
  const [authTab, setAuthTab] = useState<"phone" | "email">("phone");
  const [countryCode, setCountryCode] = useState("+93");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Splash screen timer
  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  // Handle phone auth
  const handlePhoneAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.trim()) return;
    setIsLoading(true);
    // TODO: Send OTP via API
    await new Promise(r => setTimeout(r, 800));
    router.push(`/verify?phone=${encodeURIComponent(countryCode + phoneNumber)}`);
  };

  // Handle email auth
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    setIsLoading(true);
    // TODO: Authenticate via API
    await new Promise(r => setTimeout(r, 800));
    router.push("/dashboard");
  };

  // Splash Screen
  if (showSplash) {
    return (
      <div
        className="fixed inset-0 flex items-center justify-center"
        style={{ background: "var(--gradient-hero)" }}
      >
        <div className="text-center animate-scale-in">
          {/* Logo */}
          <div
            className="w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-6"
            style={{
              background: "var(--gradient-primary)",
              boxShadow: "0 8px 32px rgba(13, 148, 136, 0.3)",
            }}
          >
            <svg
              viewBox="0 0 24 24"
              className="w-12 h-12"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </div>

          {/* Brand Name */}
          <h1
            className="text-4xl font-bold mb-2"
            style={{ color: "var(--foreground)" }}
          >
            Tabibn
          </h1>
          <p
            className="text-lg"
            style={{ color: "var(--muted)" }}
          >
            Medical Practice Platform
          </p>

          {/* Loading Indicator */}
          <div className="mt-8 flex items-center justify-center gap-2">
            <div
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ background: "var(--primary)", animationDelay: "0s" }}
            />
            <div
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ background: "var(--primary)", animationDelay: "0.2s" }}
            />
            <div
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ background: "var(--primary)", animationDelay: "0.4s" }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
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
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </svg>
        )}
      </button>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[calc(100vh-6rem)]">
          {/* Left: Hero Content */}
          <div className="animate-slide-up">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-8">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: "var(--gradient-primary)" }}
              >
                <svg
                  viewBox="0 0 24 24"
                  className="w-6 h-6"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
              </div>
              <span
                className="text-2xl font-bold"
                style={{ color: "var(--foreground)" }}
              >
                Tabibn
              </span>
            </div>

            {/* Headline */}
            <h1
              className="text-4xl lg:text-5xl font-bold leading-tight mb-4"
              style={{ color: "var(--foreground)" }}
            >
              Modern Prescriptions,{" "}
              <span style={{ color: "var(--primary)" }}>Effortless Care</span>
            </h1>

            <p
              className="text-lg mb-8 max-w-md"
              style={{ color: "var(--muted)" }}
            >
              The complete medical practice platform. Create prescriptions, manage patients,
              and streamline your workflow — all in one place.
            </p>

            {/* Features Grid */}
            <div className="grid grid-cols-2 gap-4">
              {features.map((feature, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl animate-fade-in"
                  style={{
                    background: "var(--card-bg)",
                    border: "1px solid var(--card-border)",
                    animationDelay: `${0.2 + idx * 0.1}s`,
                    opacity: 0,
                  }}
                >
                  <span className="text-2xl mb-2 block">{feature.icon}</span>
                  <h3
                    className="font-semibold mb-1"
                    style={{ color: "var(--foreground)" }}
                  >
                    {feature.title}
                  </h3>
                  <p
                    className="text-xs"
                    style={{ color: "var(--muted)" }}
                  >
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Auth Card */}
          <div className="animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <div
              className="max-w-md mx-auto p-8 rounded-2xl"
              style={{
                background: "var(--card-bg)",
                border: "1px solid var(--card-border)",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
              }}
            >
              <h2
                className="text-2xl font-bold text-center mb-2"
                style={{ color: "var(--foreground)" }}
              >
                Get Started
              </h2>
              <p
                className="text-center mb-6"
                style={{ color: "var(--muted)" }}
              >
                Sign in or create an account
              </p>

              {/* Auth Tabs */}
              <div
                className="flex rounded-xl p-1 mb-6"
                style={{ background: "var(--background-secondary)" }}
              >
                <button
                  onClick={() => setAuthTab("phone")}
                  className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-all"
                  style={{
                    background: authTab === "phone" ? "var(--card-bg)" : "transparent",
                    color: authTab === "phone" ? "var(--foreground)" : "var(--muted)",
                    boxShadow: authTab === "phone" ? "var(--card-shadow)" : "none",
                  }}
                >
                  📱 Phone
                </button>
                <button
                  onClick={() => setAuthTab("email")}
                  className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-all"
                  style={{
                    background: authTab === "email" ? "var(--card-bg)" : "transparent",
                    color: authTab === "email" ? "var(--foreground)" : "var(--muted)",
                    boxShadow: authTab === "email" ? "var(--card-shadow)" : "none",
                  }}
                >
                  ✉️ Email
                </button>
              </div>

              {/* Phone Auth Form */}
              {authTab === "phone" && (
                <form onSubmit={handlePhoneAuth} className="space-y-4">
                  <div>
                    <label
                      className="block text-sm font-medium mb-2"
                      style={{ color: "var(--foreground)" }}
                    >
                      Phone Number
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        className="px-3 py-3 rounded-xl text-sm outline-none"
                        style={{
                          background: "var(--input-bg)",
                          border: "1px solid var(--input-border)",
                          color: "var(--foreground)",
                          width: "100px",
                        }}
                      >
                        {countryCodes.map((c) => (
                          <option key={c.code} value={c.code}>
                            {c.flag} {c.code}
                          </option>
                        ))}
                      </select>
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
                        placeholder="700 123 456"
                        className="flex-1 px-4 py-3 rounded-xl text-sm outline-none"
                        style={{
                          background: "var(--input-bg)",
                          border: "1px solid var(--input-border)",
                          color: "var(--foreground)",
                        }}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={!phoneNumber.trim() || isLoading}
                    className="w-full py-3.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
                    style={{
                      background: "var(--gradient-primary)",
                      color: "white",
                    }}
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Sending OTP...
                      </span>
                    ) : (
                      "Continue with Phone"
                    )}
                  </button>
                </form>
              )}

              {/* Email Auth Form */}
              {authTab === "email" && (
                <form onSubmit={handleEmailAuth} className="space-y-4">
                  <div>
                    <label
                      className="block text-sm font-medium mb-2"
                      style={{ color: "var(--foreground)" }}
                    >
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="doctor@example.com"
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                      style={{
                        background: "var(--input-bg)",
                        border: "1px solid var(--input-border)",
                        color: "var(--foreground)",
                      }}
                    />
                  </div>

                  <div>
                    <label
                      className="block text-sm font-medium mb-2"
                      style={{ color: "var(--foreground)" }}
                    >
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-4 py-3 pr-12 rounded-xl text-sm outline-none"
                        style={{
                          background: "var(--input-bg)",
                          border: "1px solid var(--input-border)",
                          color: "var(--foreground)",
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                        style={{ color: "var(--muted)" }}
                      >
                        {showPassword ? (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                            <line x1="1" y1="1" x2="23" y2="23" />
                          </svg>
                        ) : (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={!email.trim() || !password.trim() || isLoading}
                    className="w-full py-3.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
                    style={{
                      background: "var(--gradient-primary)",
                      color: "white",
                    }}
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Signing in...
                      </span>
                    ) : (
                      "Continue with Email"
                    )}
                  </button>
                </form>
              )}

              {/* Divider */}
              <div className="flex items-center gap-4 my-6">
                <div className="flex-1 h-px" style={{ background: "var(--card-border)" }} />
                <span className="text-xs" style={{ color: "var(--muted)" }}>or</span>
                <div className="flex-1 h-px" style={{ background: "var(--card-border)" }} />
              </div>

              {/* Google Sign In */}
              <button
                onClick={() => alert("Google OAuth coming soon!")}
                className="w-full flex items-center justify-center gap-3 py-3 rounded-xl text-sm font-medium transition-all hover:opacity-80"
                style={{
                  background: "var(--input-bg)",
                  border: "1px solid var(--input-border)",
                  color: "var(--foreground)",
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </button>

              {/* Terms */}
              <p
                className="text-xs text-center mt-6"
                style={{ color: "var(--muted)" }}
              >
                By continuing, you agree to our{" "}
                <a href="#" className="underline">Terms of Service</a> and{" "}
                <a href="#" className="underline">Privacy Policy</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
