import { Sidebar } from "@/components/Sidebar";

/**
 * DASHBOARD LAYOUT
 * 
 * Premium layout with persistent sidebar and content area
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
                className="ml-[260px] min-h-screen"
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

