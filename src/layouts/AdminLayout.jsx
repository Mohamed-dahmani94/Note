import { Link, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, Users, Settings, LogOut, ShieldCheck, Menu, Search, Bell } from 'lucide-react';
import { useConfig } from '../contexts/ConfigContext';

export default function AdminLayout() {
    const location = useLocation();
    const { config } = useConfig();
    const isActive = (path) => location.pathname === path || (path !== '/admin' && location.pathname.startsWith(path));

    return (
        <div className="flex min-h-screen bg-slate-950">

            {/* --- DESKTOP SIDEBAR --- */}
            <aside className="hidden lg:flex w-72 bg-gradient-to-b from-cyan-900 via-blue-900 to-slate-900 text-white flex-col items-center py-10 sticky top-0 h-screen z-20 shadow-2xl rounded-r-[3rem] border-r border-white/5">

                {/* Admin Brand Section */}
                <div className="flex flex-col items-center mb-12 w-full px-6">
                    <div className="w-20 h-20 rounded-2xl bg-slate-800 border-4 border-cyan-500/30 mb-4 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.3)] overflow-hidden">
                        {config.logoUrl ? (
                            <img src={config.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                        ) : (
                            <ShieldCheck size={40} className="text-cyan-400" />
                        )}
                    </div>
                    <h2 className="text-xl font-bold tracking-wide">Admin Portal</h2>
                    <p className="text-cyan-300/80 text-xs uppercase tracking-widest mt-1">Super User</p>
                    <div className="mt-4 pt-4 border-t border-white/5 w-full text-center">
                        <span className="text-2xl font-black tracking-tighter text-white">
                            {config.companyName.split('.')[0]}
                            <span className="text-cyan-400">.{config.companyName.split('.')[1] || 'dz'}</span>
                        </span>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 w-full px-4 space-y-4">
                    <SidebarLink
                        to="/admin"
                        icon={LayoutDashboard}
                        label="Vue d'ensemble"
                        active={location.pathname === '/admin'}
                    />
                    <SidebarLink
                        to="/admin/soumissions"
                        icon={FileText}
                        label="Manuscrits"
                        active={isActive('/admin/soumissions')}
                    />
                    <SidebarLink
                        to="/admin/utilisateurs"
                        icon={Users}
                        label="Utilisateurs"
                        active={isActive('/admin/utilisateurs')}
                    />
                    <SidebarLink
                        to="/admin/settings"
                        icon={Settings}
                        label="Configuration"
                        active={isActive('/admin/settings')}
                    />
                </nav>

                {/* Footer Actions */}
                <div className="w-full px-4 mt-auto">
                    <button className="flex items-center gap-3 text-slate-400 hover:text-red-400 transition-colors w-full px-6 py-3 rounded-2xl hover:bg-white/5 mx-auto group">
                        <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="font-medium">Déconnexion</span>
                    </button>
                </div>
            </aside>

            {/* --- MAIN CONTENT --- */}
            <main className="flex-1 p-4 lg:p-8 bg-slate-950 relative min-h-screen overflow-x-hidden">
                {/* Background Ambient Glow removed for performance */}

                {/* Header */}
                <header className="flex justify-between items-center mb-8 relative z-10 glass-panel p-3 lg:p-4 rounded-full border border-white/5">
                    <div className="flex items-center gap-4 px-4 w-full lg:w-1/3">
                        <div className="bg-white/10 w-8 h-8 rounded-full flex items-center justify-center lg:hidden">
                            <Menu size={16} className="text-cyan-300" />
                        </div>
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                            <input
                                type="text"
                                placeholder="Recherche globale..."
                                className="w-full bg-transparent border-none focus:ring-0 text-sm pl-9 text-white placeholder-slate-500 !p-2 !bg-transparent shadow-none"
                            />
                        </div>
                    </div>

                    <div className="px-6 relative hidden lg:flex items-center gap-4">
                        <div className="text-right mr-2">
                            <div className="text-xs text-slate-400">Dernière connexion</div>
                            <div className="text-sm font-bold text-white">Aujourd'hui, 09:41</div>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 border border-white/20 shadow-lg shadow-cyan-500/20"></div>
                    </div>
                </header>

                {/* Dynamic Page Content */}
                <div className="animate-fade-in relative z-10">
                    <Outlet />
                </div>
            </main>

        </div>
    );
}

function SidebarLink({ to, icon: Icon, label, active }) {
    return (
        <Link to={to}>
            <div className={`flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 border border-transparent ${active ? 'bg-cyan-950/50 border-cyan-500/30 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.15)]' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
                <Icon size={22} className={active ? "text-cyan-400 drop-shadow-[0_0_5px_rgba(6,182,212,0.8)]" : ""} />
                <span className={active ? "font-bold" : "font-medium"}>{label}</span>
            </div>
        </Link>
    );
}
