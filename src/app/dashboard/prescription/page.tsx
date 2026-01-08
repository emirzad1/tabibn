"use client";

import { useState, useMemo } from "react";

/**
 * PRESCRIPTION PAGE
 * 
 * Layout:
 * - Prescription Tabs (top) - navigate between open prescriptions
 * - Left column (main): Patient Information + Medication cards stacked
 * - Right column (sidebar-like): Prescription Enhancers (tabbed) + Print/Export
 * 
 * BACKEND INTEGRATION NOTES:
 * -------------------------
 * 1. Patient Information: Save patient data to database
 * 2. Multiple prescriptions: Track open prescriptions in state/backend
 * 3. Medication: Add medications with dosage, frequency, duration
 * 4. Enhancers: Save diagnosis, vitals, allergies, notes with prescription
 * 5. Print/Export: Generate PDF, print, or save prescription
 */

// Tab options for Prescription Enhancers
const enhancerTabs = [
    { id: "diagnosis", label: "Diagnosis" },
    { id: "vitals", label: "Vital Signs" },
    { id: "allergies", label: "Allergies" },
    { id: "notes", label: "Additional Notes" },
];

// Format date as YYYY-MM-DD for input
const formatDate = (date: Date) => {
    return date.toISOString().split("T")[0];
};

// Initial patient form state
const getInitialPatientData = () => ({
    name: "",
    idNumber: "",
    date: formatDate(new Date()),
    age: "",
    sex: "",
    phone: "",
    address: "",
    weight: "",
    height: "",
    note: "",
});

// Medication type
interface Medication {
    id: number;
    name: string;
    strength: string;
    frequency: string;
    duration: string;
    quantity: string;
    instructions: string;
}

// Initial medication form state
const getInitialMedication = (): Omit<Medication, "id"> => ({
    name: "",
    strength: "",
    frequency: "",
    duration: "",
    quantity: "",
    instructions: "",
});

// Mock open prescriptions for tabs
const initialPrescriptions = [
    { id: 1, label: "New Prescription", isNew: true },
];

export default function PrescriptionPage() {
    const [activeEnhancerTab, setActiveEnhancerTab] = useState("diagnosis");
    const [showMoreInfo, setShowMoreInfo] = useState(false);
    const [patientData, setPatientData] = useState(getInitialPatientData());
    const [prescriptions, setPrescriptions] = useState(initialPrescriptions);
    const [activePrescriptionId, setActivePrescriptionId] = useState(1);

    // Medication state
    const [medications, setMedications] = useState<Medication[]>([]);
    const [currentMedication, setCurrentMedication] = useState(getInitialMedication());
    const [showMedInstructions, setShowMedInstructions] = useState(false);
    const [nextMedId, setNextMedId] = useState(1);

    // Calculate BMI automatically
    const bmi = useMemo(() => {
        const weightKg = parseFloat(patientData.weight);
        const heightCm = parseFloat(patientData.height);
        if (weightKg > 0 && heightCm > 0) {
            const heightM = heightCm / 100;
            const bmiValue = weightKg / (heightM * heightM);
            return bmiValue.toFixed(1);
        }
        return "";
    }, [patientData.weight, patientData.height]);

    // Handle input changes
    const handlePatientChange = (field: string, value: string) => {
        setPatientData((prev) => ({ ...prev, [field]: value }));
    };

    // Clear all patient data
    const handleClear = () => {
        setPatientData(getInitialPatientData());
        setShowMoreInfo(false);
    };

    // Save patient data
    const handleSave = () => {
        /**
         * TODO: BACKEND INTEGRATION
         * - Validate required fields
         * - Save patient data to database
         * - Show success message
         */
        console.log("Saving patient data:", patientData, "BMI:", bmi);
        alert("Patient information saved! (placeholder)");
    };

    // Add new prescription tab
    const handleAddPrescription = () => {
        const newId = Math.max(...prescriptions.map((p) => p.id)) + 1;
        setPrescriptions([
            ...prescriptions,
            { id: newId, label: `Prescription ${newId}`, isNew: true },
        ]);
        setActivePrescriptionId(newId);
    };

    // Close prescription tab
    const handleClosePrescription = (id: number) => {
        if (prescriptions.length === 1) return; // Keep at least one
        const remaining = prescriptions.filter((p) => p.id !== id);
        setPrescriptions(remaining);
        if (activePrescriptionId === id) {
            setActivePrescriptionId(remaining[remaining.length - 1].id);
        }
    };

    // Handle medication input changes
    const handleMedicationChange = (field: string, value: string) => {
        setCurrentMedication((prev) => ({ ...prev, [field]: value }));
    };

    // State for editing
    const [editingMedicationId, setEditingMedicationId] = useState<number | null>(null);

    // Add or update medication
    const handleAddMedication = () => {
        if (!currentMedication.name.trim()) return;

        if (editingMedicationId !== null) {
            // Update existing medication
            setMedications((prev) =>
                prev.map((med) =>
                    med.id === editingMedicationId
                        ? { ...currentMedication, id: editingMedicationId }
                        : med
                )
            );
            setEditingMedicationId(null);
            // Clear form after editing
            setCurrentMedication(getInitialMedication());
            setShowMedInstructions(false);
        } else {
            // Add new medication - keep form values for next entry
            const newMedication: Medication = {
                id: nextMedId,
                ...currentMedication,
            };
            setMedications((prev) => [...prev, newMedication]);
            setNextMedId((prev) => prev + 1);
            // Form values remain - user can manually edit or clear
        }
    };

    // Edit medication - populate form with medication data
    const handleEditMedication = (med: Medication) => {
        setCurrentMedication({
            name: med.name,
            strength: med.strength,
            frequency: med.frequency,
            duration: med.duration,
            quantity: med.quantity,
            instructions: med.instructions,
        });
        setEditingMedicationId(med.id);
        if (med.instructions) {
            setShowMedInstructions(true);
        }
    };

    // Cancel editing
    const handleCancelEdit = () => {
        setCurrentMedication(getInitialMedication());
        setEditingMedicationId(null);
        setShowMedInstructions(false);
    };

    // Remove medication from list
    const handleRemoveMedication = (id: number) => {
        setMedications((prev) => prev.filter((med) => med.id !== id));
        if (editingMedicationId === id) {
            handleCancelEdit();
        }
    };

    return (
        <div>
            {/* Prescription Tabs - Like IDE file tabs - Sticky at very top */}
            <div
                className="sticky top-0 z-10 flex items-center gap-1 py-3 border-b overflow-x-auto -mx-8 px-8"
                style={{ borderColor: "var(--card-border)", backgroundColor: "var(--background)" }}
            >
                {prescriptions.map((prescription) => (
                    <div
                        key={prescription.id}
                        className={`flex items-center gap-2 px-4 py-2 rounded-t-lg cursor-pointer transition-all ${activePrescriptionId === prescription.id ? "" : "hover:opacity-80"
                            }`}
                        style={{
                            backgroundColor:
                                activePrescriptionId === prescription.id
                                    ? "var(--card-bg)"
                                    : "transparent",
                            color:
                                activePrescriptionId === prescription.id
                                    ? "var(--foreground)"
                                    : "var(--muted)",
                            borderBottom:
                                activePrescriptionId === prescription.id
                                    ? "2px solid var(--primary)"
                                    : "2px solid transparent",
                        }}
                        onClick={() => setActivePrescriptionId(prescription.id)}
                    >
                        <span className="text-sm font-medium whitespace-nowrap">
                            {prescription.label}
                        </span>
                        {prescriptions.length > 1 && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleClosePrescription(prescription.id);
                                }}
                                className="p-0.5 rounded hover:opacity-60"
                            >
                                <svg
                                    width="14"
                                    height="14"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                >
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        )}
                    </div>
                ))}
                {/* Add new prescription button */}
                <button
                    onClick={handleAddPrescription}
                    className="p-2 rounded-lg hover:opacity-70 transition-all"
                    style={{ color: "var(--muted)" }}
                >
                    <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                    >
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                </button>
            </div>

            {/* Main Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
                {/* Left Column - Main Content (2/3 width) */}
                <div className="lg:col-span-2 space-y-4">
                    {/* Patient Information Card */}
                    <div
                        className="rounded-xl"
                        style={{
                            backgroundColor: "var(--card-bg)",
                            border: "1px solid var(--card-border)",
                        }}
                    >
                        {/* Card Header with Title and Actions */}
                        <div
                            className="flex items-center justify-between px-4 py-2.5 border-b"
                            style={{ borderColor: "var(--card-border)" }}
                        >
                            <h2
                                className="text-sm font-semibold"
                                style={{ color: "var(--foreground)" }}
                            >
                                Patient Information
                            </h2>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleClear}
                                    className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:opacity-80"
                                    style={{
                                        backgroundColor: "transparent",
                                        color: "var(--muted)",
                                        border: "1px solid var(--input-border)",
                                    }}
                                >
                                    Clear
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:opacity-90"
                                    style={{
                                        backgroundColor: "var(--primary)",
                                        color: "var(--background)",
                                    }}
                                >
                                    Save
                                </button>
                            </div>
                        </div>

                        {/* Form Content */}
                        <div className="p-4 space-y-3">
                            {/* Row 1: Name, ID, Date */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div>
                                    <label
                                        className="block text-xs font-medium mb-1"
                                        style={{ color: "var(--muted)" }}
                                    >
                                        Patient Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={patientData.name}
                                        onChange={(e) => handlePatientChange("name", e.target.value)}
                                        placeholder="Full name"
                                        className="w-full px-3 py-2 rounded-lg text-sm outline-none transition-all"
                                        style={{
                                            backgroundColor: "var(--input-bg)",
                                            border: "1px solid var(--input-border)",
                                            color: "var(--foreground)",
                                        }}
                                    />
                                </div>
                                <div>
                                    <label
                                        className="block text-xs font-medium mb-1"
                                        style={{ color: "var(--muted)" }}
                                    >
                                        ID Number
                                    </label>
                                    <input
                                        type="text"
                                        value={patientData.idNumber}
                                        onChange={(e) => handlePatientChange("idNumber", e.target.value)}
                                        placeholder="National ID"
                                        className="w-full px-3 py-2 rounded-lg text-sm outline-none transition-all"
                                        style={{
                                            backgroundColor: "var(--input-bg)",
                                            border: "1px solid var(--input-border)",
                                            color: "var(--foreground)",
                                        }}
                                    />
                                </div>
                                <div>
                                    <label
                                        className="block text-xs font-medium mb-1"
                                        style={{ color: "var(--muted)" }}
                                    >
                                        Date
                                    </label>
                                    <input
                                        type="date"
                                        value={patientData.date}
                                        onChange={(e) => handlePatientChange("date", e.target.value)}
                                        className="w-full px-3 py-2 rounded-lg text-sm outline-none transition-all"
                                        style={{
                                            backgroundColor: "var(--input-bg)",
                                            border: "1px solid var(--input-border)",
                                            color: "var(--foreground)",
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Row 2: Age, Sex, Phone, Address */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <div>
                                    <label
                                        className="block text-xs font-medium mb-1"
                                        style={{ color: "var(--muted)" }}
                                    >
                                        Age
                                    </label>
                                    <input
                                        type="number"
                                        value={patientData.age}
                                        onChange={(e) => handlePatientChange("age", e.target.value)}
                                        placeholder="Years"
                                        min="0"
                                        max="150"
                                        className="w-full px-3 py-2 rounded-lg text-sm outline-none transition-all"
                                        style={{
                                            backgroundColor: "var(--input-bg)",
                                            border: "1px solid var(--input-border)",
                                            color: "var(--foreground)",
                                        }}
                                    />
                                </div>
                                <div>
                                    <label
                                        className="block text-xs font-medium mb-1"
                                        style={{ color: "var(--muted)" }}
                                    >
                                        Sex
                                    </label>
                                    <div className="flex items-center gap-3 h-[36px]">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="sex"
                                                value="male"
                                                checked={patientData.sex === "male"}
                                                onChange={(e) => handlePatientChange("sex", e.target.value)}
                                                className="w-4 h-4"
                                                style={{ accentColor: "var(--primary)" }}
                                            />
                                            <span className="text-sm" style={{ color: "var(--foreground)" }}>
                                                Male
                                            </span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="sex"
                                                value="female"
                                                checked={patientData.sex === "female"}
                                                onChange={(e) => handlePatientChange("sex", e.target.value)}
                                                className="w-4 h-4"
                                                style={{ accentColor: "var(--primary)" }}
                                            />
                                            <span className="text-sm" style={{ color: "var(--foreground)" }}>
                                                Female
                                            </span>
                                        </label>
                                    </div>
                                </div>
                                <div>
                                    <label
                                        className="block text-xs font-medium mb-1"
                                        style={{ color: "var(--muted)" }}
                                    >
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        value={patientData.phone}
                                        onChange={(e) => handlePatientChange("phone", e.target.value)}
                                        placeholder="+93..."
                                        className="w-full px-3 py-2 rounded-lg text-sm outline-none transition-all"
                                        style={{
                                            backgroundColor: "var(--input-bg)",
                                            border: "1px solid var(--input-border)",
                                            color: "var(--foreground)",
                                        }}
                                    />
                                </div>
                                <div>
                                    <label
                                        className="block text-xs font-medium mb-1"
                                        style={{ color: "var(--muted)" }}
                                    >
                                        Address
                                    </label>
                                    <input
                                        type="text"
                                        value={patientData.address}
                                        onChange={(e) => handlePatientChange("address", e.target.value)}
                                        placeholder="City, Street"
                                        className="w-full px-3 py-2 rounded-lg text-sm outline-none transition-all"
                                        style={{
                                            backgroundColor: "var(--input-bg)",
                                            border: "1px solid var(--input-border)",
                                            color: "var(--foreground)",
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Collapsible Row 3: Weight, Height, BMI, Note */}
                            <div>
                                <button
                                    onClick={() => setShowMoreInfo(!showMoreInfo)}
                                    className="flex items-center gap-1.5 text-xs font-medium transition-all hover:opacity-80"
                                    style={{ color: "var(--muted)" }}
                                >
                                    <svg
                                        width="14"
                                        height="14"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        className={`transition-transform ${showMoreInfo ? "rotate-90" : ""}`}
                                    >
                                        <polyline points="9 18 15 12 9 6" />
                                    </svg>
                                    {showMoreInfo ? "Hide" : "Show"} Additional Information
                                </button>

                                {showMoreInfo && (
                                    <div className="mt-3 pt-3 border-t space-y-3" style={{ borderColor: "var(--card-border)" }}>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                            <div>
                                                <label
                                                    className="block text-xs font-medium mb-1"
                                                    style={{ color: "var(--muted)" }}
                                                >
                                                    Weight (kg)
                                                </label>
                                                <input
                                                    type="number"
                                                    value={patientData.weight}
                                                    onChange={(e) => handlePatientChange("weight", e.target.value)}
                                                    placeholder="70"
                                                    min="0"
                                                    step="0.1"
                                                    className="w-full px-3 py-2 rounded-lg text-sm outline-none transition-all"
                                                    style={{
                                                        backgroundColor: "var(--input-bg)",
                                                        border: "1px solid var(--input-border)",
                                                        color: "var(--foreground)",
                                                    }}
                                                />
                                            </div>
                                            <div>
                                                <label
                                                    className="block text-xs font-medium mb-1"
                                                    style={{ color: "var(--muted)" }}
                                                >
                                                    Height (cm)
                                                </label>
                                                <input
                                                    type="number"
                                                    value={patientData.height}
                                                    onChange={(e) => handlePatientChange("height", e.target.value)}
                                                    placeholder="170"
                                                    min="0"
                                                    className="w-full px-3 py-2 rounded-lg text-sm outline-none transition-all"
                                                    style={{
                                                        backgroundColor: "var(--input-bg)",
                                                        border: "1px solid var(--input-border)",
                                                        color: "var(--foreground)",
                                                    }}
                                                />
                                            </div>
                                            <div>
                                                <label
                                                    className="block text-xs font-medium mb-1"
                                                    style={{ color: "var(--muted)" }}
                                                >
                                                    BMI (auto)
                                                </label>
                                                <input
                                                    type="text"
                                                    value={bmi ? `${bmi} kg/m²` : ""}
                                                    readOnly
                                                    placeholder="-"
                                                    className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                                                    style={{
                                                        backgroundColor: "var(--background)",
                                                        border: "1px solid var(--input-border)",
                                                        color: "var(--foreground)",
                                                    }}
                                                />
                                            </div>
                                            <div className="md:col-span-1">
                                                {/* Empty space for alignment */}
                                            </div>
                                        </div>
                                        <div>
                                            <label
                                                className="block text-xs font-medium mb-1"
                                                style={{ color: "var(--muted)" }}
                                            >
                                                Note
                                            </label>
                                            <textarea
                                                value={patientData.note}
                                                onChange={(e) => handlePatientChange("note", e.target.value)}
                                                placeholder="Additional notes..."
                                                rows={2}
                                                className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none transition-all"
                                                style={{
                                                    backgroundColor: "var(--input-bg)",
                                                    border: "1px solid var(--input-border)",
                                                    color: "var(--foreground)",
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Medication Section - Takes remaining height */}
                    <div
                        className="rounded-xl overflow-hidden flex flex-col flex-1"
                        style={{
                            backgroundColor: "var(--card-bg)",
                            border: "1px solid var(--card-border)",
                            minHeight: "200px",
                        }}
                    >
                        {/* Add Medication Form - Fixed at top */}
                        <div
                            className="p-4 border-b flex-shrink-0"
                            style={{ borderColor: "var(--card-border)" }}
                        >
                            <div className="flex items-center justify-between mb-3">
                                <h2
                                    className="text-sm font-semibold"
                                    style={{ color: "var(--foreground)" }}
                                >
                                    {editingMedicationId !== null ? "Edit Medication" : "Add Medication"}
                                </h2>
                                {editingMedicationId !== null && (
                                    <button
                                        onClick={handleCancelEdit}
                                        className="text-xs px-2 py-1 rounded transition-all hover:opacity-80"
                                        style={{ color: "var(--muted)" }}
                                    >
                                        Cancel
                                    </button>
                                )}
                            </div>

                            {/* Row 1: Name, Strength, Frequency, Duration, Quantity */}
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-2">
                                <div className="md:col-span-1">
                                    <input
                                        type="text"
                                        value={currentMedication.name}
                                        onChange={(e) => handleMedicationChange("name", e.target.value)}
                                        placeholder="Medication name *"
                                        className="w-full px-2 py-1.5 rounded text-sm outline-none"
                                        style={{
                                            backgroundColor: "var(--input-bg)",
                                            border: "1px solid var(--input-border)",
                                            color: "var(--foreground)",
                                        }}
                                    />
                                </div>
                                <div>
                                    <input
                                        type="text"
                                        value={currentMedication.strength}
                                        onChange={(e) => handleMedicationChange("strength", e.target.value)}
                                        placeholder="Strength"
                                        className="w-full px-2 py-1.5 rounded text-sm outline-none"
                                        style={{
                                            backgroundColor: "var(--input-bg)",
                                            border: "1px solid var(--input-border)",
                                            color: "var(--foreground)",
                                        }}
                                    />
                                </div>
                                <div>
                                    <input
                                        type="text"
                                        value={currentMedication.frequency}
                                        onChange={(e) => handleMedicationChange("frequency", e.target.value)}
                                        placeholder="Frequency"
                                        className="w-full px-2 py-1.5 rounded text-sm outline-none"
                                        style={{
                                            backgroundColor: "var(--input-bg)",
                                            border: "1px solid var(--input-border)",
                                            color: "var(--foreground)",
                                        }}
                                    />
                                </div>
                                <div>
                                    <input
                                        type="text"
                                        value={currentMedication.duration}
                                        onChange={(e) => handleMedicationChange("duration", e.target.value)}
                                        placeholder="Duration"
                                        className="w-full px-2 py-1.5 rounded text-sm outline-none"
                                        style={{
                                            backgroundColor: "var(--input-bg)",
                                            border: "1px solid var(--input-border)",
                                            color: "var(--foreground)",
                                        }}
                                    />
                                </div>
                                <div>
                                    <input
                                        type="text"
                                        value={currentMedication.quantity}
                                        onChange={(e) => handleMedicationChange("quantity", e.target.value)}
                                        placeholder="Qty"
                                        className="w-full px-2 py-1.5 rounded text-sm outline-none"
                                        style={{
                                            backgroundColor: "var(--input-bg)",
                                            border: "1px solid var(--input-border)",
                                            color: "var(--foreground)",
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Row 2: Collapsible Instructions + Add Button */}
                            <div className="flex items-start gap-2">
                                <div className="flex-1">
                                    <button
                                        onClick={() => setShowMedInstructions(!showMedInstructions)}
                                        className="flex items-center gap-1 text-xs transition-all hover:opacity-80 mb-1"
                                        style={{ color: "var(--muted)" }}
                                    >
                                        <svg
                                            width="12"
                                            height="12"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            className={`transition-transform ${showMedInstructions ? "rotate-90" : ""}`}
                                        >
                                            <polyline points="9 18 15 12 9 6" />
                                        </svg>
                                        Instructions
                                    </button>
                                    {showMedInstructions && (
                                        <input
                                            type="text"
                                            value={currentMedication.instructions}
                                            onChange={(e) => handleMedicationChange("instructions", e.target.value)}
                                            placeholder="Special instructions..."
                                            className="w-full px-2 py-1.5 rounded text-sm outline-none"
                                            style={{
                                                backgroundColor: "var(--input-bg)",
                                                border: "1px solid var(--input-border)",
                                                color: "var(--foreground)",
                                            }}
                                        />
                                    )}
                                </div>
                                <button
                                    onClick={handleAddMedication}
                                    disabled={!currentMedication.name.trim()}
                                    className="px-3 py-1.5 rounded text-xs font-medium transition-all hover:opacity-90 disabled:opacity-50"
                                    style={{
                                        backgroundColor: "var(--primary)",
                                        color: "var(--background)",
                                    }}
                                >
                                    {editingMedicationId !== null ? "Update" : "+ Add"}
                                </button>
                            </div>
                        </div>

                        {/* Medication List - Scrollable */}
                        <div className="flex-1 overflow-y-auto p-2">
                            {medications.length === 0 ? (
                                <div
                                    className="p-4 rounded text-center h-full flex items-center justify-center"
                                    style={{ color: "var(--muted)" }}
                                >
                                    <p className="text-xs">No medications added yet</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {medications.map((med, index) => (
                                        <div
                                            key={med.id}
                                            className="p-3 rounded-lg"
                                            style={{
                                                backgroundColor: "var(--background)",
                                                border: editingMedicationId === med.id
                                                    ? "2px solid var(--primary)"
                                                    : "1px solid var(--input-border)",
                                            }}
                                        >
                                            {/* Header with number, name and actions */}
                                            <div className="flex items-start gap-3 mb-2">
                                                <span
                                                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                                                    style={{
                                                        backgroundColor: "var(--primary)",
                                                        color: "var(--background)",
                                                    }}
                                                >
                                                    {index + 1}
                                                </span>
                                                <div className="flex-1">
                                                    <span className="text-base font-semibold" style={{ color: "var(--foreground)" }}>
                                                        {med.name}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1 flex-shrink-0">
                                                    <button
                                                        onClick={() => handleEditMedication(med)}
                                                        className="p-1.5 rounded hover:opacity-60"
                                                        style={{ color: "var(--muted)" }}
                                                        title="Edit"
                                                    >
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={() => handleRemoveMedication(med.id)}
                                                        className="p-1.5 rounded hover:opacity-60"
                                                        style={{ color: "var(--muted)" }}
                                                        title="Remove"
                                                    >
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <line x1="18" y1="6" x2="6" y2="18" />
                                                            <line x1="6" y1="6" x2="18" y2="18" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Data in columns */}
                                            <div className="grid grid-cols-4 gap-3 ml-9">
                                                {med.strength && (
                                                    <div>
                                                        <div className="text-[10px] uppercase tracking-wide mb-0.5" style={{ color: "var(--muted)" }}>Strength</div>
                                                        <div className="text-sm font-medium" style={{ color: "var(--foreground)" }}>{med.strength}</div>
                                                    </div>
                                                )}
                                                {med.frequency && (
                                                    <div>
                                                        <div className="text-[10px] uppercase tracking-wide mb-0.5" style={{ color: "var(--muted)" }}>Frequency</div>
                                                        <div className="text-sm font-medium" style={{ color: "var(--foreground)" }}>{med.frequency}</div>
                                                    </div>
                                                )}
                                                {med.duration && (
                                                    <div>
                                                        <div className="text-[10px] uppercase tracking-wide mb-0.5" style={{ color: "var(--muted)" }}>Duration</div>
                                                        <div className="text-sm font-medium" style={{ color: "var(--foreground)" }}>{med.duration}</div>
                                                    </div>
                                                )}
                                                {med.quantity && (
                                                    <div>
                                                        <div className="text-[10px] uppercase tracking-wide mb-0.5" style={{ color: "var(--muted)" }}>Quantity</div>
                                                        <div className="text-sm font-medium" style={{ color: "var(--foreground)" }}>{med.quantity}</div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Instructions */}
                                            {med.instructions && (
                                                <div className="mt-2 ml-9 text-xs italic" style={{ color: "var(--muted)" }}>
                                                    📝 {med.instructions}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column - Sidebar-like (1/3 width) */}
                <div className="space-y-6">
                    {/* Prescription Enhancers Card - Tabbed */}
                    <div
                        className="rounded-xl overflow-hidden"
                        style={{
                            backgroundColor: "var(--card-bg)",
                            border: "1px solid var(--card-border)",
                        }}
                    >
                        <h2
                            className="text-lg font-semibold px-6 pt-6 pb-4"
                            style={{ color: "var(--foreground)" }}
                        >
                            Prescription Enhancers
                        </h2>

                        {/* Tab Navigation - Windows Properties Style */}
                        <div
                            className="flex border-b"
                            style={{ borderColor: "var(--card-border)" }}
                        >
                            {enhancerTabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveEnhancerTab(tab.id)}
                                    className="flex-1 px-3 py-2 text-xs font-medium transition-all relative"
                                    style={{
                                        color:
                                            activeEnhancerTab === tab.id
                                                ? "var(--foreground)"
                                                : "var(--muted)",
                                        backgroundColor:
                                            activeEnhancerTab === tab.id
                                                ? "var(--card-bg)"
                                                : "var(--background)",
                                    }}
                                >
                                    {tab.label}
                                    {activeEnhancerTab === tab.id && (
                                        <span
                                            className="absolute bottom-0 left-0 right-0 h-0.5"
                                            style={{ backgroundColor: "var(--primary)" }}
                                        />
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Tab Content */}
                        <div className="p-6">
                            {activeEnhancerTab === "diagnosis" && (
                                <div>
                                    <textarea
                                        placeholder="Enter diagnosis..."
                                        className="w-full h-32 px-3 py-2 rounded-lg text-sm resize-none outline-none"
                                        style={{
                                            backgroundColor: "var(--input-bg)",
                                            border: "1px solid var(--input-border)",
                                            color: "var(--foreground)",
                                        }}
                                    />
                                </div>
                            )}

                            {activeEnhancerTab === "vitals" && (
                                <div className="space-y-3">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label
                                                className="block text-xs mb-1"
                                                style={{ color: "var(--muted)" }}
                                            >
                                                Blood Pressure
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="120/80"
                                                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                                                style={{
                                                    backgroundColor: "var(--input-bg)",
                                                    border: "1px solid var(--input-border)",
                                                    color: "var(--foreground)",
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <label
                                                className="block text-xs mb-1"
                                                style={{ color: "var(--muted)" }}
                                            >
                                                Heart Rate
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="72 bpm"
                                                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                                                style={{
                                                    backgroundColor: "var(--input-bg)",
                                                    border: "1px solid var(--input-border)",
                                                    color: "var(--foreground)",
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label
                                                className="block text-xs mb-1"
                                                style={{ color: "var(--muted)" }}
                                            >
                                                Temperature
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="98.6°F"
                                                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                                                style={{
                                                    backgroundColor: "var(--input-bg)",
                                                    border: "1px solid var(--input-border)",
                                                    color: "var(--foreground)",
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <label
                                                className="block text-xs mb-1"
                                                style={{ color: "var(--muted)" }}
                                            >
                                                SpO2
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="98%"
                                                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                                                style={{
                                                    backgroundColor: "var(--input-bg)",
                                                    border: "1px solid var(--input-border)",
                                                    color: "var(--foreground)",
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeEnhancerTab === "allergies" && (
                                <div>
                                    <textarea
                                        placeholder="List known allergies..."
                                        className="w-full h-32 px-3 py-2 rounded-lg text-sm resize-none outline-none"
                                        style={{
                                            backgroundColor: "var(--input-bg)",
                                            border: "1px solid var(--input-border)",
                                            color: "var(--foreground)",
                                        }}
                                    />
                                </div>
                            )}

                            {activeEnhancerTab === "notes" && (
                                <div>
                                    <textarea
                                        placeholder="Additional notes for this prescription..."
                                        className="w-full h-32 px-3 py-2 rounded-lg text-sm resize-none outline-none"
                                        style={{
                                            backgroundColor: "var(--input-bg)",
                                            border: "1px solid var(--input-border)",
                                            color: "var(--foreground)",
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Print & Export Actions Card */}
                    <div
                        className="rounded-xl p-6"
                        style={{
                            backgroundColor: "var(--card-bg)",
                            border: "1px solid var(--card-border)",
                        }}
                    >
                        <h2
                            className="text-lg font-semibold mb-4"
                            style={{ color: "var(--foreground)" }}
                        >
                            Print & Export
                        </h2>

                        <div className="space-y-3">
                            {/* Print Button */}
                            <button
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all hover:opacity-90"
                                style={{
                                    backgroundColor: "var(--primary)",
                                    color: "var(--background)",
                                }}
                            >
                                <svg
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <polyline points="6 9 6 2 18 2 18 9" />
                                    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                                    <rect x="6" y="14" width="12" height="8" />
                                </svg>
                                Print Prescription
                            </button>

                            {/* Export as PDF Button */}
                            <button
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all hover:opacity-80"
                                style={{
                                    backgroundColor: "transparent",
                                    color: "var(--foreground)",
                                    border: "1px solid var(--input-border)",
                                }}
                            >
                                <svg
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                    <polyline points="14 2 14 8 20 8" />
                                    <line x1="12" y1="18" x2="12" y2="12" />
                                    <line x1="9" y1="15" x2="15" y2="15" />
                                </svg>
                                Export as PDF
                            </button>

                            {/* Save Draft Button */}
                            <button
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all hover:opacity-80"
                                style={{
                                    backgroundColor: "transparent",
                                    color: "var(--muted)",
                                    border: "1px solid var(--input-border)",
                                }}
                            >
                                <svg
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                                    <polyline points="17 21 17 13 7 13 7 21" />
                                    <polyline points="7 3 7 8 15 8" />
                                </svg>
                                Save Draft
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
}
