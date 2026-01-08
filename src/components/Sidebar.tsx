"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "@/components/ThemeProvider";

/**
 * DASHBOARD SIDEBAR COMPONENT
 * 
 * BACKEND INTEGRATION NOTES:
 * -------------------------
 * 1. Profile section: Fetch user's profile picture and name from backend
 * 2. Logout: Call backend to invalidate session/token
 * 3. Navigation highlighting based on current route
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
            className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200"
            style={{
                backgroundColor: isActive ? "var(--nav-active-bg)" : "transparent",
                color: isActive ? "var(--foreground)" : "var(--muted)",
            }}
        >
            <span className="w-5 h-5">{icon}</span>
            <span className="text-sm font-medium">{label}</span>
        </Link>
    );
}

export function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { theme } = useTheme();

    const handleLogout = () => {
        /**
         * TODO: BACKEND INTEGRATION
         * - Call logout API to invalidate session
         * - Clear local storage/cookies
         * - Redirect to login page
         */
        console.log("Logging out...");
        router.push("/");
    };

    // Navigation items
    const mainNavItems = [
        {
            href: "/dashboard",
            label: "Dashboard",
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
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
                    <polyline points="10 9 9 9 8 9" />
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
            className="fixed left-0 top-0 h-screen w-[250px] flex flex-col border-r"
            style={{
                backgroundColor: "var(--card-bg)",
                borderColor: "var(--card-border)",
            }}
        >
            {/* Logo Section */}
            <div className="px-6 py-6 border-b" style={{ borderColor: "var(--card-border)" }}>
                <img
                    src={theme === "light" ? "/logodashdark.svg" : "/logodashlight.svg"}
                    alt="Tabibn"
                    className="h-10 w-auto"
                    onError={(e) => {
                        // Fallback to main logos if dashboard logos don't exist
                        e.currentTarget.src = theme === "light" ? "/logodark.svg" : "/logolight.svg";
                    }}
                />
            </div>

            {/* Main Navigation */}
            <nav className="flex-1 px-3 py-4">
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

            {/* Bottom Section - Profile & Logout */}
            <div className="px-3 py-4 border-t" style={{ borderColor: "var(--card-border)" }}>
                <div className="space-y-1">
                    {/* Profile */}
                    <NavItem
                        href="/dashboard/profile"
                        icon={
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                <circle cx="12" cy="7" r="4" />
                            </svg>
                        }
                        label="Profile"
                        isActive={pathname === "/dashboard/profile"}
                    />

                    {/* Logout Button */}
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 hover:opacity-80"
                        style={{ color: "var(--muted)" }}
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
