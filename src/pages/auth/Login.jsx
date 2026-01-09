
import { useState } from 'react';
import { Mail, Lock, ArrowRight, User, ShieldCheck } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useConfig } from '../../contexts/ConfigContext';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();
    const { config } = useConfig();

    // Simulate Login Logic
    const handleLogin = (e) => {
        e.preventDefault();

        // ADMIN SIMULATION
        if (email.includes('admin') || email === 'admin@note.com') {
            const adminUser = { name: 'Super Admin', role: 'admin' };
            login(adminUser);
            navigate('/admin');
        }
        // AUTHOR SIMULATION (Default)
        else {
            const authorUser = { name: 'Amine K.', role: 'author' };
            login(authorUser);
            navigate('/auteur/dashboard');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 relative overflow-hidden">

            {/* Background Atmosphere */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-violet-600/20 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-pink-600/20 blur-[120px] rounded-full"></div>
            </div>

            <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8 z-10">

                {/* Left Side: Illustration & Branding */}
                <div className="hidden lg:flex flex-col justify-center items-start p-12 relative">
                    <div className="mb-8">
                        <div className="w-16 h-16 bg-gradient-to-tr from-violet-600 to-pink-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-violet-500/30 overflow-hidden">
                            {config.logoUrl ? (
                                <img src={config.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-3xl font-bold text-white">{config.companyName[0]}</span>
                            )}
                        </div>
                        <h1 className="text-5xl font-bold text-white mb-4 leading-tight">
                            {config.companyName.split('.')[0]} <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-pink-400">{config.companyName.split('.')[1] || 'dz'}</span>
                        </h1>
                        <p className="text-slate-400 text-lg max-w-md">
                            {config.loginMessage}
                        </p>
                    </div>

                    {/* 3D Illustration Placeholder (Rocket/Book) */}
                    <div className="relative w-full h-80 flex items-center justify-center">
                        {/* Abstract Composition simulating the requested 'Rocket' vibe */}
                        <div className="absolute w-64 h-64 bg-gradient-to-t from-violet-600 to-indigo-600 rounded-full blur-3xl opacity-40 animate-pulse"></div>
                        <div className="relative z-10 transform hover:scale-105 transition-transform duration-700">
                            <img
                                src="https://cdni.iconscout.com/illustration/premium/thumb/rocket-launch-4275997-3579043.png"
                                alt="Rocket Launch"
                                className="w-80 drop-shadow-2xl opacity-90"
                            />
                            {/* Fallback visual if image fails to load or for offline dev, we could use CSS shapes but an external generic URL is usually fine for these demos */}
                        </div>
                    </div>
                </div>

                {/* Right Side: Login Form */}
                <div className="flex items-center justify-center">
                    <div className="glass-panel w-full max-w-md p-8 md:p-10 border border-white/10 shadow-2xl relative">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold text-white mb-2">Bon retour !</h2>
                            <p className="text-slate-400 text-sm">Connectez-vous pour accéder à votre espace.</p>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-6">

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-300 uppercase tracking-wide ml-1">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="auteur@exemple.com"
                                        className="pl-11"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-300 uppercase tracking-wide ml-1">Mot de passe</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="pl-11"
                                        required
                                    />
                                </div>
                                <div className="text-right">
                                    <a href="#" className="text-xs text-violet-400 hover:text-violet-300 transition-colors">Mot de passe oublié ?</a>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full btn-primary group mt-2"
                            >
                                <span>Se Connecter</span>
                                <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                            </button>
                            <div className="mt-8 pt-6 border-t border-white/5 text-center">
                                <p className="text-slate-400 text-sm">
                                    Pas encore de compte ? <Link to="/inscription" className="text-violet-400 font-bold hover:text-violet-300 transition-colors">S'inscrire</Link>
                                </p>
                            </div>

                            {/* Dev Hint */}
                            <div className="mt-4 p-3 bg-blue-500/10 rounded-lg text-xs text-blue-300 text-center border border-blue-500/20">
                                <strong>Note Dev:</strong> <br />
                                "admin..." ➔ Admin Portal <br />
                                Autre ➔ Auteur Portal
                            </div>

                        </form>
                    </div>
                </div>

            </div>
        </div>
    );
}
