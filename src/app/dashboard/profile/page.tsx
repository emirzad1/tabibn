"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/components/ThemeProvider";
import { supabase } from "@/lib/supabase";
import { useProfile } from "@/contexts/ProfileContext";

export default function ProfilePage() {
    const router = useRouter();
    const { theme } = useTheme();
    const { profile, refreshProfile } = useProfile();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Form States
    const [formData, setFormData] = useState({
        full_name: "",
        specialty: "",
        license_number: "",
        clinic_name: "",
        clinic_address: "",
        clinic_phone: "",
    });

    const [passwordData, setPasswordData] = useState({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    // UI States
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [passwordError, setPasswordError] = useState("");
    const [passwordSuccess, setPasswordSuccess] = useState("");

    // Initialize form with profile data
    useEffect(() => {
        if (profile) {
            setFormData({
                full_name: profile.full_name || "",
                specialty: profile.specialty || "",
                license_number: profile.license_number || "",
                clinic_name: profile.clinic_name || "",
                clinic_address: profile.clinic_address || "",
                clinic_phone: profile.clinic_phone || "",
            });
        }
    }, [profile]);

    const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !profile) return;

        try {
            // Upload to Supabase Storage
            const fileExt = file.name.split('.').pop();
            const fileName = `${profile.user_id}/${Math.random()}.${fileExt}`;
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(fileName, file);

            if (uploadError) throw uploadError;

            // Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(fileName);

            // Update Profile
            const { error: updateError } = await supabase
                .from('doctor_profiles')
                .update({ photo_url: publicUrl })
                .eq('user_id', profile.user_id);

            if (updateError) throw updateError;

            await refreshProfile();
        } catch (error) {
            console.error('Error updating photo:', error);
            alert("Error updating photo");
        }
    };

    const handleSavedProfile = async () => {
        if (!profile) return;
        setIsSaving(true);
        try {
            const { error } = await supabase
                .from('doctor_profiles')
                .update({
                    full_name: formData.full_name,
                    specialty: formData.specialty,
                    license_number: formData.license_number,
                    clinic_name: formData.clinic_name,
                    clinic_address: formData.clinic_address,
                    clinic_phone: formData.clinic_phone,
                    updated_at: new Date().toISOString(),
                })
                .eq('user_id', profile.user_id);

            if (error) throw error;

            await refreshProfile();
            setIsEditing(false);
        } catch (error) {
            console.error('Error saving profile:', error);
            alert("Failed to save changes");
        } finally {
            setIsSaving(false);
        }
    };

    const handleChangePassword = async () => {
        setPasswordError("");
        setPasswordSuccess("");

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPasswordError("New passwords do not match");
            return;
        }

        if (passwordData.newPassword.length < 6) {
            setPasswordError("Password must be at least 6 characters");
            return;
        }

        setIsChangingPassword(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user || !user.email) throw new Error("No user found");

            // Verify old password by signing in
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email: user.email,
                password: passwordData.oldPassword,
            });

            if (signInError) {
                setPasswordError("Incorrect old password");
                return;
            }

            // Update password
            const { error: updateError } = await supabase.auth.updateUser({
                password: passwordData.newPassword
            });

            if (updateError) throw updateError;

            setPasswordSuccess("Password updated successfully");
            setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" });
        } catch (error: any) {
            console.error('Error changing password:', error);
            setPasswordError(error.message || "Failed to update password");
        } finally {
            setIsChangingPassword(false);
        }
    };

    const handleForgotPassword = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user || !user.email) return;

            const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
                redirectTo: `${window.location.origin}/dashboard/profile`,
            });

            if (error) throw error;
            alert(`Password reset email sent to ${user.email}`);
        } catch (error: any) {
            console.error("Reset password error:", error);
            alert("Error sending reset email");
        }
    };

    if (!profile) return null;

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-10">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>Settings</h1>
                <p style={{ color: "var(--muted)" }}>Manage your profile and preferences</p>
            </div>

            {/* Profile Card */}
            <div
                className="rounded-2xl border overflow-hidden"
                style={{
                    backgroundColor: "var(--card-bg)",
                    borderColor: "var(--card-border)",
                }}
            >
                {/* Banner */}
                <div
                    className="h-32 w-full relative"
                    style={{ background: "var(--gradient-primary)" }}
                />

                {/* Profile Info */}
                <div className="px-8 pb-8">
                    <div className="relative flex justify-between items-end -mt-12 mb-6">
                        <div className="relative group">
                            <div
                                className="w-24 h-24 rounded-2xl border-4 overflow-hidden flex items-center justify-center cursor-pointer"
                                style={{
                                    borderColor: "var(--card-bg)",
                                    backgroundColor: "var(--background-secondary)",
                                }}
                                onClick={() => isEditing && fileInputRef.current?.click()}
                            >
                                {profile.photo_url ? (
                                    <img
                                        src={profile.photo_url}
                                        alt="Profile"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <svg
                                        className="w-10 h-10"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.5"
                                        style={{ color: "var(--muted)" }}
                                    >
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                        <circle cx="12" cy="7" r="4" />
                                    </svg>
                                )}
                                {isEditing && (
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                                            <circle cx="12" cy="13" r="4" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handlePhotoChange}
                                disabled={!isEditing}
                            />
                        </div>
                        <button
                            onClick={() => isEditing ? handleSavedProfile() : setIsEditing(true)}
                            disabled={isSaving}
                            className={`px-6 py-2 rounded-xl font-medium transition-all ${isEditing
                                    ? "text-white shadow-lg hover:shadow-xl hover:opacity-90"
                                    : "border hover:bg-gray-50 dark:hover:bg-white/5"
                                }`}
                            style={isEditing ? {
                                background: "var(--gradient-primary)",
                            } : {
                                borderColor: "var(--border)",
                                color: "var(--foreground)",
                            }}
                        >
                            {isSaving ? "Saving..." : isEditing ? "Save Changes" : "Edit Profile"}
                        </button>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Personal Info */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold" style={{ color: "var(--foreground)" }}>Personal Information</h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1" style={{ color: "var(--muted)" }}>Full Name</label>
                                    <input
                                        type="text"
                                        value={formData.full_name}
                                        onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                                        disabled={!isEditing}
                                        className="w-full px-4 py-2 rounded-xl border outline-none disabled:opacity-50"
                                        style={{
                                            backgroundColor: "var(--input-bg)",
                                            borderColor: "var(--input-border)",
                                            color: "var(--foreground)",
                                        }}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1" style={{ color: "var(--muted)" }}>Specialty</label>
                                    <input
                                        type="text"
                                        value={formData.specialty}
                                        onChange={(e) => setFormData(prev => ({ ...prev, specialty: e.target.value }))}
                                        disabled={!isEditing}
                                        placeholder="e.g. Cardiology"
                                        className="w-full px-4 py-2 rounded-xl border outline-none disabled:opacity-50"
                                        style={{
                                            backgroundColor: "var(--input-bg)",
                                            borderColor: "var(--input-border)",
                                            color: "var(--foreground)",
                                        }}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1" style={{ color: "var(--muted)" }}>License Number</label>
                                    <input
                                        type="text"
                                        value={formData.license_number}
                                        onChange={(e) => setFormData(prev => ({ ...prev, license_number: e.target.value }))}
                                        disabled={!isEditing}
                                        className="w-full px-4 py-2 rounded-xl border outline-none disabled:opacity-50"
                                        style={{
                                            backgroundColor: "var(--input-bg)",
                                            borderColor: "var(--input-border)",
                                            color: "var(--foreground)",
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Clinic Info */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold" style={{ color: "var(--foreground)" }}>Clinic Details</h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1" style={{ color: "var(--muted)" }}>Clinic Name</label>
                                    <input
                                        type="text"
                                        value={formData.clinic_name}
                                        onChange={(e) => setFormData(prev => ({ ...prev, clinic_name: e.target.value }))}
                                        disabled={!isEditing}
                                        className="w-full px-4 py-2 rounded-xl border outline-none disabled:opacity-50"
                                        style={{
                                            backgroundColor: "var(--input-bg)",
                                            borderColor: "var(--input-border)",
                                            color: "var(--foreground)",
                                        }}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1" style={{ color: "var(--muted)" }}>Address</label>
                                    <input
                                        type="text"
                                        value={formData.clinic_address}
                                        onChange={(e) => setFormData(prev => ({ ...prev, clinic_address: e.target.value }))}
                                        disabled={!isEditing}
                                        className="w-full px-4 py-2 rounded-xl border outline-none disabled:opacity-50"
                                        style={{
                                            backgroundColor: "var(--input-bg)",
                                            borderColor: "var(--input-border)",
                                            color: "var(--foreground)",
                                        }}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1" style={{ color: "var(--muted)" }}>Phone</label>
                                    <input
                                        type="tel"
                                        value={formData.clinic_phone}
                                        onChange={(e) => setFormData(prev => ({ ...prev, clinic_phone: e.target.value }))}
                                        disabled={!isEditing}
                                        className="w-full px-4 py-2 rounded-xl border outline-none disabled:opacity-50"
                                        style={{
                                            backgroundColor: "var(--input-bg)",
                                            borderColor: "var(--input-border)",
                                            color: "var(--foreground)",
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Account Security */}
            <div
                className="rounded-2xl border p-8"
                style={{
                    backgroundColor: "var(--card-bg)",
                    borderColor: "var(--card-border)",
                }}
            >
                <h3 className="text-lg font-semibold mb-6" style={{ color: "var(--foreground)" }}>Account Security</h3>

                <div className="space-y-6 max-w-md">
                    <div>
                        <h4 className="font-medium mb-4" style={{ color: "var(--foreground)" }}>Change Password</h4>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1" style={{ color: "var(--muted)" }}>Current Password</label>
                                <input
                                    type="password"
                                    value={passwordData.oldPassword}
                                    onChange={(e) => setPasswordData(prev => ({ ...prev, oldPassword: e.target.value }))}
                                    className="w-full px-4 py-2 rounded-xl border outline-none"
                                    style={{
                                        backgroundColor: "var(--input-bg)",
                                        borderColor: "var(--input-border)",
                                        color: "var(--foreground)",
                                    }}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1" style={{ color: "var(--muted)" }}>New Password</label>
                                <input
                                    type="password"
                                    value={passwordData.newPassword}
                                    onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                                    className="w-full px-4 py-2 rounded-xl border outline-none"
                                    style={{
                                        backgroundColor: "var(--input-bg)",
                                        borderColor: "var(--input-border)",
                                        color: "var(--foreground)",
                                    }}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1" style={{ color: "var(--muted)" }}>Confirm New Password</label>
                                <input
                                    type="password"
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                    className="w-full px-4 py-2 rounded-xl border outline-none"
                                    style={{
                                        backgroundColor: "var(--input-bg)",
                                        borderColor: "var(--input-border)",
                                        color: "var(--foreground)",
                                    }}
                                />
                            </div>

                            {passwordError && <p className="text-red-500 text-sm">{passwordError}</p>}
                            {passwordSuccess && <p className="text-green-500 text-sm">{passwordSuccess}</p>}

                            <button
                                onClick={handleChangePassword}
                                disabled={isChangingPassword || !passwordData.oldPassword || !passwordData.newPassword}
                                className="px-6 py-2 rounded-xl font-medium text-white transition-all hover:shadow-lg disabled:opacity-50 disabled:shadow-none"
                                style={{ background: "var(--gradient-primary)" }}
                            >
                                {isChangingPassword ? "Updating..." : "Update Password"}
                            </button>
                        </div>
                    </div>

                    <div className="pt-6 border-t" style={{ borderColor: "var(--border)" }}>
                        <div className="flex justify-between items-center">
                            <div>
                                <h4 className="font-medium" style={{ color: "var(--foreground)" }}>Forgot Password?</h4>
                                <p className="text-sm" style={{ color: "var(--muted)" }}>We'll send you a link to reset it.</p>
                            </div>
                            <button
                                onClick={handleForgotPassword}
                                className="text-sm font-medium hover:underline"
                                style={{ color: "var(--primary)" }}
                            >
                                Send Reset Email
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
