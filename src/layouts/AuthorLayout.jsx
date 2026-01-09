import { Link, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, User, LogOut, Search, Bell, Home, ShieldCheck } from 'lucide-react';
import { useConfig } from '../contexts/ConfigContext';

export default function AuthorLayout() {
    const location = useLocation();
    const { config } = useConfig();
    const isActive = (path) => location.pathname === path;

    return (
        <div className="flex min-h-screen bg-slate-950 pb-20 lg:pb-0"> {/* Padding bottom for mobile nav */}

            {/* --- DESKTOP SIDEBAR (Hidden on Mobile) --- */}
            <aside className="hidden lg:flex w-72 bg-gradient-to-b from-indigo-900 via-violet-900 to-slate-900 text-white flex-col items-center py-10 sticky top-0 h-screen z-20 shadow-2xl rounded-r-[3rem]">
                {/* Profile Section */}
                <div className="flex flex-col items-center mb-12 w-full px-6">
                    <div className="w-24 h-24 rounded-full bg-slate-800 border-4 border-white/20 mb-4 overflow-hidden relative group cursor-pointer shadow-lg">
                        <div className="absolute inset-0 bg-gradient-to-br from-violet-500 to-pink-500 opacity-80 group-hover:opacity-100 transition-opacity"></div>
                        <div className="absolute inset-0 flex items-center justify-center text-2xl font-bold">AK</div>
                    </div>
                    <h2 className="text-xl font-bold tracking-wide">Amine K.</h2>
                    <p className="text-violet-300 text-sm">Auteur Premium</p>
                    <div className="mt-4 pt-4 border-t border-white/5 w-full text-center">
                        <span className="text-2xl font-black tracking-tighter text-white">
                            {config.companyName.split('.')[0]}
                            <span className="text-violet-400">.{config.companyName.split('.')[1] || 'dz'}</span>
                        </span>
                    </div>
                </div>

                {/* Desktop Navigation */}
                <nav className="flex-1 w-full px-4 space-y-4">
                    <SidebarLink to="/auteur/dashboard" icon={LayoutDashboard} label="Dashboard" active={isActive('/auteur/dashboard')} />
                    <SidebarLink to="/auteur/nouvelle-soumission" icon={PlusCircle} label="Nouvelle Œuvre" active={isActive('/auteur/nouvelle-soumission')} />
                    <SidebarLink to="/auteur/profil" icon={User} label="Mon Profil" active={isActive('/auteur/profil')} />
                </nav>

                {/* Footer Actions */}
                <div className="w-full px-4 mt-auto">
                    <button className="flex items-center gap-3 text-slate-400 hover:text-red-400 transition-colors w-full px-6 py-3 rounded-2xl hover:bg-white/5 mx-auto">
                        <LogOut size={20} />
                        <span className="font-medium">Déconnexion</span>
                    </button>
                </div>
            </aside>

            {/* --- MAIN CONTENT --- */}
            <main className="flex-1 p-4 lg:p-8 bg-slate-950 relative min-h-screen">
                {/* Background Glow removed for performance */}

                {/* Mobile Header (Slightly Simplified) */}
                <header className="flex justify-between items-center mb-6 lg:mb-10 relative z-10 glass-panel p-3 lg:p-4 rounded-full border border-white/5">
                    <div className="flex items-center gap-4 px-4 w-full lg:w-1/3">
                        <div className="bg-white/10 w-8 h-8 rounded-full flex items-center justify-center lg:hidden">
                            <User size={16} className="text-violet-300" />
                        </div>
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                            <input
                                type="text"
                                placeholder="Rechercher..."
                                className="w-full bg-transparent border-none focus:ring-0 text-sm pl-9 text-white placeholder-slate-500 !p-2 !bg-transparent"
                            />
                        </div>
                    </div>

                    <div className="px-4 relative hidden lg:block">
                        <Bell className="text-slate-300" size={24} />
                    </div>
                </header>

                {/* Page Content */}
                <div className="relative z-10">
                    <Outlet />
                </div>
            </main>

            {/* --- MOBILE BOTTOM NAVIGATION (Fixed) --- */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur-xl border-t border-white/10 z-50 h-[80px] pb-4 flex justify-around items-center px-4 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
                <MobileNavLink to="/auteur/dashboard" icon={Home} label="Accueil" active={isActive('/auteur/dashboard')} />

                {/* Floating Add Button */}
                <Link to="/auteur/nouvelle-soumission">
                    <div className="relative -top-6">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-violet-600 to-pink-600 flex items-center justify-center shadow-[0_0_20px_rgba(236,72,153,0.5)] border-4 border-slate-900 transform transition active:scale-95">
                            <PlusCircle size={32} className="text-white" />
                        </div>
                    </div>
                </Link>

                <MobileNavLink to="/auteur/profil" icon={User} label="Profil" active={isActive('/auteur/profil')} />
            </div>

        </div>
    );
}

function SidebarLink({ to, icon: Icon, label, active }) {
    return (
        <Link to={to}>
            <div className={`flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 ${active ? 'bg-white text-violet-900 shadow-xl shadow-white/10 font-bold scale-105 transform translate-x-2' : 'text-slate-400 hover:bg-white/10 hover:text-white'}`}>
                <Icon size={22} className={active ? "text-violet-600" : ""} />
                <span>{label}</span>
            </div>
        </Link>
    );
}

function MobileNavLink({ to, icon: Icon, label, active }) {
    return (
        <Link to={to} className="flex flex-col items-center gap-1 w-16">
            <Icon size={24} className={active ? "text-violet-400 drop-shadow-[0_0_8px_rgba(167,139,250,0.8)]" : "text-slate-500"} />
            <span className={`text-[10px] font-medium ${active ? "text-violet-300" : "text-slate-600"}`}>{label}</span>
        </Link>
    );
}
