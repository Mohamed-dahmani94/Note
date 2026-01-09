import { useState, useEffect } from 'react';
import { FileText, Search, Filter, MoreVertical, CheckCircle, Clock, User, AlertCircle, Download, Eye, Check, X, BookOpen, TrendingUp, AlertTriangle } from 'lucide-react';
import { supabase } from '../../supabaseClient';

export default function Manuscripts() {
    const [filter, setFilter] = useState('all'); // all, pending_user, verified_user
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedManuscript, setSelectedManuscript] = useState(null);
    const [activeAiAxe, setActiveAiAxe] = useState(null);

    // Mock Data including regular users and express (lead capture) submissions
    const [manuscripts, setManuscripts] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch from Supabase
    useEffect(() => {
        const fetchManuscripts = async () => {
            const { data, error } = await supabase
                .from('manuscripts')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching manuscripts:', error);
            } else {
                // Transform data to match UI expected shape
                const formatted = data.map(m => ({
                    id: m.id,
                    title: m.title,
                    author: m.author_name,
                    email: m.email,
                    category: m.category,
                    status: "En attente", // Default UI status
                    accountStatus: m.status, // Database status
                    score: 0, // AI score pending
                    date: new Date(m.created_at).toLocaleDateString(),
                    ...m.metadata // Spread metadata (pitch, summary, etc)
                }));
                setManuscripts(formatted);
            }
            setLoading(false);
        };

        fetchManuscripts();
    }, []);
    const filteredManuscripts = manuscripts.filter(m => {
        const matchesSearch = m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            m.author.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filter === 'all' ||
            (filter === 'pending' && m.accountStatus === 'En attente') ||
            (filter === 'verified' && m.accountStatus === 'Vérifié');
        return matchesSearch && matchesFilter;
    });

    const handleApproveAccount = (id) => {
        setManuscripts(prev => prev.map(m =>
            m.id === id ? { ...m, accountStatus: 'Vérifié', role: 'Auteur' } : m
        ));
    };

    return (
        <div className="space-y-8 pb-20">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight">Gestion des Manuscrits</h1>
                    <p className="text-slate-400 font-medium">Vue unifiée des auteurs vérifiés et des nouveaux leads express.</p>
                </div>
                <div className="flex gap-2 p-1 bg-slate-900/60 rounded-xl border border-white/5">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${filter === 'all' ? 'bg-cyan-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                    >
                        Tous
                    </button>
                    <button
                        onClick={() => setFilter('verified')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${filter === 'verified' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-slate-400 hover:text-white'}`}
                    >
                        Vérifiés
                    </button>
                    <button
                        onClick={() => setFilter('pending')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${filter === 'pending' ? 'bg-amber-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                    >
                        En attente
                        <span className="ml-2 bg-black/20 px-1.5 py-0.5 rounded-md">{manuscripts.filter(m => m.accountStatus === 'En attente').length}</span>
                    </button>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="glass-panel p-4 flex flex-col md:flex-row gap-4 items-center bg-slate-900/40 border-white/5">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input
                        type="text"
                        placeholder="Rechercher un manuscrit ou un auteur..."
                        className="w-full pl-12 pr-4 py-3"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <button className="flex items-center gap-2 px-4 py-3 bg-slate-800 rounded-xl text-slate-300 font-bold text-sm border border-white/5 hover:border-cyan-500/30 transition-all">
                        <Filter size={18} />
                        Catégories
                    </button>
                </div>
            </div>

            {/* Unified Table */}
            <div className="glass-panel overflow-hidden border-white/5">
                <table className="w-full text-left">
                    <thead className="bg-white/5 text-xs font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">
                        <tr>
                            <th className="p-4 border-b border-white/5">Manuscrit</th>
                            <th className="p-4 border-b border-white/5">Auteur / Lead</th>
                            <th className="p-4 border-b border-white/5 text-center">IA Score</th>
                            <th className="p-4 border-b border-white/5">Saisie</th>
                            <th className="p-4 border-b border-white/5">État Compte</th>
                            <th className="p-4 border-b border-white/5 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {filteredManuscripts.map((m) => (
                            <tr key={m.id} className="hover:bg-white/5 transition-colors group">
                                <td className="p-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-12 bg-slate-800 rounded-lg flex items-center justify-center text-slate-500 group-hover:bg-cyan-500/10 group-hover:text-cyan-400 transition-colors">
                                            <FileText size={20} />
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-white mb-0.5">{m.title}</div>
                                            <div className="text-[10px] font-black uppercase text-slate-500 tracking-tighter bg-slate-900/50 w-fit px-1.5 py-0.5 rounded border border-white/5">{m.category}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4 whitespace-nowrap">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-xs font-bold text-slate-400">
                                            {m.author.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-white flex items-center gap-2">
                                                {m.author}
                                                {m.status === 'Express' && <span className="bg-violet-500/10 text-violet-400 text-[10px] px-1.5 py-0.5 rounded border border-violet-500/20">LEAD EXPRESS</span>}
                                            </div>
                                            <div className="text-xs text-slate-500">{m.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4 text-center">
                                    <div className={`text-lg font-mono font-bold ${m.score >= 90 ? 'text-emerald-400' : m.score >= 70 ? 'text-cyan-400' : 'text-amber-400'}`}>
                                        {m.score}
                                    </div>
                                </td>
                                <td className="p-4 whitespace-nowrap text-slate-400 text-xs font-medium">{m.date}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 w-fit ${m.accountStatus === 'Vérifié' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20 animate-pulse'}`}>
                                        {m.accountStatus === 'Vérifié' ? <CheckCircle size={10} /> : <AlertCircle size={10} />}
                                        {m.accountStatus}
                                    </span>
                                </td>
                                <td className="p-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => setSelectedManuscript(m)} className="p-2 bg-slate-800 text-slate-400 rounded-lg hover:text-white transition-colors border border-white/5" title="Voir détails"><Eye size={16} /></button>
                                        {m.accountStatus === 'En attente' && (
                                            <button
                                                onClick={() => handleApproveAccount(m.id)}
                                                className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg hover:bg-emerald-500 hover:text-white transition-all border border-emerald-500/20"
                                                title="Approuver le compte"
                                            >
                                                <Check size={16} />
                                            </button>
                                        )}
                                        <button className="p-2 bg-slate-800 text-slate-400 rounded-lg hover:text-white transition-colors border border-white/5">
                                            <Download size={16} />
                                        </button>
                                        <button className="p-2 bg-slate-800 text-slate-500 rounded-lg hover:text-red-400 transition-colors border border-white/5">
                                            <X size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {filteredManuscripts.length === 0 && (
                    <div className="p-20 text-center space-y-4">
                        <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mx-auto text-slate-700">
                            <FileText size={32} />
                        </div>
                        <p className="text-slate-500 font-bold">Aucun manuscrit trouvé pour cette recherche.</p>
                    </div>
                )}
            </div>
            {/* --- DETAILED MODAL --- */}
            {selectedManuscript && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => { setSelectedManuscript(null); setActiveAiAxe(null); }}></div>

                    <div className="relative glass-panel w-full max-w-5xl max-h-[90vh] overflow-y-auto p-0 flex flex-col animate-scale-in">
                        {/* Modal Header */}
                        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5 sticky top-0 z-10 backdrop-blur-xl">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-violet-600/20 text-violet-400 rounded-xl flex items-center justify-center font-black">
                                    {selectedManuscript.id}
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-white">{selectedManuscript.title}</h2>
                                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">{selectedManuscript.category}</p>
                                </div>
                            </div>
                            <button onClick={() => { setSelectedManuscript(null); setActiveAiAxe(null); }} className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400"><X size={24} /></button>
                        </div>

                        <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Left: Author & Work Details */}
                            <div className="space-y-6">
                                <div className="space-y-4">
                                    <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                                        <User size={14} className="text-cyan-400" /> Profil Auteur
                                    </h3>
                                    <div className="bg-slate-900/50 p-4 rounded-2xl border border-white/5">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold">{selectedManuscript.author[0]}</div>
                                            <div>
                                                <div className="font-bold text-white">{selectedManuscript.author}</div>
                                                <div className="text-xs text-slate-500">{selectedManuscript.email}</div>
                                            </div>
                                        </div>
                                        {selectedManuscript.status === 'Express' && (
                                            <div className="space-y-2 mt-4 pt-4 border-t border-white/5">
                                                <div className="flex justify-between text-xs"><span className="text-slate-500">Date de Naissance</span><span className="text-white font-bold">{selectedManuscript.birthDate}</span></div>
                                                <div className="flex justify-between text-xs"><span className="text-slate-500">Type de Lead</span><span className="text-violet-400 font-bold">Express Capture</span></div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                                        <FileText size={14} className="text-violet-400" /> Détails de l'Œuvre
                                    </h3>
                                    <div className="bg-slate-900/50 p-4 rounded-2xl border border-white/5 space-y-4">
                                        <div>
                                            <div className="text-[10px] text-slate-500 font-bold uppercase mb-1">Pitch</div>
                                            <p className="text-sm text-white italic">"{selectedManuscript.pitch}"</p>
                                        </div>
                                        <div>
                                            <div className="text-[10px] text-slate-500 font-bold uppercase mb-1">Résumé / Synopsis</div>
                                            <p className="text-xs text-slate-400 leading-relaxed">{selectedManuscript.synopsis}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Center/Right: AI Analysis */}
                            <div className="lg:col-span-2 space-y-8">
                                <div className="flex justify-between items-end">
                                    <div>
                                        <h3 className="text-2xl font-black text-white">Analyse Profonde IA</h3>
                                        <p className="text-slate-400 text-sm">Décomposition de la note globale par axes stratégiques.</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-cyan-400 to-blue-600 leading-none">
                                            {selectedManuscript.score}
                                        </div>
                                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Score Global</div>
                                    </div>
                                </div>

                                {/* Axes Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <AxeCard
                                        label="Contenu & Langue"
                                        details={selectedManuscript.aiDetails.content}
                                        isActive={activeAiAxe === 'content'}
                                        onClick={() => setActiveAiAxe(activeAiAxe === 'content' ? null : 'content')}
                                        icon={BookOpen}
                                        color="cyan"
                                    />
                                    <AxeCard
                                        label="Potentiel Marketing"
                                        details={selectedManuscript.aiDetails.marketing}
                                        isActive={activeAiAxe === 'marketing'}
                                        onClick={() => setActiveAiAxe(activeAiAxe === 'marketing' ? null : 'marketing')}
                                        icon={TrendingUp}
                                        color="pink"
                                    />
                                    <AxeCard
                                        label="Originalité"
                                        details={selectedManuscript.aiDetails.originality}
                                        isActive={activeAiAxe === 'originality'}
                                        onClick={() => setActiveAiAxe(activeAiAxe === 'originality' ? null : 'originality')}
                                        icon={TrendingUp}
                                        color="amber"
                                    />
                                    <div className="p-4 rounded-2xl bg-red-500/5 border border-red-500/10 flex justify-between items-center group">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-red-500/10 text-red-400"><AlertTriangle size={18} /></div>
                                            <div>
                                                <div className="text-xs font-bold text-red-300">{selectedManuscript.aiDetails.risks.label}</div>
                                                <div className="text-[10px] text-red-500/60 uppercase font-black">{selectedManuscript.aiDetails.risks.reason}</div>
                                            </div>
                                        </div>
                                        <div className="text-xl font-black text-red-500">-{selectedManuscript.aiDetails.risks.score}</div>
                                    </div>
                                </div>

                                {/* Action Bar */}
                                <div className="pt-6 border-t border-white/5 flex flex-wrap gap-4">
                                    <button className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold flex items-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all">
                                        <CheckCircle size={20} /> Accepter pour Publication
                                    </button>
                                    <button className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-all active:scale-95">
                                        Demander une Correction
                                    </button>
                                    <button className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-all active:scale-95">
                                        Informations Complémentaires
                                    </button>
                                    <button className="px-6 py-3 rounded-xl bg-red-500/10 text-red-400 font-bold border border-red-500/20 hover:bg-red-500 hover:text-white transition-all ml-auto">
                                        Rejeter
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function AxeCard({ label, details, isActive, onClick, icon: Icon, color }) {
    const colorClasses = {
        cyan: "from-cyan-500/20 to-blue-500/5 border-cyan-500/20 text-cyan-400",
        pink: "from-pink-500/20 to-rose-500/5 border-pink-500/20 text-pink-400",
        amber: "from-amber-500/20 to-orange-500/5 border-amber-500/20 text-amber-400"
    };

    return (
        <div
            onClick={onClick}
            className={`cursor-pointer rounded-2xl border p-4 transition-all duration-300 bg-gradient-to-br ${isActive ? 'scale-[1.02] shadow-xl ' + colorClasses[color] : 'bg-slate-900/50 border-white/5 opacity-80 hover:opacity-100'}`}
        >
            <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-slate-800 ${isActive ? 'bg-white/10' : ''}`}><Icon size={18} /></div>
                    <div className="text-sm font-bold text-white">{label}</div>
                </div>
                <div className="text-xl font-black text-white">{details.score}<span className="text-slate-500 text-xs font-bold">/{details.max}</span></div>
            </div>

            {isActive && (
                <div className="mt-4 space-y-4 animate-fade-in">
                    <p className="text-xs text-slate-300 leading-relaxed bg-black/30 p-3 rounded-xl border border-white/5 italic">
                        "{details.reason}"
                    </p>
                    <div className="space-y-2">
                        {details.subAxes.map((sub, i) => (
                            <div key={i}>
                                <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase mb-1">
                                    <span>{sub.label}</span>
                                    <span>{sub.score}/{sub.max}</span>
                                </div>
                                <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-white transition-all duration-700"
                                        style={{ width: `${(sub.score / sub.max) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {!isActive && <div className="mt-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center animate-pulse">Cliquer pour justifier</div>}
        </div>
    );
}
