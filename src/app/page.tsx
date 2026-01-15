"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTheme } from "@/components/ThemeProvider";
import { supabase } from "@/lib/supabase";

/**
 * TABIBN LANDING & AUTH PAGE
 * 
 * Redesigned authentication flow:
 * - Default: Sign In form (email/phone + password)
 * - Create Account: Separate flow with Phone/Email choice
 * - OTP: Only used for phone registration
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
  { code: "+90", country: "TR", flag: "🇹🇷" },
];

export default function LandingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { theme, toggleTheme } = useTheme();

  const [showSplash, setShowSplash] = useState(true);
  const [authView, setAuthView] = useState<"signin" | "create">("signin");
  const [signupMethod, setSignupMethod] = useState<"phone" | "email" | null>(null);

  // Form states
  const [identifier, setIdentifier] = useState(""); // email or phone for sign in
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [countryCode, setCountryCode] = useState("+93");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verifiedPhone, setVerifiedPhone] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Splash screen timer
  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  // Check for verified phone from OTP page
  useEffect(() => {
    const phone = searchParams.get("verified_phone");
    if (phone) {
      setVerifiedPhone(phone);
      setAuthView("create");
      setSignupMethod("phone");
    }
  }, [searchParams]);

  // Detect if identifier is email or phone
  const isEmail = (str: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);

  // Handle Sign In
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password.trim()) return;

    setIsLoading(true);

    try {
      let authData;

      if (isEmail(identifier)) {
        // Sign in with email
        const { data, error } = await supabase.auth.signInWithPassword({
          email: identifier,
          password,
        });
        authData = data;
        if (error) throw error;
      } else {
        // Sign in with phone
        const { data, error } = await supabase.auth.signInWithPassword({
          phone: identifier,
          password,
        });
        authData = data;
        if (error) throw error;
      }

      // Check if user has completed profile setup
      if (authData.user) {
        const { data: profile } = await supabase
          .from('doctor_profiles')
          .select('id')
          .eq('user_id', authData.user.id)
          .single();

        // Redirect to setup if profile doesn't exist, otherwise to dashboard
        router.push(profile ? "/dashboard" : "/setup");
      }
    } catch (error: any) {
      console.error("Sign in error:", error);
      alert(`Sign in failed: ${error.message}`);
      setIsLoading(false);
    }
  };

  // Handle Phone OTP Send
  const handleSendPhoneOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.trim()) return;

    setIsLoading(true);
    const fullPhone = countryCode + phoneNumber.replace(/\D/g, "");

    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: fullPhone
      });

      if (error) throw error;

      router.push(`/verify?phone=${encodeURIComponent(fullPhone)}&mode=signup`);
    } catch (error: any) {
      console.error("OTP Error:", error);
      alert(`Failed to send code: ${error.message}`);
      setIsLoading(false);
    }
  };

  // Handle Email Signup
  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) return;

    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
          emailRedirectTo: undefined,
        }
      });

      if (error) throw error;

      // Redirect to setup page to complete profile
      if (data.user) {
        router.push("/setup");
      }
    } catch (error: any) {
      console.error("Signup error:", error);
      alert(`Signup failed: ${error.message}`);
      setIsLoading(false);
    }
  };

  // Handle Phone Signup (after OTP verification)
  const handlePhoneSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !password.trim() || !verifiedPhone) return;

    setIsLoading(true);

    try {
      // User is already logged in from Verify step
      // We just need to set the password and name
      const { data, error } = await supabase.auth.updateUser({
        password: password,
        data: {
          full_name: name,
        },
      });

      if (error) throw error;

      // Redirect to setup page to complete profile
      if (data.user) {
        router.push("/setup");
      }
    } catch (error: any) {
      console.error("Signup error:", error);
      alert(`Signup failed: ${error.message}`);
      setIsLoading(false);
    }
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
              {/* SIGN IN VIEW */}
              {authView === "signin" && (
                <>
                  <h2
                    className="text-2xl font-bold text-center mb-2"
                    style={{ color: "var(--foreground)" }}
                  >
                    Sign In
                  </h2>
                  <p
                    className="text-center mb-6"
                    style={{ color: "var(--muted)" }}
                  >
                    Welcome back to Tabibn
                  </p>

                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div>
                      <label
                        className="block text-sm font-medium mb-2"
                        style={{ color: "var(--foreground)" }}
                      >
                        Email or Phone
                      </label>
                      <input
                        type="text"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        placeholder="doctor@example.com or +93700123456"
                        className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                        style={{
                          background: "var(--input-bg)",
                          border: "1px solid var(--input-border)",
                          color: "var(--foreground)",
                        }}
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label
                          className="block text-sm font-medium"
                          style={{ color: "var(--foreground)" }}
                        >
                          Password
                        </label>
                        <a
                          href="#"
                          className="text-xs font-medium hover:underline"
                          style={{ color: "var(--primary)" }}
                          onClick={(e) => {
                            e.preventDefault();
                            alert("Password reset coming soon!");
                          }}
                        >
                          Forgot password?
                        </a>
                      </div>
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
                      disabled={!identifier.trim() || !password.trim() || isLoading}
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
                        "Sign In"
                      )}
                    </button>
                  </form>

                  {/* Divider */}
                  <div className="flex items-center gap-4 my-6">
                    <div className="flex-1 h-px" style={{ background: "var(--card-border)" }} />
                    <span className="text-xs" style={{ color: "var(--muted)" }}>or</span>
                    <div className="flex-1 h-px" style={{ background: "var(--card-border)" }} />
                  </div>

                  {/* Create Account Button */}
                  <button
                    onClick={() => {
                      setAuthView("create");
                      setSignupMethod(null);
                    }}
                    className="w-full py-3 rounded-xl text-sm font-medium transition-all hover:opacity-80"
                    style={{
                      background: "var(--input-bg)",
                      border: "1px solid var(--input-border)",
                      color: "var(--foreground)",
                    }}
                  >
                    Create Account
                  </button>
                </>
              )}

              {/* CREATE ACCOUNT VIEW */}
              {authView === "create" && (
                <>
                  {/* Method Selection */}
                  {!signupMethod && (
                    <>
                      <h2
                        className="text-2xl font-bold text-center mb-2"
                        style={{ color: "var(--foreground)" }}
                      >
                        Create Account
                      </h2>
                      <p
                        className="text-center mb-6"
                        style={{ color: "var(--muted)" }}
                      >
                        How would you like to sign up?
                      </p>

                      <div className="space-y-3">
                        <button
                          onClick={() => setSignupMethod("email")}
                          className="w-full flex items-center gap-3 p-4 rounded-xl text-sm font-medium transition-all hover:opacity-80"
                          style={{
                            background: "var(--input-bg)",
                            border: "1px solid var(--input-border)",
                            color: "var(--foreground)",
                          }}
                        >
                          <span className="text-2xl">✉️</span>
                          <div className="text-left">
                            <div className="font-semibold">Email</div>
                            <div className="text-xs" style={{ color: "var(--muted)" }}>
                              Sign up with your email address
                            </div>
                          </div>
                        </button>

                        <button
                          onClick={() => setSignupMethod("phone")}
                          className="w-full flex items-center gap-3 p-4 rounded-xl text-sm font-medium transition-all hover:opacity-80"
                          style={{
                            background: "var(--input-bg)",
                            border: "1px solid var(--input-border)",
                            color: "var(--foreground)",
                          }}
                        >
                          <span className="text-2xl">📱</span>
                          <div className="text-left">
                            <div className="font-semibold">Phone</div>
                            <div className="text-xs" style={{ color: "var(--muted)" }}>
                              Sign up with your phone number (OTP required)
                            </div>
                          </div>
                        </button>
                      </div>

                      <button
                        onClick={() => setAuthView("signin")}
                        className="w-full mt-6 py-2 text-sm transition-all hover:opacity-80"
                        style={{ color: "var(--muted)" }}
                      >
                        ← Back to Sign In
                      </button>
                    </>
                  )}

                  {/* Email Signup Form */}
                  {signupMethod === "email" && (
                    <>
                      <h2
                        className="text-2xl font-bold text-center mb-2"
                        style={{ color: "var(--foreground)" }}
                      >
                        Sign Up with Email
                      </h2>
                      <p
                        className="text-center mb-6"
                        style={{ color: "var(--muted)" }}
                      >
                        Create your account
                      </p>

                      <form onSubmit={handleEmailSignup} className="space-y-4">
                        <div>
                          <label
                            className="block text-sm font-medium mb-2"
                            style={{ color: "var(--foreground)" }}
                          >
                            Full Name
                          </label>
                          <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Dr. John Smith"
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
                          disabled={!name.trim() || !email.trim() || !password.trim() || isLoading}
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
                              Creating account...
                            </span>
                          ) : (
                            "Create Account"
                          )}
                        </button>
                      </form>

                      <button
                        onClick={() => setSignupMethod(null)}
                        className="w-full mt-4 py-2 text-sm transition-all hover:opacity-80"
                        style={{ color: "var(--muted)" }}
                      >
                        ← Choose different method
                      </button>
                    </>
                  )}

                  {/* Phone Signup Form */}
                  {signupMethod === "phone" && !verifiedPhone && (
                    <>
                      <h2
                        className="text-2xl font-bold text-center mb-2"
                        style={{ color: "var(--foreground)" }}
                      >
                        Sign Up with Phone
                      </h2>
                      <p
                        className="text-center mb-6"
                        style={{ color: "var(--muted)" }}
                      >
                        We'll send you a verification code
                      </p>

                      <form onSubmit={handleSendPhoneOTP} className="space-y-4">
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
                            "Send Verification Code"
                          )}
                        </button>
                      </form>

                      <button
                        onClick={() => setSignupMethod(null)}
                        className="w-full mt-4 py-2 text-sm transition-all hover:opacity-80"
                        style={{ color: "var(--muted)" }}
                      >
                        ← Choose different method
                      </button>
                    </>
                  )}

                  {/* Phone Signup - After OTP Verification */}
                  {signupMethod === "phone" && verifiedPhone && (
                    <>
                      <h2
                        className="text-2xl font-bold text-center mb-2"
                        style={{ color: "var(--foreground)" }}
                      >
                        Complete Your Account
                      </h2>
                      <p
                        className="text-center mb-6"
                        style={{ color: "var(--muted)" }}
                      >
                        Phone verified: {verifiedPhone}
                      </p>

                      <form onSubmit={handlePhoneSignup} className="space-y-4">
                        <div>
                          <label
                            className="block text-sm font-medium mb-2"
                            style={{ color: "var(--foreground)" }}
                          >
                            Full Name
                          </label>
                          <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Dr. John Smith"
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
                          disabled={!name.trim() || !password.trim() || isLoading}
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
                              Creating account...
                            </span>
                          ) : (
                            "Create Account"
                          )}
                        </button>
                      </form>

                      <button
                        onClick={() => {
                          setVerifiedPhone("");
                          setSignupMethod(null);
                        }}
                        className="w-full mt-4 py-2 text-sm transition-all hover:opacity-80"
                        style={{ color: "var(--muted)" }}
                      >
                        ← Start over
                      </button>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
