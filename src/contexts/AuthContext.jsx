import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showBypass, setShowBypass] = useState(false); // New state

    useEffect(() => {
        let mounted = true;

        // Safety Timeout: Enable manual bypass after 3 seconds (faster fallback)
        const maxWait = setTimeout(() => {
            if (mounted && loading) {
                console.warn("Auth initialization timed out.");
                setShowBypass(true);
            }
        }, 3000);

        // 2. Listen for auth changes (Primary Source of Truth)
        // This handles INITIAL_SESSION, SIGNED_IN, SIGNED_OUT, etc.
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log("Auth Event:", event);

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
                    <div className="flex flex-col items-center p-8 bg-slate-900 rounded-2xl border border-slate-800 shadow-xl">
                        <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="text-slate-400 mb-4">Chargement de l'application...</p>

                        {showBypass && (
                            <div className="animate-fade-in text-center flex flex-col gap-2">
                                <p className="text-sm text-red-400">Le chargement semble bloqué.</p>
                                <button
                                    onClick={() => setLoading(false)}
                                    className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm font-medium transition-colors"
                                >
                                    Forcer l'accès au site
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            ) : children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
