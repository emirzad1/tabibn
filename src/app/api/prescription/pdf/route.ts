import { NextRequest, NextResponse } from "next/server";

/**
 * API Route: /api/prescription/pdf
 * 
 * Handles prescription PDF generation requests.
 * Note: The actual PDF generation is done client-side using jsPDF and html2canvas
 * for better HTML rendering support. This endpoint serves as a backup/alternative
 * method and can be extended with server-side PDF generation if needed.
 */

export interface PrescriptionPDFRequest {
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
    settings: {
        header: {
            clinicName: string;
            address: string;
            phone: string;
            email: string;
        };
        footer: {
            doctorName: string;
            licenseNumber: string;
            signatureLabel: string;
            disclaimer: string;
        };
        pageSize: "A4" | "Letter";
    };
}

export async function POST(request: NextRequest) {
    try {
        const body: PrescriptionPDFRequest = await request.json();

        // Validate required fields
        if (!body.patient) {
            return NextResponse.json(
                { error: "Patient data is required" },
                { status: 400 }
            );
        }

        if (!body.settings) {
            return NextResponse.json(
                { error: "Settings are required" },
                { status: 400 }
            );
        }

        // For now, return the validated data
        // The actual PDF generation happens client-side for better HTML rendering
        // This endpoint can be extended to use puppeteer or similar for server-side PDF
        return NextResponse.json({
            success: true,
            message: "Prescription data validated. Use client-side PDF generation for best results.",
            data: {
                patientName: body.patient.name,
                date: body.patient.date,
                medicationCount: body.medications?.length || 0,
                pageSize: body.settings.pageSize,
            },
        });
    } catch (error) {
        console.error("Error processing prescription PDF request:", error);
        return NextResponse.json(
            { error: "Failed to process prescription request" },
            { status: 500 }
        );
    }
}

export async function GET() {
    return NextResponse.json({
        message: "Prescription PDF API",
        endpoints: {
            POST: "Generate/validate prescription PDF data",
        },
        supportedPageSizes: ["A4", "Letter"],
    });
}
