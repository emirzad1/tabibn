"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { DoctorProfile } from "@/lib/supabase";
import { useRouter } from "next/navigation";

interface ProfileContextType {
    profile: DoctorProfile | null;
    isLoading: boolean;
    error: Error | null;
    refreshProfile: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
    const [profile, setProfile] = useState<DoctorProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const router = useRouter();

    const fetchProfile = async () => {
        try {
            setIsLoading(true);
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                setProfile(null);
                setIsLoading(false);
                return;
            }

            const { data, error: fetchError } = await supabase
                .from('doctor_profiles')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (fetchError) {
                throw fetchError;
            }

            setProfile(data);
            setError(null);
        } catch (err: any) {
            console.error("Error fetching profile:", err);
            setError(err);
            // Don't redirect here, let Layout handle protection if needed
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const refreshProfile = async () => {
        await fetchProfile();
    };

    return (
        <ProfileContext.Provider value={{ profile, isLoading, error, refreshProfile }}>
            {children}
        </ProfileContext.Provider>
    );
}

export function useProfile() {
    const context = useContext(ProfileContext);
    if (context === undefined) {
        throw new Error("useProfile must be used within a ProfileProvider");
    }
    return context;
}
