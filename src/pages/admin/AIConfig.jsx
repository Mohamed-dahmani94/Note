import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient.js';
import { Settings, Save, RotateCcw, Info, CheckCircle, AlertCircle } from 'lucide-react';

const AIConfig = () => {
    const [prompt, setPrompt] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('admin_settings')
                .select('value')
                .eq('key', 'ai_manuscript_prompt')
                .single();

            if (data) setPrompt(data.value);
            if (error && error.code !== 'PGRST116') throw error;
        } catch (err) {
            console.error(err);
            setMessage({ type: 'error', text: 'Erreur lors du chargement des paramètres.' });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage({ type: '', text: '' });
        try {
            const { error } = await supabase
                .from('admin_settings')
                .upsert({
                    key: 'ai_manuscript_prompt',
                    value: prompt,
                    updated_at: new Date().toISOString()
                });

            if (error) throw error;
            setMessage({ type: 'success', text: 'Configuration enregistrée avec succès !' });
        } catch (err) {
            console.error(err);
            setMessage({ type: 'error', text: 'Erreur lors de la sauvegarde.' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Chargement de la configuration...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                        <Settings className="w-8 h-8 text-note-purple" />
                        Configuration du Prompt IA
                    </h1>
                    <p className="text-gray-500 mt-1">Personnalisez la manière dont l'IA analyse et note les manuscrits.</p>
                </div>
                <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-note-purple hover:bg-violet-700 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 shadow-sm transition-all disabled:opacity-50"
                >
                    {saving ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Enregistrer
                </button>
            </div>

            {message.text && (
                <div className={`p-4 rounded-xl border flex items-center gap-3 ${message.type === 'success' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                    {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    {message.text}
                </div>
            )}

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Instructions de l'IA (Prompt)</label>
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        rows={15}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-mono text-sm focus:ring-2 focus:ring-note-purple outline-none transition-all"
                        placeholder="Tapez vos instructions ici..."
                    />
                </div>

                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex gap-4">
                    <Info className="w-6 h-6 text-blue-500 flex-shrink-0" />
                    <div className="text-sm text-blue-800 space-y-2">
                        <p className="font-bold">Variables disponibles :</p>
                        <ul className="list-disc list-inside space-y-1 opacity-80">
                            <li><code>{"{{title}}"}</code> : Titre principal</li>
                            <li><code>{"{{title_secondary}}"}</code> : Titre secondaire</li>
                            <li><code>{"{{summary}}"}</code> : Sommaire</li>
                            <li><code>{"{{abstract}}"}</code> : Résumé global</li>
                            <li><code>{"{{keywords}}"}</code> : Mots-clés</li>
                            <li><code>{"{{full_text}}"}</code> : Texte intégral pour l'IA</li>
                            
                            <li><code>{"{{co_authors}}"}</code> : Liste des co-auteurs (JSON)</li>
                            
                            {/* Author Details */}
                            <li><code>{"{{author_profile}}"}</code> : Profil complet (JSON)</li>
                            <li><code>{"{{author_full_name}}"}</code> : Nom complet</li>
                            <li><code>{"{{author_nationality}}"}</code> : Nationalité</li>
                            <li><code>{"{{author_birth_date}}"}</code> : Date de naissance</li>
                            <li><code>{"{{author_birth_place}}"}</code> : Lieu de naissance</li>
                            <li><code>{"{{author_address}}"}</code> : Adresse</li>
                            <li><code>{"{{author_phone}}"}</code> : Téléphone</li>
                            <li><code>{"{{author_id_card}}"}</code> : Numéro CNI/Passeport</li>
                            
                            {/* Tech Details */}
                            <li><code>{"{{isbn}}"}</code> : ISBN</li>
                            <li><code>{"{{language}}"}</code> : Langue</li>
                            <li><code>{"{{publisher_1}}"}</code> / <code>{"{{publisher_2}}"}</code> : Éditeurs</li>
                            <li><code>{"{{publication_year}}"}</code> : Année</li>
                            <li><code>{"{{collection_title}}"}</code> : Collection</li>
                            <li><code>{"{{collection_number}}"}</code> : N° Collection</li>
                            <li><code>{"{{page_count}}"}</code> : Pages</li>
                            <li><code>{"{{volume_count}}"}</code> : Tomes</li>
                            <li><code>{"{{format}}"}</code> : Format</li>
                            <li><code>{"{{illustrations}}"}</code> : Illustrations</li>
                            <li><code>{"{{editor_name}}"}</code> : Éditeur (Responsable)</li>
                        </ul>
                        <p className="mt-2 text-xs opacity-70 italic">Note : L'IA doit impérativement répondre au format JSON pour que l'interface puisse afficher les scores.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIConfig;
