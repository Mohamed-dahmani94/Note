import { ArrowRight, BookOpen, Star, Shield, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useConfig } from '../contexts/ConfigContext';

export default function Landing() {
    const { config } = useConfig();
    return (
        <div className="flex flex-col min-h-screen">
            {/* Navbar */}
            <nav className="border-b border-white/5 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {config.logoUrl ? (
                            <img src={config.logoUrl} alt="Logo" className="h-10 w-10 object-contain" />
                        ) : (
                            <BookOpen className="text-violet-500" size={32} />
                        )}
                        <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">{config.companyName}</span>
                    </div>
                    <div className="flex gap-4">
                        <Link to="/connexion">
                            <button className="text-slate-300 hover:text-white px-4 py-2 font-medium transition-colors">Se Connecter</button>
                        </Link>
                        <Link to="/inscription">
                            <button className="px-6 py-2 rounded-full bg-violet-600 hover:bg-violet-500 text-white font-bold transition-all shadow-lg shadow-violet-500/20">
                                Commencer
                            </button>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-24 relative overflow-hidden">
                {/* Decorative Blobs */}
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-[100px] -z-10 animate-fade-in delay-75"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-600/20 rounded-full blur-[100px] -z-10 animate-fade-in delay-150"></div>

                <div className="glass-panel p-12 max-w-4xl w-full animate-slide-up relative border-t border-white/10">
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-sm font-medium uppercase tracking-wider backdrop-blur-md">
                        Nouvelle Génération d'Édition
                    </div>

                    <h1 className="text-6xl md:text-7xl font-bold mb-6 mt-4 title-gradient tracking-tight">
                        {config.landingTitle.split('.')[0]}<br />{config.landingTitle.split('.')[1] || ''}
                    </h1>
                    <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
                        {config.landingSubTitle}
                    </p>

                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Link to="/soumission-rapide">
                            <button className="btn-primary flex items-center justify-center gap-2 text-lg w-full sm:w-auto">
                                Soumettre mon Manuscrit
                                <ArrowRight size={20} />
                            </button>
                        </Link>
                        <Link to="/inscription">
                            <button className="px-8 py-3.5 rounded-full border border-slate-600 hover:border-slate-400 text-slate-300 hover:text-white transition-all font-medium w-full sm:w-auto">
                                Découvrir le Processus
                            </button>
                        </Link>
                    </div>

                    {/* Features Mini-Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 pt-10 border-t border-white/5">
                        <div className="flex flex-col items-center gap-2">
                            <div className="p-3 bg-violet-500/10 rounded-xl text-violet-400 mb-2"><Zap size={24} /></div>
                            <h3 className="font-bold text-white">Analyse Rapide</h3>
                            <p className="text-sm text-slate-400">Feedback IA instantané</p>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <div className="p-3 bg-pink-500/10 rounded-xl text-pink-400 mb-2"><Star size={24} /></div>
                            <h3 className="font-bold text-white">Score de Potentiel</h3>
                            <p className="text-sm text-slate-400">Évaluation marché précise</p>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <div className="p-3 bg-cyan-500/10 rounded-xl text-cyan-400 mb-2"><Shield size={24} /></div>
                            <h3 className="font-bold text-white">Protection IP</h3>
                            <p className="text-sm text-slate-400">Manuscrit sécurisé</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="border-t border-white/5 bg-slate-900/50 py-12">
                <div className="max-w-7xl mx-auto px-6 text-center text-slate-500 text-sm">
                    <p>&copy; {new Date().getFullYear()} {config.companyName}. Tous droits réservés.</p>
                    <div className="flex justify-center gap-6 mt-4">
                        <a href="#" className="hover:text-white transition-colors">Confidentialité</a>
                        <a href="#" className="hover:text-white transition-colors">Conditions</a>
                        <a href="#" className="hover:text-white transition-colors">Support</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
