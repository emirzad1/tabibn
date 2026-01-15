"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

/**
 * PREMIUM HISTORY PAGE
 * 
 * Features:
 * - Filter chips with clear visual feedback
 * - Date range picker
 * - Status filter badges
 * - Expandable prescription cards
 * - Print/Export actions
 */

interface PrescriptionHistory {
    id: string; // UUID
    patientName: string;
    patientId: string;
    date: string;
    diagnosis: string;
    medications: { name: string; dosage: string }[];
    status: "Printed" | "Draft" | "Sent";
}


const statusFilters = ["All", "Printed", "Sent", "Draft"];

export default function HistoryPage() {
    const [prescriptions, setPrescriptions] = useState<PrescriptionHistory[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [expandedId, setExpandedId] = useState<string | null>(null);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('prescriptions')
                .select('*, medications(*)')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) {
                console.error("Error fetching history:", error);
                return;
            }

            if (data) {
                const mapped: PrescriptionHistory[] = data.map((p: any) => ({
                    id: p.id,
                    patientName: p.patient_name,
                    patientId: p.patient_id_number || "",
                    date: p.date,
                    diagnosis: p.diagnosis || "",
                    medications: p.medications ? p.medications.map((m: any) => ({
                        name: m.name,
                        dosage: `${m.strength || ""} ${m.frequency || ""}`.trim()
                    })) : [],
                    status: p.status
                }));
                setPrescriptions(mapped);
            }
        } catch (error) {
            console.error("Error:", error);
        }
    };

    const filteredPrescriptions = prescriptions.filter((rx) => {
        const matchesSearch =
            rx.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            rx.patientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
            rx.diagnosis.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesDateFrom = !dateFrom || rx.date >= dateFrom;
        const matchesDateTo = !dateTo || rx.date <= dateTo;
        const matchesStatus = statusFilter === "All" || rx.status === statusFilter;
        return matchesSearch && matchesDateFrom && matchesDateTo && matchesStatus;
    });

    const getStatusStyle = (status: string) => {
        switch (status) {
            case "Printed": return { bg: "#dcfce7", color: "#16a34a" };
            case "Sent": return { bg: "#dbeafe", color: "#2563eb" };
            case "Draft": return { bg: "#fef3c7", color: "#d97706" };
            default: return { bg: "var(--background-secondary)", color: "var(--muted)" };
        }
    };

    const handlePrint = (rx: PrescriptionHistory) => {
        try {
            // Store prescription data for print page
            const printData = {
                patient: {
                    name: rx.patientName,
                    idNumber: rx.patientId,
                    date: rx.date,
                },
                medications: rx.medications.map((med, idx) => ({
                    id: idx + 1,
                    name: med.name,
                    strength: "",
                    frequency: med.dosage,
                    duration: "",
                    quantity: "",
                    instructions: "",
                })),
                diagnosis: rx.diagnosis,
                vitals: {},
                allergies: [],
                additionalNotes: "",
            };

            sessionStorage.setItem("tabibn-prescription-data", JSON.stringify(printData));

            // Open print page in new window
            window.open("/dashboard/prescription/print", "_blank");
        } catch (error) {
            console.error("Print error:", error);
            alert("Failed to open print page. Please try again.");
        }
    };

    const handleExport = async (rx: PrescriptionHistory) => {
        try {
            // Call PDF generation API
            const response = await fetch("/api/prescription/pdf", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    patient: {
                        name: rx.patientName,
                        idNumber: rx.patientId,
                        date: rx.date,
                    },
                    medications: rx.medications.map((med) => ({
                        name: med.name,
                        dosage: med.dosage,
                    })),
                    diagnosis: rx.diagnosis,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to generate PDF");
            }

            // Download PDF
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `prescription_${rx.patientName.replace(/ /g, "_")}_${rx.date}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error("Export error:", error);
            alert("Failed to export PDF. Please try again.");
        }
    };

    const clearFilters = () => {
        setSearchQuery("");
        setDateFrom("");
        setDateTo("");
        setStatusFilter("All");
    };

    const hasFilters = searchQuery || dateFrom || dateTo || statusFilter !== "All";

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>
                    Prescription History
                </h1>
                <p style={{ color: "var(--muted)" }}>
                    {filteredPrescriptions.length} of {prescriptions.length} prescriptions
                </p>
            </div>

            {/* Filters Card */}
            <div
                className="p-5 rounded-2xl mb-6"
                style={{
                    background: "var(--card-bg)",
                    border: "1px solid var(--card-border)",
                }}
            >
                {/* Search Row */}
                <div className="flex gap-4 mb-4">
                    <div className="flex-1 relative">
                        <svg
                            className="absolute left-4 top-1/2 -translate-y-1/2"
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="var(--muted)"
                            strokeWidth="2"
                        >
                            <circle cx="11" cy="11" r="8" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search patient, ID, or diagnosis..."
                            className="w-full pl-12 pr-4 py-3 rounded-xl text-sm outline-none"
                            style={{
                                background: "var(--input-bg)",
                                border: "1px solid var(--input-border)",
                                color: "var(--foreground)",
                            }}
                        />
                    </div>
                    <input
                        type="date"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                        className="px-4 py-3 rounded-xl text-sm outline-none"
                        style={{
                            background: "var(--input-bg)",
                            border: "1px solid var(--input-border)",
                            color: "var(--foreground)",
                        }}
                    />
                    <span className="flex items-center" style={{ color: "var(--muted)" }}>to</span>
                    <input
                        type="date"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                        className="px-4 py-3 rounded-xl text-sm outline-none"
                        style={{
                            background: "var(--input-bg)",
                            border: "1px solid var(--input-border)",
                            color: "var(--foreground)",
                        }}
                    />
                </div>

                {/* Status Chips */}
                <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                        {statusFilters.map((status) => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className="px-4 py-2 rounded-full text-sm font-medium transition-all"
                                style={{
                                    background: statusFilter === status ? "var(--primary)" : "var(--background-secondary)",
                                    color: statusFilter === status ? "white" : "var(--muted)",
                                }}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                    {hasFilters && (
                        <button
                            onClick={clearFilters}
                            className="text-sm font-medium transition-all hover:opacity-80"
                            style={{ color: "var(--accent-danger)" }}
                        >
                            Clear filters
                        </button>
                    )}
                </div>
            </div>

            {/* Prescription List */}
            <div className="space-y-4">
                {filteredPrescriptions.length === 0 ? (
                    <div
                        className="py-16 text-center rounded-2xl"
                        style={{
                            background: "var(--card-bg)",
                            border: "1px solid var(--card-border)",
                        }}
                    >
                        <svg
                            className="mx-auto mb-4"
                            width="48"
                            height="48"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="var(--muted)"
                            strokeWidth="1.5"
                        >
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                        </svg>
                        <p style={{ color: "var(--muted)" }}>
                            {hasFilters ? "No prescriptions match your filters" : "No prescription history yet"}
                        </p>
                    </div>
                ) : (
                    filteredPrescriptions.map((rx) => (
                        <div
                            key={rx.id}
                            className="rounded-2xl overflow-hidden transition-all"
                            style={{
                                background: "var(--card-bg)",
                                border: "1px solid var(--card-border)",
                            }}
                        >
                            {/* Main Row */}
                            <div
                                className="p-5 cursor-pointer transition-all hover:opacity-90"
                                onClick={() => setExpandedId(expandedId === rx.id ? null : rx.id)}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div
                                            className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold"
                                            style={{
                                                background: "var(--gradient-primary)",
                                                color: "white",
                                            }}
                                        >
                                            {rx.patientName.split(" ").map(n => n[0]).join("")}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3">
                                                <h3 className="font-semibold" style={{ color: "var(--foreground)" }}>
                                                    {rx.patientName}
                                                </h3>
                                                <span
                                                    className="px-2.5 py-1 rounded-full text-xs font-medium"
                                                    style={{
                                                        background: getStatusStyle(rx.status).bg,
                                                        color: getStatusStyle(rx.status).color,
                                                    }}
                                                >
                                                    {rx.status}
                                                </span>
                                            </div>
                                            <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
                                                {rx.patientId} • {rx.date} • {rx.medications.length} medication{rx.medications.length > 1 ? "s" : ""}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handlePrint(rx); }}
                                            className="p-2.5 rounded-lg transition-all hover:opacity-80"
                                            style={{ background: "var(--background-secondary)" }}
                                            title="Print"
                                        >
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--foreground)" strokeWidth="2">
                                                <polyline points="6 9 6 2 18 2 18 9" />
                                                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                                                <rect x="6" y="14" width="12" height="8" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleExport(rx); }}
                                            className="p-2.5 rounded-lg transition-all hover:opacity-80"
                                            style={{ background: "var(--background-secondary)" }}
                                            title="Export PDF"
                                        >
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--foreground)" strokeWidth="2">
                                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                                <polyline points="7 10 12 15 17 10" />
                                                <line x1="12" y1="15" x2="12" y2="3" />
                                            </svg>
                                        </button>
                                        <svg
                                            width="18"
                                            height="18"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="var(--muted)"
                                            strokeWidth="2"
                                            className={`transition-transform ${expandedId === rx.id ? "rotate-180" : ""}`}
                                        >
                                            <polyline points="6 9 12 15 18 9" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            {/* Expanded Details */}
                            {expandedId === rx.id && (
                                <div
                                    className="px-5 pb-5 pt-2 border-t animate-fade-in"
                                    style={{ borderColor: "var(--card-border)" }}
                                >
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <p className="text-xs font-semibold uppercase mb-2" style={{ color: "var(--muted)" }}>
                                                Diagnosis
                                            </p>
                                            <p className="text-sm" style={{ color: "var(--foreground)" }}>
                                                {rx.diagnosis}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold uppercase mb-2" style={{ color: "var(--muted)" }}>
                                                Medications
                                            </p>
                                            <div className="space-y-2">
                                                {rx.medications.map((med, idx) => (
                                                    <div key={idx} className="flex items-start gap-2">
                                                        <span
                                                            className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold mt-0.5"
                                                            style={{
                                                                background: "var(--primary-subtle)",
                                                                color: "var(--primary)",
                                                            }}
                                                        >
                                                            {idx + 1}
                                                        </span>
                                                        <div>
                                                            <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
                                                                {med.name}
                                                            </p>
                                                            <p className="text-xs" style={{ color: "var(--muted)" }}>
                                                                {med.dosage}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
