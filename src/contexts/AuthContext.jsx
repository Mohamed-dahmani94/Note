import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showBypass, setShowBypass] = useState(false);

    const fetchProfile = async (authUser) => {
        try {
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error("Profile fetch timeout")), 3000)
            );

            const dbQuery = supabase
                .from('profiles')
                .select('*')
                .eq('id', authUser.id)
                .maybeSingle();

            const { data, error } = await Promise.race([dbQuery, timeoutPromise]);

            if (data) {
                setUser({ ...authUser, ...data });
            } else {
                setUser({ ...authUser, role: 'author' });
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
            setUser({ ...authUser, role: 'author' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let mounted = true;

        // 1. Fast Path: Check session immediately
        const initSession = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
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

        // 2. Safety Timeout
        const maxWait = setTimeout(() => {
            if (mounted && loading) {
                console.warn("Auth initialization timed out.");
                setShowBypass(true);
            }
        }, 10000);

        // 3. Listener for updates
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session?.user && !user) {
                if (mounted) await fetchProfile(session.user);
            } else if (event === 'SIGNED_OUT') {
                if (mounted) {
                    setUser(null);
                    setLoading(false);
                }
            }
        });

        return () => {
            mounted = false;
            clearTimeout(maxWait);
            subscription.unsubscribe();
        };
    }, []);

    const login = async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
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
            children
            )}
        </AuthContext.Provider>
        </AuthContext.Provider >
    );
};

export const useAuth = () => useContext(AuthContext);
