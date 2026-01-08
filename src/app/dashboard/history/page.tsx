/**
 * HISTORY PAGE
 * 
 * This page is for viewing saved prescriptions history at /dashboard/history
 * TODO: Display list of past prescriptions, search, filter by date/patient
 */

export default function HistoryPage() {
    return (
        <div>
            <h1
                className="text-2xl font-semibold mb-2"
                style={{ color: "var(--foreground)" }}
            >
                History
            </h1>
            <p
                className="text-sm mb-8"
                style={{ color: "var(--muted)" }}
            >
                View and search your saved prescriptions.
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
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                </svg>
                <p className="text-lg font-medium" style={{ color: "var(--foreground)" }}>
                    Prescription History
                </p>
                <p className="text-sm mt-2" style={{ color: "var(--muted)" }}>
                    This feature is coming soon.
                </p>
            </div>
        </div>
    );
}
