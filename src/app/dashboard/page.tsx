/**
 * DASHBOARD HOME PAGE
 * 
 * This is the main dashboard page shown at /dashboard
 * TODO: Add dashboard widgets, stats, recent activity, etc.
 */

export default function DashboardPage() {
    return (
        <div>
            <h1
                className="text-2xl font-semibold mb-2"
                style={{ color: "var(--foreground)" }}
            >
                Dashboard
            </h1>
            <p
                className="text-sm mb-8"
                style={{ color: "var(--muted)" }}
            >
                Welcome back! Here&apos;s an overview of your activity.
            </p>

            {/* Placeholder Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Stats Card 1 */}
                <div
                    className="p-6 rounded-xl"
                    style={{
                        backgroundColor: "var(--card-bg)",
                        border: "1px solid var(--card-border)",
                    }}
                >
                    <p className="text-sm" style={{ color: "var(--muted)" }}>
                        Total Patients
                    </p>
                    <p className="text-3xl font-bold mt-2" style={{ color: "var(--foreground)" }}>
                        0
                    </p>
                </div>

                {/* Stats Card 2 */}
                <div
                    className="p-6 rounded-xl"
                    style={{
                        backgroundColor: "var(--card-bg)",
                        border: "1px solid var(--card-border)",
                    }}
                >
                    <p className="text-sm" style={{ color: "var(--muted)" }}>
                        Prescriptions Today
                    </p>
                    <p className="text-3xl font-bold mt-2" style={{ color: "var(--foreground)" }}>
                        0
                    </p>
                </div>

                {/* Stats Card 3 */}
                <div
                    className="p-6 rounded-xl"
                    style={{
                        backgroundColor: "var(--card-bg)",
                        border: "1px solid var(--card-border)",
                    }}
                >
                    <p className="text-sm" style={{ color: "var(--muted)" }}>
                        This Month
                    </p>
                    <p className="text-3xl font-bold mt-2" style={{ color: "var(--foreground)" }}>
                        0
                    </p>
                </div>
            </div>

            {/* Recent Activity Placeholder */}
            <div
                className="mt-8 p-6 rounded-xl"
                style={{
                    backgroundColor: "var(--card-bg)",
                    border: "1px solid var(--card-border)",
                }}
            >
                <h2
                    className="text-lg font-semibold mb-4"
                    style={{ color: "var(--foreground)" }}
                >
                    Recent Activity
                </h2>
                <p className="text-sm" style={{ color: "var(--muted)" }}>
                    No recent activity to show.
                </p>
            </div>
        </div>
    );
}
