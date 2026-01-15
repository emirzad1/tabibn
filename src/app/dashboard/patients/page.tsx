"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

/**
 * PATIENTS PAGE - TWO COLUMN LAYOUT
 * 
 * Layout:
 * - Left Panel: Scrollable patient list with search
 * - Right Panel: Patient profile with prescription history
 * 
 * Features:
 * - Fixed layout (no page scrolling)
 * - Scrollable sections within panels
 * - Edit/Delete buttons in patient profile
 */

interface Patient {
    id: string; // UUID from Supabase
    name: string;
    idNumber: string;
    phone: string;
    address: string;
    dateOfBirth: string;
    gender: "Male" | "Female";
    age?: number;
    lastVisit: string;
    totalVisits: number;
}

interface Prescription {
    id: string;
    patientId: string;
    date: string;
    diagnosis: string;
    medications: { name: string; dosage: string }[];
}


const getInitialPatient = (): Omit<Patient, "id" | "lastVisit" | "totalVisits"> => ({
    name: "", idNumber: "", phone: "", address: "", dateOfBirth: "", gender: "Male", age: undefined,
});

export default function PatientsPage() {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
    const [formData, setFormData] = useState(getInitialPatient());
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [deleteConfirm, setDeleteConfirm] = useState(false);

    // Fetch patients from Supabase
    useEffect(() => {
        fetchPatients();
    }, []);

    const fetchPatients = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('patients')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;

            if (data) {
                const mappedPatients: Patient[] = data.map(p => ({
                    id: p.id,
                    name: p.name,
                    idNumber: p.id_number || "",
                    phone: p.phone || "",
                    address: p.address || "",
                    dateOfBirth: "",
                    age: p.age,
                    gender: (p.sex === "Male" || p.sex === "male") ? "Male" : "Female",
                    lastVisit: p.created_at.split('T')[0],
                    totalVisits: 0,
                }));
                setPatients(mappedPatients);
            }
        } catch (error) {
            console.error('Error fetching patients:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredPatients = patients.filter(
        (p) =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.idNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.phone.includes(searchQuery)
    );

    const [patientPrescriptions, setPatientPrescriptions] = useState<Prescription[]>([]);

    useEffect(() => {
        if (selectedPatient?.id) {
            fetchPatientPrescriptions(selectedPatient.id);
        } else {
            setPatientPrescriptions([]);
        }
    }, [selectedPatient?.id]);

    const fetchPatientPrescriptions = async (patientId: string) => {
        const { data } = await supabase
            .from('prescriptions')
            .select('*, medications(*)')
            .eq('patient_id', patientId)
            .order('date', { ascending: false });

        if (data) {
            setPatientPrescriptions(data.map((p: any) => ({
                id: p.id,
                patientId: p.patient_id,
                date: p.date,
                diagnosis: p.diagnosis || "",
                medications: p.medications ? p.medications.map((m: any) => ({
                    name: m.name,
                    dosage: `${m.strength || ""} ${m.frequency || ""}`.trim()
                })) : []
            })));
        }
    };

    const handleFormChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleAdd = async () => {
        if (!formData.name.trim()) return;

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const newPatientData = {
                user_id: user.id,
                name: formData.name,
                id_number: formData.idNumber,
                phone: formData.phone,
                address: formData.address,
                sex: formData.gender,
                // store other fields if needed
            };

            const { data, error } = await supabase
                .from('patients')
                .insert([newPatientData])
                .select()
                .single();

            if (error) {
                console.error('Error adding patient:', error);
                return;
            }

            if (data) {
                const newPatient: Patient = {
                    id: data.id,
                    name: data.name,
                    idNumber: data.id_number || "",
                    phone: data.phone || "",
                    address: data.address || "",
                    dateOfBirth: "",
                    age: data.age,
                    gender: (data.sex === "Male" || data.sex === "male") ? "Male" : "Female",
                    lastVisit: new Date().toISOString().split("T")[0],
                    totalVisits: 0,
                };
                setPatients((prev) => [newPatient, ...prev]);
                closeModal();
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleEdit = async () => {
        if (!editingPatient || !formData.name.trim()) return;

        try {
            const updateData = {
                name: formData.name,
                id_number: formData.idNumber,
                phone: formData.phone,
                address: formData.address,
                sex: formData.gender,
                age: formData.age || (formData.dateOfBirth ? calculateAge(formData.dateOfBirth) : null),
            };

            const { error } = await supabase
                .from('patients')
                .update(updateData)
                .eq('id', editingPatient.id);

            if (error) throw error;

            setPatients((prev) =>
                prev.map((p) =>
                    p.id === editingPatient.id
                        ? { ...p, ...formData, id: p.id }
                        : p
                )
            );

            // Update selected patient if needed
            if (selectedPatient?.id === editingPatient.id) {
                setSelectedPatient((prev) => prev ? { ...prev, ...formData } : null);
            }

            closeModal();
            fetchPatients();
        } catch (error) {
            console.error('Error updating patient:', error);
            alert('Failed to update patient');
        }
    };

    const handleDelete = async (id: string) => {
        if (!id) return;

        try {
            const { error } = await supabase
                .from('patients')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setPatients((prev) => prev.filter((p) => p.id !== id));
            if (selectedPatient?.id === id) setSelectedPatient(null);
            alert("Patient deleted successfully.");
        } catch (error: any) {
            console.error('Error deleting patient:', error);
            alert(`Failed to delete patient: ${error.message}`);
        }
    };

    const openEditModal = (patient: Patient) => {
        setFormData({
            // @ts-ignore
            name: patient.name,
            idNumber: patient.idNumber,
            phone: patient.phone,
            address: patient.address,
            dateOfBirth: patient.dateOfBirth,
            gender: patient.gender,
            // @ts-ignore
            age: patient.age || "", // Ensure age is handled
        });
        setEditingPatient(patient);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingPatient(null);
        setFormData(getInitialPatient());
    };

    const calculateAge = (dob: string) => {
        if (!dob) return 0;
        const today = new Date();
        const birthDate = new Date(dob);
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    return (
        <div className="h-full flex overflow-hidden">
            {/* Left Panel - Patient List */}
            <div
                className="w-80 flex-shrink-0 flex flex-col overflow-hidden border-r"
                style={{
                    backgroundColor: "var(--card-bg)",
                    borderColor: "var(--card-border)",
                }}
            >
                {/* Header */}
                <div className="p-4 border-b flex-shrink-0" style={{ borderColor: "var(--card-border)" }}>
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <h1
                                className="text-lg font-bold"
                                style={{ color: "var(--foreground)" }}
                            >
                                Patients
                            </h1>
                            <p className="text-xs" style={{ color: "var(--muted)" }}>
                                {patients.length} total
                            </p>
                        </div>
                        <button
                            onClick={() => setShowModal(true)}
                            className="p-2 rounded-lg transition-all hover:opacity-80"
                            style={{
                                background: "var(--gradient-primary)",
                                color: "white",
                            }}
                            title="Add Patient"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <line x1="12" y1="5" x2="12" y2="19" />
                                <line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                        </button>
                    </div>

                    {/* Search Bar */}
                    <div className="relative">
                        <svg
                            className="absolute left-3 top-1/2 -translate-y-1/2"
                            width="16"
                            height="16"
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
                            placeholder="Search patients..."
                            className="w-full pl-9 pr-3 py-2 rounded-lg text-sm outline-none"
                            style={{
                                background: "var(--input-bg)",
                                border: "1px solid var(--input-border)",
                                color: "var(--foreground)",
                            }}
                        />
                    </div>
                </div>

                {/* Patient List - Scrollable */}
                <div className="flex-1 overflow-y-auto p-2">
                    {filteredPatients.length === 0 ? (
                        <div className="text-center py-8" style={{ color: "var(--muted)" }}>
                            <svg
                                className="mx-auto mb-3"
                                width="40"
                                height="40"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.5"
                            >
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                <circle cx="9" cy="7" r="4" />
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                            </svg>
                            <p className="text-sm">
                                {searchQuery ? "No patients found" : "No patients yet"}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {filteredPatients.map((patient) => (
                                <div
                                    key={patient.id}
                                    onClick={() => setSelectedPatient(patient)}
                                    className="p-3 rounded-xl cursor-pointer transition-all hover:scale-[1.01]"
                                    style={{
                                        background: selectedPatient?.id === patient.id
                                            ? "var(--primary-subtle)"
                                            : "transparent",
                                        border: selectedPatient?.id === patient.id
                                            ? "1px solid var(--primary)"
                                            : "1px solid transparent",
                                    }}
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                                            style={{
                                                background: "var(--gradient-primary)",
                                                color: "white",
                                            }}
                                        >
                                            {patient.name.split(" ").map(n => n[0]).join("")}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2">
                                                <h3
                                                    className="font-medium text-sm truncate"
                                                    style={{ color: "var(--foreground)" }}
                                                >
                                                    {patient.name}
                                                </h3>
                                                <span
                                                    className="text-[10px] px-1.5 py-0.5 rounded flex-shrink-0"
                                                    style={{
                                                        background: "var(--background-secondary)",
                                                        color: "var(--muted)",
                                                    }}
                                                >
                                                    {patient.idNumber}
                                                </span>
                                            </div>
                                            <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
                                                {patient.phone}
                                            </p>
                                            <p className="text-[10px] mt-1" style={{ color: "var(--muted)" }}>
                                                Last visit: {patient.lastVisit}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Right Panel - Patient Profile */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {selectedPatient ? (
                    <>
                        {/* Profile Header */}
                        <div
                            className="p-6 border-b flex-shrink-0"
                            style={{ borderColor: "var(--card-border)" }}
                        >
                            <div className="flex items-start gap-5">
                                <div
                                    className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold"
                                    style={{
                                        background: "var(--gradient-primary)",
                                        color: "white",
                                    }}
                                >
                                    {selectedPatient.name.split(" ").map(n => n[0]).join("")}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-1">
                                        <h2
                                            className="text-2xl font-bold"
                                            style={{ color: "var(--foreground)" }}
                                        >
                                            {selectedPatient.name}
                                        </h2>
                                        <span
                                            className="text-xs px-2 py-1 rounded-full"
                                            style={{
                                                background: "var(--background-secondary)",
                                                color: "var(--muted)",
                                            }}
                                        >
                                            {selectedPatient.idNumber}
                                        </span>
                                    </div>
                                    <p className="text-sm" style={{ color: "var(--muted)" }}>
                                        {selectedPatient.gender} • {selectedPatient.age || calculateAge(selectedPatient.dateOfBirth) || "?"} years old
                                    </p>
                                </div>
                                {/* Edit & Delete Buttons */}
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => openEditModal(selectedPatient)}
                                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-80"
                                        style={{
                                            background: "var(--background-secondary)",
                                            color: "var(--foreground)",
                                        }}
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                        </svg>
                                        Edit
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (deleteConfirm) {
                                                handleDelete(selectedPatient.id);
                                                setDeleteConfirm(false);
                                            } else {
                                                setDeleteConfirm(true);
                                            }
                                        }}
                                        onMouseLeave={() => setDeleteConfirm(false)}
                                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-80"
                                        style={{
                                            background: deleteConfirm ? "#ef4444" : "#fee2e2",
                                            color: deleteConfirm ? "white" : "#ef4444",
                                        }}
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <polyline points="3 6 5 6 21 6" />
                                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                        </svg>
                                        {deleteConfirm ? "Confirm?" : "Delete"}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Profile Content - Scrollable */}
                        <div className="flex-1 overflow-y-auto p-6">
                            {/* Patient Details Grid */}
                            <div
                                className="rounded-xl p-5 mb-6"
                                style={{
                                    background: "var(--card-bg)",
                                    border: "1px solid var(--card-border)",
                                }}
                            >
                                <h3
                                    className="text-sm font-semibold mb-4"
                                    style={{ color: "var(--foreground)" }}
                                >
                                    Patient Information
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    <div>
                                        <p className="text-xs mb-1" style={{ color: "var(--muted)" }}>Phone</p>
                                        <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>{selectedPatient.phone}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs mb-1" style={{ color: "var(--muted)" }}>Address</p>
                                        <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>{selectedPatient.address}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs mb-1" style={{ color: "var(--muted)" }}>Date of Birth</p>
                                        <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>{selectedPatient.dateOfBirth}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs mb-1" style={{ color: "var(--muted)" }}>Gender</p>
                                        <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>{selectedPatient.gender}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs mb-1" style={{ color: "var(--muted)" }}>Total Visits</p>
                                        <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>{selectedPatient.totalVisits}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs mb-1" style={{ color: "var(--muted)" }}>Last Visit</p>
                                        <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>{selectedPatient.lastVisit}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Prescription History */}
                            <div
                                className="rounded-xl p-5"
                                style={{
                                    background: "var(--card-bg)",
                                    border: "1px solid var(--card-border)",
                                }}
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <h3
                                        className="text-sm font-semibold"
                                        style={{ color: "var(--foreground)" }}
                                    >
                                        Prescription History
                                    </h3>
                                    <span
                                        className="text-xs px-2 py-1 rounded-full"
                                        style={{
                                            background: "var(--primary-subtle)",
                                            color: "var(--primary)",
                                        }}
                                    >
                                        {patientPrescriptions.length} records
                                    </span>
                                </div>

                                {patientPrescriptions.length === 0 ? (
                                    <div className="text-center py-8" style={{ color: "var(--muted)" }}>
                                        <svg
                                            className="mx-auto mb-3"
                                            width="40"
                                            height="40"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="1.5"
                                        >
                                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                            <polyline points="14 2 14 8 20 8" />
                                            <line x1="12" y1="18" x2="12" y2="12" />
                                            <line x1="9" y1="15" x2="15" y2="15" />
                                        </svg>
                                        <p className="text-sm">No prescriptions yet</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {patientPrescriptions.map((prescription) => (
                                            <div
                                                key={prescription.id}
                                                className="p-4 rounded-xl transition-all hover:scale-[1.005]"
                                                style={{
                                                    background: "var(--background)",
                                                    border: "1px solid var(--card-border)",
                                                }}
                                            >
                                                <div className="flex items-start justify-between mb-2">
                                                    <div>
                                                        <p
                                                            className="font-medium text-sm"
                                                            style={{ color: "var(--foreground)" }}
                                                        >
                                                            {prescription.diagnosis}
                                                        </p>
                                                        <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
                                                            {prescription.date}
                                                        </p>
                                                    </div>
                                                    <span
                                                        className="text-xs px-2 py-1 rounded"
                                                        style={{
                                                            background: "var(--background-secondary)",
                                                            color: "var(--muted)",
                                                        }}
                                                    >
                                                        {prescription.medications.length} medication{prescription.medications.length > 1 ? "s" : ""}
                                                    </span>
                                                </div>
                                                <div className="flex flex-wrap gap-2 mt-3">
                                                    {prescription.medications.map((med, idx) => (
                                                        <span
                                                            key={idx}
                                                            className="text-xs px-2 py-1 rounded"
                                                            style={{
                                                                background: "var(--primary-subtle)",
                                                                color: "var(--primary)",
                                                            }}
                                                        >
                                                            {med.name} {med.dosage}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                ) : (
                    /* Empty State - No Patient Selected */
                    <div
                        className="flex-1 flex items-center justify-center"
                        style={{ color: "var(--muted)" }}
                    >
                        <div className="text-center">
                            <svg
                                className="mx-auto mb-4"
                                width="64"
                                height="64"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1"
                            >
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                <circle cx="9" cy="7" r="4" />
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                            </svg>
                            <h3
                                className="text-lg font-semibold mb-2"
                                style={{ color: "var(--foreground)" }}
                            >
                                Select a Patient
                            </h3>
                            <p className="text-sm max-w-xs">
                                Choose a patient from the list to view their profile and prescription history
                            </p>
                        </div>
                    </div>
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
                                        Age
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.age || ""}
                                        // @ts-ignore
                                        onChange={(e) => handleFormChange("age", e.target.value)}
                                        placeholder="Age"
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
                                        Date of Birth (Optional)
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
