import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { BrainCircuit, Star, FileText, User, Activity, AlertCircle, TrendingUp, BookOpen, Users, Flag, CheckCircle2, XCircle } from 'lucide-react';

const AIEvaluationManager = () => {
    const [manuscripts, setManuscripts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [analyzingId, setAnalyzingId] = useState(null);
    const [customPrompt, setCustomPrompt] = useState(null);
    const [expandedReview, setExpandedReview] = useState(null);

    useEffect(() => {
        fetchManuscripts();
        fetchPrompts();
    }, []);

    const fetchPrompts = async () => {
        const { data } = await supabase
            .from('admin_settings')
            .select('value')
            .eq('key', 'ai_manuscript_prompt')
            .single();
        if (data) setCustomPrompt(data.value);
    };

    const fetchManuscripts = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data: pubs, error: pubError } = await supabase
                .from('publications')
                .select('*')
                .order('created_at', { ascending: false });

            if (pubError) throw pubError;

            if (pubs && pubs.length > 0) {
                const userIds = [...new Set(pubs.map(p => p.user_id).filter(id => id))];
                if (userIds.length > 0) {
                    const { data: profs } = await supabase.from('profiles').select('*').in('id', userIds);
                    if (profs) {
                        const profMap = Object.fromEntries(profs.map(p => [p.id, p]));
                        setManuscripts(pubs.map(p => ({ ...p, author_profile: profMap[p.user_id] || null })));
                        return;
                    }
                }
                setManuscripts(pubs);
            } else {
                setManuscripts([]);
            }
        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleRunAI = async (m) => {
        setAnalyzingId(m.id);
        setError(null);
        try {
            console.log(`Expertise IA: Appel de la fonction pour le manuscrit ${m.id}`);

            const { data, error: functionError } = await supabase.functions.invoke('evaluate-manuscript', {
                body: { manuscriptId: m.id }
            });

            if (functionError) throw functionError;

            console.log("Expertise IA: Analyse terminée avec succès", data);

            // Refresh manuscripts to show results
            fetchManuscripts();
            setAnalyzingId(null);
        } catch (err) {
            console.error("Erreur lors de l'expertise IA:", err);
            setError("L'analyse a échoué : " + (err.message || "Erreur inconnue"));
            setAnalyzingId(null);
        }
    };

    const getRecommendationStyle = (rec) => {
        if (rec === 'publish') return 'bg-green-100 text-green-700 border-green-200';
        if (rec === 'publish_with_revisions') return 'bg-amber-100 text-amber-700 border-amber-200';
        return 'bg-red-100 text-red-700 border-red-200';
    };

    if (loading) return <div className="p-8 text-center text-gray-500 animate-pulse">Initialisation du système d'évaluation...</div>;

    return (
        <div className="space-y-8 pb-12">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <BrainCircuit className="w-10 h-10 text-note-purple" />
                        Système d'Expertise IA
                    </h1>
                    <p className="text-gray-500 mt-2 max-w-2xl">
                        Analyse multicritère institutionnelle : Marché (30%), Qualité (40%), Profil Auteur (15%) et Benchmarking (15%).
                    </p>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 text-red-800 p-4 rounded-2xl border border-red-200 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 mt-0.5" />
                    <div><h4 className="font-bold">Erreur Technique</h4><p className="text-sm">{error}</p></div>
                </div>
            )}

            <div className="grid grid-cols-1 gap-8">
                {manuscripts.map((m) => {
                    const review = m.ai_detailed_review;
                    const isExpanded = expandedReview === m.id;

                    return (
                        <div key={m.id} className={`bg-white rounded-3xl border ${isExpanded ? 'border-note-purple shadow-xl' : 'border-gray-100 shadow-sm'} overflow-hidden transition-all duration-300`}>
                            {/* Header Panel */}
                            <div className="p-8 flex flex-col md:flex-row gap-8 items-center bg-white">
                                <div className="flex-1 space-y-2">
                                    <div className="flex items-center gap-3 mb-1">
                                        <span className="px-3 py-1 bg-violet-50 text-note-purple text-[10px] font-bold uppercase tracking-wider rounded-full border border-violet-100">
                                            {review?.language_detected === 'ar' ? 'Matière Arabophone' : 'Matière Francophone'}
                                        </span>
                                        <span className="text-xs text-gray-400 font-medium tracking-tight">ID: {m.id.split('-')[0]}</span>
                                    </div>
                                    <h2 className="text-2xl font-black text-gray-900 tracking-tight leading-tight">{m.title_main}</h2>
                                    <div className="flex items-center gap-4 pt-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 border border-gray-100">
                                                <User className="w-4 h-4" />
                                            </div>
                                            <span className="text-sm font-bold text-gray-700">{m.main_author_name} {m.main_author_firstname}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col items-center md:items-end gap-3 min-w-[200px]">
                                    {m.ai_status === 'completed' ? (
                                        <div className="text-right">
                                            <div className="flex items-center gap-2 mb-1 justify-end">
                                                <span className="text-4xl font-black text-note-purple">{review?.final_evaluation?.overall_score}</span>
                                                <span className="text-gray-300 text-lg">/10</span>
                                            </div>
                                            <span className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase border shadow-sm ${getRecommendationStyle(review?.final_evaluation?.final_recommendation)}`}>
                                                {review?.final_evaluation?.final_recommendation?.replace(/_/g, ' ')}
                                            </span>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => handleRunAI(m)}
                                            disabled={analyzingId !== null}
                                            className="bg-note-purple text-white px-8 py-3 rounded-2xl font-black text-sm hover:bg-violet-700 transition-all hover:scale-105 active:scale-95 disabled:bg-gray-100 disabled:text-gray-400"
                                        >
                                            {analyzingId === m.id ? 'ANALYSES EN COURS...' : 'LANCER L\'EXPERTISE'}
                                        </button>
                                    )}
                                    <button
                                        onClick={() => setExpandedReview(isExpanded ? null : m.id)}
                                        className="text-xs font-bold text-gray-400 hover:text-note-purple flex items-center gap-1"
                                    >
                                        {isExpanded ? 'Réduire les détails' : 'Détails de l\'analyse →'}
                                    </button>
                                </div>
                            </div>

                            {/* Detailed Review Section */}
                            {isExpanded && review && (
                                <div className="border-t border-gray-50 bg-gray-50/30 p-8 space-y-8 animate-in slide-in-from-top duration-500">
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                                            <TrendingUp className="w-5 h-5 text-blue-500 mb-3" />
                                            <h4 className="text-xs font-bold text-gray-400 uppercase mb-1">Marché (30%)</h4>
                                            <p className="text-xl font-black text-gray-900">{review.market_analysis?.weighted_score}/10</p>
                                            <p className="text-[10px] text-gray-500 mt-1 uppercase">Saturation: {review.market_analysis?.market_saturation_level}</p>
                                        </div>
                                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                                            <BookOpen className="w-5 h-5 text-violet-500 mb-3" />
                                            <h4 className="text-xs font-bold text-gray-400 uppercase mb-1">Contenu (40%)</h4>
                                            <p className="text-xl font-black text-gray-900">{review.content_evaluation?.weighted_score}/10</p>
                                            <p className="text-[10px] text-gray-500 mt-1 uppercase">Plagiat: {review.content_evaluation?.plagiarism_risk_percent}%</p>
                                        </div>
                                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                                            <Users className="w-5 h-5 text-orange-500 mb-3" />
                                            <h4 className="text-xs font-bold text-gray-400 uppercase mb-1">Auteur (15%)</h4>
                                            <p className="text-xl font-black text-gray-900">{review.author_evaluation?.weighted_score}/10</p>
                                            <p className="text-[10px] text-gray-500 mt-1 uppercase">Marketing: {review.author_evaluation?.marketing_potential_score}/10</p>
                                        </div>
                                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                                            <Flag className="w-5 h-5 text-emerald-500 mb-3" />
                                            <h4 className="text-xs font-bold text-gray-400 uppercase mb-1">Impact (15%)</h4>
                                            <p className="text-xl font-black text-gray-900">8.0/10</p>
                                            <p className="text-[10px] text-gray-500 mt-1 uppercase">Concurrentiel</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <h4 className="font-bold text-gray-800 flex items-center gap-2">
                                                <CheckCircle2 className="w-5 h-5 text-green-500" /> Forces Stratégiques
                                            </h4>
                                            <div className="flex flex-wrap gap-2">
                                                {review.final_evaluation?.strengths?.map((s, i) => (
                                                    <span key={i} className="bg-white px-4 py-2 rounded-xl border border-green-100 text-sm text-green-700 font-medium">{s}</span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <h4 className="font-bold text-gray-800 flex items-center gap-2">
                                                <XCircle className="w-5 h-5 text-red-500" /> Points de Vigilance
                                            </h4>
                                            <div className="flex flex-wrap gap-2">
                                                {review.final_evaluation?.weaknesses?.map((w, i) => (
                                                    <span key={i} className="bg-white px-4 py-2 rounded-xl border border-red-100 text-sm text-red-700 font-medium">{w}</span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                                        <h4 className="text-xs font-bold text-gray-400 uppercase mb-4">Justification Institutionnelle</h4>
                                        <p className="text-gray-700 leading-relaxed italic">"{review.final_evaluation?.decision_justification}"</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}

                {manuscripts.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-[40px] border-4 border-dashed border-gray-50">
                        <Activity className="w-16 h-16 text-gray-100 mx-auto mb-4" />
                        <h3 className="font-black text-gray-300 text-2xl">VOTRE PIPELINE EST VIDE</h3>
                        <p className="text-gray-400">Aucun manuscrit n'est actuellement en attente d'expertise.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AIEvaluationManager;
