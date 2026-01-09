import { useState } from 'react';
import { BookOpen, FileText, Upload, Check, Loader, File, AlertCircle } from 'lucide-react';
import { mockPdfExtract } from '../../services/mockApi';
import { useNavigate } from 'react-router-dom';

export default function NewSubmission() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [extracting, setExtracting] = useState(false);
    const [extractMethod, setExtractMethod] = useState('auto'); // 'auto' or 'manual'

    const [formData, setFormData] = useState({
        title: '', category: '', categoryOther: '', audience: '',
        synopsis: '', idea: '', pillars: ['', '', '', '', ''], keywords: '',
        manuscriptFile: null, sampleFile: null, sampleText: ''
    });

    const categories = ['Roman', 'Histoire', 'Science Fiction', 'Développement Personnel', 'Poésie', 'Autre'];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePillarChange = (index, value) => {
        const newPillars = [...formData.pillars];
        newPillars[index] = value;
        setFormData(prev => ({ ...prev, pillars: newPillars }));
    };

    const handleFileChange = async (e, type) => {
        const file = e.target.files[0];
        if (!file) return;

        if (type === 'manuscript') {
            setFormData(prev => ({ ...prev, manuscriptFile: file }));
        } else if (type === 'sample') {
            setFormData(prev => ({ ...prev, sampleFile: file }));
            // If auto extract is selected, run mock
            if (extractMethod === 'auto') {
                setExtracting(true);
                const result = await mockPdfExtract(file);
                setFormData(prev => ({ ...prev, sampleText: result.sampleText }));
                setExtracting(false);
            }
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        setTimeout(() => {
            navigate('/auteur/dashboard');
        }, 2000);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Stepper */}
            <div className="flex justify-between items-center mb-8 relative">
                <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-700 -z-10 rounded"></div>
                {[1, 2, 3].map((s) => (
                    <div key={s} className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all ${step >= s ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/40' : 'bg-slate-800 text-slate-500'}`}>
                        {step > s ? <Check /> : s}
                    </div>
                ))}
            </div>

            <div className="glass-panel p-8 animate-slide-up">
                <h2 className="text-2xl font-bold mb-6 text-white text-center">
                    {step === 1 ? 'Informations de l\'Œuvre' : step === 2 ? 'Le Cœur du Livre' : 'Fichiers & Extrait'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {step === 1 && (
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm text-slate-300">Titre Temporaire</label>
                                <input type="text" name="title" required className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-3 text-white mt-1 focus:border-violet-500 bg-transparent outline-none" value={formData.title} onChange={handleChange} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm text-slate-300">Catégorie</label>
                                    <select name="category" className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-3 text-white mt-1 outline-none" value={formData.category} onChange={handleChange}>
                                        <option value="">Choisir...</option>
                                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                {formData.category === 'Autre' && (
                                    <div>
                                        <label className="text-sm text-slate-300">Précisez</label>
                                        <input type="text" name="categoryOther" className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-3 text-white mt-1 outline-none" value={formData.categoryOther} onChange={handleChange} />
                                    </div>
                                )}
                            </div>
                            <div>
                                <label className="text-sm text-slate-300">Public Cible</label>
                                <input type="text" name="audience" placeholder="Ex: Jeunes adultes, Passionnés d'histoire..." className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-3 text-white mt-1 outline-none" value={formData.audience} onChange={handleChange} />
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm text-slate-300 flex justify-between">
                                    <span>Synopsis Complet</span>
                                    <span className="text-slate-500 text-xs">Max 3000 mots</span>
                                </label>
                                <textarea name="synopsis" rows="6" className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-3 text-white mt-1 outline-none" value={formData.synopsis} onChange={handleChange} placeholder="Résumez votre œuvre en détail..." />
                            </div>
                            <div>
                                <label className="text-sm text-slate-300">L'Idée en une phrase (Pitch)</label>
                                <input type="text" name="idea" className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-3 text-white mt-1 outline-none" value={formData.idea} onChange={handleChange} />
                            </div>
                            <div>
                                <label className="text-sm text-slate-300 mb-2 block">Les 5 Piliers (Points Clés)</label>
                                <div className="space-y-2">
                                    {formData.pillars.map((p, i) => (
                                        <div key={i} className="flex gap-2 items-center">
                                            <span className="text-slate-500 font-bold">{i + 1}.</span>
                                            <input type="text" className="flex-1 bg-slate-800/50 border border-slate-700 rounded-lg p-2 text-white outline-none" value={p} onChange={(e) => handlePillarChange(i, e.target.value)} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6">
                            <div className="p-4 border border-dashed border-slate-600 rounded-xl bg-slate-800/30 text-center hover:border-violet-500 transition-colors">
                                <input type="file" id="manu-upload" className="hidden" onChange={(e) => handleFileChange(e, 'manuscript')} accept=".pdf,.doc,.docx" />
                                <label htmlFor="manu-upload" className="cursor-pointer flex flex-col items-center gap-2">
                                    <FileText size={40} className="text-violet-400" />
                                    <span className="font-medium text-white">
                                        {formData.manuscriptFile ? formData.manuscriptFile.name : 'Déposer le Manuscrit Complet (PDF/Word)'}
                                    </span>
                                </label>
                            </div>

                            <div className="bg-slate-900/50 p-4 rounded-xl space-y-4">
                                <label className="text-sm text-slate-300 font-bold block mb-2">L'Extrait (20 premières pages)</label>

                                {/* Tabs */}
                                <div className="flex gap-4 border-b border-slate-700 pb-2 mb-4">
                                    <button type="button" onClick={() => setExtractMethod('auto')} className={`pb-2 text-sm ${extractMethod === 'auto' ? 'text-violet-400 border-b-2 border-violet-400' : 'text-slate-500'}`}>Extraction Auto</button>
                                    <button type="button" onClick={() => setExtractMethod('manual')} className={`pb-2 text-sm ${extractMethod === 'manual' ? 'text-violet-400 border-b-2 border-violet-400' : 'text-slate-500'}`}>Upload Manuel</button>
                                </div>

                                {extractMethod === 'auto' ? (
                                    <div className="text-center py-4">
                                        {extracting ? (
                                            <div className="flex flex-col items-center gap-2 text-violet-300">
                                                <Loader className="animate-spin" />
                                                <span className="text-sm">Analyse et extraction en cours...</span>
                                            </div>
                                        ) : formData.sampleText ? (
                                            <div className="flex items-center gap-2 text-green-400 justify-center">
                                                <CheckCircle size={20} />
                                                <span>Extrait généré avec succès ({formData.sampleText.length} chars)</span>
                                            </div>
                                        ) : (
                                            <p className="text-sm text-slate-400">L'IA tentera d'extraire automatiquement l'extrait du manuscrit ci-dessus.</p>
                                        )}
                                    </div>
                                ) : (
                                    <div className="p-4 border border-slate-700 rounded-lg bg-slate-800">
                                        <input type="file" className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100" />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="flex gap-4 pt-6">
                        {step > 1 && <button type="button" onClick={() => setStep(s => s - 1)} className="px-6 py-2 text-slate-300 hover:bg-slate-800 rounded-xl transition-colors">Retour</button>}

                        {step < 3 ? (
                            <button type="button" onClick={() => setStep(s => s + 1)} className="btn-primary flex-1">Continuer</button>
                        ) : (
                            <button type="submit" disabled={loading} className="btn-primary flex-1 flex justify-center items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600">
                                {loading ? <Loader className="animate-spin" /> : 'Confirmer la soumission'}
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}

function CheckCircle({ size }) {
    return <div className="w-5 h-5 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center"><Check size={14} /></div>
}
