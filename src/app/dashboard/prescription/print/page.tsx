"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PrescriptionRenderer, {
    PrescriptionSettings,
    PrescriptionData,
    PAPER_SIZES,
    PaperSize,
    getDefaultSettings,
} from "@/components/PrescriptionRenderer";
import jsPDF from "jspdf";

/**
 * PRESCRIPTION PRINT & EXPORT PAGE
 * 
 * Dedicated page for printing/exporting prescriptions
 * Same layout as Print Settings page for consistent UX
 */

const SETTINGS_KEY = "tabibn-print-settings";
const DATA_KEY = "tabibn-prescription-data";

export default function PrintPrescriptionPage() {
    const router = useRouter();
    const prescriptionRef = useRef<HTMLDivElement>(null);
    const [settings, setSettings] = useState<PrescriptionSettings>(getDefaultSettings());
    const [data, setData] = useState<PrescriptionData | null>(null);
    const [previewScale, setPreviewScale] = useState(0.5);
    const [activeTab, setActiveTab] = useState<"header" | "footer">("header");
    const [isPrinting, setIsPrinting] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [saved, setSaved] = useState(false);

    // Load prescription data and settings
    const searchParams = useSearchParams();
    const autoPrint = searchParams.get("auto") === "true";

    // Load prescription data and settings
    useEffect(() => {
        // Load prescription data from sessionStorage OR localStorage (fallback for new windows)
        const storedData = sessionStorage.getItem(DATA_KEY) || localStorage.getItem(DATA_KEY);
        if (storedData) {
            try {
                setData(JSON.parse(storedData));
            } catch {
                if (!autoPrint) router.push("/dashboard/prescription");
                return;
            }
        } else {
            if (!autoPrint) router.push("/dashboard/prescription");
            return;
        }

        // Load saved settings from localStorage
        const storedSettings = localStorage.getItem(SETTINGS_KEY);
        if (storedSettings) {
            try {
                setSettings((prev) => ({ ...prev, ...JSON.parse(storedSettings) }));
            } catch { }
        }
    }, [router, autoPrint]);

    // Auto-print effect
    useEffect(() => {
        if (autoPrint && data && prescriptionRef.current) {
            // Small delay to ensure render and resources
            const timer = setTimeout(() => {
                handlePrint();
            }, 800);
            return () => clearTimeout(timer);
        }
    }, [data, autoPrint]);

    // Calculate preview scale
    useEffect(() => {
        const containerWidth = 550;
        const paperWidth = PAPER_SIZES[settings.pageSize].width * 3.7795;
        setPreviewScale(Math.min(containerWidth / paperWidth, 0.6));
    }, [settings.pageSize]);

    const updateSetting = <K extends keyof PrescriptionSettings>(key: K, value: PrescriptionSettings[K]) => {
        setSettings((prev) => ({ ...prev, [key]: value }));
    };

    const updateHeader = (field: keyof PrescriptionSettings["header"], value: string | boolean) => {
        setSettings((prev) => ({ ...prev, header: { ...prev.header, [field]: value } }));
    };

    const updateFooter = (field: keyof PrescriptionSettings["footer"], value: string) => {
        setSettings((prev) => ({ ...prev, footer: { ...prev.footer, [field]: value } }));
    };

    const handleSaveDefault = () => {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const handleBack = () => {
        router.push("/dashboard/prescription");
    };

    const handlePrint = async () => {
        if (!prescriptionRef.current || !data) return;

        setIsPrinting(true);
        try {
            const element = prescriptionRef.current;
            const printWindow = window.open("", "_blank");
            if (!printWindow) {
                alert("Please allow pop-ups to print.");
                return;
            }

            const paper = PAPER_SIZES[settings.pageSize];
            const pageWidth = `${paper.width}mm`;
            const pageHeight = `${paper.height}mm`;

            printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Prescription - ${data.patient.name || "Print"}</title>
                    <style>
                        @page { size: ${pageWidth} ${pageHeight}; margin: 0; }
                        * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                        body { margin: 0; padding: 0; font-family: Calibri, 'Segoe UI', Arial, sans-serif; }
                        .prescription-page { width: ${pageWidth} !important; height: ${pageHeight} !important; max-height: ${pageHeight} !important; overflow: hidden !important; transform: scale(1) !important; }
                    </style>
                </head>
                <body>${element.outerHTML}</body>
                </html>
            `);
            printWindow.document.close();
            printWindow.onload = () => { printWindow.print(); printWindow.close(); };
            setTimeout(() => { try { printWindow.print(); printWindow.close(); } catch { } }, 500);
        } catch (error) {
            console.error("Error printing:", error);
            alert("Error printing. Please try again.");
        } finally {
            setIsPrinting(false);
        }
    };

    const handleExportPDF = async () => {
        if (!data) return;
        setIsExporting(true);
        try {
            const paperSize = PAPER_SIZES[settings.pageSize];
            const pdf = new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: settings.pageSize === "A4" ? "a4" : "letter",
            });

            const pageWidth = paperSize.width;
            const margin = 20;
            let y = margin;

            const addText = (text: string, x: number, yPos: number, fontSize: number = 11, fontStyle: "normal" | "bold" | "italic" = "normal", color: [number, number, number] = [0, 0, 0]) => {
                pdf.setFontSize(fontSize);
                pdf.setFont("helvetica", fontStyle);
                pdf.setTextColor(color[0], color[1], color[2]);
                pdf.text(text, x, yPos);
            };

            const blackColor: [number, number, number] = [0, 0, 0];
            const grayColor: [number, number, number] = [100, 100, 100];

            // Header
            if (settings.showHeader) {
                addText(settings.header.doctorNameEn, margin, y, 14, "bold", blackColor);
                y += 5;
                addText(settings.header.titleEn, margin, y, 10, "normal", grayColor);
                y += 4;
                if (settings.header.bioEn) {
                    addText(settings.header.bioEn, margin, y, 9, "normal", grayColor);
                    y += 4;
                }
                y += 4;
                pdf.setDrawColor(80, 80, 80);
                pdf.setLineWidth(0.5);
                pdf.line(margin, y, pageWidth - margin, y);
                y += 10;
            } else {
                y = margin + settings.headerHeight;
            }

            // Title + Watermark
            pdf.setFillColor(245, 245, 245);
            pdf.rect(margin, y - 4, pageWidth - 2 * margin, 14, "F");
            addText("PRESCRIPTION", pageWidth / 2, y + 2, 14, "bold", blackColor);
            pdf.setFontSize(7);
            pdf.setTextColor(150, 150, 150);
            pdf.text("tabibn.com", pageWidth / 2, y + 7, { align: "center" });
            y += 16;

            // Patient Information
            addText("Patient Information", margin, y, 11, "bold", blackColor);
            y += 2;
            pdf.setDrawColor(200, 200, 200);
            pdf.line(margin, y, pageWidth - margin, y);
            y += 6;

            const col2 = pageWidth / 2;
            addText(`Name: ${data.patient.name || "-"}`, margin, y, 10, "normal", blackColor);
            addText(`Date: ${data.patient.date || "-"}`, col2, y, 10, "normal", blackColor);
            y += 5;
            addText(`Age: ${data.patient.age || "-"} years`, margin, y, 10, "normal", blackColor);
            addText(`Sex: ${data.patient.sex || "-"}`, col2, y, 10, "normal", blackColor);
            y += 8;

            // Diagnosis
            if (data.diagnosis) {
                addText("Diagnosis", margin, y, 11, "bold", blackColor);
                y += 2;
                pdf.line(margin, y, pageWidth - margin, y);
                y += 6;
                addText(data.diagnosis, margin, y, 10, "normal", blackColor);
                y += 8;
            }

            // Allergies
            if (data.allergies.length > 0) {
                pdf.setFillColor(245, 245, 245);
                pdf.rect(margin, y - 2, pageWidth - 2 * margin, 8, "F");
                addText(`Allergies: ${data.allergies.join(", ")}`, margin + 2, y + 3, 9, "bold", [80, 80, 80]);
                y += 12;
            }

            // Medications
            addText("Medications", margin, y, 11, "bold", blackColor);
            y += 2;
            pdf.line(margin, y, pageWidth - margin, y);
            y += 6;

            if (data.medications.length === 0) {
                addText("No medications prescribed.", margin, y, 10, "italic", grayColor);
            } else {
                data.medications.forEach((med, index) => {
                    addText(`${index + 1}. ${med.name}`, margin, y, 10, "bold", blackColor);
                    y += 5;
                    const details = [
                        med.strength && `Strength: ${med.strength}`,
                        med.frequency && `Frequency: ${med.frequency}`,
                        med.duration && `Duration: ${med.duration}`,
                        med.quantity && `Qty: ${med.quantity}`,
                    ].filter(Boolean).join("  |  ");
                    if (details) {
                        addText(`   ${details}`, margin, y, 9, "normal", grayColor);
                        y += 4;
                    }
                    if (med.instructions) {
                        addText(`   Instructions: ${med.instructions}`, margin, y, 9, "italic", grayColor);
                        y += 4;
                    }
                    y += 2;
                });
            }

            // Footer
            if (settings.showFooter) {
                const footerY = paperSize.height - 40;
                pdf.setDrawColor(200, 200, 200);
                pdf.line(margin, footerY - 5, pageWidth - margin, footerY - 5);
                addText(`Address: ${settings.footer.address}`, margin, footerY + 2, 9, "normal", grayColor);
                addText(`Phone: ${settings.footer.phone}`, margin, footerY + 6, 9, "normal", grayColor);
                addText(`Email: ${settings.footer.email}`, margin, footerY + 10, 9, "normal", grayColor);

                const sigX = pageWidth - margin - 50;
                pdf.line(sigX, footerY + 8, pageWidth - margin, footerY + 8);
                addText(settings.footer.signatureName, sigX + 25, footerY + 13, 10, "bold", blackColor);
                addText(settings.footer.signatureTitle, sigX + 25, footerY + 17, 8, "normal", grayColor);
            }

            const fileName = `${(data.patient.name || "prescription").replace(/\s+/g, "_")}_${data.patient.date || new Date().toISOString().split("T")[0]}.pdf`;
            pdf.save(fileName);
        } catch (error) {
            console.error("Error generating PDF:", error);
            alert("Error generating PDF");
        } finally {
            setIsExporting(false);
        }
    };

    const inputStyle = {
        background: "var(--input-bg)",
        border: "1px solid var(--input-border)",
        color: "var(--foreground)",
    };

    const paperSize = PAPER_SIZES[settings.pageSize];
    const mmToPx = (mm: number) => mm * 3.7795;

    if (!data) {
        return (
            <div className="h-full flex items-center justify-center">
                <p style={{ color: "var(--muted)" }}>Loading prescription...</p>
            </div>
        );
    }

    return (
        <div className="h-full flex overflow-hidden">
            {/* Left Panel - Settings */}
            <div
                className="w-[400px] flex-shrink-0 flex flex-col overflow-hidden border-r"
                style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--card-border)" }}
            >
                {/* Header */}
                <div className="p-4 border-b flex-shrink-0 flex items-center gap-3" style={{ borderColor: "var(--card-border)" }}>
                    <button
                        onClick={handleBack}
                        className="p-2 rounded-lg hover:bg-opacity-10"
                        style={{ color: "var(--muted)" }}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M19 12H5M12 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <div>
                        <h1 className="text-lg font-bold" style={{ color: "var(--foreground)" }}>
                            Print & Export
                        </h1>
                        <p className="text-xs" style={{ color: "var(--muted)" }}>
                            {data.patient.name || "Prescription"} • {data.patient.date}
                        </p>
                    </div>
                </div>

                {/* Settings - Scrollable */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {/* Paper Size */}
                    <div>
                        <label className="block text-xs font-semibold mb-2" style={{ color: "var(--foreground)" }}>
                            Paper Size
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {(["A4", "Letter"] as PaperSize[]).map((size) => (
                                <button
                                    key={size}
                                    onClick={() => updateSetting("pageSize", size)}
                                    className="p-2.5 rounded-lg text-sm font-medium transition-all"
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
                                className="flex-1 py-2 rounded-lg text-xs font-medium transition-all"
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
                        <div className="p-3 rounded-xl" style={{ background: "var(--background)", border: "1px solid var(--card-border)" }}>
                            <div className="flex items-center justify-between mb-3">
                                <div>
                                    <h3 className="text-xs font-semibold" style={{ color: "var(--foreground)" }}>Print Header</h3>
                                    <p className="text-[10px]" style={{ color: "var(--muted)" }}>
                                        {settings.showHeader ? "Doctor info will be printed" : "Blank space for letterhead"}
                                    </p>
                                </div>
                                <button
                                    onClick={() => updateSetting("showHeader", !settings.showHeader)}
                                    className="w-10 h-6 rounded-full relative transition-all"
                                    style={{ backgroundColor: settings.showHeader ? "var(--primary)" : "var(--input-border)" }}
                                >
                                    <div
                                        className="w-4 h-4 rounded-full absolute top-1 bg-white transition-all"
                                        style={{ left: settings.showHeader ? "calc(100% - 1.25rem)" : "0.25rem" }}
                                    />
                                </button>
                            </div>

                            {settings.showHeader && (
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-[10px] font-semibold mb-1.5" style={{ color: "var(--primary)" }}>🇬🇧 English</p>
                                        <div className="space-y-1.5">
                                            <input type="text" value={settings.header.doctorNameEn} onChange={(e) => updateHeader("doctorNameEn", e.target.value)} placeholder="Doctor Name" className="w-full px-2 py-1.5 rounded text-xs outline-none" style={inputStyle} />
                                            <input type="text" value={settings.header.titleEn} onChange={(e) => updateHeader("titleEn", e.target.value)} placeholder="Title" className="w-full px-2 py-1.5 rounded text-xs outline-none" style={inputStyle} />
                                            <textarea value={settings.header.bioEn} onChange={(e) => updateHeader("bioEn", e.target.value)} placeholder="Bio / Specializations" rows={2} className="w-full px-2 py-1.5 rounded text-xs outline-none resize-none" style={inputStyle} />
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-semibold mb-1.5" style={{ color: "var(--primary)" }}>🇦🇫 Persian/Dari</p>
                                        <div className="space-y-1.5">
                                            <input type="text" value={settings.header.doctorNameFa} onChange={(e) => updateHeader("doctorNameFa", e.target.value)} placeholder="نام داکتر" className="w-full px-2 py-1.5 rounded text-xs outline-none text-right" style={inputStyle} dir="rtl" />
                                            <input type="text" value={settings.header.titleFa} onChange={(e) => updateHeader("titleFa", e.target.value)} placeholder="عنوان" className="w-full px-2 py-1.5 rounded text-xs outline-none text-right" style={inputStyle} dir="rtl" />
                                            <textarea value={settings.header.bioFa} onChange={(e) => updateHeader("bioFa", e.target.value)} placeholder="بیوگرافی" rows={2} className="w-full px-2 py-1.5 rounded text-xs outline-none text-right resize-none" style={inputStyle} dir="rtl" />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Footer Settings */}
                    {activeTab === "footer" && (
                        <div className="p-3 rounded-xl" style={{ background: "var(--background)", border: "1px solid var(--card-border)" }}>
                            <div className="flex items-center justify-between mb-3">
                                <div>
                                    <h3 className="text-xs font-semibold" style={{ color: "var(--foreground)" }}>Print Footer</h3>
                                    <p className="text-[10px]" style={{ color: "var(--muted)" }}>
                                        {settings.showFooter ? "Contact & signature printed" : "Blank space for letterhead"}
                                    </p>
                                </div>
                                <button
                                    onClick={() => updateSetting("showFooter", !settings.showFooter)}
                                    className="w-10 h-6 rounded-full relative transition-all"
                                    style={{ backgroundColor: settings.showFooter ? "var(--primary)" : "var(--input-border)" }}
                                >
                                    <div
                                        className="w-4 h-4 rounded-full absolute top-1 bg-white transition-all"
                                        style={{ left: settings.showFooter ? "calc(100% - 1.25rem)" : "0.25rem" }}
                                    />
                                </button>
                            </div>

                            {settings.showFooter && (
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-[10px] font-semibold mb-1.5" style={{ color: "var(--primary)" }}>📍 Contact Details</p>
                                        <div className="space-y-1.5">
                                            <textarea value={settings.footer.address} onChange={(e) => updateFooter("address", e.target.value)} placeholder="Address (max 2 lines)" rows={2} className="w-full px-2 py-1.5 rounded text-xs outline-none resize-none" style={inputStyle} />
                                            <div className="grid grid-cols-2 gap-1.5">
                                                <input type="text" value={settings.footer.phone} onChange={(e) => updateFooter("phone", e.target.value)} placeholder="Phone" className="w-full px-2 py-1.5 rounded text-xs outline-none" style={inputStyle} />
                                                <input type="text" value={settings.footer.email} onChange={(e) => updateFooter("email", e.target.value)} placeholder="Email" className="w-full px-2 py-1.5 rounded text-xs outline-none" style={inputStyle} />
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-semibold mb-1.5" style={{ color: "var(--primary)" }}>✍️ Signature</p>
                                        <div className="space-y-1.5">
                                            <input type="text" value={settings.footer.signatureName} onChange={(e) => updateFooter("signatureName", e.target.value)} placeholder="Doctor Name" className="w-full px-2 py-1.5 rounded text-xs outline-none" style={inputStyle} />
                                            <input type="text" value={settings.footer.signatureTitle} onChange={(e) => updateFooter("signatureTitle", e.target.value)} placeholder="Title/Profession" className="w-full px-2 py-1.5 rounded text-xs outline-none" style={inputStyle} />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Info */}
                    <p className="text-[10px] text-center" style={{ color: "var(--muted)" }}>
                        All prescriptions include "tabibn.com" watermark
                    </p>
                </div>

                {/* Footer Actions */}
                <div className="p-4 border-t space-y-2" style={{ borderColor: "var(--card-border)" }}>
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            onClick={handlePrint}
                            disabled={isPrinting}
                            className="py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2"
                            style={{
                                backgroundColor: "var(--primary)",
                                color: "#fff",
                                opacity: isPrinting ? 0.7 : 1,
                            }}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="6 9 6 2 18 2 18 9" />
                                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                                <rect x="6" y="14" width="12" height="8" />
                            </svg>
                            {isPrinting ? "Printing..." : "Print"}
                        </button>
                        <button
                            onClick={handleExportPDF}
                            disabled={isExporting}
                            className="py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2"
                            style={{
                                border: "1px solid var(--card-border)",
                                backgroundColor: "var(--background)",
                                color: "var(--foreground)",
                                opacity: isExporting ? 0.7 : 1,
                            }}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                <polyline points="14 2 14 8 20 8" />
                                <line x1="12" y1="18" x2="12" y2="12" />
                                <line x1="9" y1="15" x2="15" y2="15" />
                            </svg>
                            {isExporting ? "Exporting..." : "Export PDF"}
                        </button>
                    </div>
                    <button
                        onClick={handleSaveDefault}
                        className="w-full py-2 rounded-lg text-xs font-medium transition-all"
                        style={{
                            border: "1px dashed var(--card-border)",
                            backgroundColor: saved ? "var(--primary-subtle)" : "transparent",
                            color: saved ? "var(--primary)" : "var(--muted)",
                        }}
                    >
                        {saved ? "✓ Saved as Default" : "Save as Default Settings"}
                    </button>
                </div>
            </div>

            {/* Right Panel - Preview */}
            <div
                className="flex-1 overflow-auto p-6 flex justify-center items-start"
                style={{ backgroundColor: "var(--background-secondary)" }}
            >
                <div className="text-center">
                    <p className="text-xs mb-3" style={{ color: "var(--muted)" }}>
                        Live Preview • {PAPER_SIZES[settings.pageSize].label} • {Math.round(previewScale * 100)}% scale
                    </p>
                    <div
                        className="shadow-2xl mx-auto"
                        style={{
                            width: mmToPx(paperSize.width) * previewScale,
                            height: mmToPx(paperSize.height) * previewScale,
                            overflow: "hidden",
                            borderRadius: "4px",
                        }}
                    >
                        <PrescriptionRenderer
                            ref={prescriptionRef}
                            data={data}
                            settings={settings}
                            scale={previewScale}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
