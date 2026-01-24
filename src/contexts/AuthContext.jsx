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

        // 1. Fast Path
        const initSession = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                console.log("AuthProvider: Init Session found:", !!session);
                if (session?.user) {
                    if (mounted) await fetchProfile(session.user);
                } else {
                    if (mounted) setLoading(false);
                }
            } catch (e) {
                console.error("Init session failed", e);
                if (mounted) setLoading(false);
            }
        };
        initSession();

        // 2. Auth State Listener
        // 2. Auth State Listener (Robust handling)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log("AuthProvider: Auth Event:", event);

            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
                // If we have a valid session, ensure our App State is in sync
                // especially for Token Refreshes (which update the JWT role)
                if (session?.user && mounted) {
                    // Check if we actually need to update (avoid infinite loops if user obj is same)
                    // But since we decorate 'user' with DB data, we should re-sync.
                    // fetchProfile handles the merging and is now optimistic (fast).
                    await fetchProfile(session.user);
                }
            } else if (event === 'SIGNED_OUT') {
                if (mounted) {
                    setUser(null);
                    setLoading(false);
                    // Clear any sensitive local storage if needed beyond Supabase's default
                    localStorage.removeItem('supabase.auth.token'); // Cleanup helper
                }
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
