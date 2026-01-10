"use client";

import { useState } from "react";

/**
 * PREMIUM PATIENTS PAGE
 * 
 * Features:
 * - Search with visual feedback
 * - Patient cards with hover effects
 * - Slide-in add/edit modal
 * - Quick view panel
 * - Premium animations
 */

interface Patient {
    id: number;
    name: string;
    idNumber: string;
    phone: string;
    address: string;
    dateOfBirth: string;
    gender: "Male" | "Female";
    lastVisit: string;
    totalVisits: number;
}

const mockPatients: Patient[] = [
    { id: 1, name: "Ahmad Khan", idNumber: "P-001", phone: "+93 700 111 222", address: "Kabul, District 4", dateOfBirth: "1985-03-15", gender: "Male", lastVisit: "2026-01-10", totalVisits: 12 },
    { id: 2, name: "Fatima Ahmadi", idNumber: "P-002", phone: "+93 700 333 444", address: "Kabul, District 7", dateOfBirth: "1990-07-22", gender: "Female", lastVisit: "2026-01-09", totalVisits: 8 },
    { id: 3, name: "Mohammad Rahimi", idNumber: "P-003", phone: "+93 700 555 666", address: "Herat, Main Road", dateOfBirth: "1978-11-08", gender: "Male", lastVisit: "2026-01-08", totalVisits: 24 },
    { id: 4, name: "Zahra Karimi", idNumber: "P-004", phone: "+93 700 777 888", address: "Mazar-i-Sharif", dateOfBirth: "1995-02-28", gender: "Female", lastVisit: "2026-01-07", totalVisits: 3 },
    { id: 5, name: "Ali Mohammadi", idNumber: "P-005", phone: "+93 700 999 000", address: "Kabul, District 1", dateOfBirth: "1982-09-12", gender: "Male", lastVisit: "2026-01-05", totalVisits: 18 },
    { id: 6, name: "Maryam Nazari", idNumber: "P-006", phone: "+93 700 222 333", address: "Kandahar", dateOfBirth: "1988-05-20", gender: "Female", lastVisit: "2026-01-04", totalVisits: 5 },
];

const getInitialPatient = (): Omit<Patient, "id" | "lastVisit" | "totalVisits"> => ({
    name: "", idNumber: "", phone: "", address: "", dateOfBirth: "", gender: "Male",
});

export default function PatientsPage() {
    const [patients, setPatients] = useState<Patient[]>(mockPatients);
    const [searchQuery, setSearchQuery] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
    const [formData, setFormData] = useState(getInitialPatient());
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

    const filteredPatients = patients.filter(
        (p) =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.idNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.phone.includes(searchQuery)
    );

    const handleFormChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleAdd = () => {
        if (!formData.name.trim()) return;
        const newPatient: Patient = {
            id: Date.now(),
            ...formData,
            lastVisit: new Date().toISOString().split("T")[0],
            totalVisits: 0,
        };
        setPatients((prev) => [newPatient, ...prev]);
        closeModal();
    };

    const handleEdit = () => {
        if (!editingPatient || !formData.name.trim()) return;
        setPatients((prev) =>
            prev.map((p) => (p.id === editingPatient.id ? { ...p, ...formData } : p))
        );
        closeModal();
    };

    const handleDelete = (id: number) => {
        if (confirm("Delete this patient?")) {
            setPatients((prev) => prev.filter((p) => p.id !== id));
            if (selectedPatient?.id === id) setSelectedPatient(null);
        }
    };

    const openEditModal = (patient: Patient) => {
        setFormData({
            name: patient.name,
            idNumber: patient.idNumber,
            phone: patient.phone,
            address: patient.address,
            dateOfBirth: patient.dateOfBirth,
            gender: patient.gender,
        });
        setEditingPatient(patient);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingPatient(null);
        setFormData(getInitialPatient());
    };

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1
                        className="text-2xl font-bold"
                        style={{ color: "var(--foreground)" }}
                    >
                        Patients
                    </h1>
                    <p style={{ color: "var(--muted)" }}>
                        {patients.length} total patients
                    </p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-5 py-3 rounded-xl font-semibold transition-all hover:shadow-lg"
                    style={{
                        background: "var(--gradient-primary)",
                        color: "white",
                    }}
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Add Patient
                </button>
            </div>

            {/* Search Bar */}
            <div className="relative mb-6">
                <svg
                    className="absolute left-4 top-1/2 -translate-y-1/2"
                    width="20"
                    height="20"
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
                    placeholder="Search patients by name, ID, or phone..."
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl text-sm outline-none transition-all"
                    style={{
                        background: "var(--card-bg)",
                        border: "1px solid var(--card-border)",
                        color: "var(--foreground)",
                    }}
                />
            </div>

            {/* Patient Grid */}
            <div className="grid grid-cols-2 gap-4">
                {filteredPatients.length === 0 ? (
                    <div
                        className="col-span-2 py-16 text-center rounded-2xl"
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
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                        <p style={{ color: "var(--muted)" }}>
                            {searchQuery ? "No patients found" : "No patients yet"}
                        </p>
                    </div>
                ) : (
                    filteredPatients.map((patient) => (
                        <div
                            key={patient.id}
                            onClick={() => setSelectedPatient(patient)}
                            className="p-5 rounded-2xl cursor-pointer transition-all hover:scale-[1.01]"
                            style={{
                                background: selectedPatient?.id === patient.id
                                    ? "var(--primary-subtle)"
                                    : "var(--card-bg)",
                                border: `1px solid ${selectedPatient?.id === patient.id
                                        ? "var(--primary)"
                                        : "var(--card-border)"
                                    }`,
                            }}
                        >
                            <div className="flex items-start gap-4">
                                <div
                                    className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold"
                                    style={{
                                        background: "var(--gradient-primary)",
                                        color: "white",
                                    }}
                                >
                                    {patient.name.split(" ").map(n => n[0]).join("")}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <h3
                                            className="font-semibold truncate"
                                            style={{ color: "var(--foreground)" }}
                                        >
                                            {patient.name}
                                        </h3>
                                        <span
                                            className="text-xs px-2 py-1 rounded-full"
                                            style={{
                                                background: "var(--background-secondary)",
                                                color: "var(--muted)",
                                            }}
                                        >
                                            {patient.idNumber}
                                        </span>
                                    </div>
                                    <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
                                        {patient.phone}
                                    </p>
                                    <div className="flex items-center gap-4 mt-3 text-xs" style={{ color: "var(--muted)" }}>
                                        <span>{patient.gender}</span>
                                        <span>•</span>
                                        <span>{patient.totalVisits} visits</span>
                                        <span>•</span>
                                        <span>Last: {patient.lastVisit}</span>
                                    </div>
                                </div>
                            </div>
                            {/* Quick Actions */}
                            <div className="flex gap-2 mt-4">
                                <button
                                    onClick={(e) => { e.stopPropagation(); openEditModal(patient); }}
                                    className="flex-1 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-80"
                                    style={{
                                        background: "var(--background-secondary)",
                                        color: "var(--foreground)",
                                    }}
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleDelete(patient.id); }}
                                    className="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-80"
                                    style={{
                                        background: "#fee2e2",
                                        color: "#ef4444",
                                    }}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div
                    className="fixed inset-0 flex items-center justify-center z-50 animate-fade-in"
                    style={{ background: "rgba(0, 0, 0, 0.5)" }}
                >
                    <div
                        className="w-full max-w-md rounded-2xl p-8 animate-scale-in"
                        style={{
                            background: "var(--card-bg)",
                            border: "1px solid var(--card-border)",
                        }}
                    >
                        <h2
                            className="text-xl font-bold mb-6"
                            style={{ color: "var(--foreground)" }}
                        >
                            {editingPatient ? "Edit Patient" : "Add New Patient"}
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: "var(--foreground)" }}>
                                    Full Name *
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => handleFormChange("name", e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                                    style={{
                                        background: "var(--input-bg)",
                                        border: "1px solid var(--input-border)",
                                        color: "var(--foreground)",
                                    }}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2" style={{ color: "var(--foreground)" }}>
                                        Patient ID
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.idNumber}
                                        onChange={(e) => handleFormChange("idNumber", e.target.value)}
                                        placeholder="P-000"
                                        className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                                        style={{
                                            background: "var(--input-bg)",
                                            border: "1px solid var(--input-border)",
                                            color: "var(--foreground)",
                                        }}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2" style={{ color: "var(--foreground)" }}>
                                        Phone
                                    </label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => handleFormChange("phone", e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                                        style={{
                                            background: "var(--input-bg)",
                                            border: "1px solid var(--input-border)",
                                            color: "var(--foreground)",
                                        }}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: "var(--foreground)" }}>
                                    Address
                                </label>
                                <input
                                    type="text"
                                    value={formData.address}
                                    onChange={(e) => handleFormChange("address", e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                                    style={{
                                        background: "var(--input-bg)",
                                        border: "1px solid var(--input-border)",
                                        color: "var(--foreground)",
                                    }}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2" style={{ color: "var(--foreground)" }}>
                                        Date of Birth
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.dateOfBirth}
                                        onChange={(e) => handleFormChange("dateOfBirth", e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                                        style={{
                                            background: "var(--input-bg)",
                                            border: "1px solid var(--input-border)",
                                            color: "var(--foreground)",
                                        }}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2" style={{ color: "var(--foreground)" }}>
                                        Gender
                                    </label>
                                    <div className="flex gap-4 mt-2">
                                        {["Male", "Female"].map((g) => (
                                            <label key={g} className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    checked={formData.gender === g}
                                                    onChange={() => handleFormChange("gender", g)}
                                                    className="accent-[var(--primary)]"
                                                />
                                                <span className="text-sm" style={{ color: "var(--foreground)" }}>{g}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-8">
                            <button
                                onClick={closeModal}
                                className="flex-1 py-3 rounded-xl font-medium transition-all"
                                style={{
                                    background: "var(--background-secondary)",
                                    color: "var(--foreground)",
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={editingPatient ? handleEdit : handleAdd}
                                disabled={!formData.name.trim()}
                                className="flex-1 py-3 rounded-xl font-medium transition-all disabled:opacity-50"
                                style={{
                                    background: "var(--gradient-primary)",
                                    color: "white",
                                }}
                            >
                                {editingPatient ? "Save Changes" : "Add Patient"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
