"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "@/components/ThemeProvider";

/**
 * PREMIUM DASHBOARD SIDEBAR
 * 
 * Features:
 * - Branded logo section
 * - Smooth hover animations
 * - Active state with gradient indicator
 * - New prescription quick action
 * - Profile section with avatar
 */

interface NavItemProps {
    href: string;
    icon: React.ReactNode;
    label: string;
    isActive: boolean;
}

function NavItem({ href, icon, label, isActive }: NavItemProps) {
    return (
        <Link
            href={href}
            className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 relative group"
            style={{
                backgroundColor: isActive ? "var(--nav-active-bg)" : "transparent",
                color: isActive ? "var(--primary)" : "var(--muted)",
            }}
        >
            {/* Active indicator */}
            {isActive && (
                <div
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full"
                    style={{ background: "var(--gradient-primary)" }}
                />
            )}
            <span className={`w-5 h-5 transition-transform ${isActive ? "" : "group-hover:scale-110"}`}>
                {icon}
            </span>
            <span className={`text-sm ${isActive ? "font-semibold" : "font-medium"}`}>
                {label}
            </span>
        </Link>
    );
}

export function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { theme, toggleTheme } = useTheme();

    const handleLogout = () => {
        router.push("/");
    };

    // Navigation items
    const mainNavItems = [
        {
            href: "/dashboard",
            label: "Dashboard",
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="7" rx="1" />
                    <rect x="14" y="3" width="7" height="7" rx="1" />
                    <rect x="14" y="14" width="7" height="7" rx="1" />
                    <rect x="3" y="14" width="7" height="7" rx="1" />
                </svg>
            ),
        },
        {
            href: "/dashboard/prescription",
            label: "Prescription",
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
            ),
        },
        {
            href: "/dashboard/patients",
            label: "Patients",
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
            ),
        },
        {
            href: "/dashboard/history",
            label: "History",
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                </svg>
            ),
        },
    ];

    return (
        <aside
            className="fixed left-0 top-0 h-screen w-[260px] flex flex-col border-r"
            style={{
                backgroundColor: "var(--card-bg)",
                borderColor: "var(--card-border)",
            }}
        >
            {/* Logo Section */}
            <div className="px-6 py-5 border-b" style={{ borderColor: "var(--card-border)" }}>
                <div className="flex items-center gap-3">
                    <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ background: "var(--gradient-primary)" }}
                    >
                        <svg
                            viewBox="0 0 24 24"
                            className="w-5 h-5"
                            fill="none"
                            stroke="white"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                        </svg>
                    </div>
                    <span
                        className="text-xl font-bold"
                        style={{ color: "var(--foreground)" }}
                    >
                        Tabibn
                    </span>
                </div>
            </div>

            {/* Quick Action */}
            <div className="px-4 py-4">
                <Link
                    href="/dashboard/prescription"
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold transition-all hover:shadow-lg"
                    style={{
                        background: "var(--gradient-primary)",
                        color: "white",
                    }}
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    New Prescription
                </Link>
            </div>

            {/* Main Navigation */}
            <nav className="flex-1 px-3 py-2 overflow-y-auto">
                <p className="text-xs font-semibold uppercase px-4 mb-2" style={{ color: "var(--muted)" }}>
                    Menu
                </p>
                <div className="space-y-1">
                    {mainNavItems.map((item) => (
                        <NavItem
                            key={item.href}
                            href={item.href}
                            icon={item.icon}
                            label={item.label}
                            isActive={pathname === item.href}
                        />
                    ))}
                </div>
            </nav>

            {/* Bottom Section */}
            <div className="px-3 py-4 border-t" style={{ borderColor: "var(--card-border)" }}>
                <div className="space-y-1">
                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 hover:opacity-80"
                        style={{
                            color: "var(--muted)",
                            backgroundColor: "var(--background-secondary)",
                        }}
                    >
                        <span className="w-5 h-5">
                            {theme === "light" ? (
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                                </svg>
                            ) : (
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="5" />
                                    <line x1="12" y1="1" x2="12" y2="3" />
                                    <line x1="12" y1="21" x2="12" y2="23" />
                                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                                    <line x1="1" y1="12" x2="3" y2="12" />
                                    <line x1="21" y1="12" x2="23" y2="12" />
                                </svg>
                            )}
                        </span>
                        <span className="text-sm font-medium">
                            {theme === "light" ? "Dark Mode" : "Light Mode"}
                        </span>
                    </button>

                    {/* Profile */}
                    <NavItem
                        href="/dashboard/profile"
                        icon={
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="3" />
                                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                            </svg>
                        }
                        label="Settings"
                        isActive={pathname === "/dashboard/profile"}
                    />

                    {/* Logout Button */}
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 hover:opacity-80"
                        style={{ color: "var(--accent-danger)" }}
                    >
                        <span className="w-5 h-5">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                <polyline points="16 17 21 12 16 7" />
                                <line x1="21" y1="12" x2="9" y2="12" />
                            </svg>
                        </span>
                        <span className="text-sm font-medium">Log out</span>
                    </button>
                </div>
            </div>
        </aside>
    );
}
