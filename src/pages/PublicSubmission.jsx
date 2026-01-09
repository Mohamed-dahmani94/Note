import { useState, useEffect } from 'react';
import { BookOpen, FileText, Upload, Check, Loader, User, Calendar, Mail, ArrowRight, CheckCircle, ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useConfig } from '../contexts/ConfigContext';

export default function PublicSubmission() {
    const { config } = useConfig();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [emailExists, setEmailExists] = useState(false);
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        birthDate: '',
        email: '',
        // Fiche Publication Fields
        title: '',
        titreSecondaire: '',
        titreParallele: '',
        langue: 'Arabe',
        editeur: 'Dar note',
        lieuPublication: '',
        annee: '',
        sommaire: '',
        synopsis: '',
        motsCles: '',
        isAlreadyPublished: false, // Checkbox state
        category: '',
        pitch: '',
        manuscriptFile: null
    });

    const categories = ['Roman', 'Histoire', 'Science Fiction', 'Développement Personnel', 'Poésie', 'Autre'];

    // Mock email check
    useEffect(() => {
        if (formData.email.includes('admin') || formData.email === 'amine@note.dz') {
            setEmailExists(true);
        } else {
            setEmailExists(false);
        }
    }, [formData.email]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({ ...prev, manuscriptFile: file }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);

        // Simulation of AI analysis & Save to "Database" (localStorage)
        setTimeout(() => {
            const newManuscript = {
                id: Date.now(),
                title: formData.title,
                titreSecondaire: formData.titreSecondaire,
                titreParallele: formData.titreParallele,
                author: `${formData.firstName} ${formData.lastName}`,
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                birthDate: formData.birthDate,
                role: "Prospect", // New public submission = Prospect
                category: formData.category,
                langue: formData.langue,
                // Publication details
                isAlreadyPublished: formData.isAlreadyPublished,
                editeur: formData.isAlreadyPublished ? formData.editeur : null,
                lieuPublication: formData.isAlreadyPublished ? formData.lieuPublication : null,
                annee: formData.isAlreadyPublished ? formData.annee : null,
                // Content
                pitch: formData.pitch,
                synopsis: formData.synopsis,
                sommaire: formData.sommaire,
                motsCles: formData.motsCles,

                // System / Mock Data
                score: Math.floor(Math.random() * 20) + 70, // Random score 70-90
                date: new Date().toISOString().split('T')[0],
                status: "Express",
                accountStatus: "En attente",
                aiDetails: {
                    content: { score: 0, reason: "En attente d'analyse détaillée." },
                    marketing: { score: 0, reason: "En attente d'analyse." },
                    originality: { score: 0, reason: "En attente d'analyse." }
                }
            };

            // Save to LocalStorage
            const existingData = localStorage.getItem('site_manuscripts');
            const manuscripts = existingData ? JSON.parse(existingData) : [];
            manuscripts.push(newManuscript);
            localStorage.setItem('site_manuscripts', JSON.stringify(manuscripts));

            setLoading(false);
            setSuccess(true);
        }, 2000);
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6">
                <div className="glass-panel max-w-lg w-full p-10 text-center space-y-8 animate-slide-up border-t-4 border-emerald-500">
                    <div className="flex justify-center">
                        <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                            <CheckCircle size={48} />
                        </div>
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-white mb-4">Soumission Réussie !</h2>
                        <p className="text-slate-400 leading-relaxed">
                            Votre manuscrit "<strong>{formData.title}</strong>" a été transmis à notre équipe.
                            Nous avons créé pour vous un compte temporaire rattaché à <strong>{formData.email}</strong>.
                        </p>
                    </div>

                    <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl text-amber-300 text-sm flex items-start gap-3 text-left">
                        <Mail size={20} className="shrink-0 mt-0.5" />
                        <div>
                            <span className="font-bold">Vérification Requise :</span>
                            <p className="opacity-80">Un email d'activation vient d'être envoyé. Veuillez cliquer sur le lien dans le mail pour valider votre compte et suivre l'avancement.</p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <button onClick={() => navigate('/')} className="btn-primary">
                            Retour à l'accueil
                        </button>
                        <p className="text-xs text-slate-500">Plus de 1 200 auteurs nous font déjà confiance.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center py-12 px-4 relative overflow-hidden">

            {/* Background Decoration */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-violet-600/10 blur-[120px] rounded-full"></div>
            </div>

            {/* Header / Brand */}
            <div className="flex items-center gap-2 mb-12 z-10">
                {config.logoUrl ? (
                    <img src={config.logoUrl} alt="Logo" className="h-10 w-10 object-contain" />
                ) : (
                    <div className="w-10 h-10 bg-violet-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-violet-500/20">
                        {config.companyName[0]}
                    </div>
                )}
                <span className="text-3xl font-black tracking-tighter text-white">
                    {config.companyName.split('.')[0]}<span className="text-violet-400">.{config.companyName.split('.')[1] || 'dz'}</span>
                </span>
            </div>

            <div className="w-full max-w-2xl z-10">
                {/* Stepper */}
                <div className="flex justify-between items-center mb-10 px-4 relative">
                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-800 -z-10"></div>
                    {[1, 2, 3].map((s) => (
                        <div key={s} className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-500 border-2 ${step >= s ? 'bg-violet-600 border-violet-500 text-white shadow-[0_0_15px_rgba(139,92,246,0.3)]' : 'bg-slate-900 border-slate-700 text-slate-500'}`}>
                            {step > s ? <Check size={18} /> : s}
                        </div>
                    ))}
                </div>

                <div className="glass-panel p-8 md:p-10 border border-white/5 shadow-2xl animate-fade-in">
                    <form onSubmit={handleSubmit} className="space-y-8">

                        {/* STEP 1: IDENTITY */}
                        {step === 1 && (
                            <div className="space-y-6 animate-slide-right">
                                <div className="text-center mb-8">
                                    <h2 className="text-2xl font-bold text-white mb-2">Commençons par vous</h2>
                                    <p className="text-slate-400 text-sm">Vos informations nous permettent de lier votre œuvre à votre futur profil.</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 tracking-widest uppercase ml-1">Prénom</label>
                                        <div className="relative">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                            <input type="text" name="firstName" required className="pl-11" value={formData.firstName} onChange={handleChange} placeholder="Jean" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 tracking-widest uppercase ml-1">Nom</label>
                                        <div className="relative">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                            <input type="text" name="lastName" required className="pl-11" value={formData.lastName} onChange={handleChange} placeholder="Dupont" />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 tracking-widest uppercase ml-1">Date de Naissance</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                        <input type="date" name="birthDate" required className="pl-11" value={formData.birthDate} onChange={handleChange} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center px-1">
                                        <label className="text-xs font-bold text-slate-400 tracking-widest uppercase">Email</label>
                                        {emailExists && <span className="text-[10px] text-amber-400 font-bold bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20 animate-pulse">Email déjà connu</span>}
                                    </div>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                        <input type="email" name="email" required className={`pl-11 ${emailExists ? 'border-amber-500/50 focus:border-amber-500' : ''}`} value={formData.email} onChange={handleChange} placeholder="votre@email.com" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 2: PROJECT (FICHE TECHNIQUE) */}
                        {step === 2 && (
                            <div className="space-y-8 animate-slide-right">
                                <div className="text-center mb-8">
                                    <h2 className="text-2xl font-bold text-white mb-2">Fiche de la Publication</h2>
                                    <p className="text-slate-400 text-sm">Remplissez les détails bibliographiques de votre œuvre.</p>
                                </div>

                                {/* SECTION 1: IDENTIFICATION */}
                                <div className="space-y-4 pt-4 border-t border-white/5">
                                    <h3 className="text-xs font-black text-violet-400 uppercase tracking-widest mb-4">Identification</h3>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 tracking-widest uppercase ml-1">Titre Principal <span className="text-red-500">*</span></label>
                                        <input type="text" name="title" required className="font-bold text-lg" value={formData.title} onChange={handleChange} placeholder="Ex: L'Aube des Fennecs" />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-400 tracking-widest uppercase ml-1">Titre Secondaire</label>
                                            <input type="text" name="titreSecondaire" value={formData.titreSecondaire} onChange={handleChange} placeholder="Sous-titre éventuel" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-400 tracking-widest uppercase ml-1">Titre Parallèle</label>
                                            <input type="text" name="titreParallele" value={formData.titreParallele} onChange={handleChange} placeholder="Titre en autre langue" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-400 tracking-widest uppercase ml-1">Langue <span className="text-red-500">*</span></label>
                                            <select name="langue" required value={formData.langue} onChange={handleChange} className="w-full bg-slate-900 border-slate-700 rounded-xl p-3 text-white outline-none focus:border-violet-500 transition-colors">
                                                <option value="Arabe">Arabe</option>
                                                <option value="Français">Français</option>
                                                <option value="Anglais">Anglais</option>
                                                <option value="Amazigh">Amazigh</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-400 tracking-widest uppercase ml-1">Catégorie <span className="text-red-500">*</span></label>
                                            <select name="category" required className="w-full bg-slate-900 border-slate-700 rounded-xl p-3 text-white outline-none focus:border-violet-500 transition-colors" value={formData.category} onChange={handleChange}>
                                                <option value="">Choisir une catégorie...</option>
                                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* SECTION 2: PUBLICATION */}
                                <div className="space-y-4 pt-4 border-t border-white/5">
                                    <div className="flex items-center gap-3 mb-4">
                                        <input
                                            type="checkbox"
                                            name="isAlreadyPublished"
                                            id="isAlreadyPublished"
                                            checked={formData.isAlreadyPublished}
                                            onChange={(e) => setFormData(prev => ({ ...prev, isAlreadyPublished: e.target.checked }))}
                                            className="w-5 h-5 rounded-md border-slate-600 bg-slate-800 text-violet-500 focus:ring-violet-500/50"
                                        />
                                        <label htmlFor="isAlreadyPublished" className="text-sm font-bold text-white cursor-pointer select-none">
                                            Cet ouvrage a-t-il déjà été publié ?
                                        </label>
                                    </div>

                                    {formData.isAlreadyPublished && (
                                        <div className="animate-fade-in space-y-4 pl-4 border-l-2 border-violet-500/20">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-slate-400 tracking-widest uppercase ml-1">Éditeur</label>
                                                <input type="text" name="editeur" value={formData.editeur} onChange={handleChange} placeholder="Dar note (par défaut)" />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-slate-400 tracking-widest uppercase ml-1">Lieu</label>
                                                    <input type="text" name="lieuPublication" value={formData.lieuPublication} onChange={handleChange} placeholder="Ex: Alger" />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-slate-400 tracking-widest uppercase ml-1">Année</label>
                                                    <input type="number" name="annee" value={formData.annee} onChange={handleChange} placeholder="2024" />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* SECTION 3: CONTENU */}
                                <div className="space-y-4 pt-4 border-t border-white/5">
                                    <h3 className="text-xs font-black text-violet-400 uppercase tracking-widest mb-4">Contenu & Indexation</h3>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 tracking-widest uppercase ml-1">Pitch (Une phrase) <span className="text-red-500">*</span></label>
                                        <input type="text" name="pitch" required value={formData.pitch} onChange={handleChange} placeholder="Accroche marketing courte..." />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 tracking-widest uppercase ml-1">Résumé / Synopsis <span className="text-red-500">*</span></label>
                                        <textarea name="synopsis" rows="4" required value={formData.synopsis} onChange={handleChange} placeholder="Le résumé complet de l'œuvre..." className="w-full bg-slate-900 border-slate-700 rounded-xl p-3 text-white outline-none focus:border-violet-500 transition-colors" />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 tracking-widest uppercase ml-1">Sommaire <span className="text-red-500">*</span></label>
                                        <textarea name="sommaire" rows="4" required value={formData.sommaire} onChange={handleChange} placeholder="Chapitre 1: ... Chapitre 2: ..." className="w-full bg-slate-900 border-slate-700 rounded-xl p-3 text-white outline-none focus:border-violet-500 transition-colors" />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 tracking-widest uppercase ml-1">Mots Clés <span className="text-red-500">*</span></label>
                                        <textarea name="motsCles" rows="2" required value={formData.motsCles} onChange={handleChange} placeholder="Ex: Roman, Histoire, Révolution, Amour..." className="w-full bg-slate-900 border-slate-700 rounded-xl p-3 text-white outline-none focus:border-violet-500 transition-colors" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 3: UPLOAD */}
                        {step === 3 && (
                            <div className="space-y-8 animate-slide-right">
                                <div className="text-center">
                                    <h2 className="text-2xl font-bold text-white mb-2">Dépôt du Manuscrit</h2>
                                    <p className="text-slate-400 text-sm">Nous acceptons les formats PDF, Word (.doc, .docx).</p>
                                </div>

                                <div className="group relative border-2 border-dashed border-slate-700 rounded-[2.5rem] p-12 flex flex-col items-center justify-center hover:border-violet-500/50 transition-all cursor-pointer bg-slate-900/40 overflow-hidden">
                                    <div className="absolute inset-0 bg-violet-600/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    <input type="file" required className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={handleFileChange} accept=".pdf,.doc,.docx" />

                                    <div className="w-20 h-20 rounded-3xl bg-slate-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 border border-white/5 shadow-xl">
                                        <FileText size={40} className="text-violet-400" />
                                    </div>

                                    <div className="text-center relative z-10">
                                        <p className="text-lg font-bold text-white mb-1">
                                            {formData.manuscriptFile ? formData.manuscriptFile.name : "Cliquez ou glissez le fichier"}
                                        </p>
                                        <p className="text-xs text-slate-500 font-medium">Taille maximale : 50 Mo</p>
                                    </div>

                                    {formData.manuscriptFile && (
                                        <div className="mt-6 flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-500/20 animate-bounce">
                                            Fichier prêt pour analyse
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center gap-3 bg-slate-900/50 p-4 rounded-2xl border border-white/5">
                                    <ShieldCheck className="text-cyan-400 shrink-0" size={24} />
                                    <p className="text-[10px] text-slate-400 leading-tight">
                                        En soumettant votre œuvre, vous conservez l'intégralité de vos droits d'auteur. Notre plateforme assure la protection intellectuelle de vos fichiers.
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="flex gap-4 pt-4">
                            {step > 1 && (
                                <button type="button" onClick={() => setStep(s => s - 1)} className="px-8 py-4 rounded-2xl font-bold text-slate-400 hover:bg-white/5 transition-colors">
                                    Retour
                                </button>
                            )}

                            {step < 3 ? (
                                emailExists ? (
                                    <Link to="/connexion" className="flex-1">
                                        <button type="button" className="btn-primary w-full shadow-lg shadow-amber-500/20 bg-gradient-to-r from-amber-600 to-orange-600">
                                            <span>Se connecter pour continuer</span>
                                            <ArrowRight size={20} className="ml-2" />
                                        </button>
                                    </Link>
                                ) : (
                                    <button type="button" onClick={() => setStep(s => s + 1)} className="btn-primary flex-1 group transition-all">
                                        <span>Continuer</span>
                                        <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                )
                            ) : (
                                <button type="submit" disabled={loading || !formData.manuscriptFile} className="btn-primary flex-1 flex justify-center items-center gap-3 shadow-xl shadow-violet-500/30">
                                    {loading ? (
                                        <>
                                            <Loader className="animate-spin" />
                                            <span>Analyse en cours...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Confirmer ma soumission</span>
                                            <Check size={20} />
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                <p className="text-center mt-8 text-slate-500 text-sm">
                    Déjà auteur ? <Link to="/connexion" className="text-violet-400 font-bold hover:underline">Connectez-vous ici</Link>
                </p>
            </div>
        </div>
    );
}
