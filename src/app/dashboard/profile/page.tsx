"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/components/ThemeProvider";

/**
 * PREMIUM PROFILE/SETTINGS PAGE
 * 
 * Sections:
 * - Profile card with photo and info
 * - Practice details
 * - Preferences (theme, etc.)
 * - Account actions
 */

export default function ProfilePage() {
    const router = useRouter();
    const { theme, toggleTheme } = useTheme();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [profile, setProfile] = useState({
        photo: null as string | null,
        name: "Dr. Nawi Safi",
        email: "dr.nawi@clinic.com",
        phone: "+93 700 123 456",
        specialty: "General Practice",
        licenseNumber: "MD-12345",
        clinicName: "Kabul Medical Center",
        clinicAddress: "District 4, Main Road, Kabul",
        clinicPhone: "+93 20 123 4567",
    });

    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({ ...profile });
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setEditData((prev) => ({ ...prev, photo: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = () => {
        setProfile(editData);
        setIsEditing(false);
    };

    const handleLogout = () => {
        router.push("/");
    };

    return (
        <div className="animate-fade-in max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>
                    Settings
                </h1>
                <p style={{ color: "var(--muted)" }}>
                    Manage your profile and preferences
                </p>
            </div>

            {/* Profile Card */}
            <div
                className="rounded-2xl overflow-hidden mb-6"
                style={{
                    background: "var(--card-bg)",
                    border: "1px solid var(--card-border)",
                }}
            >
                <div
                    className="h-24"
                    style={{ background: "var(--gradient-primary)" }}
                />
                <div className="px-6 pb-6">
                    <div className="flex items-end gap-4 -mt-12">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handlePhotoChange}
                        />
                        <button
                            onClick={() => isEditing && fileInputRef.current?.click()}
                            className="w-24 h-24 rounded-2xl flex items-center justify-center overflow-hidden border-4 transition-all"
                            style={{
                                background: editData.photo || profile.photo
                                    ? "transparent"
                                    : "var(--primary-subtle)",
                                borderColor: "var(--card-bg)",
                            }}
                            disabled={!isEditing}
                        >
                            {editData.photo || profile.photo ? (
                                <img
                                    src={editData.photo || profile.photo || ""}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <svg
                                    width="40"
                                    height="40"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="var(--primary)"
                                    strokeWidth="1.5"
                                >
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                    <circle cx="12" cy="7" r="4" />
                                </svg>
                            )}
                        </button>
                        <div className="flex-1 pb-2">
                            <h2
                                className="text-xl font-bold"
                                style={{ color: "var(--foreground)" }}
                            >
                                {profile.name}
                            </h2>
                            <p style={{ color: "var(--muted)" }}>
                                {profile.specialty}
                            </p>
                        </div>
                        <button
                            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                            className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
                            style={{
                                background: isEditing ? "var(--gradient-primary)" : "var(--background-secondary)",
                                color: isEditing ? "white" : "var(--foreground)",
                            }}
                        >
                            {isEditing ? "Save Changes" : "Edit Profile"}
                        </button>
                    </div>
                </div>
            </div>

            {/* Personal Information */}
            <div
                className="rounded-2xl p-6 mb-6"
                style={{
                    background: "var(--card-bg)",
                    border: "1px solid var(--card-border)",
                }}
            >
                <h3 className="text-lg font-semibold mb-4" style={{ color: "var(--foreground)" }}>
                    Personal Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: "var(--muted)" }}>
                            Full Name
                        </label>
                        {isEditing ? (
                            <input
                                type="text"
                                value={editData.name}
                                onChange={(e) => setEditData((p) => ({ ...p, name: e.target.value }))}
                                className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                                style={{
                                    background: "var(--input-bg)",
                                    border: "1px solid var(--input-border)",
                                    color: "var(--foreground)",
                                }}
                            />
                        ) : (
                            <p style={{ color: "var(--foreground)" }}>{profile.name}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: "var(--muted)" }}>
                            Email
                        </label>
                        {isEditing ? (
                            <input
                                type="email"
                                value={editData.email}
                                onChange={(e) => setEditData((p) => ({ ...p, email: e.target.value }))}
                                className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                                style={{
                                    background: "var(--input-bg)",
                                    border: "1px solid var(--input-border)",
                                    color: "var(--foreground)",
                                }}
                            />
                        ) : (
                            <p style={{ color: "var(--foreground)" }}>{profile.email}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: "var(--muted)" }}>
                            Phone
                        </label>
                        {isEditing ? (
                            <input
                                type="tel"
                                value={editData.phone}
                                onChange={(e) => setEditData((p) => ({ ...p, phone: e.target.value }))}
                                className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                                style={{
                                    background: "var(--input-bg)",
                                    border: "1px solid var(--input-border)",
                                    color: "var(--foreground)",
                                }}
                            />
                        ) : (
                            <p style={{ color: "var(--foreground)" }}>{profile.phone}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: "var(--muted)" }}>
                            License Number
                        </label>
                        {isEditing ? (
                            <input
                                type="text"
                                value={editData.licenseNumber}
                                onChange={(e) => setEditData((p) => ({ ...p, licenseNumber: e.target.value }))}
                                className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                                style={{
                                    background: "var(--input-bg)",
                                    border: "1px solid var(--input-border)",
                                    color: "var(--foreground)",
                                }}
                            />
                        ) : (
                            <p style={{ color: "var(--foreground)" }}>{profile.licenseNumber}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Practice Information */}
            <div
                className="rounded-2xl p-6 mb-6"
                style={{
                    background: "var(--card-bg)",
                    border: "1px solid var(--card-border)",
                }}
            >
                <h3 className="text-lg font-semibold mb-4" style={{ color: "var(--foreground)" }}>
                    Practice Information
                </h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: "var(--muted)" }}>
                            Clinic Name
                        </label>
                        {isEditing ? (
                            <input
                                type="text"
                                value={editData.clinicName}
                                onChange={(e) => setEditData((p) => ({ ...p, clinicName: e.target.value }))}
                                className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                                style={{
                                    background: "var(--input-bg)",
                                    border: "1px solid var(--input-border)",
                                    color: "var(--foreground)",
                                }}
                            />
                        ) : (
                            <p style={{ color: "var(--foreground)" }}>{profile.clinicName}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: "var(--muted)" }}>
                            Address
                        </label>
                        {isEditing ? (
                            <textarea
                                value={editData.clinicAddress}
                                onChange={(e) => setEditData((p) => ({ ...p, clinicAddress: e.target.value }))}
                                rows={2}
                                className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none"
                                style={{
                                    background: "var(--input-bg)",
                                    border: "1px solid var(--input-border)",
                                    color: "var(--foreground)",
                                }}
                            />
                        ) : (
                            <p style={{ color: "var(--foreground)" }}>{profile.clinicAddress}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Preferences */}
            <div
                className="rounded-2xl p-6 mb-6"
                style={{
                    background: "var(--card-bg)",
                    border: "1px solid var(--card-border)",
                }}
            >
                <h3 className="text-lg font-semibold mb-4" style={{ color: "var(--foreground)" }}>
                    Preferences
                </h3>
                <div className="space-y-4">
                    {/* Theme Toggle */}
                    <div className="flex items-center justify-between py-2">
                        <div>
                            <p className="font-medium" style={{ color: "var(--foreground)" }}>
                                Dark Mode
                            </p>
                            <p className="text-sm" style={{ color: "var(--muted)" }}>
                                Switch between light and dark themes
                            </p>
                        </div>
                        <button
                            onClick={toggleTheme}
                            className="w-14 h-8 rounded-full relative transition-all"
                            style={{
                                background: theme === "dark" ? "var(--primary)" : "var(--input-border)",
                            }}
                        >
                            <div
                                className="w-6 h-6 rounded-full absolute top-1 transition-all"
                                style={{
                                    background: "white",
                                    left: theme === "dark" ? "calc(100% - 1.75rem)" : "0.25rem",
                                }}
                            />
                        </button>
                    </div>

                    {/* Notification Toggle (placeholder) */}
                    <div className="flex items-center justify-between py-2 border-t" style={{ borderColor: "var(--card-border)" }}>
                        <div>
                            <p className="font-medium" style={{ color: "var(--foreground)" }}>
                                Email Notifications
                            </p>
                            <p className="text-sm" style={{ color: "var(--muted)" }}>
                                Receive updates about your practice
                            </p>
                        </div>
                        <button
                            className="w-14 h-8 rounded-full relative transition-all"
                            style={{ background: "var(--primary)" }}
                        >
                            <div
                                className="w-6 h-6 rounded-full absolute top-1"
                                style={{
                                    background: "white",
                                    left: "calc(100% - 1.75rem)",
                                }}
                            />
                        </button>
                    </div>
                </div>
            </div>

            {/* Danger Zone */}
            <div
                className="rounded-2xl p-6"
                style={{
                    background: "var(--card-bg)",
                    border: "1px solid #fee2e2",
                }}
            >
                <h3 className="text-lg font-semibold mb-4" style={{ color: "#ef4444" }}>
                    Danger Zone
                </h3>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="font-medium" style={{ color: "var(--foreground)" }}>
                            Log out of your account
                        </p>
                        <p className="text-sm" style={{ color: "var(--muted)" }}>
                            You will need to sign in again
                        </p>
                    </div>
                    <button
                        onClick={() => setShowLogoutConfirm(true)}
                        className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
                        style={{
                            background: "#fee2e2",
                            color: "#ef4444",
                        }}
                    >
                        Log Out
                    </button>
                </div>
            </div>

            {/* Logout Confirmation Modal */}
            {showLogoutConfirm && (
                <div
                    className="fixed inset-0 flex items-center justify-center z-50 animate-fade-in"
                    style={{ background: "rgba(0, 0, 0, 0.5)" }}
                >
                    <div
                        className="w-full max-w-sm rounded-2xl p-6 text-center animate-scale-in"
                        style={{
                            background: "var(--card-bg)",
                            border: "1px solid var(--card-border)",
                        }}
                    >
                        <div
                            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                            style={{ background: "#fee2e2" }}
                        >
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                <polyline points="16 17 21 12 16 7" />
                                <line x1="21" y1="12" x2="9" y2="12" />
                            </svg>
                        </div>
                        <h3
                            className="text-xl font-bold mb-2"
                            style={{ color: "var(--foreground)" }}
                        >
                            Log Out?
                        </h3>
                        <p className="mb-6" style={{ color: "var(--muted)" }}>
                            Are you sure you want to log out?
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowLogoutConfirm(false)}
                                className="flex-1 py-3 rounded-xl font-medium"
                                style={{
                                    background: "var(--background-secondary)",
                                    color: "var(--foreground)",
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleLogout}
                                className="flex-1 py-3 rounded-xl font-medium"
                                style={{
                                    background: "#ef4444",
                                    color: "white",
                                }}
                            >
                                Log Out
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
