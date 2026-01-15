"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/components/ThemeProvider";
import { supabase } from "@/lib/supabase";

/**
 * MULTI-STEP PROFILE SETUP PAGE
 * 
 * Steps:
 * 1. Personal Info (Photo, Name)
 * 2. Professional Info (Specialty, License)
 * 3. Practice Info (Clinic name, Address)
 */

// Specialty options
const specialties = [
    "General Practice",
    "Internal Medicine",
    "Pediatrics",
    "Cardiology",
    "Dermatology",
    "Neurology",
    "Orthopedics",
    "Psychiatry",
    "Surgery",
    "Other",
];

interface ProfileData {
    photo: string | null;
    fullName: string;
    specialty: string;
    licenseNumber: string;
    clinicName: string;
    clinicAddress: string;
    clinicPhone: string;
}

export default function SetupPage() {
    const router = useRouter();
    const { theme, toggleTheme } = useTheme();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [profile, setProfile] = useState<ProfileData>({
        photo: null,
        fullName: "",
        specialty: "",
        licenseNumber: "",
        clinicName: "",
        clinicAddress: "",
        clinicPhone: "",
    });

    // Check authentication on mount
    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            // Not authenticated, redirect to login
            router.push("/");
            return;
        }

        // Check if profile already exists
        const { data: existingProfile } = await supabase
            .from('doctor_profiles')
            .select('id')
            .eq('user_id', user.id)
            .single();

        if (existingProfile) {
            // Profile already exists, redirect to dashboard
            router.push("/dashboard");
            return;
        }

        // Get user's name from auth metadata
        if (user.user_metadata?.full_name) {
            setProfile(prev => ({ ...prev, fullName: user.user_metadata.full_name }));
        }

        setIsLoading(false);
    };

    // Handle photo upload
    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfile((prev) => ({ ...prev, photo: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    // Handle input change
    const handleChange = (field: keyof ProfileData, value: string) => {
        setProfile((prev) => ({ ...prev, [field]: value }));
    };

    // Next step
    const handleNext = () => {
        if (step < 3) {
            setStep(step + 1);
        } else {
            handleComplete();
        }
    };

    // Previous step
    const handleBack = () => {
        if (step > 1) {
            setStep(step - 1);
        }
    };

    // Complete setup
    const handleComplete = async () => {
        setIsSubmitting(true);

        try {
            // Get current user
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                alert("Authentication error. Please log in again.");
                router.push("/");
                return;
            }

            // Save doctor profile to database
            const { error } = await supabase
                .from('doctor_profiles')
                .insert([{
                    user_id: user.id,
                    photo_url: profile.photo, // Base64 for now, can upload to storage later
                    full_name: profile.fullName,
                    specialty: profile.specialty,
                    license_number: profile.licenseNumber || null,
                    clinic_name: profile.clinicName || null,
                    clinic_address: profile.clinicAddress || null,
                    clinic_phone: profile.clinicPhone || null,
                }]);

            if (error) {
                console.error('Error saving profile:', error);
                alert(`Failed to save profile: ${error.message}`);
                setIsSubmitting(false);
                return;
            }

            // Success! Redirect to dashboard
            router.push("/dashboard");
        } catch (error) {
            console.error('Error:', error);
            alert("An error occurred. Please try again.");
            setIsSubmitting(false);
        }
    };

    // Check if current step is valid
    const isStepValid = () => {
        switch (step) {
            case 1:
                return profile.fullName.trim().length >= 2;
            case 2:
                return profile.specialty !== "";
            case 3:
                return true; // Optional step
            default:
                return false;
        }
    };

    // Show loading state while checking auth
    if (isLoading) {
        return (
            <div
                className="min-h-screen flex items-center justify-center"
                style={{ background: "var(--gradient-hero)" }}
            >
                <div className="text-center">
                    <div className="w-16 h-16 rounded-full mx-auto mb-4" style={{ background: "var(--gradient-primary)" }}>
                        <svg className="w-16 h-16 animate-spin" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4" />
                            <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                    </div>
                    <p style={{ color: "var(--foreground)" }}>Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div
            className="min-h-screen flex items-center justify-center py-12"
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

            <div className="w-full max-w-lg px-6">
                <div
                    className="p-8 rounded-2xl"
                    style={{
                        background: "var(--card-bg)",
                        border: "1px solid var(--card-border)",
                        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
                    }}
                >
                    {/* Progress Steps */}
                    <div className="flex items-center justify-center gap-2 mb-8">
                        {[1, 2, 3].map((s) => (
                            <div key={s} className="flex items-center">
                                <div
                                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all"
                                    style={{
                                        background: s <= step ? "var(--gradient-primary)" : "var(--background-secondary)",
                                        color: s <= step ? "white" : "var(--muted)",
                                    }}
                                >
                                    {s < step ? (
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                    ) : (
                                        s
                                    )}
                                </div>
                                {s < 3 && (
                                    <div
                                        className="w-12 h-0.5 mx-1"
                                        style={{
                                            background: s < step ? "var(--primary)" : "var(--card-border)",
                                        }}
                                    />
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Step 1: Personal Info */}
                    {step === 1 && (
                        <div className="animate-fade-in">
                            <div className="text-center mb-6">
                                <h1
                                    className="text-2xl font-bold mb-2"
                                    style={{ color: "var(--foreground)" }}
                                >
                                    Welcome to Tabibn
                                </h1>
                                <p style={{ color: "var(--muted)" }}>
                                    Let&apos;s set up your profile
                                </p>
                            </div>

                            {/* Photo Upload */}
                            <div className="flex justify-center mb-6">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handlePhotoChange}
                                />
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-28 h-28 rounded-full flex items-center justify-center overflow-hidden transition-all hover:opacity-80"
                                    style={{
                                        background: profile.photo ? "transparent" : "var(--primary-subtle)",
                                        border: `2px dashed ${profile.photo ? "transparent" : "var(--primary)"}`,
                                    }}
                                >
                                    {profile.photo ? (
                                        <img
                                            src={profile.photo}
                                            alt="Profile"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="text-center">
                                            <svg
                                                className="mx-auto mb-1"
                                                width="32"
                                                height="32"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="var(--primary)"
                                                strokeWidth="1.5"
                                            >
                                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                                <circle cx="12" cy="7" r="4" />
                                            </svg>
                                            <span className="text-xs" style={{ color: "var(--primary)" }}>
                                                Add Photo
                                            </span>
                                        </div>
                                    )}
                                </button>
                            </div>

                            {/* Name Input */}
                            <div>
                                <label
                                    className="block text-sm font-medium mb-2"
                                    style={{ color: "var(--foreground)" }}
                                >
                                    Full Name <span style={{ color: "var(--accent-danger)" }}>*</span>
                                </label>
                                <input
                                    type="text"
                                    value={profile.fullName}
                                    onChange={(e) => handleChange("fullName", e.target.value)}
                                    placeholder="Dr. John Smith"
                                    className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                                    style={{
                                        background: "var(--input-bg)",
                                        border: "1px solid var(--input-border)",
                                        color: "var(--foreground)",
                                    }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Step 2: Professional Info */}
                    {step === 2 && (
                        <div className="animate-fade-in">
                            <div className="text-center mb-6">
                                <h1
                                    className="text-2xl font-bold mb-2"
                                    style={{ color: "var(--foreground)" }}
                                >
                                    Professional Details
                                </h1>
                                <p style={{ color: "var(--muted)" }}>
                                    Tell us about your practice
                                </p>
                            </div>

                            <div className="space-y-4">
                                {/* Specialty */}
                                <div>
                                    <label
                                        className="block text-sm font-medium mb-2"
                                        style={{ color: "var(--foreground)" }}
                                    >
                                        Specialty <span style={{ color: "var(--accent-danger)" }}>*</span>
                                    </label>
                                    <select
                                        value={profile.specialty}
                                        onChange={(e) => handleChange("specialty", e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                                        style={{
                                            background: "var(--input-bg)",
                                            border: "1px solid var(--input-border)",
                                            color: profile.specialty ? "var(--foreground)" : "var(--muted)",
                                        }}
                                    >
                                        <option value="">Select your specialty</option>
                                        {specialties.map((s) => (
                                            <option key={s} value={s}>{s}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* License Number */}
                                <div>
                                    <label
                                        className="block text-sm font-medium mb-2"
                                        style={{ color: "var(--foreground)" }}
                                    >
                                        Medical License Number
                                    </label>
                                    <input
                                        type="text"
                                        value={profile.licenseNumber}
                                        onChange={(e) => handleChange("licenseNumber", e.target.value)}
                                        placeholder="Optional"
                                        className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                                        style={{
                                            background: "var(--input-bg)",
                                            border: "1px solid var(--input-border)",
                                            color: "var(--foreground)",
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Practice Info */}
                    {step === 3 && (
                        <div className="animate-fade-in">
                            <div className="text-center mb-6">
                                <h1
                                    className="text-2xl font-bold mb-2"
                                    style={{ color: "var(--foreground)" }}
                                >
                                    Your Practice
                                </h1>
                                <p style={{ color: "var(--muted)" }}>
                                    This information will appear on prescriptions
                                </p>
                            </div>

                            <div className="space-y-4">
                                {/* Clinic Name */}
                                <div>
                                    <label
                                        className="block text-sm font-medium mb-2"
                                        style={{ color: "var(--foreground)" }}
                                    >
                                        Clinic / Hospital Name
                                    </label>
                                    <input
                                        type="text"
                                        value={profile.clinicName}
                                        onChange={(e) => handleChange("clinicName", e.target.value)}
                                        placeholder="City Medical Center"
                                        className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                                        style={{
                                            background: "var(--input-bg)",
                                            border: "1px solid var(--input-border)",
                                            color: "var(--foreground)",
                                        }}
                                    />
                                </div>

                                {/* Clinic Address */}
                                <div>
                                    <label
                                        className="block text-sm font-medium mb-2"
                                        style={{ color: "var(--foreground)" }}
                                    >
                                        Address
                                    </label>
                                    <textarea
                                        value={profile.clinicAddress}
                                        onChange={(e) => handleChange("clinicAddress", e.target.value)}
                                        placeholder="Street address, City, Country"
                                        rows={2}
                                        className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none"
                                        style={{
                                            background: "var(--input-bg)",
                                            border: "1px solid var(--input-border)",
                                            color: "var(--foreground)",
                                        }}
                                    />
                                </div>

                                {/* Clinic Phone */}
                                <div>
                                    <label
                                        className="block text-sm font-medium mb-2"
                                        style={{ color: "var(--foreground)" }}
                                    >
                                        Clinic Phone
                                    </label>
                                    <input
                                        type="tel"
                                        value={profile.clinicPhone}
                                        onChange={(e) => handleChange("clinicPhone", e.target.value)}
                                        placeholder="+93 700 000 000"
                                        className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                                        style={{
                                            background: "var(--input-bg)",
                                            border: "1px solid var(--input-border)",
                                            color: "var(--foreground)",
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex gap-3 mt-8">
                        {step > 1 && (
                            <button
                                onClick={handleBack}
                                className="flex-1 py-3.5 rounded-xl text-sm font-semibold transition-all"
                                style={{
                                    background: "var(--background-secondary)",
                                    color: "var(--foreground)",
                                }}
                            >
                                Back
                            </button>
                        )}
                        <button
                            onClick={handleNext}
                            disabled={!isStepValid() || isSubmitting}
                            className="flex-1 py-3.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
                            style={{
                                background: "var(--gradient-primary)",
                                color: "white",
                            }}
                        >
                            {isSubmitting ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Setting up...
                                </span>
                            ) : step === 3 ? (
                                "Complete Setup"
                            ) : (
                                "Continue"
                            )}
                        </button>
                    </div>

                    {/* Skip for now */}
                    {step === 3 && (
                        <button
                            onClick={() => router.push("/dashboard")}
                            className="w-full mt-3 py-2 text-sm transition-all hover:opacity-80"
                            style={{ color: "var(--muted)" }}
                        >
                            Skip for now
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
