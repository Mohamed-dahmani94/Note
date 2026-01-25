import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient.js';
import { BrainCircuit, User, Activity, AlertCircle, TrendingUp, BookOpen, Users, Flag, CheckCircle2, XCircle } from 'lucide-react';

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

    const [provider, setProvider] = useState(() => localStorage.getItem('ai_provider') || 'gemini');
    const [manualJson, setManualJson] = useState('');
    const [showManualModal, setShowManualModal] = useState(null);
    const [showSettings, setShowSettings] = useState(false);

    // API Keys from LocalStorage
    const [apiKeys, setApiKeys] = useState({
        mistral: localStorage.getItem('key_mistral') || '',
        openai: localStorage.getItem('key_openai') || '',
        gemini: "AIzaSyBpLSKJRT8AKsBDr3u0xNGtOspey_Iax9g" // Default Gemini
    });

    const updateApiKey = (p, val) => {
        setApiKeys(prev => ({ ...prev, [p]: val }));
        localStorage.setItem(`key_${p}`, val);
    };

    const handleRunAI = async (m) => {
        setAnalyzingId(m.id);
        setError(null);
        try {
            console.log(`Expertise IA V2.0: Utilisation de ${provider} pour ${m.id}`);
            localStorage.setItem('ai_provider', provider);

            const defaultPrompt = `SYSTEM ROLE:
أنت نظام تقييم مؤسسي لدار نشر محترفة.

OBJECTIF:
- تحليل سوق الكتاب
- النقد الأدبي
- التدقيق اللغوي
- تقييم المؤلفين
- دعم قرار النشر آليًا

LANGUAGE MODE (STRICT):
- إذا كان المحتوى عربيًا → جميع القيم النصية في JSON بالعربية
- إذا كان المحتوى فرنسيًا → جميع القيم النصية في JSON بالفرنسية
- إذا كان المحتوى إنجليزيًا → جميع القيم النصية في JSON بالإنجليزية
- يجب أن تطابق لغة الإخراج لغة المحتوى الأساسي
- لا تخلط اللغات داخل نفس الحقول

INPUT VARIABLES:
- {{title}} : Titre principal
- {{title_secondary}} : Titre secondaire
- {{summary}} : Sommaire
- {{abstract}} : Résumé global
- {{keywords}} : Mots-clés
- {{full_text}} : Texte intégral pour l'IA
- {{co_authors}} : Liste des co-auteurs (JSON)
- {{author_profile}} : Profil complet (JSON)
- {{author_full_name}} : Nom complet
- {{author_birth_date}} : Date de naissance
- {{isbn}} : ISBN
- {{language}} : Langue
- {{publisher_1}} / {{publisher_2}} : Éditeurs
- {{publication_year}} : Année
- {{collection_title}} : Collection
- {{collection_number}} : N° Collection
- {{page_count}} : Pages
- {{volume_count}} : Tomes
- {{format}} : Format
- {{illustrations}} : Illustrations
- {{editor_name}} : Éditeur (Responsable)

TASK:
قيّم المخطوط بدقة عالية وفق المنهجية المحددة أدناه.

CRITICAL OUTPUT RULES (MANDATORY):
- الإخراج يجب أن يكون JSON صالح 100%
- ممنوع أي نص خارج JSON
- ممنوع الشرح أو التقديم أو الخاتمة
- ممنوع Markdown
- ممنوع التعليقات
- استخدم القيم الافتراضية (0 أو "" أو []) إذا كانت المعلومة غير متوفرة
- احترم أسماء المفاتيح EXACTLY كما هي
- جميع القيم الرقمية من 0 إلى 10 (إلا إذا ذُكر غير ذلك)

==================================================
SCORING WEIGHTING SYSTEM (MANDATORY)
==================================================
- Content Quality & Originality        → 40%
- Market & Topic Relevance              → 30%
- Author Profile & Digital Presence     → 15%
- Benchmarking & Competitive Position   → 15%

Final Score = weighted average (0 – 10)

==================================================
EVALUATION METHODOLOGY
==================================================
1) Topic & Market Analysis (30%)
2) Benchmarking (15%)
3) Content Evaluation (40%)
4) Author Assessment (15%)
5) Publishing Decision

==================================================
DECISION RULES (STRICT)
==================================================
- overall_score ≥ 7.5  → publish
- 5.5 ≤ overall_score < 7.5 → publish_with_revisions
- overall_score < 5.5 → reject

==================================================
OUTPUT FORMAT (JSON ONLY – NO EXTRA TEXT)
==================================================
{
  "language_detected": "ar | fr | en",
  "manuscript": {
    "title": "{{title}}",
    "identified_topic": "",
    "target_audience": ""
  },
  "market_analysis": {
    "global_presence_score": 0,
    "algeria_presence_score": 0,
    "market_saturation_level": "low | medium | high",
    "weighted_score": 0,
    "comment": ""
  },
  "benchmarking": {
    "similar_works": [
      {
        "title": "",
        "author": "",
        "year": "",
        "region": "global | arab | algeria",
        "strengths": ""
      }
    ],
    "comparative_score": 0,
    "weighted_score": 0,
    "comment": ""
  },
  "content_evaluation": {
    "plagiarism_risk_percent": 0,
    "literary_creativity_score": 0,
    "linguistic_quality_score": 0,
    "editorial_quality_score": 0,
    "spelling_grammar_error_level": "low | medium | high",
    "weighted_score": 0,
    "comment": ""
  },
  "author_evaluation": {
    "digital_presence_score": 0,
    "academic_level_score": 0,
    "marketing_potential_score": 0,
    "weighted_score": 0,
    "comment": ""
  },
  "final_evaluation": {
    "overall_score": 0,
    "strengths": [],
    "weaknesses": [],
    "risk_level": "low | medium | high",
    "final_recommendation": "publish | publish_with_revisions | reject",
    "decision_justification": ""
  }
}`;

            const prompt = (customPrompt || defaultPrompt)
                .replace("{{title}}", m.title_main || "")
                .replace("{{summary}}", m.summary || "")
                .replace("{{keywords}}", m.keywords || "")
                .replace("{{full_text}}", m.full_text || "Non fourni")
                .replace("{{co_authors}}", JSON.stringify(m.co_authors || []))
                .replace("{{author_profile}}", JSON.stringify(m.author_profile || {}))
                
                // Detailed Publication Info
                .replace("{{title_secondary}}", m.title_secondary || "")
                .replace("{{abstract}}", m.abstract || "")
                .replace("{{isbn}}", m.isbn || "")
                .replace("{{language}}", m.language || "")
                .replace("{{collection_title}}", m.collection_title || "")
                .replace("{{collection_number}}", m.collection_number || "")
                .replace("{{publisher_1}}", m.publisher_1 || "")
                .replace("{{publisher_2}}", m.publisher_2 || "")
                .replace("{{publication_year}}", m.publication_year || "")
                .replace("{{volume_count}}", m.volume_count || "")
                .replace("{{page_count}}", m.page_count || "")
                .replace("{{format}}", m.format || "")
                .replace("{{illustrations}}", m.illustrations || "")
                .replace("{{editor_name}}", m.editor_name || "")

                // Detailed Author Info
                .replace("{{author_full_name}}", m.author_profile?.full_name || "")
                .replace("{{author_nationality}}", m.author_profile?.nationality || "")
                .replace("{{author_birth_date}}", m.author_profile?.birth_date || "")
                .replace("{{author_birth_place}}", m.author_profile?.birth_place || "")
                .replace("{{author_address}}", m.author_profile?.address || "")
                .replace("{{author_phone}}", m.author_profile?.phone || "")
                .replace("{{author_id_card}}", m.author_profile?.id_card_number || "");

            if (provider === 'manual') {
                setShowManualModal({ manuscript: m, prompt: prompt });
                setAnalyzingId(null);
                return;
            }

            let aiResult = null;

            if (provider === 'mistral') {
                if (!apiKeys.mistral) throw new Error("Veuillez configurer votre clé Mistral dans les réglages (icône ⚙️).");
                const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKeys.mistral}` },
                    body: JSON.stringify({
                        model: "mistral-small-latest",
                        messages: [{ role: "user", content: prompt }],
                        response_format: { type: "json_object" }
                    })
                });
                if (!response.ok) {
                    const err = await response.json().catch(() => ({}));
                    throw new Error(err.error?.message || `Mistral Error ${response.status}`);
                }
                const data = await response.json();
                aiResult = JSON.parse(data.choices[0].message.content);
            } else if (provider === 'openai') {
                if (!apiKeys.openai) throw new Error("Veuillez configurer votre clé OpenAI dans les réglages.");
                const response = await fetch("https://api.openai.com/v1/chat/completions", {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKeys.openai}` },
                    body: JSON.stringify({
                        model: "gpt-4o-mini",
                        messages: [{ role: "user", content: prompt }],
                        response_format: { type: "json_object" }
                    })
                });
                if (!response.ok) {
                    const err = await response.json().catch(() => ({}));
                    throw new Error(err.error?.message || `OpenAI Error ${response.status}`);
                }
                const data = await response.json();
                aiResult = JSON.parse(data.choices[0].message.content);
            } else if (provider === 'gemini') {
                const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKeys.gemini}`;
                const response = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                        generationConfig: { responseMimeType: "application/json" }
                    })
                });
                if (!response.ok) throw new Error(`Gemini API Quota Error (429/400).`);
                const data = await response.json();
                let text = data.candidates?.[0]?.content?.parts?.[0]?.text;
                text = text.replace(/```json\n?/, '').replace(/\n?```/, '').trim();
                aiResult = JSON.parse(text);
            }

            if (aiResult) {
                await updateManuscriptResult(m.id, aiResult);
                fetchManuscripts();
            }
            setAnalyzingId(null);
        } catch (err) {
            console.error("Expertise IA Error:", err);
            setError(`L'IA (${provider}) a échoué : ${err.message}`);
            setAnalyzingId(null);
        }
    };

    const updateManuscriptResult = async (id, result) => {
        const { error: upErr } = await supabase
            .from('publications')
            .update({
                ai_score: Math.round(result.final_evaluation?.overall_score || 0),
                ai_detailed_review: result,
                ai_status: 'completed'
            })
            .eq('id', id);
        if (upErr) throw upErr;
    };

    const handleSaveManual = async () => {
        try {
            // 1. Extract JSON strictly
            let cleanJson = manualJson;
            
            // Try extracting from markdown code blocks first
            const jsonBlockMatch = manualJson.match(/```json\s*([\s\S]*?)\s*```/);
            if (jsonBlockMatch) {
                cleanJson = jsonBlockMatch[1];
            } else {
                // Fallback: Find first '{' and last '}'
                const firstBrace = manualJson.indexOf('{');
                const lastBrace = manualJson.lastIndexOf('}');
                
                if (firstBrace !== -1 && lastBrace !== -1) {
                    cleanJson = manualJson.substring(firstBrace, lastBrace + 1);
                }
            }

            // 2. Parse
            let result;
            try {
                result = JSON.parse(cleanJson);
            } catch (_e) {
                throw new Error("Impossible de lire le JSON. Vérifiez qu'il s'agit bien d'un format JSON valide.");
            }

            // 3. Relaxed Validation & Normalization
            if (!result.final_evaluation) {
                result.final_evaluation = {};
            }

            // Fuzzy Score Search Helper (Recursive)
            const findScore = (obj) => {
                if (!obj || typeof obj !== 'object') return undefined;
                
                const targets = ['overall_score', 'score', 'total_score', 'rating', 'note', 'valeur', 'resultat', 'التقييم_العام', 'النتيجة_النهائية', 'الدرجة', 'تقييم', 'المجموع', 'total'];
                
                // 1. Exact Match
                for (const t of targets) {
                     // Check regex partial match for Arabic keys sometimes having hidden chars? No, simple access first.
                     if (obj[t] !== undefined) return obj[t];
                }

                // 2. Look inside specific sub-objects (common in custom prompts)
                const subOne = obj['final_evaluation'] || obj['نظام_التنقيط'] || obj['evaluation'];
                if (subOne) {
                    // Avoid infinite recursion if circular (unlikely in JSON)
                    for (const t of targets) {
                        if (subOne[t] !== undefined) return subOne[t];
                    }
                }

                // 3. Key Partial Match
                const keys = Object.keys(obj);
                const match = keys.find(k => {
                    const low = k.toLowerCase();
                    return low.includes('score') || low.includes('rate') || low.includes('note') || low.includes('تقييم');
                });
                if (match && typeof obj[match] === 'number') return obj[match];

                return undefined;
            };

            let score = findScore(result);

            if (typeof score === 'undefined') {
                 console.log("Failed to find score. Keys:", Object.keys(result));
                 throw new Error(`Score introuvable. J'ai cherché 'score', 'المجموع', 'rating' etc. mais rien trouvé.`);
            }

            // Normalize Score (handle "8.5/10" or strings)
            if (typeof score === 'string') {
                score = parseFloat(score.split('/')[0].replace(',', '.'));
            }
            
            // Handle /100 scale
            if (score > 10 && score <= 100) {
                score = score / 10;
            }

            // Ensure 0-10 range
            result.final_evaluation.overall_score = Math.min(Math.max(score, 0), 10);
            
            // Map Arabic Recommendation to English if needed
            if (!result.final_evaluation.final_recommendation) {
                const rec = result['قرار_النشر']?.['القرار'] || result['recommendation'];
                if (rec) {
                    if (rec.includes('مقبول') || rec.includes('publish')) result.final_evaluation.final_recommendation = 'publish';
                    else if (rec.includes('تعديل') || rec.includes('revision')) result.final_evaluation.final_recommendation = 'publish_with_revisions';
                    else result.final_evaluation.final_recommendation = 'reject';
                }
            }

            // 4. Save
            await updateManuscriptResult(showManualModal.manuscript.id, result);
            fetchManuscripts();
            
            setShowManualModal(null);
            setManualJson('');
            alert("Analyse manuelle enregistrée avec succès !");

        } catch (err) {
            console.error(err);
            alert(`Erreur : ${err.message}`);
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
            <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <BrainCircuit className="w-10 h-10 text-note-purple" />
                        Système d'Expertise IA 2.0
                    </h1>
                    <p className="text-gray-500 mt-2 max-w-2xl">
                        Choisissez votre moteur d'analyse. Mistral est conseillé pour sa stabilité gratuite. Usez du mode manuel en cas de blocage.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => setShowSettings(!showSettings)}
                        className={`p-3 rounded-2xl border transition-all ${showSettings ? 'bg-note-purple text-white border-note-purple' : 'bg-white text-gray-400 border-gray-100 hover:border-note-purple hover:text-note-purple'}`}
                        title="Réglages des clés API"
                    >
                        <BrainCircuit className="w-5 h-5" />
                    </button>

                    <div className="bg-white p-2 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-400 px-3 uppercase">Moteur :</span>
                        <select
                            value={provider}
                            onChange={(e) => setProvider(e.target.value)}
                            className="bg-gray-50 border-none text-sm font-bold text-note-purple rounded-xl px-4 py-2 focus:ring-2 focus:ring-note-purple outline-none"
                        >
                            <option value="gemini">Google Gemini (Free Tier)</option>
                            <option value="mistral">Mistral AI (Stable)</option>
                            <option value="openai">OpenAI GPT-4o Mini</option>
                            <option value="manual">Mode Manuel (Paste JSON)</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Settings Panel */}
            {showSettings && (
                <div className="bg-violet-50 rounded-3xl p-8 border border-violet-100 animate-in slide-in-from-top-4 duration-300">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 bg-white rounded-2xl shadow-sm text-note-purple">
                            <BrainCircuit className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-gray-900">Configuration des IA</h3>
                            <p className="text-sm text-gray-500 font-medium">Configurez vos clés API pour une autonomie totale.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Clé Mistral AI</label>
                            <input
                                type="password"
                                value={apiKeys.mistral}
                                onChange={(e) => updateApiKey('mistral', e.target.value)}
                                placeholder="Collez votre clé mistral.ai"
                                className="w-full bg-white border border-violet-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-note-purple outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Clé OpenAI</label>
                            <input
                                type="password"
                                value={apiKeys.openai}
                                onChange={(e) => updateApiKey('openai', e.target.value)}
                                placeholder="sk-..."
                                className="w-full bg-white border border-violet-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-note-purple outline-none transition-all"
                            />
                        </div>
                    </div>
                    <div className="mt-6 pt-6 border-t border-violet-100 text-[10px] text-violet-400 font-bold uppercase tracking-widest">
                        Les clés sont sauvegardées localement dans votre navigateur uniquement.
                    </div>
                </div>
            )}

            {error && (
                <div className="bg-red-50 text-red-800 p-4 rounded-2xl border border-red-200 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 mt-0.5" />
                    <div><h4 className="font-bold">Erreur Technique</h4><p className="text-sm">{error}</p></div>
                </div>
            )}

            {/* Manual Entry Modal - ENHANCED */}
            {showManualModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-6">
                    <div className="bg-white rounded-[40px] w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-200">
                        <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                            <div>
                                <h3 className="text-2xl font-black text-gray-900 leading-tight">Expertise Manuelle : {showManualModal.manuscript.title_main}</h3>
                                <p className="text-gray-500 text-sm font-medium">Bypassez les limites d'API en utilisant l'IA de votre choix (ChatGPT, Claude, etc.)</p>
                            </div>
                            <button onClick={() => setShowManualModal(null)} type="button" className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-400">
                                <XCircle className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Step 1: Prompt Generation */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-8 h-8 rounded-full bg-note-purple text-white flex items-center justify-center text-xs font-black">1</div>
                                    <h4 className="font-bold text-gray-900 uppercase text-xs tracking-widest">Générer le Prompt</h4>
                                </div>
                                <div className="relative group">
                                    <textarea
                                        readOnly
                                        value={showManualModal.prompt}
                                        className="w-full h-[400px] bg-gray-50 rounded-2xl p-6 font-mono text-[10px] text-gray-600 border border-gray-100 outline-none resize-none"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            navigator.clipboard.writeText(showManualModal.prompt);
                                            alert("Prompt copié ! Collez-le maintenant dans ChatGPT ou Gemini.");
                                        }}
                                        className="absolute bottom-4 right-4 bg-white border border-gray-200 px-4 py-2 rounded-xl text-xs font-bold text-note-purple shadow-sm hover:bg-note-purple hover:text-white transition-all flex items-center gap-2"
                                    >
                                        <TrendingUp className="w-3 h-3" /> COPIER LE CODE AI
                                    </button>
                                </div>
                                <p className="text-[10px] text-gray-400 italic">Ce code contient toutes les métadonnées du manuscrit et les instructions de formatage.</p>
                            </div>

                            {/* Step 2: Result Pasting */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-black">2</div>
                                    <h4 className="font-bold text-gray-900 uppercase text-xs tracking-widest">Coller le Résultat (JSON)</h4>
                                </div>
                                <textarea
                                    value={manualJson}
                                    onChange={(e) => setManualJson(e.target.value)}
                                    placeholder='Collez ici la réponse de l’IA (le bloc de code JSON)...'
                                    className="w-full h-[400px] bg-emerald-50/30 rounded-2xl p-6 font-mono text-[10px] text-emerald-900 border border-emerald-100 focus:border-emerald-500 focus:bg-white transition-all outline-none resize-none"
                                />
                                <button
                                    type="button"
                                    onClick={handleSaveManual}
                                    disabled={!manualJson.trim()}
                                    className="w-full bg-note-purple text-white py-4 rounded-2xl font-black shadow-lg shadow-purple-200 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:scale-100"
                                >
                                    ENREGISTRER LE RAPPORT INSTITUTIONNEL
                                </button>
                            </div>
                        </div>
                    </div>
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
                                    {m.ai_status === 'completed' && (
                                        <div className="text-right mb-2">
                                            <div className="flex items-center gap-2 mb-1 justify-end">
                                                <span className="text-4xl font-black text-note-purple">{review?.final_evaluation?.overall_score}</span>
                                                <span className="text-gray-300 text-lg">/10</span>
                                            </div>
                                            <span className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase border shadow-sm ${getRecommendationStyle(review?.final_evaluation?.final_recommendation)}`}>
                                                {review?.final_evaluation?.final_recommendation?.replace(/_/g, ' ')}
                                            </span>
                                        </div>
                                    )}
                                    
                                    <button
                                        type="button"
                                        onClick={() => handleRunAI(m)}
                                        disabled={analyzingId !== null}
                                        className={`px-6 py-2 rounded-2xl font-black text-xs transition-all hover:scale-105 active:scale-95 disabled:bg-gray-100 disabled:text-gray-400 ${m.ai_status === 'completed' ? 'bg-white border-2 border-note-purple text-note-purple hover:bg-note-purple hover:text-white' : 'bg-note-purple text-white shadow-lg shadow-purple-200'}`}
                                    >
                                        {analyzingId === m.id ? 'ANALYSE EN COURS...' : (m.ai_status === 'completed' ? 'RELANCER L\'ANALYSE' : 'LANCER L\'EXPERTISE')}
                                    </button>
                                    <button
                                        type="button"
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
