"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import PrescriptionRenderer, {
    PrescriptionSettings,
    PrescriptionData,
    PAPER_SIZES,
    PaperSize,
    getDefaultSettings,
} from "@/components/PrescriptionRenderer";

/**
 * PRINT SETTINGS PAGE
 * 
 * Doctor-focused with bilingual support (English/Persian)
 * Two-column layout with live preview
 */

const STORAGE_KEY = "tabibn-print-settings";

// Sample prescription data for preview
const samplePrescriptionData: PrescriptionData = {
    patient: {
        name: "Sample Patient",
        idNumber: "P-001",
        date: new Date().toISOString().split("T")[0],
        age: "35",
        sex: "Male",
        phone: "+93 700 123 456",
        address: "Kabul, District 4",
    },
    medications: [
        { id: 1, name: "Paracetamol", strength: "500mg", frequency: "3x daily", duration: "5 days", quantity: "15", instructions: "Take after meals" },
        { id: 2, name: "Vitamin C", strength: "1000mg", frequency: "1x daily", duration: "10 days", quantity: "10", instructions: "" },
    ],
    diagnosis: "Common cold with fever",
    vitals: { bloodPressure: "120/80", heartRate: "72 bpm", temperature: "37.5°C", spO2: "98%" },
    allergies: ["Penicillin"],
    additionalNotes: "Rest and drink plenty of fluids.",
};

export default function PrintSettingsPage() {
    const [settings, setSettings] = useState<PrescriptionSettings>(getDefaultSettings());
    const [saved, setSaved] = useState(false);
    const [previewScale, setPreviewScale] = useState(0.5);
    const [activeTab, setActiveTab] = useState<"header" | "footer">("header");
    const [isLoading, setIsLoading] = useState(true);

    // Load doctor profile and settings on mount
    useEffect(() => {
        loadDoctorProfile();
        loadSavedSettings();
    }, []);

    const loadDoctorProfile = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) return;

            const { data: doctorProfile, error } = await supabase
                .from('doctor_profiles')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (error || !doctorProfile) {
                console.error('Error loading profile:', error);
                return;
            }

            // Auto-fill settings with doctor profile data
            setSettings((prev) => ({
                ...prev,
                header: {
                    ...prev.header,
                    // English fields
                    doctorNameEn: doctorProfile.full_name || "",
                    titleEn: doctorProfile.specialty || "",
                    bioEn: doctorProfile.license_number ? `License: ${doctorProfile.license_number}` : "",
                    // Persian fields - you can customize these
                    doctorNameFa: "", // User can fill this manually
                    titleFa: "",
                    bioFa: "",
                },
                footer: {
                    ...prev.footer,
                    address: doctorProfile.clinic_address || "",
                    phone: doctorProfile.clinic_phone || "",
                    email: user.email || "",
                    signatureName: doctorProfile.full_name || "",
                    signatureTitle: doctorProfile.specialty || "",
                },
            }));
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const loadSavedSettings = () => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                setSettings((prev) => ({ ...prev, ...parsed }));
            } catch {
                // Ignore parse errors
            }
        }
    };

    // Calculate preview scale
    useEffect(() => {
        const containerWidth = 500;
        const paperWidth = PAPER_SIZES[settings.pageSize].width * 3.7795;
        setPreviewScale(Math.min(containerWidth / paperWidth, 0.55));
    }, [settings.pageSize]);

    const handleSaveDefault = () => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const updateSetting = <K extends keyof PrescriptionSettings>(key: K, value: PrescriptionSettings[K]) => {
        setSettings((prev) => ({ ...prev, [key]: value }));
    };

    const updateHeader = (field: keyof PrescriptionSettings["header"], value: string | boolean) => {
        setSettings((prev) => ({ ...prev, header: { ...prev.header, [field]: value } }));
    };

    const updateFooter = (field: keyof PrescriptionSettings["footer"], value: string) => {
        setSettings((prev) => ({ ...prev, footer: { ...prev.footer, [field]: value } }));
    };

    const inputStyle = {
        background: "var(--input-bg)",
        border: "1px solid var(--input-border)",
        color: "var(--foreground)",
    };

    return (
        <div className="h-full flex overflow-hidden">
            {/* Left Panel - Settings */}
            <div
                className="w-[420px] flex-shrink-0 flex flex-col overflow-hidden border-r"
                style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--card-border)" }}
            >
                {/* Header */}
                <div className="p-5 border-b flex-shrink-0" style={{ borderColor: "var(--card-border)" }}>
                    <h1 className="text-xl font-bold" style={{ color: "var(--foreground)" }}>
                        Print Settings
                    </h1>
                    <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
                        Configure your prescription layout
                    </p>
                </div>

                {/* Settings - Scrollable */}
                <div className="flex-1 overflow-y-auto p-5 space-y-5">
                    {/* Paper Size */}
                    <div>
                        <label className="block text-sm font-semibold mb-2" style={{ color: "var(--foreground)" }}>
                            Paper Size
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {(["A4", "Letter"] as PaperSize[]).map((size) => (
                                <button
                                    key={size}
                                    onClick={() => updateSetting("pageSize", size)}
                                    className="p-3 rounded-xl text-sm font-medium transition-all"
                                    style={{
                                        border: settings.pageSize === size ? "2px solid var(--primary)" : "1px solid var(--card-border)",
                                        backgroundColor: settings.pageSize === size ? "var(--primary-subtle)" : "var(--background)",
                                        color: "var(--foreground)",
                                    }}
                                >
                                    {PAPER_SIZES[size].label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-2">
                        {(["header", "footer"] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className="flex-1 py-2 rounded-lg text-sm font-medium transition-all"
                                style={{
                                    backgroundColor: activeTab === tab ? "var(--primary)" : "var(--background-secondary)",
                                    color: activeTab === tab ? "white" : "var(--muted)",
                                }}
                            >
                                {tab === "header" ? "Header (Doctor Info)" : "Footer (Contact)"}
                            </button>
                        ))}
                    </div>

                    {/* Header Settings */}
                    {activeTab === "header" && (
                        <div className="p-4 rounded-xl" style={{ background: "var(--background)", border: "1px solid var(--card-border)" }}>
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                                        Print Header
                                    </h3>
                                    <p className="text-xs" style={{ color: "var(--muted)" }}>
                                        {settings.showHeader ? "Doctor info will be printed" : "Blank space for letterhead"}
                                    </p>
                                </div>
                                <button
                                    onClick={() => updateSetting("showHeader", !settings.showHeader)}
                                    className="w-12 h-7 rounded-full relative transition-all"
                                    style={{ backgroundColor: settings.showHeader ? "var(--primary)" : "var(--input-border)" }}
                                >
                                    <div
                                        className="w-5 h-5 rounded-full absolute top-1 bg-white transition-all"
                                        style={{ left: settings.showHeader ? "calc(100% - 1.5rem)" : "0.25rem" }}
                                    />
                                </button>
                            </div>

                            {settings.showHeader ? (
                                <div className="space-y-4">
                                    {/* English Info */}
                                    <div>
                                        <p className="text-xs font-semibold mb-2" style={{ color: "var(--primary)" }}>
                                            🇬🇧 English (Left Side)
                                        </p>
                                        <div className="space-y-2">
                                            <input
                                                type="text"
                                                value={settings.header.doctorNameEn}
                                                onChange={(e) => updateHeader("doctorNameEn", e.target.value)}
                                                placeholder="Doctor Name (e.g., Dr. John Smith)"
                                                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                                                style={inputStyle}
                                            />
                                            <input
                                                type="text"
                                                value={settings.header.titleEn}
                                                onChange={(e) => updateHeader("titleEn", e.target.value)}
                                                placeholder="Title (e.g., MD, Cardiologist)"
                                                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                                                style={inputStyle}
                                            />
                                            <textarea
                                                value={settings.header.bioEn}
                                                onChange={(e) => updateHeader("bioEn", e.target.value)}
                                                placeholder="Bio / Specializations (multi-line)"
                                                rows={2}
                                                className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none"
                                                style={inputStyle}
                                            />
                                        </div>
                                    </div>

                                    {/* Persian Info */}
                                    <div>
                                        <p className="text-xs font-semibold mb-2" style={{ color: "var(--primary)" }}>
                                            🇦🇫 Persian/Dari (Right Side)
                                        </p>
                                        <div className="space-y-2">
                                            <input
                                                type="text"
                                                value={settings.header.doctorNameFa}
                                                onChange={(e) => updateHeader("doctorNameFa", e.target.value)}
                                                placeholder="نام داکتر"
                                                className="w-full px-3 py-2 rounded-lg text-sm outline-none text-right"
                                                style={inputStyle}
                                                dir="rtl"
                                            />
                                            <input
                                                type="text"
                                                value={settings.header.titleFa}
                                                onChange={(e) => updateHeader("titleFa", e.target.value)}
                                                placeholder="عنوان"
                                                className="w-full px-3 py-2 rounded-lg text-sm outline-none text-right"
                                                style={inputStyle}
                                                dir="rtl"
                                            />
                                            <textarea
                                                value={settings.header.bioFa}
                                                onChange={(e) => updateHeader("bioFa", e.target.value)}
                                                placeholder="بیوگرافی / تخصص ها"
                                                rows={2}
                                                className="w-full px-3 py-2 rounded-lg text-sm outline-none text-right resize-none"
                                                style={inputStyle}
                                                dir="rtl"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-xs mb-2" style={{ color: "var(--muted)" }}>
                                        Header Space: {settings.headerHeight}mm
                                    </label>
                                    <input
                                        type="range"
                                        min="10"
                                        max="100"
                                        value={settings.headerHeight}
                                        onChange={(e) => updateSetting("headerHeight", parseInt(e.target.value))}
                                        className="w-full accent-[var(--primary)]"
                                    />
                                    <div className="flex justify-between text-xs mt-1" style={{ color: "var(--muted)" }}>
                                        <span>10mm</span>
                                        <span>100mm</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Footer Settings */}
                    {activeTab === "footer" && (
                        <div className="p-4 rounded-xl" style={{ background: "var(--background)", border: "1px solid var(--card-border)" }}>
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                                        Print Footer
                                    </h3>
                                    <p className="text-xs" style={{ color: "var(--muted)" }}>
                                        {settings.showFooter ? "Contact & signature printed" : "Blank space for letterhead"}
                                    </p>
                                </div>
                                <button
                                    onClick={() => updateSetting("showFooter", !settings.showFooter)}
                                    className="w-12 h-7 rounded-full relative transition-all"
                                    style={{ backgroundColor: settings.showFooter ? "var(--primary)" : "var(--input-border)" }}
                                >
                                    <div
                                        className="w-5 h-5 rounded-full absolute top-1 bg-white transition-all"
                                        style={{ left: settings.showFooter ? "calc(100% - 1.5rem)" : "0.25rem" }}
                                    />
                                </button>
                            </div>

                            {settings.showFooter ? (
                                <div className="space-y-4">
                                    {/* Contact Details */}
                                    <div>
                                        <p className="text-xs font-semibold mb-2" style={{ color: "var(--primary)" }}>
                                            📍 Contact Details
                                        </p>
                                        <div className="space-y-2">
                                            <textarea
                                                value={settings.footer.address}
                                                onChange={(e) => updateFooter("address", e.target.value)}
                                                placeholder="Address (max 2 lines)"
                                                rows={2}
                                                className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none"
                                                style={inputStyle}
                                            />
                                            <div className="grid grid-cols-2 gap-2">
                                                <input
                                                    type="text"
                                                    value={settings.footer.phone}
                                                    onChange={(e) => updateFooter("phone", e.target.value)}
                                                    placeholder="Phone"
                                                    className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                                                    style={inputStyle}
                                                />
                                                <input
                                                    type="text"
                                                    value={settings.footer.email}
                                                    onChange={(e) => updateFooter("email", e.target.value)}
                                                    placeholder="Email"
                                                    className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                                                    style={inputStyle}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Signature Area */}
                                    <div>
                                        <p className="text-xs font-semibold mb-2" style={{ color: "var(--primary)" }}>
                                            ✍️ Signature Area
                                        </p>
                                        <div className="space-y-2">
                                            <input
                                                type="text"
                                                value={settings.footer.signatureName}
                                                onChange={(e) => updateFooter("signatureName", e.target.value)}
                                                placeholder="Doctor Name for Signature"
                                                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                                                style={inputStyle}
                                            />
                                            <input
                                                type="text"
                                                value={settings.footer.signatureTitle}
                                                onChange={(e) => updateFooter("signatureTitle", e.target.value)}
                                                placeholder="Title/Profession"
                                                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                                                style={inputStyle}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-xs mb-2" style={{ color: "var(--muted)" }}>
                                        Footer Space: {settings.footerHeight}mm
                                    </label>
                                    <input
                                        type="range"
                                        min="10"
                                        max="100"
                                        value={settings.footerHeight}
                                        onChange={(e) => updateSetting("footerHeight", parseInt(e.target.value))}
                                        className="w-full accent-[var(--primary)]"
                                    />
                                    <div className="flex justify-between text-xs mt-1" style={{ color: "var(--muted)" }}>
                                        <span>10mm</span>
                                        <span>100mm</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Watermark Notice */}
                    <div className="p-3 rounded-lg" style={{ backgroundColor: "var(--primary-subtle)" }}>
                        <p className="text-xs" style={{ color: "var(--primary)" }}>
                            <strong>Note:</strong> All prescriptions include a small "Powered by Tabibn" watermark at the bottom.
                        </p>
                    </div>
                </div>

                {/* Save Button */}
                <div className="p-5 border-t flex-shrink-0" style={{ borderColor: "var(--card-border)" }}>
                    <button
                        onClick={handleSaveDefault}
                        className="w-full py-3 rounded-xl font-semibold transition-all hover:opacity-90"
                        style={{ background: saved ? "#10b981" : "var(--gradient-primary)", color: "white" }}
                    >
                        {saved ? "✓ Saved as Default" : "Save as Default"}
                    </button>
                    <p className="text-xs text-center mt-2" style={{ color: "var(--muted)" }}>
                        Settings will be used for all prescriptions
                    </p>
                </div>
            </div>

            {/* Right Panel - Preview */}
            <div className="flex-1 flex flex-col overflow-hidden" style={{ backgroundColor: "var(--background-secondary)" }}>
                <div className="p-4 border-b flex-shrink-0" style={{ borderColor: "var(--card-border)" }}>
                    <h2 className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                        Live Preview
                    </h2>
                    <p className="text-xs" style={{ color: "var(--muted)" }}>
                        {PAPER_SIZES[settings.pageSize].label} • {Math.round(previewScale * 100)}% scale
                    </p>
                </div>

                <div className="flex-1 overflow-auto p-6">
                    <div
                        className="mx-auto"
                        style={{ width: `${PAPER_SIZES[settings.pageSize].width * 3.7795 * previewScale}px` }}
                    >
                        <PrescriptionRenderer
                            data={samplePrescriptionData}
                            settings={settings}
                            scale={previewScale}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
