"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { ProfileProvider, useProfile } from "@/contexts/ProfileContext";

/**
 * DASHBOARD LAYOUT
 * 
 * Premium layout with persistent sidebar and content area
 * Includes authentication protection via ProfileProvider
 */

function DashboardContent({ children }: { children: React.ReactNode }) {
    const { profile, isLoading } = useProfile();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !profile) {
            router.push("/");
        }
    }, [isLoading, profile, router]);

    if (isLoading) {
        return (
            <div
                className="h-screen flex items-center justify-center"
                style={{ backgroundColor: "var(--background)" }}
            >
                <div className="text-center">
                    <div className="w-16 h-16 rounded-full mx-auto mb-4" style={{ background: "var(--gradient-primary)" }}>
                        <svg className="w-16 h-16 animate-spin" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4" />
                            <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                    </div>
                    <p style={{ color: "var(--foreground)" }}>Loading...</p>
                </div>
            </div>
        );
    }

    if (!profile) return null;

    return (
        <div className="h-screen flex" style={{ backgroundColor: "var(--background)" }}>
            {/* Sidebar now uses Context internally */}
            <Sidebar />

            {/* Main Content Area */}
            <main
                className="ml-[260px] h-screen overflow-y-auto flex-1"
                style={{ backgroundColor: "var(--background)" }}
            >
                {/* Page Content */}
                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ProfileProvider>
            <DashboardContent>{children}</DashboardContent>
        </ProfileProvider>
    );
}
