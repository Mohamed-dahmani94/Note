import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showBypass, setShowBypass] = useState(false);

    useEffect(() => {
        let mounted = true;

        // Safety Timeout (10s)
        const maxWait = setTimeout(() => {
            if (mounted && loading) {
                console.warn("Auth initialization timed out.");
                setShowBypass(true);
            }
        }, 10000);

        // Listen for auth changes
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
            clearTimeout(maxWait);
            subscription.unsubscribe();
        };
    }, []);

    const fetchProfile = async (authUser) => {
        try {
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error("Profile fetch timeout")), 10000)
            );

            const dbQuery = supabase
                .from('profiles')
                .select('*')
                .eq('id', authUser.id)
                .single();

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
            {loading ? (
                <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white font-sans">
                    <div className="flex flex-col items-center">
                        <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="text-slate-400">Chargement...</p>
                        {showBypass && (
                            <button onClick={() => setLoading(false)} className="mt-4 text-sm text-red-400 underline">
                                Forcer l'accès
                            </button>
                        )}
                    </div>
                </div>
            ) : children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
