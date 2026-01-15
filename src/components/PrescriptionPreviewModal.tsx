"use client";

import React, { useRef, useState, useEffect } from "react";
import PrescriptionRenderer, {
    PrescriptionData,
    PrescriptionSettings,
    PAPER_SIZES,
    PaperSize,
    getDefaultSettings,
} from "./PrescriptionRenderer";
import jsPDF from "jspdf";

interface PrescriptionPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: PrescriptionData;
    settings: PrescriptionSettings;
    onSettingsChange: (settings: PrescriptionSettings) => void;
}

const STORAGE_KEY = "tabibn-print-settings";

/**
 * PrescriptionPreviewModal Component
 * Full-screen modal with embedded settings panel (like Print Settings page)
 */
export default function PrescriptionPreviewModal({
    isOpen,
    onClose,
    data,
    settings,
    onSettingsChange,
}: PrescriptionPreviewModalProps) {
    const prescriptionRef = useRef<HTMLDivElement>(null);
    const [isExporting, setIsExporting] = useState(false);
    const [isPrinting, setIsPrinting] = useState(false);
    const [activeTab, setActiveTab] = useState<"header" | "footer">("header");
    const [previewScale, setPreviewScale] = useState(0.5);

    // Calculate preview scale
    useEffect(() => {
        if (!isOpen) return;
        const containerWidth = 500;
        const paperWidth = PAPER_SIZES[settings.pageSize].width * 3.7795;
        setPreviewScale(Math.min(containerWidth / paperWidth, 0.55));
    }, [settings.pageSize, isOpen]);

    if (!isOpen) return null;

    const updateSetting = <K extends keyof PrescriptionSettings>(key: K, value: PrescriptionSettings[K]) => {
        onSettingsChange({ ...settings, [key]: value });
    };

    const updateHeader = (field: keyof PrescriptionSettings["header"], value: string | boolean) => {
        onSettingsChange({ ...settings, header: { ...settings.header, [field]: value } });
    };

    const updateFooter = (field: keyof PrescriptionSettings["footer"], value: string) => {
        onSettingsChange({ ...settings, footer: { ...settings.footer, [field]: value } });
    };

    const handleSaveAsDefault = () => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    };

    const handleExportPDF = async () => {
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
            pdf.setFontSize(14);
            pdf.setFont("helvetica", "bold");
            pdf.setTextColor(0, 0, 0);
            pdf.text("PRESCRIPTION", pageWidth / 2, y + 2, { align: "center" });
            pdf.setFontSize(7);
            pdf.setFont("helvetica", "normal");
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
                y += 6;
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

            const patientName = data.patient.name || "prescription";
            const pdfDate = data.patient.date || new Date().toISOString().split("T")[0];
            const fileName = `${patientName.replace(/\s+/g, "_")}_${pdfDate}.pdf`;
            pdf.save(fileName);
        } catch (error) {
            console.error("Error generating PDF:", error);
            alert("Error generating PDF: " + (error as Error).message);
        } finally {
            setIsExporting(false);
        }
    };

    const handlePrint = async () => {
        if (!prescriptionRef.current) return;

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
                        body { margin: 0; padding: 0; font-family: Calibri, 'Segoe UI', Arial, sans-serif; font-size: 11pt; line-height: 1.4; color: #000; background: white; }
                        .prescription-page { width: ${pageWidth} !important; height: ${pageHeight} !important; max-height: ${pageHeight} !important; overflow: hidden !important; transform: scale(1) !important; padding: 15mm !important; display: flex !important; flex-direction: column !important; }
                        @media print { html, body { width: ${pageWidth}; height: ${pageHeight}; } .prescription-page { page-break-after: avoid; page-break-inside: avoid; } }
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

    const inputStyle = {
        background: "var(--input-bg)",
        border: "1px solid var(--input-border)",
        color: "var(--foreground)",
    };

    const paperSize = PAPER_SIZES[settings.pageSize];
    const mmToPx = (mm: number) => mm * 3.7795;

    return (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.85)", display: "flex", zIndex: 900 }}>
            {/* Left Panel - Preview */}
            <div style={{ flex: 1, overflow: "auto", padding: "30px", display: "flex", justifyContent: "center", alignItems: "flex-start", backgroundColor: "#1a1a2e" }}>
                <div style={{ width: mmToPx(paperSize.width) * previewScale, height: mmToPx(paperSize.height) * previewScale, overflow: "hidden" }}>
                    <PrescriptionRenderer ref={prescriptionRef} data={data} settings={settings} scale={previewScale} />
                </div>
            </div>

            {/* Right Panel - Settings (like Print Settings page) */}
            <div style={{ width: "380px", flexShrink: 0, display: "flex", flexDirection: "column", backgroundColor: "var(--card-bg)", borderLeft: "1px solid var(--card-border)" }}>
                {/* Header */}
                <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--card-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                        <h2 style={{ margin: 0, fontSize: "16px", fontWeight: 600, color: "var(--foreground)" }}>Print & Export</h2>
                        <p style={{ margin: "2px 0 0 0", fontSize: "12px", color: "var(--muted)" }}>Configure and preview</p>
                    </div>
                    <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: "6px", color: "var(--muted)", borderRadius: "6px" }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                    </button>
                </div>

                {/* Settings - Scrollable */}
                <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
                    {/* Paper Size */}
                    <div style={{ marginBottom: "16px" }}>
                        <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--foreground)", marginBottom: "8px" }}>Paper Size</label>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                            {(["A4", "Letter"] as PaperSize[]).map((size) => (
                                <button key={size} onClick={() => updateSetting("pageSize", size)} style={{
                                    padding: "10px",
                                    borderRadius: "8px",
                                    border: settings.pageSize === size ? "2px solid var(--primary)" : "1px solid var(--card-border)",
                                    backgroundColor: settings.pageSize === size ? "var(--primary-subtle)" : "var(--background)",
                                    color: "var(--foreground)",
                                    fontSize: "12px",
                                    fontWeight: 500,
                                    cursor: "pointer",
                                }}>{size}</button>
                            ))}
                        </div>
                    </div>

                    {/* Tabs */}
                    <div style={{ display: "flex", gap: "6px", marginBottom: "12px" }}>
                        {(["header", "footer"] as const).map((tab) => (
                            <button key={tab} onClick={() => setActiveTab(tab)} style={{
                                flex: 1,
                                padding: "8px",
                                borderRadius: "6px",
                                border: "none",
                                fontSize: "11px",
                                fontWeight: 500,
                                cursor: "pointer",
                                backgroundColor: activeTab === tab ? "var(--primary)" : "var(--background-secondary)",
                                color: activeTab === tab ? "white" : "var(--muted)",
                            }}>{tab === "header" ? "Header (Doctor)" : "Footer (Contact)"}</button>
                        ))}
                    </div>

                    {/* Header Settings */}
                    {activeTab === "header" && (
                        <div style={{ padding: "12px", borderRadius: "10px", background: "var(--background)", border: "1px solid var(--card-border)" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                                <span style={{ fontSize: "12px", fontWeight: 500, color: "var(--foreground)" }}>Show Header</span>
                                <button onClick={() => updateSetting("showHeader", !settings.showHeader)} style={{
                                    width: "40px",
                                    height: "22px",
                                    borderRadius: "11px",
                                    border: "none",
                                    backgroundColor: settings.showHeader ? "var(--primary)" : "var(--input-border)",
                                    position: "relative",
                                    cursor: "pointer",
                                }}>
                                    <div style={{
                                        width: "16px",
                                        height: "16px",
                                        borderRadius: "8px",
                                        backgroundColor: "white",
                                        position: "absolute",
                                        top: "3px",
                                        left: settings.showHeader ? "21px" : "3px",
                                        transition: "left 0.2s",
                                    }} />
                                </button>
                            </div>

                            {settings.showHeader && (
                                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                    <p style={{ margin: 0, fontSize: "10px", fontWeight: 600, color: "var(--primary)" }}>🇬🇧 English</p>
                                    <input type="text" value={settings.header.doctorNameEn} onChange={(e) => updateHeader("doctorNameEn", e.target.value)} placeholder="Doctor Name" className="w-full px-2 py-1.5 rounded text-xs outline-none" style={inputStyle} />
                                    <input type="text" value={settings.header.titleEn} onChange={(e) => updateHeader("titleEn", e.target.value)} placeholder="Title" className="w-full px-2 py-1.5 rounded text-xs outline-none" style={inputStyle} />
                                    <textarea value={settings.header.bioEn} onChange={(e) => updateHeader("bioEn", e.target.value)} placeholder="Bio / Specializations" rows={2} className="w-full px-2 py-1.5 rounded text-xs outline-none resize-none" style={inputStyle} />

                                    <p style={{ margin: "8px 0 0 0", fontSize: "10px", fontWeight: 600, color: "var(--primary)" }}>🇦🇫 Persian/Dari</p>
                                    <input type="text" value={settings.header.doctorNameFa} onChange={(e) => updateHeader("doctorNameFa", e.target.value)} placeholder="نام داکتر" className="w-full px-2 py-1.5 rounded text-xs outline-none text-right" style={inputStyle} dir="rtl" />
                                    <input type="text" value={settings.header.titleFa} onChange={(e) => updateHeader("titleFa", e.target.value)} placeholder="عنوان" className="w-full px-2 py-1.5 rounded text-xs outline-none text-right" style={inputStyle} dir="rtl" />
                                    <textarea value={settings.header.bioFa} onChange={(e) => updateHeader("bioFa", e.target.value)} placeholder="بیوگرافی" rows={2} className="w-full px-2 py-1.5 rounded text-xs outline-none text-right resize-none" style={inputStyle} dir="rtl" />
                                </div>
                            )}
                        </div>
                    )}

                    {/* Footer Settings */}
                    {activeTab === "footer" && (
                        <div style={{ padding: "12px", borderRadius: "10px", background: "var(--background)", border: "1px solid var(--card-border)" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                                <span style={{ fontSize: "12px", fontWeight: 500, color: "var(--foreground)" }}>Show Footer</span>
                                <button onClick={() => updateSetting("showFooter", !settings.showFooter)} style={{
                                    width: "40px",
                                    height: "22px",
                                    borderRadius: "11px",
                                    border: "none",
                                    backgroundColor: settings.showFooter ? "var(--primary)" : "var(--input-border)",
                                    position: "relative",
                                    cursor: "pointer",
                                }}>
                                    <div style={{
                                        width: "16px",
                                        height: "16px",
                                        borderRadius: "8px",
                                        backgroundColor: "white",
                                        position: "absolute",
                                        top: "3px",
                                        left: settings.showFooter ? "21px" : "3px",
                                        transition: "left 0.2s",
                                    }} />
                                </button>
                            </div>

                            {settings.showFooter && (
                                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                    <p style={{ margin: 0, fontSize: "10px", fontWeight: 600, color: "var(--primary)" }}>📍 Contact Details</p>
                                    <textarea value={settings.footer.address} onChange={(e) => updateFooter("address", e.target.value)} placeholder="Address" rows={2} className="w-full px-2 py-1.5 rounded text-xs outline-none resize-none" style={inputStyle} />
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                                        <input type="text" value={settings.footer.phone} onChange={(e) => updateFooter("phone", e.target.value)} placeholder="Phone" className="w-full px-2 py-1.5 rounded text-xs outline-none" style={inputStyle} />
                                        <input type="text" value={settings.footer.email} onChange={(e) => updateFooter("email", e.target.value)} placeholder="Email" className="w-full px-2 py-1.5 rounded text-xs outline-none" style={inputStyle} />
                                    </div>

                                    <p style={{ margin: "8px 0 0 0", fontSize: "10px", fontWeight: 600, color: "var(--primary)" }}>✍️ Signature</p>
                                    <input type="text" value={settings.footer.signatureName} onChange={(e) => updateFooter("signatureName", e.target.value)} placeholder="Doctor Name" className="w-full px-2 py-1.5 rounded text-xs outline-none" style={inputStyle} />
                                    <input type="text" value={settings.footer.signatureTitle} onChange={(e) => updateFooter("signatureTitle", e.target.value)} placeholder="Title" className="w-full px-2 py-1.5 rounded text-xs outline-none" style={inputStyle} />
                                </div>
                            )}
                        </div>
                    )}

                    {/* Watermark Notice */}
                    <p style={{ margin: "12px 0", fontSize: "10px", color: "var(--muted)", textAlign: "center" }}>
                        All prescriptions include "tabibn.com" watermark
                    </p>
                </div>

                {/* Footer Actions */}
                <div style={{ padding: "16px 20px", borderTop: "1px solid var(--card-border)", display: "flex", flexDirection: "column", gap: "8px" }}>
                    <button onClick={handlePrint} disabled={isPrinting} style={{
                        width: "100%",
                        padding: "12px",
                        borderRadius: "8px",
                        border: "none",
                        backgroundColor: "var(--primary)",
                        color: "#fff",
                        fontSize: "13px",
                        fontWeight: 600,
                        cursor: isPrinting ? "not-allowed" : "pointer",
                        opacity: isPrinting ? 0.7 : 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                    }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="8" /></svg>
                        {isPrinting ? "Preparing..." : "Print"}
                    </button>
                    <button onClick={handleExportPDF} disabled={isExporting} style={{
                        width: "100%",
                        padding: "12px",
                        borderRadius: "8px",
                        border: "1px solid var(--input-border)",
                        backgroundColor: "transparent",
                        color: "var(--foreground)",
                        fontSize: "13px",
                        fontWeight: 600,
                        cursor: isExporting ? "not-allowed" : "pointer",
                        opacity: isExporting ? 0.7 : 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                    }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="12" y1="18" x2="12" y2="12" /><line x1="9" y1="15" x2="15" y2="15" /></svg>
                        {isExporting ? "Generating..." : "Export PDF"}
                    </button>
                    <button onClick={handleSaveAsDefault} style={{
                        width: "100%",
                        padding: "10px",
                        borderRadius: "8px",
                        border: "1px dashed var(--card-border)",
                        backgroundColor: "transparent",
                        color: "var(--muted)",
                        fontSize: "11px",
                        fontWeight: 500,
                        cursor: "pointer",
                    }}>
                        Save as Default Settings
                    </button>
                </div>
            </div>
        </div>
    );
}
