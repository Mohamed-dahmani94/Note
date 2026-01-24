import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { BrainCircuit, Star, FileText, User, ChevronRight, Activity, AlertCircle } from 'lucide-react';

const AIEvaluationManager = () => {
    const [manuscripts, setManuscripts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [analyzingId, setAnalyzingId] = useState(null);
    const [customPrompt, setCustomPrompt] = useState(null);

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
            console.log("Fetching all publications...");
            const { data: pubs, error: pubError } = await supabase
                .from('publications')
                .select('*')
                .order('created_at', { ascending: false });

            if (pubError) throw pubError;

            console.log("Publications fetched:", pubs?.length);

            if (pubs && pubs.length > 0) {
                // Fetch profiles for these users
                const userIds = [...new Set(pubs.map(p => p.user_id).filter(id => id))];

                if (userIds.length > 0) {
                    const { data: profs, error: profError } = await supabase
                        .from('profiles')
                        .select('*')
                        .in('id', userIds);

                    if (!profError && profs) {
                        const profMap = Object.fromEntries(profs.map(p => [p.id, p]));
                        const enriched = pubs.map(p => ({
                            ...p,
                            author_profile: profMap[p.user_id] || null
                        }));
                        setManuscripts(enriched);
                        return;
                    }
                }
                setManuscripts(pubs);
            } else {
                setManuscripts([]);
            }
        } catch (err) {
            console.error("Error fetching manuscripts:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleRunAI = async (m) => {
        setAnalyzingId(m.id);

        // Simulating AI Request to Edge Function
        // In a real scenario, we would call: supabase.functions.invoke('analyze-manuscript', { body: { id: m.id } })
        try {
            console.log(`Analyzing manuscript with custom prompt...`);

            // Build the prompt context
            const promptContext = customPrompt || "";
            const finalPrompt = promptContext
                .replace("{{title}}", m.title_main || "Untitled")
                .replace("{{summary}}", m.summary || "No summary")
                .replace("{{keywords}}", m.keywords || "None")
                .replace("{{author_profile}}", m.author_profile ? JSON.stringify(m.author_profile) : "No bio");

            console.log("PROMPT ENVOYÉ À L'IA :", finalPrompt);

            // For Demo/Mock purposes until Edge Function is ready:
            setTimeout(async () => {
                const mockReview = {
                    score: Math.floor(Math.random() * 3) + 7, // 7-9 for demo
                    feedback: "L'IA a analysé le manuscrit \"" + m.title_main + "\". Le style est fluide et la thématique est en parfaite adéquation avec le profil de l'auteur. Le potentiel commercial est estimé comme élevé.",
                    originality: "Élevée",
                    style: "Académique / Professionnel"
                };

                const { error } = await supabase
                    .from('publications')
                    .update({
                        ai_score: mockReview.score,
                        ai_detailed_review: mockReview,
                        ai_status: 'completed'
                    })
                    .eq('id', m.id);

                if (error) throw error;

                fetchManuscripts();
                setAnalyzingId(null);
            }, 3000);

        } catch (error) {
            console.error(error);
            setAnalyzingId(null);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Chargement des soumissions...</div>;

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                        <BrainCircuit className="w-8 h-8 text-note-purple" />
                        Notes de Lecture Assistées par IA
                    </h1>
                    <p className="text-gray-500 mt-1">Analyse approfondie des manuscrits et des profils auteurs.</p>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 text-red-800 p-4 rounded-2xl border border-red-200 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-bold">Erreur de chargement</h4>
                        <p className="text-sm">{error}</p>
                        <button
                            onClick={fetchManuscripts}
                            className="mt-2 text-xs font-bold underline hover:no-underline"
                        >
                            Réessayer
                        </button>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 gap-6">
                {manuscripts.map((m) => (
                    <div key={m.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col md:flex-row transition-all hover:shadow-md">
                        {/* Section Titre / Auteur */}
                        <div className="p-6 md:w-1/3 border-b md:border-b-0 md:border-r border-gray-50">
                            <div className="flex items-center gap-2 text-xs font-bold text-note-purple uppercase tracking-wider mb-2">
                                <FileText className="w-4 h-4" />
                                Manuscrit
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-1">{m.title_main}</h3>
                            <p className="text-sm text-gray-500 mb-4">{m.language} | {m.collection_title || 'Hors collection'}</p>

                            <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                                <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center text-note-purple font-bold">
                                    {m.main_author_name?.charAt(0) || 'A'}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-800">{m.main_author_name} {m.main_author_firstname}</p>
                                    <p className="text-xs text-gray-500">Profil vérifié</p>
                                </div>
                            </div>
                        </div>

                        {/* Section Analyse IA */}
                        <div className="p-6 flex-1 flex flex-col justify-center bg-gradient-to-br from-white to-violet-50/30">
                            {m.ai_status === 'completed' ? (
                                <div className="space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-2">
                                            <div className="flex">
                                                {[...Array(10)].map((_, i) => (
                                                    <Star key={i} className={`w-4 h-4 ${i < m.ai_score ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`} />
                                                ))}
                                            </div>
                                            <span className="text-sm font-bold text-gray-900">{m.ai_score}/10</span>
                                        </div>
                                        <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full border border-green-100">Analyse Terminée</span>
                                    </div>
                                    <div className="text-sm text-gray-600 leading-relaxed italic">
                                        "{m.ai_detailed_review?.feedback}"
                                    </div>
                                    <div className="flex gap-4 pt-2">
                                        <div className="text-xs">
                                            <span className="text-gray-400 block">Originalité</span>
                                            <span className="font-bold text-gray-700">{m.ai_detailed_review?.originality}</span>
                                        </div>
                                        <div className="text-xs">
                                            <span className="text-gray-400 block">Style</span>
                                            <span className="font-bold text-gray-700">{m.ai_detailed_review?.style}</span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center text-center space-y-4 py-4">
                                    <div className={`p-4 rounded-full ${analyzingId === m.id ? 'bg-violet-100' : 'bg-gray-50'} transition-colors`}>
                                        <BrainCircuit className={`w-8 h-8 ${analyzingId === m.id ? 'text-note-purple animate-pulse' : 'text-gray-300'}`} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-800">Prêt pour l'analyse IA</h4>
                                        <p className="text-xs text-gray-500 max-w-xs mx-auto mt-1">
                                            L'IA va lire le fichier DOC/PDF et croiser les informations avec le profil de l'auteur.
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handleRunAI(m)}
                                        disabled={analyzingId !== null}
                                        className={`
                                            px-6 py-2 rounded-xl text-sm font-bold shadow-sm transition-all
                                            ${analyzingId === m.id
                                                ? 'bg-note-purple text-white'
                                                : analyzingId !== null
                                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                    : 'bg-note-purple hover:bg-violet-700 text-white hover:scale-105 active:scale-95'}
                                        `}
                                    >
                                        {analyzingId === m.id ? (
                                            <span className="flex items-center gap-2">
                                                <Activity className="w-4 h-4 animate-spin" />
                                                Lecture du doc...
                                            </span>
                                        ) : 'Lancer l\'IA'}
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Section Fichiers */}
                        <div className="p-6 md:w-1/4 flex flex-col justify-center border-t md:border-t-0 md:border-l border-gray-50 bg-gray-50/50">
                            <h4 className="text-xs font-bold text-gray-400 uppercase mb-3">Documents joints</h4>
                            <div className="space-y-2">
                                {m.file_doc_url ? (
                                    <div className="flex items-center gap-2 p-2 bg-blue-50 border border-blue-100 rounded-lg text-blue-700 text-xs">
                                        <FileText className="w-4 h-4" />
                                        <span className="flex-1 truncate">Manuscrit.doc</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 p-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-400 text-xs">
                                        <AlertCircle className="w-4 h-4" />
                                        <span>DOC manquant</span>
                                    </div>
                                )}
                                {m.file_pdf_url && (
                                    <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-100 rounded-lg text-red-700 text-xs">
                                        <FileText className="w-4 h-4" />
                                        <span className="flex-1 truncate">Version.pdf</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}

                {manuscripts.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                        <User className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                        <h3 className="font-bold text-gray-400 mb-4">Aucun manuscrit trouvé</h3>
                        <button
                            onClick={fetchManuscripts}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                            Actualiser la liste
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AIEvaluationManager;
