'use client';

import { useState, useEffect } from 'react';

interface UserProfile {
    id: string;
    name: string;
    email: string;
    role: string;
    hprNumber: string | null;
    address: string | null;
}

export function useUserProfile() {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await fetch('/api/user/profile');
                if (response.ok) {
                    const data = await response.json();
                    setProfile(data);
                } else {
                    setError(true);
                }
            } catch (err) {
                console.error('Failed to fetch user profile:', err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    return { profile, loading, error };
}
