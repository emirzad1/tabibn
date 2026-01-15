"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

/**
 * PREMIUM DASHBOARD PAGE
 * 
 * Features:
 * - Welcome header with date
 * - Stats cards with gradient icons
 * - Quick actions row
 * - Two-column layout: Activity + Tips
 * - Recent prescriptions list (fetched from database)
 */

interface DashboardStats {
    totalPatients: number;
    todayPrescriptions: number;
    weekPrescriptions: number;
    monthPrescriptions: number;
}

interface RecentActivity {
    id: string;
    patient_name: string;
    medications_count: number;
    created_at: string;
    status: string;
}

const tips = [
    "💡 Use templates to speed up common prescriptions",
    "🔒 All data is encrypted and stored securely",
    "📱 Access your dashboard from any device",
    "⭐ Add frequently used drugs to favorites",
];

export default function DashboardPage() {
    const [stats, setStats] = useState<DashboardStats>({
        totalPatients: 0,
        todayPrescriptions: 0,
        weekPrescriptions: 0,
        monthPrescriptions: 0,
    });
    const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
    const [doctorName, setDoctorName] = useState("Doctor");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Fetch doctor profile
            const { data: profile } = await supabase
                .from('doctor_profiles')
                .select('full_name')
                .eq('user_id', user.id)
                .single();

            if (profile) {
                setDoctorName(profile.full_name);
            }

            // Fetch total patients
            const { count: patientsCount } = await supabase
                .from('patients')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id);

            // Fetch prescriptions for stats
            const { data: prescriptions } = await supabase
                .from('prescriptions')
                .select('created_at, status')
                .eq('user_id', user.id);

            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

            const todayCount = prescriptions?.filter(p =>
                new Date(p.created_at) >= today
            ).length || 0;

            const weekCount = prescriptions?.filter(p =>
                new Date(p.created_at) >= weekAgo
            ).length || 0;

            const monthCount = prescriptions?.filter(p =>
                new Date(p.created_at) >= monthStart
            ).length || 0;

            setStats({
                totalPatients: patientsCount || 0,
                todayPrescriptions: todayCount,
                weekPrescriptions: weekCount,
                monthPrescriptions: monthCount,
            });

            // Fetch recent activity
            const { data: recentPrescriptions } = await supabase
                .from('prescriptions')
                .select(`
                    id,
                    patient_name,
                    created_at,
                    status,
                    medications (id)
                `)
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(5);

            if (recentPrescriptions) {
                const activity = recentPrescriptions.map(p => ({
                    id: p.id,
                    patient_name: p.patient_name,
                    medications_count: p.medications?.length || 0,
                    created_at: p.created_at,
                    status: p.status?.toLowerCase() || 'draft',
                }));
                setRecentActivity(activity);
            }

            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            setIsLoading(false);
        }
    };

    const formatTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 60) return `${diffMins} min ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        if (diffDays === 1) return 'Yesterday';
        return `${diffDays} days ago`;
    };

    const today = new Date().toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good morning";
        if (hour < 18) return "Good afternoon";
        return "Good evening";
    };

    return (
        <div className="animate-fade-in">
            {/* Welcome Header */}
            <div className="mb-8">
                <h1
                    className="text-3xl font-bold mb-1"
                    style={{ color: "var(--foreground)" }}
                >
                    {getGreeting()}, Dr. {doctorName} 👋
                </h1>
                <p style={{ color: "var(--muted)" }}>{today}</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-4 gap-5 mb-8">
                {[
                    {
                        label: "Total Patients",
                        value: stats.totalPatients.toString(),
                        change: stats.totalPatients > 0 ? "Active patients" : "No patients yet",
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
                        value: stats.todayPrescriptions.toString(),
                        change: stats.todayPrescriptions > 0 ? "Created today" : "None today",
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
                        value: stats.weekPrescriptions.toString(),
                        change: stats.weekPrescriptions > 0 ? "Last 7 days" : "None this week",
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
                        value: stats.monthPrescriptions.toString(),
                        change: stats.monthPrescriptions > 0 ? "This month" : "None this month",
                        color: "#a855f7",
                        icon: (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="12" y1="20" x2="12" y2="10" />
                                <line x1="18" y1="20" x2="18" y2="4" />
                                <line x1="6" y1="20" x2="6" y2="16" />
                            </svg>
                        ),
                    },
                ].map((stat, idx) => (
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
                        {recentActivity.length === 0 ? (
                            <div className="p-12 text-center">
                                <p style={{ color: "var(--muted)" }}>No recent activity</p>
                                <p className="text-sm mt-2" style={{ color: "var(--muted)" }}>
                                    Create your first prescription to see activity here
                                </p>
                            </div>
                        ) : (
                            recentActivity.map((item, idx) => (
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
                                            {item.patient_name.split(" ").map((n: string) => n[0]).join("")}
                                        </div>
                                        <div>
                                            <p
                                                className="font-medium"
                                                style={{ color: "var(--foreground)" }}
                                            >
                                                {item.patient_name}
                                            </p>
                                            <p className="text-sm" style={{ color: "var(--muted)" }}>
                                                Prescription created • {item.medications_count} medication{item.medications_count > 1 ? "s" : ""}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs" style={{ color: "var(--muted)" }}>
                                            {formatTimeAgo(item.created_at)}
                                        </p>
                                        <span
                                            className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-medium"
                                            style={{
                                                background: item.status === "completed" || item.status === "printed" ? "#dcfce7" :
                                                    item.status === "draft" ? "#fef3c7" : "#dbeafe",
                                                color: item.status === "completed" || item.status === "printed" ? "#16a34a" :
                                                    item.status === "draft" ? "#d97706" : "#2563eb",
                                            }}
                                        >
                                            {item.status}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
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
