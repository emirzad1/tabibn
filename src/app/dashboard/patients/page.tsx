/**
 * PATIENTS PAGE
 * 
 * This page is for managing patients at /dashboard/patients
 * TODO: Add patient list, search, create/edit patient functionality
 */

export default function PatientsPage() {
    return (
        <div>
            <h1
                className="text-2xl font-semibold mb-2"
                style={{ color: "var(--foreground)" }}
            >
                Patients
            </h1>
            <p
                className="text-sm mb-8"
                style={{ color: "var(--muted)" }}
            >
                View and manage your patient records.
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
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                <p className="text-lg font-medium" style={{ color: "var(--foreground)" }}>
                    Patient Management
                </p>
                <p className="text-sm mt-2" style={{ color: "var(--muted)" }}>
                    This feature is coming soon.
                </p>
            </div>
        </div>
    );
}
