import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchProfile = async (authUser) => {
        // 1. TRUST THE TOKEN FIRST (The "Badge") - OPTIMISTIC LOGIN
        const jwtRole = authUser.app_metadata?.role;
        console.log("AuthProvider: JWT Role is:", jwtRole);

        // CRITICAL FIX: Unlock the UI IMMEDIATELY. 
        const basicUser = { ...authUser, role: jwtRole || 'author' };
        setUser(basicUser);
        setLoading(false);

        // 2. Background Sync: Fire and Forget
        // We do NOT await this promise, so the login function returns instantly.
        (async () => {
            try {
                console.log("AuthProvider: Starting background profile sync...");
                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', authUser.id)
                    .maybeSingle();

                if (data) {
                    console.log("AuthProvider: Profile sync complete.");
                    setUser(prev => ({ ...prev, ...data, role: jwtRole || data.role }));
                }
            } catch (error) {
                console.warn('AuthProvider: Background profile fetch warning:', error);
            }
        })();
    };

    useEffect(() => {
        let mounted = true;
        console.log("AuthProvider: Initializing listener...");

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log(`AuthProvider: Event: ${event}`);

            if (!mounted) return;

            if (session?.user) {
                // We have a session!
                await fetchProfile(session.user);
            } else {
                // No session
                setUser(null);
                setLoading(false);
            }
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);

    const login = async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;

        // Critical: Manually update state immediately to prevent race conditions during navigation
        // The listener will also fire, but we ensure 'user' is set here first.
        if (data?.user) {
            await fetchProfile(data.user);
        }

        return data;
    };

    const signup = async (email, password, fullName) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { full_name: fullName } // Passed to trigger
            }
        });
        if (error) throw error;
        return data;
    };

    const logout = async () => {
        await supabase.auth.signOut();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, signup, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
