import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        // 1. Check active session
        const getSession = async () => {
            try {
                const { data: { session }, error } = await supabase.auth.getSession();
                if (error) throw error;

                if (session?.user) {
                    if (mounted) await fetchProfile(session.user);
                } else {
                    if (mounted) setLoading(false);
                }
            } catch (error) {
                console.error("Auth Init Error:", error);
                if (mounted) setLoading(false);
            }
        };

        getSession();

        // 2. Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session?.user) {
                if (mounted) await fetchProfile(session.user);
            } else {
                if (mounted) {
                    setUser(null);
                    setLoading(false);
                }
            }
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);

    const fetchProfile = async (authUser) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', authUser.id)
                .single();

            if (data) {
                setUser({ ...authUser, ...data }); // Merge Auth data + Profile data (role)
            } else {
                setUser(authUser);
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

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
        <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
            {loading ? (
                <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white font-sans">
                    <div className="animate-pulse flex flex-col items-center">
                        <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="text-slate-400">Chargement de l'application...</p>
                    </div>
                </div>
            ) : children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
