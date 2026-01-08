import { Sidebar } from "@/components/Sidebar";

/**
 * DASHBOARD LAYOUT
 * 
 * This layout wraps all pages under /dashboard/*
 * It provides the persistent sidebar navigation and main content area
 * 
 * NOTE: Theme toggle will be implemented in Profile settings
 */

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen" style={{ backgroundColor: "var(--background)" }}>
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content Area */}
            <main
                className="ml-[250px] min-h-screen"
                style={{ backgroundColor: "var(--background)" }}
            >
                {/* Page Content */}
                <div className="px-8 pb-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
