import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, User, Instagram, Facebook, TrendingUp, AlertTriangle, Check, X, FileText, Download } from 'lucide-react';

export default function SubmissionDetail() {
    const { id } = useParams();

    // Mock Data
    const data = {
        id,
        title: "L'Algérie de Demain",
        category: "Essai Politique",
        synopsis: "Une analyse profonde des mutations sociales et économiques...",
        author: {
            name: "Yacine B.",
            age: 28,
            wilaya: "Alger",
            followers: 45200,
            avatar: "YB"
        },
        scores: {
            content: 28, // /35
            marketing: 32, // /35
            originality: 18, // /20
            risk: -5, // Penalty
            total: 94 // Adjusted
        },
        flags: ["Contenu Original", "Sujet Tendance"]
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
            <Link to="/admin" className="text-slate-400 hover:text-white flex items-center gap-2 mb-4">
                <ChevronLeft size={20} /> Retour au Dashboard
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Author & Info */}
                <div className="space-y-6">
                    {/* Author Card */}
                    <div className="glass-panel p-6 text-center">
                        <div className="w-24 h-24 mx-auto rounded-full bg-slate-700 border-4 border-slate-600 flex items-center justify-center text-3xl font-bold text-white mb-4">
                            {data.author.avatar}
                        </div>
                        <h2 className="text-xl font-bold text-white">{data.author.name}</h2>
                        <p className="text-slate-400">{data.author.wilaya} • {data.author.age} ans</p>

                        <div className="flex justify-center gap-3 mt-4">
                            <div className="p-2 bg-pink-500/10 rounded-full text-pink-500"><Instagram size={18} /></div>
                            <div className="p-2 bg-blue-500/10 rounded-full text-blue-500"><Facebook size={18} /></div>
                        </div>

                        <div className="mt-6 pt-6 border-t border-slate-700">
                            <div className="text-sm text-slate-500 uppercase tracking-widest mb-1">Capital Numérique</div>
                            <div className="text-2xl font-bold text-white">{data.author.followers.toLocaleString()}</div>
                            <div className="text-xs text-green-400">High Influence</div>
                        </div>
                    </div>

                    {/* File Info */}
                    <div className="glass-panel p-6">
                        <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                            <FileText size={18} className="text-violet-400" /> Fichiers Soumis
                        </h3>
                        <button className="w-full flex items-center justify-between p-3 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors mb-2">
                            <span className="text-sm text-slate-300">Manuscrit_Complet.pdf</span>
                            <Download size={16} className="text-slate-500" />
                        </button>
                        <button className="w-full flex items-center justify-between p-3 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors">
                            <span className="text-sm text-slate-300">Extrait_20p.pdf</span>
                            <Download size={16} className="text-slate-500" />
                        </button>
                    </div>
                </div>

                {/* Center/Right: AI Analysis */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="glass-panel p-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <TrendingUp size={120} className="text-white" />
                        </div>

                        <div className="flex justify-between items-start mb-8 relative z-10">
                            <div>
                                <div className="px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 text-xs font-bold inline-block mb-2">{data.category}</div>
                                <h1 className="text-3xl font-bold text-white mb-2">{data.title}</h1>
                                <p className="text-slate-300 max-w-xl">{data.synopsis}</p>
                            </div>
                            <div className="text-center">
                                <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-green-400 to-emerald-600">
                                    {data.scores.total}
                                </div>
                                <div className="text-sm text-slate-400 font-bold uppercase tracking-wider">Note Globale</div>
                            </div>
                        </div>

                        {/* Score Breakdown */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                            <div className="space-y-4">
                                <ScoreBar label="Qualité Contenu & Langue" score={data.scores.content} max={35} color="bg-blue-500" />
                                <ScoreBar label="Potentiel Marketing (Buzz)" score={data.scores.marketing} max={35} color="bg-pink-500" />
                            </div>
                            <div className="space-y-4">
                                <ScoreBar label="Originalité & Innovation" score={data.scores.originality} max={20} color="bg-amber-500" />
                                <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-lg flex justify-between items-center text-red-300">
                                    <span className="text-sm font-medium flex items-center gap-2"><AlertTriangle size={16} /> Risque / Plagiat</span>
                                    <span className="font-bold">{data.scores.risk} pts</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Decision Actions */}
                    <div className="glass-panel p-6 flex justify-between items-center">
                        <div className="text-slate-400 text-sm">
                            Décision requise pour cette soumission.
                        </div>
                        <div className="flex gap-4">
                            <button className="px-6 py-2 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-2">
                                <X size={18} /> Refuser
                            </button>
                            <button className="px-6 py-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold hover:shadow-lg hover:shadow-green-500/20 transition-all flex items-center gap-2">
                                <Check size={18} /> Accepter pour Publication
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ScoreBar({ label, score, max, color }) {
    const percent = (score / max) * 100;
    return (
        <div>
            <div className="flex justify-between text-sm mb-1 text-slate-300">
                <span>{label}</span>
                <span className="font-bold">{score}/{max}</span>
            </div>
            <div className="h-2 w-full bg-slate-700 rounded-full overflow-hidden">
                <div style={{ width: `${percent}%` }} className={`h-full ${color}`}></div>
            </div>
        </div>
    );
}
