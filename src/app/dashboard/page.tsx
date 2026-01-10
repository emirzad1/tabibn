"use client";

import Link from "next/link";

/**
 * PREMIUM DASHBOARD PAGE
 * 
 * Features:
 * - Welcome header with date
 * - Stats cards with gradient icons
 * - Quick actions row
 * - Two-column layout: Activity + Tips
 * - Recent prescriptions list
 */

// Mock data
const stats = [
    {
        label: "Total Patients",
        value: "156",
        change: "+12 this month",
        color: "#0d9488",
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
        ),
    },
    {
        label: "Today's Prescriptions",
        value: "8",
        change: "3 pending",
        color: "#22c55e",
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
        ),
    },
    {
        label: "This Week",
        value: "42",
        change: "+15% from last week",
        color: "#3b82f6",
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
        ),
    },
    {
        label: "This Month",
        value: "187",
        change: "Target: 200",
        color: "#a855f7",
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="20" x2="12" y2="10" />
                <line x1="18" y1="20" x2="18" y2="4" />
                <line x1="6" y1="20" x2="6" y2="16" />
            </svg>
        ),
    },
];

const recentActivity = [
    { id: 1, patient: "Ahmad Khan", action: "Prescription created", meds: 3, time: "10 min ago", status: "completed" },
    { id: 2, patient: "Fatima Ahmadi", action: "Prescription created", meds: 2, time: "1 hour ago", status: "completed" },
    { id: 3, patient: "Mohammad Rahimi", action: "Prescription updated", meds: 4, time: "2 hours ago", status: "updated" },
    { id: 4, patient: "Zahra Karimi", action: "Prescription created", meds: 1, time: "Yesterday", status: "completed" },
    { id: 5, patient: "Ali Mohammadi", action: "Prescription printed", meds: 5, time: "Yesterday", status: "printed" },
];

const tips = [
    "💡 Use templates to speed up common prescriptions",
    "🔒 All data is encrypted and stored securely",
    "📱 Access your dashboard from any device",
    "⭐ Add frequently used drugs to favorites",
];

export default function DashboardPage() {
    const today = new Date().toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    return (
        <div className="animate-fade-in">
            {/* Welcome Header */}
            <div className="mb-8">
                <h1
                    className="text-3xl font-bold mb-1"
                    style={{ color: "var(--foreground)" }}
                >
                    Good morning, Doctor 👋
                </h1>
                <p style={{ color: "var(--muted)" }}>{today}</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-4 gap-5 mb-8">
                {stats.map((stat, idx) => (
                    <div
                        key={idx}
                        className="p-5 rounded-2xl transition-all hover:scale-[1.02]"
                        style={{
                            background: "var(--card-bg)",
                            border: "1px solid var(--card-border)",
                            boxShadow: "var(--card-shadow)",
                        }}
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div
                                className="w-12 h-12 rounded-xl flex items-center justify-center"
                                style={{ backgroundColor: `${stat.color}15` }}
                            >
                                <span
                                    className="w-6 h-6"
                                    style={{ color: stat.color }}
                                >
                                    {stat.icon}
                                </span>
                            </div>
                        </div>
                        <p
                            className="text-3xl font-bold mb-1"
                            style={{ color: "var(--foreground)" }}
                        >
                            {stat.value}
                        </p>
                        <p className="text-sm" style={{ color: "var(--muted)" }}>
                            {stat.label}
                        </p>
                        <p
                            className="text-xs mt-2"
                            style={{ color: stat.color }}
                        >
                            {stat.change}
                        </p>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div
                className="p-6 rounded-2xl mb-8"
                style={{
                    background: "var(--card-bg)",
                    border: "1px solid var(--card-border)",
                }}
            >
                <h2
                    className="text-lg font-semibold mb-4"
                    style={{ color: "var(--foreground)" }}
                >
                    Quick Actions
                </h2>
                <div className="flex gap-4">
                    <Link
                        href="/dashboard/prescription"
                        className="flex items-center gap-3 px-5 py-3 rounded-xl transition-all hover:shadow-lg"
                        style={{
                            background: "var(--gradient-primary)",
                            color: "white",
                        }}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        <span className="font-semibold">New Prescription</span>
                    </Link>
                    <Link
                        href="/dashboard/patients"
                        className="flex items-center gap-3 px-5 py-3 rounded-xl transition-all hover:opacity-80"
                        style={{
                            background: "var(--background-secondary)",
                            color: "var(--foreground)",
                        }}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                            <circle cx="8.5" cy="7" r="4" />
                            <line x1="20" y1="8" x2="20" y2="14" />
                            <line x1="23" y1="11" x2="17" y2="11" />
                        </svg>
                        <span className="font-medium">Add Patient</span>
                    </Link>
                    <Link
                        href="/dashboard/history"
                        className="flex items-center gap-3 px-5 py-3 rounded-xl transition-all hover:opacity-80"
                        style={{
                            background: "var(--background-secondary)",
                            color: "var(--foreground)",
                        }}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                        </svg>
                        <span className="font-medium">View History</span>
                    </Link>
                </div>
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-3 gap-6">
                {/* Recent Activity */}
                <div
                    className="col-span-2 rounded-2xl overflow-hidden"
                    style={{
                        background: "var(--card-bg)",
                        border: "1px solid var(--card-border)",
                    }}
                >
                    <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: "var(--card-border)" }}>
                        <h2
                            className="text-lg font-semibold"
                            style={{ color: "var(--foreground)" }}
                        >
                            Recent Activity
                        </h2>
                        <Link
                            href="/dashboard/history"
                            className="text-sm font-medium transition-all hover:opacity-80"
                            style={{ color: "var(--primary)" }}
                        >
                            View all →
                        </Link>
                    </div>
                    <div>
                        {recentActivity.map((item, idx) => (
                            <div
                                key={item.id}
                                className={`p-4 flex items-center justify-between ${idx < recentActivity.length - 1 ? "border-b" : ""
                                    }`}
                                style={{ borderColor: "var(--card-border)" }}
                            >
                                <div className="flex items-center gap-4">
                                    <div
                                        className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold"
                                        style={{
                                            background: "var(--primary-subtle)",
                                            color: "var(--primary)",
                                        }}
                                    >
                                        {item.patient.split(" ").map(n => n[0]).join("")}
                                    </div>
                                    <div>
                                        <p
                                            className="font-medium"
                                            style={{ color: "var(--foreground)" }}
                                        >
                                            {item.patient}
                                        </p>
                                        <p className="text-sm" style={{ color: "var(--muted)" }}>
                                            {item.action} • {item.meds} medication{item.meds > 1 ? "s" : ""}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs" style={{ color: "var(--muted)" }}>
                                        {item.time}
                                    </p>
                                    <span
                                        className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-medium"
                                        style={{
                                            background: item.status === "completed" ? "#dcfce7" :
                                                item.status === "printed" ? "#dbeafe" : "#fef3c7",
                                            color: item.status === "completed" ? "#16a34a" :
                                                item.status === "printed" ? "#2563eb" : "#d97706",
                                        }}
                                    >
                                        {item.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Tips & Shortcuts */}
                <div
                    className="rounded-2xl p-5"
                    style={{
                        background: "var(--card-bg)",
                        border: "1px solid var(--card-border)",
                    }}
                >
                    <h2
                        className="text-lg font-semibold mb-4"
                        style={{ color: "var(--foreground)" }}
                    >
                        Tips & Shortcuts
                    </h2>
                    <div className="space-y-3">
                        {tips.map((tip, idx) => (
                            <div
                                key={idx}
                                className="p-3 rounded-xl text-sm"
                                style={{
                                    background: "var(--background-secondary)",
                                    color: "var(--foreground-secondary)",
                                }}
                            >
                                {tip}
                            </div>
                        ))}
                    </div>

                    {/* Keyboard Shortcuts */}
                    <div className="mt-6">
                        <p
                            className="text-xs font-semibold uppercase mb-3"
                            style={{ color: "var(--muted)" }}
                        >
                            Keyboard Shortcuts
                        </p>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span style={{ color: "var(--muted)" }}>New Prescription</span>
                                <kbd
                                    className="px-2 py-0.5 rounded text-xs font-mono"
                                    style={{
                                        background: "var(--background-secondary)",
                                        color: "var(--foreground)",
                                    }}
                                >
                                    Ctrl+N
                                </kbd>
                            </div>
                            <div className="flex justify-between">
                                <span style={{ color: "var(--muted)" }}>Search</span>
                                <kbd
                                    className="px-2 py-0.5 rounded text-xs font-mono"
                                    style={{
                                        background: "var(--background-secondary)",
                                        color: "var(--foreground)",
                                    }}
                                >
                                    Ctrl+K
                                </kbd>
                            </div>
                            <div className="flex justify-between">
                                <span style={{ color: "var(--muted)" }}>Print</span>
                                <kbd
                                    className="px-2 py-0.5 rounded text-xs font-mono"
                                    style={{
                                        background: "var(--background-secondary)",
                                        color: "var(--foreground)",
                                    }}
                                >
                                    Ctrl+P
                                </kbd>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
