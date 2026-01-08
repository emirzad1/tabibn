/**
 * PROFILE PAGE
 * 
 * This page is for viewing/editing user profile at /dashboard/profile
 * TODO: Display and edit user information, profile picture, settings
 */

export default function ProfilePage() {
    return (
        <div>
            <h1
                className="text-2xl font-semibold mb-2"
                style={{ color: "var(--foreground)" }}
            >
                Profile
            </h1>
            <p
                className="text-sm mb-8"
                style={{ color: "var(--muted)" }}
            >
                Manage your account settings and preferences.
            </p>

            {/* Placeholder */}
            <div
                className="p-12 rounded-xl text-center"
                style={{
                    backgroundColor: "var(--card-bg)",
                    border: "1px solid var(--card-border)",
                }}
            >
                <svg
                    className="mx-auto mb-4"
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ color: "var(--muted)" }}
                >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                </svg>
                <p className="text-lg font-medium" style={{ color: "var(--foreground)" }}>
                    Profile Settings
                </p>
                <p className="text-sm mt-2" style={{ color: "var(--muted)" }}>
                    This feature is coming soon.
                </p>
            </div>
        </div>
    );
}
