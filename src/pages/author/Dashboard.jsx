import { Link } from 'react-router-dom';
import { Book, TrendingUp, Download, ArrowUpRight, MoreHorizontal, Activity } from 'lucide-react';

export default function AuthorDashboard() {
    return (
        <div className="animate-fade-in space-y-8 pb-10">

            {/* --- Page Header --- */}
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-extrabold text-white tracking-tight">Espace Auteur</h1>
                <p className="text-slate-400 font-medium">Bon retour, Amine K. ! 👋</p>
            </div>

            {/* --- Top Row: Statistics Grid --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Global Performance Analysis - Main Card */}
                <div className="lg:col-span-2 glass-panel p-6 lg:p-8 flex flex-col bg-slate-900/40 border-white/5 shadow-md relative group">
                    <div className="flex justify-between items-center mb-10">
                        <div>
                            <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                                <Activity size={20} className="text-violet-400" />
                                Impact des Œuvres
                            </h3>
                            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Vues & Interactions par mois</p>
                        </div>
                        <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span className="text-[10px] text-slate-300 font-bold tracking-tighter">DATA LIVE</span>
                        </div>
                    </div>

                    {/* Visualization Bars */}
                    <div className="flex items-end justify-between h-[180px] gap-2 lg:gap-4 mb-4">
                        {[40, 65, 45, 80, 55, 90, 70, 85].map((h, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center group/bar cursor-pointer">
                                <div className="w-full relative h-[180px] flex flex-col justify-end">
                                    <div
                                        className="w-full rounded-lg bg-gradient-to-t from-violet-600/20 to-violet-500 transition-all duration-300 transform group-hover/bar:scale-x-105"
                                        style={{ height: `${h}%` }}
                                    ></div>
                                </div>
                                <span className="text-[10px] text-slate-500 mt-4 font-bold tracking-tighter group-hover/bar:text-white transition-colors">
                                    {['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG'][i]}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Financial Overview - Action Card */}
                <div className="space-y-6 flex flex-col justify-between">
                    <div className="rounded-[2.5rem] p-8 bg-gradient-to-br from-indigo-700 to-violet-800 shadow-md text-white relative overflow-hidden group hover:-translate-y-1 transition-all duration-500 flex-1">
                        <div className="absolute top-[-20%] right-[-10%] opacity-10 transform rotate-12 group-hover:scale-110 transition-transform duration-1000">
                            <TrendingUp size={180} />
                        </div>
                        <div className="relative z-10 h-full flex flex-col">
                            <div className="mb-auto">
                                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-100/60">Balance Estimée</span>
                                <div className="flex items-baseline gap-1 mt-2">
                                    <span className="text-5xl font-black tracking-tighter">$2,450</span>
                                    <span className="text-lg font-bold text-indigo-200">.00</span>
                                </div>
                            </div>

                            <div className="mt-6 flex items-center justify-between">
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-indigo-200 uppercase font-bold">Croissance</span>
                                    <div className="flex items-center gap-1 text-sm font-black text-emerald-300">
                                        <ArrowUpRight size={16} strokeWidth={3} /> +12.5%
                                    </div>
                                </div>
                                <button className="bg-white/10 hover:bg-white/20 backdrop-blur-md p-3 rounded-full transition-colors border border-white/10 group/btn">
                                    <ArrowUpRight size={20} className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Profile Completion - Mini Widget */}
                    <div className="glass-panel p-5 flex items-center gap-6 neon-glow-pink bg-black/40 border-white/5 hover:border-pink-500/30 transition-all duration-300">
                        <div className="relative w-16 h-16 flex-shrink-0">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-slate-800" />
                                <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="transparent" strokeDasharray="176" strokeDashoffset="88" className="text-pink-500" strokeLinecap="round" />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center font-black text-white text-sm">50%</div>
                        </div>
                        <div className="flex-1">
                            <h4 className="text-sm font-bold text-white mb-0.5">Setup Auteur</h4>
                            <p className="text-[10px] text-slate-500 font-medium leading-tight">Bio & Réseaux sociaux manquants.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- Middle Row: KPI Summary Cards --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {/* Manuscripts quick card */}
                <div className="glass-panel p-6 flex flex-col justify-between neon-glow-violet bg-gradient-to-br from-slate-900 via-slate-900 to-violet-900/20 border-white/5 hover:-translate-y-1 transition-all duration-300">
                    <div className="flex justify-between items-center mb-6">
                        <div className="p-3 bg-violet-600/10 rounded-2xl text-violet-400 border border-violet-500/20">
                            <Book size={24} />
                        </div>
                        <span className="text-4xl font-black text-white tracking-tighter">12</span>
                    </div>
                    <div>
                        <h3 className="font-bold text-white text-lg">Manuscrits Envoyés</h3>
                        <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest font-bold">Mis à jour en temps réel</p>
                    </div>
                </div>

                {/* Downloads quick card */}
                <div className="glass-panel p-6 flex flex-col justify-between neon-glow-cyan bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-900/20 border-white/5 hover:-translate-y-1 transition-all duration-300">
                    <div className="flex justify-between items-center mb-6">
                        <div className="p-3 bg-cyan-600/10 rounded-2xl text-cyan-400 border border-cyan-500/20">
                            <Download size={24} />
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-4xl font-black text-white tracking-tighter">1.2K</span>
                            <span className="text-[10px] font-bold text-cyan-400 mt-1">Lectorat Actuel</span>
                        </div>
                    </div>
                    <div>
                        <h3 className="font-bold text-white text-lg">Lectures & Extraits</h3>
                        <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest font-bold">Top 5% auteurs émergents</p>
                    </div>
                </div>

                {/* Recent Events - Mobile List Style UX */}
                <div className="glass-panel overflow-hidden bg-slate-950/40 border-white/5 lg:col-span-1 shadow-md">
                    <div className="p-5 border-b border-white/5 flex justify-between items-center bg-white/5 backdrop-blur-sm">
                        <h3 className="font-bold text-white text-xs uppercase tracking-[0.2em]">Flux d'Activité</h3>
                        <MoreHorizontal size={18} className="text-slate-600 hover:text-white transition-colors cursor-pointer" />
                    </div>
                    <div className="divide-y divide-white/5 max-h-[160px] overflow-y-auto custom-scrollbar">
                        {[
                            { title: "Review IA Complétée", time: "2m", color: "bg-blue-500", desc: "Sahara : Analyse 94/100" },
                            { title: "Nouveau Lecteur", time: "1h", color: "bg-emerald-500", desc: "Un extrait a été consulté" },
                            { title: "Profil Validé", time: "5h", color: "bg-violet-500", desc: "Accès Premium activé" }
                        ].map((item, i) => (
                            <div key={i} className="p-4 flex items-start gap-4 hover:bg-white/[0.03] transition-all cursor-pointer group">
                                <div className={`w-1 h-6 rounded-full ${item.color} mt-1 blur-[1px] group-hover:blur-0 transition-all`}></div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-center mb-0.5">
                                        <div className="text-[11px] font-black text-white uppercase tracking-tight group-hover:text-violet-300 transition-colors">{item.title}</div>
                                        <div className="text-[9px] text-slate-600 font-bold">{item.time}</div>
                                    </div>
                                    <div className="text-[10px] text-slate-500 group-hover:text-slate-400 transition-colors">{item.desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

        </div>
    );
}
