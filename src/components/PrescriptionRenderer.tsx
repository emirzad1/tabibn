"use client";

import React, { forwardRef } from "react";

/**
 * Paper sizes in millimeters
 */
export const PAPER_SIZES = {
    A4: { width: 210, height: 297, label: "A4 (210 × 297 mm)" },
    Letter: { width: 215.9, height: 279.4, label: "Letter (8.5 × 11 in)" },
} as const;

export type PaperSize = keyof typeof PAPER_SIZES;

/**
 * Header/Footer configuration interface
 * Doctor-focused with bilingual support (English/Persian)
 */
export interface PrescriptionSettings {
    header: {
        // English (Left side)
        doctorNameEn: string;
        titleEn: string;        // e.g., "MD, Cardiologist"
        bioEn: string;          // e.g., "Specialist in Internal Medicine"
        // Persian (Right side)
        doctorNameFa: string;
        titleFa: string;
        bioFa: string;
        // Logo
        logoUrl?: string;
        showLogo: boolean;
    };
    footer: {
        // Contact details
        address: string;
        phone: string;
        email: string;
        // Signature area
        signatureName: string;
        signatureTitle: string;
    };
    pageSize: PaperSize;
    // Pre-printed letterhead support
    showHeader: boolean;
    showFooter: boolean;
    headerHeight: number;
    footerHeight: number;
}

/**
 * Default prescription settings
 */
export const getDefaultSettings = (): PrescriptionSettings => ({
    header: {
        // English (Left)
        doctorNameEn: "Dr. John Smith",
        titleEn: "MD, General Practitioner",
        bioEn: "Specialist in Family Medicine",
        // Persian (Right)
        doctorNameFa: "داکتر جان اسمیت",
        titleFa: "متخصص طب عمومی",
        bioFa: "متخصص طب خانواده",
        logoUrl: "",
        showLogo: false,
    },
    footer: {
        address: "123 Medical Center, Kabul, Afghanistan",
        phone: "+93 700 123 456",
        email: "doctor@clinic.com",
        signatureName: "Dr. John Smith",
        signatureTitle: "General Practitioner",
    },
    pageSize: "A4",
    showHeader: true,
    showFooter: true,
    headerHeight: 35,
    footerHeight: 45,
});

/**
 * Prescription data interface
 */
export interface PrescriptionData {
    patient: {
        name: string;
        idNumber: string;
        date: string;
        age: string;
        sex: string;
        phone: string;
        address: string;
    };
    medications: Array<{
        id: number;
        name: string;
        strength: string;
        frequency: string;
        duration: string;
        quantity: string;
        instructions: string;
    }>;
    diagnosis: string;
    vitals: {
        bloodPressure: string;
        heartRate: string;
        temperature: string;
        spO2: string;
    };
    allergies: string[];
    additionalNotes: string;
    accessCode?: string;
}

interface PrescriptionRendererProps {
    data: PrescriptionData;
    settings: PrescriptionSettings;
    scale?: number;
}

/**
 * PrescriptionRenderer Component
 * Renders a prescription document with customizable header/footer
 * Supports A4 and Letter page sizes
 */
const PrescriptionRenderer = forwardRef<HTMLDivElement, PrescriptionRendererProps>(
    ({ data, settings, scale = 1 }, ref) => {
        const paperSize = PAPER_SIZES[settings.pageSize];

        // Convert mm to pixels at 96 DPI (1mm = 3.7795px)
        const mmToPx = (mm: number) => mm * 3.7795;

        const pageStyle: React.CSSProperties = {
            width: `${mmToPx(paperSize.width)}px`,
            height: `${mmToPx(paperSize.height)}px`,
            maxHeight: `${mmToPx(paperSize.height)}px`,
            backgroundColor: "#ffffff",
            color: "#000000",
            fontFamily: "Calibri, 'Segoe UI', Arial, sans-serif",
            fontSize: "11pt",
            lineHeight: "1.4",
            padding: "15mm",
            boxSizing: "border-box",
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
            position: "relative",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
        };

        return (
            <div ref={ref} style={pageStyle} className="prescription-page">
                {/* Header Section - Shows content or blank space for letterhead */}
                {settings.showHeader ? (
                    <header style={{
                        borderBottom: "2px solid #333",
                        paddingBottom: "12px",
                        marginBottom: "15px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        flexShrink: 0,
                    }}>
                        {/* English - Left Side */}
                        <div style={{ textAlign: "left", flex: 1 }}>
                            <h1 style={{ margin: 0, fontSize: "14pt", fontWeight: "bold", color: "#000" }}>
                                {settings.header.doctorNameEn}
                            </h1>
                            <p style={{ margin: "2px 0 0 0", fontSize: "10pt", color: "#333", fontWeight: "500" }}>
                                {settings.header.titleEn}
                            </p>
                            <p style={{ margin: "2px 0 0 0", fontSize: "9pt", color: "#555", whiteSpace: "pre-line" }}>
                                {settings.header.bioEn}
                            </p>
                        </div>
                        {/* Logo - Center */}
                        {settings.header.showLogo && settings.header.logoUrl && (
                            <div style={{
                                width: "60px",
                                height: "60px",
                                border: "1px solid #ccc",
                                borderRadius: "4px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                backgroundColor: "#f5f5f5",
                                margin: "0 15px",
                                flexShrink: 0,
                            }}>
                                <span style={{ fontSize: "8pt", color: "#999" }}>Logo</span>
                            </div>
                        )}
                        {/* Persian - Right Side */}
                        <div style={{ textAlign: "right", flex: 1, direction: "rtl" }}>
                            <h1 style={{ margin: 0, fontSize: "14pt", fontWeight: "bold", color: "#000", fontFamily: "Calibri, 'B Nazanin', Tahoma, sans-serif" }}>
                                {settings.header.doctorNameFa}
                            </h1>
                            <p style={{ margin: "2px 0 0 0", fontSize: "10pt", color: "#333", fontWeight: "500", fontFamily: "Calibri, 'B Nazanin', Tahoma, sans-serif" }}>
                                {settings.header.titleFa}
                            </p>
                            <p style={{ margin: "2px 0 0 0", fontSize: "9pt", color: "#555", whiteSpace: "pre-line", fontFamily: "Calibri, 'B Nazanin', Tahoma, sans-serif" }}>
                                {settings.header.bioFa}
                            </p>
                        </div>
                    </header>
                ) : (
                    <div style={{ height: `${settings.headerHeight}mm`, marginBottom: "10px", flexShrink: 0 }} />
                )}

                {/* Prescription Title + Watermark */}
                <div style={{
                    textAlign: "center",
                    marginBottom: "15px",
                    padding: "8px",
                    backgroundColor: "#f5f5f5",
                    borderRadius: "4px",
                    flexShrink: 0,
                }}>
                    <h2 style={{ margin: 0, fontSize: "14pt", fontWeight: "bold", color: "#000" }}>
                        ℞ PRESCRIPTION
                    </h2>
                    {data.accessCode && (
                        <div>
                            <p style={{ margin: "4px 0 0 0", fontSize: "10pt", color: "#000", fontWeight: "bold", letterSpacing: "1px" }}>
                                CODE: {data.accessCode}
                            </p>
                            <p style={{ margin: "2px 0 0 0", fontSize: "7pt", color: "#444" }}>
                                Verify at tabibn.com/verify
                            </p>
                        </div>
                    )}
                    <p style={{ margin: "4px 0 0 0", fontSize: "7pt", color: "#888" }}>
                        tabibn.com
                    </p>
                </div>

                {/* Patient Information */}
                <section style={{ marginBottom: "20px" }}>
                    <h3 style={{
                        fontSize: "12pt",
                        fontWeight: "bold",
                        borderBottom: "1px solid #ddd",
                        paddingBottom: "5px",
                        marginBottom: "10px",
                        color: "#333"
                    }}>
                        Patient Information
                    </h3>
                    <table style={{ width: "100%", fontSize: "11pt" }}>
                        <tbody>
                            <tr>
                                <td style={{ padding: "4px 0", width: "50%" }}>
                                    <strong>Name:</strong> {data.patient.name || "—"}
                                </td>
                                <td style={{ padding: "4px 0" }}>
                                    <strong>Date:</strong> {data.patient.date || "—"}
                                </td>
                            </tr>
                            <tr>
                                <td style={{ padding: "4px 0" }}>
                                    <strong>Age:</strong> {data.patient.age || "—"} years
                                </td>
                                <td style={{ padding: "4px 0" }}>
                                    <strong>Sex:</strong> {data.patient.sex || "—"}
                                </td>
                            </tr>
                            <tr>
                                <td style={{ padding: "4px 0" }}>
                                    <strong>ID:</strong> {data.patient.idNumber || "—"}
                                </td>
                                <td style={{ padding: "4px 0" }}>
                                    <strong>Phone:</strong> {data.patient.phone || "—"}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </section>

                {/* Diagnosis */}
                {data.diagnosis && (
                    <section style={{ marginBottom: "20px" }}>
                        <h3 style={{
                            fontSize: "12pt",
                            fontWeight: "bold",
                            borderBottom: "1px solid #ddd",
                            paddingBottom: "5px",
                            marginBottom: "10px",
                            color: "#333"
                        }}>
                            Diagnosis
                        </h3>
                        <p style={{ margin: 0, fontSize: "11pt" }}>{data.diagnosis}</p>
                    </section>
                )}

                {/* Allergies Warning */}
                {data.allergies.length > 0 && (
                    <section style={{
                        marginBottom: "20px",
                        padding: "10px",
                        backgroundColor: "#f5f5f5",
                        border: "1px solid #ccc",
                        borderRadius: "4px"
                    }}>
                        <strong style={{ color: "#333" }}>⚠ Allergies:</strong>{" "}
                        <span style={{ color: "#000" }}>{data.allergies.join(", ")}</span>
                    </section>
                )}

                {/* Medications */}
                <section style={{ marginBottom: "20px" }}>
                    <h3 style={{
                        fontSize: "12pt",
                        fontWeight: "bold",
                        borderBottom: "1px solid #ddd",
                        paddingBottom: "5px",
                        marginBottom: "10px",
                        color: "#333"
                    }}>
                        Medications
                    </h3>
                    {data.medications.length === 0 ? (
                        <p style={{ fontSize: "11pt", color: "#666", fontStyle: "italic" }}>
                            No medications prescribed.
                        </p>
                    ) : (
                        <table style={{
                            width: "100%",
                            borderCollapse: "collapse",
                            fontSize: "11pt"
                        }}>
                            <thead>
                                <tr style={{ backgroundColor: "#f5f5f5" }}>
                                    <th style={{ border: "1px solid #ddd", padding: "8px", textAlign: "left" }}>#</th>
                                    <th style={{ border: "1px solid #ddd", padding: "8px", textAlign: "left" }}>Medication</th>
                                    <th style={{ border: "1px solid #ddd", padding: "8px", textAlign: "left" }}>Strength</th>
                                    <th style={{ border: "1px solid #ddd", padding: "8px", textAlign: "left" }}>Frequency</th>
                                    <th style={{ border: "1px solid #ddd", padding: "8px", textAlign: "left" }}>Duration</th>
                                    <th style={{ border: "1px solid #ddd", padding: "8px", textAlign: "left" }}>Qty</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.medications.map((med, index) => (
                                    <React.Fragment key={med.id}>
                                        <tr>
                                            <td style={{ border: "1px solid #ddd", padding: "8px" }}>{index + 1}</td>
                                            <td style={{ border: "1px solid #ddd", padding: "8px", fontWeight: "bold" }}>{med.name}</td>
                                            <td style={{ border: "1px solid #ddd", padding: "8px" }}>{med.strength || "—"}</td>
                                            <td style={{ border: "1px solid #ddd", padding: "8px" }}>{med.frequency || "—"}</td>
                                            <td style={{ border: "1px solid #ddd", padding: "8px" }}>{med.duration || "—"}</td>
                                            <td style={{ border: "1px solid #ddd", padding: "8px" }}>{med.quantity || "—"}</td>
                                        </tr>
                                        {med.instructions && (
                                            <tr>
                                                <td style={{ border: "1px solid #ddd", padding: "8px" }}></td>
                                                <td colSpan={5} style={{
                                                    border: "1px solid #ddd",
                                                    padding: "8px",
                                                    fontStyle: "italic",
                                                    color: "#666",
                                                    fontSize: "10pt"
                                                }}>
                                                    📝 {med.instructions}
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    )}
                </section>

                {/* Vitals (if any filled) */}
                {(data.vitals.bloodPressure || data.vitals.heartRate || data.vitals.temperature || data.vitals.spO2) && (
                    <section style={{ marginBottom: "20px" }}>
                        <h3 style={{
                            fontSize: "12pt",
                            fontWeight: "bold",
                            borderBottom: "1px solid #ddd",
                            paddingBottom: "5px",
                            marginBottom: "10px",
                            color: "#333"
                        }}>
                            Vital Signs
                        </h3>
                        <div style={{ display: "flex", gap: "20px", fontSize: "11pt" }}>
                            {data.vitals.bloodPressure && <span><strong>BP:</strong> {data.vitals.bloodPressure}</span>}
                            {data.vitals.heartRate && <span><strong>HR:</strong> {data.vitals.heartRate}</span>}
                            {data.vitals.temperature && <span><strong>Temp:</strong> {data.vitals.temperature}</span>}
                            {data.vitals.spO2 && <span><strong>SpO2:</strong> {data.vitals.spO2}</span>}
                        </div>
                    </section>
                )}

                {/* Additional Notes */}
                {data.additionalNotes && (
                    <section style={{ marginBottom: "30px" }}>
                        <h3 style={{
                            fontSize: "12pt",
                            fontWeight: "bold",
                            borderBottom: "1px solid #ddd",
                            paddingBottom: "5px",
                            marginBottom: "10px",
                            color: "#333"
                        }}>
                            Additional Notes
                        </h3>
                        <p style={{ margin: 0, fontSize: "11pt" }}>{data.additionalNotes}</p>
                    </section>
                )}

                {/* Footer Section */}
                {settings.showFooter ? (
                    <footer style={{
                        marginTop: "auto",
                        paddingTop: "15px",
                        borderTop: "1px solid #ccc",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-end",
                        flexShrink: 0,
                    }}>
                        {/* Contact Details - Left, stacked */}
                        <div style={{ fontSize: "9pt", color: "#333", lineHeight: "1.6" }}>
                            <div><strong>Address:</strong> {settings.footer.address}</div>
                            <div><strong>Phone:</strong> {settings.footer.phone}</div>
                            <div><strong>Email:</strong> {settings.footer.email}</div>
                        </div>

                        {/* Signature Area - Right */}
                        <div style={{ textAlign: "center", width: "180px" }}>
                            <div style={{
                                borderBottom: "1px solid #333",
                                height: "40px",
                                marginBottom: "4px"
                            }}></div>
                            <p style={{ margin: 0, fontSize: "10pt", fontWeight: "bold", color: "#000" }}>
                                {settings.footer.signatureName}
                            </p>
                            <p style={{ margin: 0, fontSize: "9pt", color: "#555" }}>
                                {settings.footer.signatureTitle}
                            </p>
                        </div>
                    </footer>
                ) : (
                    <div style={{ height: `${settings.footerHeight}mm`, marginTop: "auto", flexShrink: 0 }} />
                )}
            </div>
        );
    }
);

PrescriptionRenderer.displayName = "PrescriptionRenderer";

export default PrescriptionRenderer;
