"use client";

import React from "react";
import { PrescriptionSettings, PAPER_SIZES, PaperSize } from "./PrescriptionRenderer";

interface HeaderFooterSettingsProps {
    settings: PrescriptionSettings;
    onSettingsChange: (settings: PrescriptionSettings) => void;
    onClose: () => void;
}

/**
 * HeaderFooterSettings Component
 * Settings panel for customizing prescription header and footer
 */
export default function HeaderFooterSettings({
    settings,
    onSettingsChange,
    onClose,
}: HeaderFooterSettingsProps) {
    const updateHeader = (field: keyof PrescriptionSettings["header"], value: string | boolean) => {
        onSettingsChange({
            ...settings,
            header: { ...settings.header, [field]: value },
        });
    };

    const updateFooter = (field: keyof PrescriptionSettings["footer"], value: string) => {
        onSettingsChange({
            ...settings,
            footer: { ...settings.footer, [field]: value },
        });
    };

    const updatePageSize = (size: PaperSize) => {
        onSettingsChange({
            ...settings,
            pageSize: size,
        });
    };

    const inputStyle: React.CSSProperties = {
        width: "100%",
        padding: "8px 12px",
        borderRadius: "8px",
        border: "1px solid var(--input-border)",
        backgroundColor: "var(--input-bg)",
        color: "var(--foreground)",
        fontSize: "14px",
        outline: "none",
    };

    const labelStyle: React.CSSProperties = {
        display: "block",
        fontSize: "12px",
        fontWeight: 500,
        color: "var(--muted)",
        marginBottom: "4px",
    };

    return (
        <div
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(0,0,0,0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1000,
            }}
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div
                style={{
                    backgroundColor: "var(--card-bg)",
                    borderRadius: "16px",
                    width: "90%",
                    maxWidth: "600px",
                    maxHeight: "85vh",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                {/* Header */}
                <div
                    style={{
                        padding: "20px 24px",
                        borderBottom: "1px solid var(--card-border)",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 600, color: "var(--foreground)" }}>
                        Prescription Settings
                    </h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            padding: "4px",
                            color: "var(--muted)",
                        }}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div style={{ padding: "24px", overflowY: "auto", flex: 1 }}>
                    {/* Page Size Selection */}
                    <div style={{ marginBottom: "24px" }}>
                        <label style={{ ...labelStyle, marginBottom: "8px" }}>Page Size</label>
                        <div style={{ display: "flex", gap: "12px" }}>
                            {(Object.keys(PAPER_SIZES) as PaperSize[]).map((size) => (
                                <button
                                    key={size}
                                    onClick={() => updatePageSize(size)}
                                    style={{
                                        flex: 1,
                                        padding: "12px",
                                        borderRadius: "8px",
                                        border: settings.pageSize === size
                                            ? "2px solid var(--primary)"
                                            : "1px solid var(--input-border)",
                                        backgroundColor: settings.pageSize === size
                                            ? "rgba(13, 148, 136, 0.1)"
                                            : "var(--input-bg)",
                                        color: "var(--foreground)",
                                        cursor: "pointer",
                                        transition: "all 0.2s",
                                    }}
                                >
                                    <div style={{ fontWeight: 600 }}>{size}</div>
                                    <div style={{ fontSize: "11px", color: "var(--muted)" }}>
                                        {PAPER_SIZES[size].label}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Pre-printed Letterhead Section */}
                    <div style={{
                        marginBottom: "24px",
                        padding: "16px",
                        backgroundColor: "rgba(13, 148, 136, 0.05)",
                        borderRadius: "12px",
                        border: "1px solid rgba(13, 148, 136, 0.2)"
                    }}>
                        <h3 style={{
                            fontSize: "14px",
                            fontWeight: 600,
                            color: "var(--primary)",
                            marginBottom: "12px",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px"
                        }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                <line x1="3" y1="9" x2="21" y2="9" />
                                <line x1="3" y1="15" x2="21" y2="15" />
                            </svg>
                            Pre-printed Letterhead Mode
                        </h3>
                        <p style={{ fontSize: "12px", color: "var(--muted)", marginBottom: "16px" }}>
                            Disable header/footer to print on pre-printed letterheads. Adjust the blank space height to match your letterhead.
                        </p>

                        {/* Header Toggle */}
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                            <div>
                                <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--foreground)" }}>Show Header</span>
                                <p style={{ fontSize: "11px", color: "var(--muted)", margin: 0 }}>
                                    {settings.showHeader ? "Header content will be printed" : "Blank space for letterhead"}
                                </p>
                            </div>
                            <button
                                onClick={() => onSettingsChange({ ...settings, showHeader: !settings.showHeader })}
                                style={{
                                    width: "48px",
                                    height: "26px",
                                    borderRadius: "13px",
                                    border: "none",
                                    backgroundColor: settings.showHeader ? "var(--primary)" : "var(--input-border)",
                                    cursor: "pointer",
                                    position: "relative",
                                    transition: "all 0.2s"
                                }}
                            >
                                <div style={{
                                    width: "20px",
                                    height: "20px",
                                    borderRadius: "50%",
                                    backgroundColor: "#fff",
                                    position: "absolute",
                                    top: "3px",
                                    left: settings.showHeader ? "25px" : "3px",
                                    transition: "all 0.2s",
                                    boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
                                }} />
                            </button>
                        </div>

                        {/* Header Height (shown when header is disabled) */}
                        {!settings.showHeader && (
                            <div style={{ marginBottom: "16px", paddingLeft: "16px", borderLeft: "2px solid var(--primary)" }}>
                                <label style={labelStyle}>Header Space Height: {settings.headerHeight}mm</label>
                                <input
                                    type="range"
                                    min="20"
                                    max="80"
                                    value={settings.headerHeight}
                                    onChange={(e) => onSettingsChange({ ...settings, headerHeight: parseInt(e.target.value) })}
                                    style={{ width: "100%", accentColor: "var(--primary)" }}
                                />
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "var(--muted)" }}>
                                    <span>20mm</span>
                                    <span>80mm</span>
                                </div>
                            </div>
                        )}

                        {/* Footer Toggle */}
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                            <div>
                                <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--foreground)" }}>Show Footer</span>
                                <p style={{ fontSize: "11px", color: "var(--muted)", margin: 0 }}>
                                    {settings.showFooter ? "Footer/signature will be printed" : "Blank space for letterhead"}
                                </p>
                            </div>
                            <button
                                onClick={() => onSettingsChange({ ...settings, showFooter: !settings.showFooter })}
                                style={{
                                    width: "48px",
                                    height: "26px",
                                    borderRadius: "13px",
                                    border: "none",
                                    backgroundColor: settings.showFooter ? "var(--primary)" : "var(--input-border)",
                                    cursor: "pointer",
                                    position: "relative",
                                    transition: "all 0.2s"
                                }}
                            >
                                <div style={{
                                    width: "20px",
                                    height: "20px",
                                    borderRadius: "50%",
                                    backgroundColor: "#fff",
                                    position: "absolute",
                                    top: "3px",
                                    left: settings.showFooter ? "25px" : "3px",
                                    transition: "all 0.2s",
                                    boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
                                }} />
                            </button>
                        </div>

                        {/* Footer Height (shown when footer is disabled) */}
                        {!settings.showFooter && (
                            <div style={{ paddingLeft: "16px", borderLeft: "2px solid var(--primary)" }}>
                                <label style={labelStyle}>Footer Space Height: {settings.footerHeight}mm</label>
                                <input
                                    type="range"
                                    min="20"
                                    max="80"
                                    value={settings.footerHeight}
                                    onChange={(e) => onSettingsChange({ ...settings, footerHeight: parseInt(e.target.value) })}
                                    style={{ width: "100%", accentColor: "var(--primary)" }}
                                />
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "var(--muted)" }}>
                                    <span>20mm</span>
                                    <span>80mm</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Header Settings */}
                    <div style={{ marginBottom: "24px" }}>
                        <h3 style={{
                            fontSize: "14px",
                            fontWeight: 600,
                            color: "var(--foreground)",
                            marginBottom: "16px",
                            paddingBottom: "8px",
                            borderBottom: "1px solid var(--card-border)"
                        }}>
                            Header Information
                        </h3>
                        <div style={{ display: "grid", gap: "16px" }}>
                            <div>
                                <label style={labelStyle}>Clinic Name</label>
                                <input
                                    type="text"
                                    value={settings.header.clinicName}
                                    onChange={(e) => updateHeader("clinicName", e.target.value)}
                                    placeholder="Enter clinic name"
                                    style={inputStyle}
                                />
                            </div>
                            <div>
                                <label style={labelStyle}>Address</label>
                                <input
                                    type="text"
                                    value={settings.header.address}
                                    onChange={(e) => updateHeader("address", e.target.value)}
                                    placeholder="Enter clinic address"
                                    style={inputStyle}
                                />
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                                <div>
                                    <label style={labelStyle}>Phone</label>
                                    <input
                                        type="text"
                                        value={settings.header.phone}
                                        onChange={(e) => updateHeader("phone", e.target.value)}
                                        placeholder="Phone number"
                                        style={inputStyle}
                                    />
                                </div>
                                <div>
                                    <label style={labelStyle}>Email</label>
                                    <input
                                        type="email"
                                        value={settings.header.email}
                                        onChange={(e) => updateHeader("email", e.target.value)}
                                        placeholder="Email address"
                                        style={inputStyle}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Settings */}
                    <div>
                        <h3 style={{
                            fontSize: "14px",
                            fontWeight: 600,
                            color: "var(--foreground)",
                            marginBottom: "16px",
                            paddingBottom: "8px",
                            borderBottom: "1px solid var(--card-border)"
                        }}>
                            Footer Information
                        </h3>
                        <div style={{ display: "grid", gap: "16px" }}>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                                <div>
                                    <label style={labelStyle}>Doctor Name</label>
                                    <input
                                        type="text"
                                        value={settings.footer.doctorName}
                                        onChange={(e) => updateFooter("doctorName", e.target.value)}
                                        placeholder="Dr. Name"
                                        style={inputStyle}
                                    />
                                </div>
                                <div>
                                    <label style={labelStyle}>License Number</label>
                                    <input
                                        type="text"
                                        value={settings.footer.licenseNumber}
                                        onChange={(e) => updateFooter("licenseNumber", e.target.value)}
                                        placeholder="License #"
                                        style={inputStyle}
                                    />
                                </div>
                            </div>
                            <div>
                                <label style={labelStyle}>Signature Label</label>
                                <input
                                    type="text"
                                    value={settings.footer.signatureLabel}
                                    onChange={(e) => updateFooter("signatureLabel", e.target.value)}
                                    placeholder="e.g., Doctor's Signature"
                                    style={inputStyle}
                                />
                            </div>
                            <div>
                                <label style={labelStyle}>Disclaimer Text</label>
                                <textarea
                                    value={settings.footer.disclaimer}
                                    onChange={(e) => updateFooter("disclaimer", e.target.value)}
                                    placeholder="Disclaimer or additional notes"
                                    rows={3}
                                    style={{ ...inputStyle, resize: "vertical" }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div
                    style={{
                        padding: "16px 24px",
                        borderTop: "1px solid var(--card-border)",
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: "12px",
                    }}
                >
                    <button
                        onClick={onClose}
                        style={{
                            padding: "10px 20px",
                            borderRadius: "8px",
                            border: "1px solid var(--input-border)",
                            backgroundColor: "transparent",
                            color: "var(--foreground)",
                            fontSize: "14px",
                            fontWeight: 500,
                            cursor: "pointer",
                        }}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
