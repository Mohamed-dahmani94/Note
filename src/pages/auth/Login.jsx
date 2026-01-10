import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Mail, Lock, User, Github, Facebook, Apple } from 'lucide-react'; // Simulating social icons
import LanguageSwitcher from '../../components/LanguageSwitcher';

const Login = () => {
    const { t, i18n } = useTranslation();
    const { login, signup } = useAuth();
    const navigate = useNavigate();

    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Form States
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isLogin) {
                await login(email, password);
                navigate('/admin'); // Or redirect based on role later
            } else {
                await signup(email, password, fullName);
                alert("Compte créé ! Vérifiez votre email.");
                setIsLogin(true);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSocialLogin = async (provider) => {
        // Implementation for Supabase OAuth
        console.log(`Login with ${provider}`);
        alert(`Social Login with ${provider} requires Supabase configuration.`);
    };

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col relative overflow-hidden">
            {/* Navbar (Minimal) */}
            <div className="absolute top-0 w-full p-6 flex justify-between items-center z-10">
                <h1 className="text-xl font-bold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent cursor-pointer" onClick={() => navigate('/')}>
                    Note.dz
                </h1>
                <LanguageSwitcher />
            </div>

            <div className="flex-1 flex items-center justify-center p-4">
                <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl w-full max-w-md relative z-10 backdrop-blur-sm bg-opacity-95">

                    <h2 className="text-3xl font-bold text-white mb-2 text-center">
                        {isLogin ? t('login') : t('register_btn')}
                    </h2>
                    <p className="text-slate-400 text-center mb-8 text-sm">
                        {t('subtitle')}
                    </p>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg mb-6 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {!isLogin && (
                            <div className="relative">
                                <User className="absolute left-3 top-3.5 h-5 w-5 text-slate-500" />
                                <input
                                    type="text"
                                    placeholder={t('full_name')}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg py-3 px-10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    required
                                />
                            </div>
                        )}

                        <div className="relative">
                            <Mail className="absolute left-3 top-3.5 h-5 w-5 text-slate-500" />
                            <input
                                type="email"
                                placeholder={t('email')}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg py-3 px-10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="relative">
                            <Lock className="absolute left-3 top-3.5 h-5 w-5 text-slate-500" />
                            <input
                                type="password"
                                placeholder={t('password')}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg py-3 px-10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                        >
                            {loading ? t('loading') : (isLogin ? t('login_btn') : t('register_btn'))}
                        </button>
                    </form>

                    <div className="mt-8">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-800"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-slate-900 text-slate-500 uppercase">{t('or')}</span>
                            </div>
                        </div>

                        <div className="mt-6 flex gap-4 justify-center">
                            <button onClick={() => handleSocialLogin('google')} className="p-3 bg-slate-800 hover:bg-slate-700 rounded-full transition-colors group" title={t('google_login')}>
                                <span className="text-white font-bold">G</span>
                            </button>
                            <button onClick={() => handleSocialLogin('facebook')} className="p-3 bg-slate-800 hover:bg-blue-900/50 rounded-full transition-colors" title={t('facebook_login')}>
                                <Facebook className="w-5 h-5 text-blue-500" />
                            </button>
                            <button onClick={() => handleSocialLogin('apple')} className="p-3 bg-slate-800 hover:bg-slate-700 rounded-full transition-colors" title={t('apple_login')}>
                                <Apple className="w-5 h-5 text-white" />
                            </button>
                        </div>
                    </div>

                    <p className="mt-8 text-center text-sm text-slate-400">
                        {isLogin ? t('no_account') : t('has_account')}{' '}
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-violet-400 hover:text-violet-300 font-medium transition-colors"
                        >
                            {isLogin ? t('register_btn') : t('login_btn')}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
