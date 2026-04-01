import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Mail, Lock, User, Facebook, Apple } from 'lucide-react';
import LanguageSwitcher from '../../components/LanguageSwitcher';

const Login = () => {
    const { t } = useTranslation();
    const { login, signup } = useAuth();
    const navigate = useNavigate();

    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');

    // --- REDIRECTION LOGIC (Add this) ---
    const { user, loading: authLoading } = useAuth();
    useEffect(() => {
        if (!authLoading && user) {
            const role = user.app_metadata?.role || user.role;
            console.log("Login: Already logged in, redirecting based on role:", role);
            if (role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/author');
            }
        }
    }, [user, authLoading, navigate]);
    // ------------------------------------

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        console.log("Login: Submit started");

        try {
            if (isLogin) {
                console.log("Login: Attempting sign in...");
                const { user: authUser } = await login(email, password);
                console.log("Login: Auth success!", authUser);

                if (!authUser) throw new Error("Connexion réussie mais aucun utilisateur retourné.");

                // Redirect based on role
                const role = authUser.app_metadata?.role;
                console.log("Login: Detected role:", role);

                // Redirect based on role (no alert popup)
                if (role === 'admin') {
                    console.log("Login: Redirecting to /admin");
                    navigate('/admin');
                } else {
                    console.log("Login: Redirecting to /author");
                    navigate('/author');
                }
            } else {
                await signup(email, password, fullName);
                alert("Compte créé ! Vérifiez votre email.");
                setIsLogin(true);
            }
        } catch (err) {
            console.error("Login Error:", err);
            // Translate common Supabase errors if possible
            let msg = err.message;
            if (msg.includes("Invalid login credentials")) msg = t("error_invalid_credentials", { defaultValue: "Email ou mot de passe incorrect." });
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleSocialLogin = (provider) => {
        // Mock function for consistency
        alert(`Social Login with ${provider} requires Supabase configuration.`);
    };

    if (authLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-note-purple"></div>
                <p className="text-gray-400 text-sm">Vérification de la session...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white relative overflow-hidden flex items-center justify-center font-sans text-gray-800">

            {/* --- DECORATIVE BLOBS (Note Identity) --- */}
            {/* Top Left Blob */}
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-gradient-to-br from-note-purple to-violet-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
            {/* Bottom Right Blob */}
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-gradient-to-tl from-violet-600 to-note-purple rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
            {/* Middle Accent Blob */}
            <div className="absolute top-[20%] right-[20%] w-[300px] h-[300px] bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>


            {/* --- NAVBAR HELPER --- */}
            <div className="absolute top-0 w-full p-6 flex justify-between items-center z-20">
                <h1 className="text-2xl font-bold text-note-purple cursor-pointer flex items-center gap-2" onClick={() => navigate('/')}>
                    Note<span className="text-gray-400 text-sm font-normal">.dz</span>
                </h1>
                <LanguageSwitcher />
            </div>

            {/* --- MAIN CARD --- */}
            <div className="relative z-10 w-full max-w-4xl flex flex-col md:flex-row bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden border border-white/50 m-4">

                {/* Left Side: Visual/Branding (Hidden on mobile) */}
                <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-note-purple to-violet-700 p-10 flex-col justify-center text-white relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                    <h2 className="text-4xl font-bold mb-4 relative z-10">
                        {isLogin ? t('welcome_back', { defaultValue: "Bon retour !" }) : t('join_us', { defaultValue: "Rejoignez-nous" })}
                    </h2>
                    <p className="text-violet-100 text-lg relative z-10">
                        {t('hero_subtitle')}
                    </p>
                </div>

                {/* Right Side: Form */}
                <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">

                    <h3 className="text-2xl font-bold text-deep-black mb-2 text-center">
                        {isLogin ? t('login') : t('register_btn')}
                    </h3>
                    <p className="text-gray-400 text-center mb-8 text-sm">
                        {t('subtitle')}
                    </p>

                    {error && (
                        <div className="bg-red-50 text-red-500 p-3 rounded-lg mb-6 text-sm text-center border border-red-100">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">

                        {!isLogin && (
                            <div className="relative group">
                                <User className="absolute left-4 top-3.5 h-5 w-5 text-gray-400 group-focus-within:text-note-purple transition-colors" />
                                <input
                                    type="text"
                                    placeholder={t('full_name')}
                                    className="w-full bg-gray-50 border border-gray-100 rounded-full py-3 px-12 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-note-purple/50 focus:border-note-purple transition-all shadow-sm"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    required
                                />
                            </div>
                        )}

                        <div className="relative group">
                            <Mail className="absolute left-4 top-3.5 h-5 w-5 text-gray-400 group-focus-within:text-note-purple transition-colors" />
                            <input
                                type="email"
                                placeholder={t('email')}
                                className="w-full bg-gray-50 border border-gray-100 rounded-full py-3 px-12 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-note-purple/50 focus:border-note-purple transition-all shadow-sm"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="relative group">
                            <Lock className="absolute left-4 top-3.5 h-5 w-5 text-gray-400 group-focus-within:text-note-purple transition-colors" />
                            <input
                                type="password"
                                placeholder={t('password')}
                                className="w-full bg-gray-50 border border-gray-100 rounded-full py-3 px-12 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-note-purple/50 focus:border-note-purple transition-all shadow-sm"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        {/* Remember Me & Forgot Password */}
                        {isLogin && (
                            <div className="flex items-center justify-between px-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" className="accent-note-purple w-4 h-4" defaultChecked />
                                    <span className="text-sm text-gray-500">Rester connecté</span>
                                </label>
                                <a href="#" className="text-xs text-gray-400 hover:text-note-purple transition-colors">
                                    {t('forgot_password')}
                                </a>
                            </div>
                        )}

                        {/* Moved inside the flex container above */}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-note-purple to-violet-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold py-3 px-4 rounded-full shadow-lg shadow-violet-200 transform transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? t('loading') : (isLogin ? t('login_btn').toUpperCase() : t('register_btn').toUpperCase())}
                        </button>
                    </form>

                    <div className="mt-8">
                        <div className="relative flex py-2 items-center">
                            <div className="flex-grow border-t border-gray-100"></div>
                            <span className="flex-shrink mx-4 text-gray-300 text-xs uppercase">{t('or')}</span>
                            <div className="flex-grow border-t border-gray-100"></div>
                        </div>

                        <div className="mt-4 flex gap-4 justify-center">
                            <button onClick={() => handleSocialLogin('google')} className="p-3 bg-white border border-gray-100 hover:bg-gray-50 rounded-full shadow-sm transition-all hover:shadow-md" title={t('google_login')}>
                                <span className="text-red-500 font-bold text-xl">G</span>
                            </button>
                            <button onClick={() => handleSocialLogin('facebook')} className="p-3 bg-white border border-gray-100 hover:bg-gray-50 rounded-full shadow-sm transition-all hover:shadow-md" title={t('facebook_login')}>
                                <Facebook className="w-6 h-6 text-blue-600" />
                            </button>
                            <button onClick={() => handleSocialLogin('apple')} className="p-3 bg-white border border-gray-100 hover:bg-gray-50 rounded-full shadow-sm transition-all hover:shadow-md" title={t('apple_login')}>
                                <Apple className="w-6 h-6 text-gray-900" />
                            </button>
                        </div>
                    </div>

                    <div className="mt-8 text-center">
                        <p className="text-sm text-gray-400">
                            {isLogin ? t('no_account') : t('has_account')}
                            <button
                                onClick={() => setIsLogin(!isLogin)}
                                className="ml-2 text-note-purple font-bold hover:underline transition-all"
                            >
                                {isLogin ? t('register_btn') : t('login_btn')}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
