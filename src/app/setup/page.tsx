"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useTheme } from "@/components/ThemeProvider";

/**
 * PROFILE SETUP PAGE
 * 
 * BACKEND INTEGRATION NOTES:
 * -------------------------
 * 1. This page is shown after successful OTP verification
 * 2. User provides their name and optional profile picture
 * 3. The handleCreate function should:
 *    - Upload profile picture to storage (if provided)
 *    - Create/update user profile in database with name and picture URL
 *    - On success: redirect to dashboard
 *    - On failure: show error message
 * 
 * Current Implementation:
 * - Frontend only, stores image as base64 preview
 * - Replace console.log with actual API calls when backend is ready
 */

export default function ProfileSetupPage() {
    const router = useRouter();
    const { theme } = useTheme();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [name, setName] = useState("");
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleImageClick = () => {
        fileInputRef.current?.click();
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith("image/")) {
                alert("Please select an image file");
                return;
            }

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert("Image size should be less than 5MB");
                return;
            }

            // Create preview
            const reader = new FileReader();
            reader.onload = (event) => {
                setProfileImage(event.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) {
            return;
        }

        setIsLoading(true);

        /**
         * TODO: BACKEND INTEGRATION
         * Replace this with actual API call to create user profile:
         * 
         * try {
         *   // First upload image if provided
         *   let profilePictureUrl = null;
         *   if (profileImage) {
         *     profilePictureUrl = await uploadImage(profileImage);
         *   }
         *   
         *   // Then create/update user profile
         *   const response = await createProfile({
         *     name: name.trim(),
         *     profilePicture: profilePictureUrl
         *   });
         *   
         *   if (response.success) {
         *     router.push("/dashboard");
         *   } else {
         *     setError("Failed to create profile. Please try again.");
         *   }
         * } catch (error) {
         *   setError("Something went wrong. Please try again.");
         * } finally {
         *   setIsLoading(false);
         * }
         */

        console.log("Creating profile:", { name: name.trim(), hasImage: !!profileImage });

        // Simulate API call delay
        setTimeout(() => {
            setIsLoading(false);
            router.push("/dashboard");
        }, 500);
    };

    return (
        <main
            className="min-h-screen flex items-center justify-center px-4"
            style={{ backgroundColor: "var(--background)" }}
        >
            {/* Theme Toggle - Top Right Corner */}
            <ThemeToggle />

            {/* Profile Setup Card */}
            <div
                className="w-full max-w-[456px] px-10 py-12 rounded-2xl"
                style={{
                    backgroundColor: "var(--card-bg)",
                    border: "1px solid var(--card-border)",
                    boxShadow: "0 4px 24px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)",
                }}
            >
                {/* Profile Picture Upload */}
                <div className="flex justify-center mb-8">
                    <button
                        type="button"
                        onClick={handleImageClick}
                        className="relative group focus:outline-none"
                    >
                        {/* Profile Picture Circle */}
                        <div
                            className="w-32 h-32 rounded-full overflow-hidden transition-all duration-200 group-hover:opacity-80"
                            style={{
                                backgroundColor: "var(--input-bg)",
                                border: "3px dashed var(--input-border)",
                            }}
                        >
                            {profileImage ? (
                                <img
                                    src={profileImage}
                                    alt="Profile preview"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center">
                                    {/* Camera/Upload Icon */}
                                    <svg
                                        width="32"
                                        height="32"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        style={{ color: "var(--muted)" }}
                                    >
                                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                                        <circle cx="12" cy="13" r="4" />
                                    </svg>
                                    <span
                                        className="text-xs mt-2"
                                        style={{ color: "var(--muted)" }}
                                    >
                                        Add Photo
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Edit Badge */}
                        {profileImage && (
                            <div
                                className="absolute bottom-1 right-1 w-8 h-8 rounded-full flex items-center justify-center"
                                style={{
                                    backgroundColor: "var(--primary)",
                                    color: "var(--background)",
                                }}
                            >
                                <svg
                                    width="14"
                                    height="14"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                </svg>
                            </div>
                        )}
                    </button>

                    {/* Hidden File Input */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                    />
                </div>

                {/* Setup Text */}
                <div className="text-center mb-8">
                    <h1
                        className="text-2xl font-semibold mb-2"
                        style={{ color: "var(--foreground)" }}
                    >
                        Set Up Your Profile
                    </h1>
                    <p
                        className="text-sm"
                        style={{ color: "var(--muted)" }}
                    >
                        Add your name and a profile picture
                    </p>
                </div>

                {/* Profile Form */}
                <form onSubmit={handleCreate}>
                    <div className="mb-6">
                        <label
                            className="block text-sm font-medium mb-2"
                            style={{ color: "var(--foreground)" }}
                        >
                            Your Name
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter your name"
                            className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-all duration-200"
                            style={{
                                backgroundColor: "var(--input-bg)",
                                border: "1px solid var(--input-border)",
                                color: "var(--foreground)",
                            }}
                            required
                        />
                    </div>

                    {/* Create Button */}
                    <button
                        type="submit"
                        disabled={!name.trim() || isLoading}
                        className="w-full py-3 rounded-lg text-sm font-medium transition-all duration-200 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                            backgroundColor: "var(--primary)",
                            color: "var(--background)",
                        }}
                    >
                        {isLoading ? "Creating..." : "Create"}
                    </button>
                </form>

                {/* Skip Option */}
                <p
                    className="text-sm text-center mt-6"
                    style={{ color: "var(--muted)" }}
                >
                    You can update your profile later in settings
                </p>
            </div>
        </main>
    );
}
