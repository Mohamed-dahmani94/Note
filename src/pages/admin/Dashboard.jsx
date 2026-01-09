import { TrendingUp, Users, FileText, AlertTriangle, ArrowUpRight, Activity, BookOpen, Clock } from 'lucide-react';

export default function AdminDashboard() {
    const kpis = [
        { label: "Total Manuscrits", value: "0", change: "+0%", icon: FileText, color: "text-cyan-400", glow: "border-cyan-500/20" },
        { label: "Utilisateurs Actifs", value: "0", change: "+0%", icon: Users, color: "text-blue-400", glow: "border-blue-500/20" },
        { label: "Revue En Attente", value: "0", change: "0", icon: Clock, color: "text-amber-400", glow: "border-amber-500/20" },
        { label: "Top Quality (>90%)", value: "0", change: "+0%", icon: TrendingUp, color: "text-emerald-400", glow: "border-emerald-500/20" },
    ];

    return (
        <div className="space-y-8 pb-20">
            {/* Title Section */}
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Tableau de Bord</h1>
                <p className="text-slate-400">Vue d'ensemble de la plateforme et indicateurs clés.</p>
            </div>

            {/* KPIs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {kpis.map((k, i) => (
                    <div key={i} className={`glass-panel p-6 relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${k.glow} border`}>
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-xl bg-slate-900/50 ${k.color}`}>
                                <k.icon size={24} />
                            </div>
                            <span className="flex items-center text-xs font-bold text-slate-500 bg-slate-900/30 px-2 py-1 rounded-lg">
                                <ArrowUpRight size={12} className="mr-1 text-green-400" /> {k.change}
                            </span>
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-white mb-1">{k.value}</div>
                            <div className="text-sm text-slate-400 font-medium">{k.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Large Chart Section */}
                <div className="lg:col-span-2 glass-panel p-8 bg-slate-900/40 border border-white/5 relative overflow-hidden">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                                <Activity className="text-cyan-400" size={20} />
                                Activité de la Plateforme
                            </h3>
                            <p className="text-sm text-slate-500">Soumissions vs Validations (Temps Réel)</p>
                        </div>
                        <select className="bg-slate-900 border border-slate-700 text-slate-300 text-sm rounded-lg px-3 py-1">
                            <option>7 derniers jours</option>
                            <option>Mois en cours</option>
                        </select>
                    </div>

                    {/* Mock Graph Visual */}
                    <div className="h-[250px] w-full flex items-end justify-between px-2 gap-2">
                        {[35, 55, 40, 70, 50, 85, 60, 75, 55, 90, 65, 80].map((h, i) => (
                            <div key={i} className="group relative flex-1 flex flex-col justify-end h-full">
                                <div
                                    className="w-full bg-gradient-to-t from-cyan-900/40 to-blue-500/20 rounded-t-sm transition-all duration-500 group-hover:from-cyan-600 group-hover:to-cyan-400"
                                    style={{ height: `${h}%` }}
                                ></div>
                            </div>
                        ))}
                    </div>
                    {/* X Axis */}
                    <div className="flex justify-between mt-4 text-xs text-slate-500 font-mono uppercase">
                        <span>Lun</span><span>Mar</span><span>Mer</span><span>Jeu</span><span>Ven</span><span>Sam</span><span>Dim</span>
                    </div>
                </div>

                {/* Right Column: Alerts & Actions */}
                <div className="space-y-6">
                    {/* Neon Action Card */}
                    <div className="rounded-3xl p-6 bg-gradient-to-br from-cyan-600 to-blue-700 shadow-[0_10px_30px_rgba(6,182,212,0.3)] text-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-700">
                            <BookOpen size={120} />
                        </div>
                        <h3 className="text-lg font-bold mb-2">Comité de Lecture</h3>
                        <p className="text-cyan-100 text-sm mb-6 max-w-[80%]">3 manuscrits nécessitent votre validation finale ce matin.</p>
                        <button className="bg-white text-cyan-900 px-6 py-3 rounded-xl font-bold text-sm hover:bg-cyan-50 transition shadow-lg">
                            Ouvrir la session
                        </button>
                    </div>

                    {/* Recent Alerts List */}
                    <div className="glass-panel p-0 overflow-hidden bg-slate-900/30">
                        <div className="p-5 border-b border-white/5 bg-white/5">
                            <h3 className="font-bold text-white text-sm uppercase tracking-wider">Derniers Scores IA</h3>
                        </div>
                        <div>
                            {/* Empty State */}
                            <div className="p-8 text-center text-slate-500 text-xs italic">
                                Aucune activité récente
                            </div>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
}
