import { useState, useEffect } from 'react';
import { Save, Building2, Layout, Cpu, Upload, Image as ImageIcon, Globe, Server, Shield, Database, AlertTriangle, LogOut } from 'lucide-react';
import { useConfig } from '../../contexts/ConfigContext';

export default function Settings() {
    const { config, updateConfig } = useConfig();
    const [activeTab, setActiveTab] = useState('entreprise');
    const [saved, setSaved] = useState(false);

    // Form States
    const [companyName, setCompanyName] = useState(config.companyName);
    const [logo, setLogo] = useState(null);
    const [preview, setPreview] = useState(config.logoUrl);

    useEffect(() => {
        setCompanyName(config.companyName);
        setPreview(config.logoUrl);
    }, [config]);

    const handleLogoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setLogo(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSave = () => {
        updateConfig({
            companyName,
            logoUrl: preview
        });
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-20">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-black text-white tracking-tight">Configuration</h2>
                    <p className="text-slate-400 font-medium">Gérez l'identité et les paramètres techniques de Note.dz</p>
                </div>
                <button
                    onClick={handleSave}
                    className={`btn-primary flex items-center gap-2 px-8 py-3 rounded-2xl transition-all duration-300 ${saved ? 'bg-emerald-600 scale-95 shadow-none' : 'hover:scale-105'}`}
                >
                    {saved ? 'Enregistré !' : 'Appliquer les changements'}
                    {!saved && <Save size={20} />}
                </button>
            </div>

            {/* --- TAB NAVIGATION --- */}
            <div className="flex gap-2 p-1 bg-slate-900/60 border border-white/5 rounded-2xl w-fit">
                {[
                    { id: 'entreprise', label: 'Entreprise', icon: Building2 },
                    { id: 'pages', label: 'Pages & Contenu', icon: Layout },
                    { id: 'roles', label: 'Rôles & Permissions', icon: Shield },
                    { id: 'ia', label: 'Connectivité IA', icon: Cpu },
                    { id: 'data', label: 'Données', icon: Database }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all duration-300 ${activeTab === tab.id ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                    >
                        <tab.icon size={18} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* --- TAB CONTENT --- */}
            <div className="animate-fade-in">
                {activeTab === 'entreprise' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Brand & Logo */}
                        <div className="glass-panel p-8 space-y-8 bg-slate-900/40">
                            <div>
                                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                                    <Globe size={18} className="text-cyan-400" /> Identité visuelle
                                </h3>
                                <div className="space-y-4">
                                    <label className="block">
                                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Nom de l'entreprise</span>
                                        <input
                                            type="text"
                                            value={companyName}
                                            onChange={(e) => setCompanyName(e.target.value)}
                                            className="mt-2 text-lg font-bold"
                                        />
                                    </label>
                                    <p className="text-[10px] text-slate-500 italic px-1">* S'affichera sous le logo dans la barre latérale.</p>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-white/5">
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Logo Officiel</span>
                                <div className="mt-4 flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-3xl p-8 hover:border-cyan-500/30 transition-colors group cursor-pointer relative overflow-hidden">
                                    <input type="file" onChange={handleLogoUpload} className="absolute inset-0 opacity-0 cursor-pointer z-10" accept="image/*" />

                                    {preview ? (
                                        <div className="relative group/preview">
                                            <img src={preview} alt="Logo preview" className="max-h-32 object-contain rounded-xl shadow-2xl" style={{ maxWidth: '200px' }} />
                                            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm opacity-0 group-hover/preview:opacity-100 flex items-center justify-center transition-opacity rounded-xl">
                                                <Upload size={24} className="text-white" />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center text-slate-500 group-hover:text-cyan-400 transition-colors">
                                            <div className="p-4 bg-white/5 rounded-full mb-3">
                                                <ImageIcon size={32} />
                                            </div>
                                            <p className="text-sm font-bold">Cliquer pour uploader</p>
                                            <p className="text-[10px]">PNG, SVG (max. 512px)</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Company Info */}
                        <div className="glass-panel p-8 space-y-6 bg-slate-900/40">
                            <h3 className="text-white font-bold mb-2">Informations Légales</h3>
                            <div className="grid grid-cols-1 gap-4">
                                <label className="block">
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Adresse Siège</span>
                                    <textarea rows="2" className="mt-2 text-sm" placeholder="Ex: 12 Rue des Pins, Alger" />
                                </label>
                                <div className="grid grid-cols-2 gap-4">
                                    <label className="block">
                                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Numéro RC</span>
                                        <input type="text" className="mt-2 text-sm" placeholder="00-B-1234567" />
                                    </label>
                                    <label className="block">
                                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">NIF / AI</span>
                                        <input type="text" className="mt-2 text-sm" placeholder="1234567890" />
                                    </label>
                                </div>
                                <label className="block">
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Contact Support (Email)</span>
                                    <input type="email" className="mt-2 text-sm" placeholder="contact@note.dz" />
                                </label>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'pages' && (
                    <div className="space-y-8">
                        {/* Login Page Config */}
                        <div className="glass-panel p-8 bg-slate-900/40 border-l-4 border-cyan-500">
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-1">Page de Connexion</h3>
                                    <p className="text-sm text-slate-500 font-medium">Personnalisez l'expérience d'entrée (Bureau & Mobile)</p>
                                </div>
                                <div className="flex gap-2">
                                    <span className="px-2 py-1 bg-cyan-500/10 text-cyan-400 text-[10px] font-black rounded border border-cyan-500/20">LIVE PREVIEW</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="space-y-4">
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Image de Gauche (Desktop)</span>
                                    <div className="aspect-[4/5] bg-slate-800 rounded-3xl border border-white/5 flex items-center justify-center relative overflow-hidden group cursor-pointer">
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent opacity-60"></div>
                                        <div className="relative z-10 flex flex-col items-center">
                                            <ImageIcon size={32} className="text-slate-600 mb-2" />
                                            <span className="text-[10px] font-bold text-slate-500">Photo 1 (900x1200)</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="lg:col-span-2 space-y-6">
                                    <label className="block">
                                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Message d'accueil connextion</span>
                                        <textarea rows="4" className="mt-2 font-medium" placeholder="Ex: Bienvenue sur le premier portail d'édition au Maghreb..." />
                                    </label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <label className="block">
                                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Couleur primaire</span>
                                            <div className="flex items-center gap-3 mt-2 bg-slate-950/50 p-2 rounded-xl border border-white/5">
                                                <div className="w-8 h-8 rounded-lg bg-cyan-500"></div>
                                                <input type="text" value="#06b6d4" className="bg-transparent border-none p-0 text-xs font-mono" readOnly />
                                            </div>
                                        </label>
                                        <label className="block">
                                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Accent Néon</span>
                                            <div className="flex items-center gap-3 mt-2 bg-slate-950/50 p-2 rounded-xl border border-white/5">
                                                <div className="w-8 h-8 rounded-lg bg-violet-500"></div>
                                                <input type="text" value="#8b5cf6" className="bg-transparent border-none p-0 text-xs font-mono" readOnly />
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Landing & Submission Page */}
                        <div className="glass-panel p-8 bg-slate-900/40 border-l-4 border-violet-500">
                            <h3 className="text-xl font-bold text-white mb-6">Landing Page de Soumission</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <label className="block">
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Titre Principal Landing</span>
                                    <input type="text" className="mt-2" placeholder="Ex: Donnez vie à vos mots." />
                                </label>
                                <label className="block">
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Sous-titre CTA</span>
                                    <input type="text" className="mt-2" placeholder="Ex: Soumettez votre manuscrit en 5 minutes." />
                                </label>
                                <label className="block md:col-span-2">
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Contenu "Comment ça marche ?"</span>
                                    <textarea rows="3" className="mt-2" placeholder="Listez les étapes séparées par une virgule..." />
                                </label>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'roles' && (
                    <div className="space-y-6">
                        <div className="flex flex-col gap-2 mb-4">
                            <h3 className="text-xl font-bold text-white">Définition des Rôles</h3>
                            <p className="text-sm text-slate-500 font-medium">Configurez les niveaux d'accès globaux de Note.dz</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[
                                {
                                    role: "Administrateur",
                                    desc: "Accès total à la plateforme, gestion des utilisateurs, configuration système et financière.",
                                    icon: Shield,
                                    color: "border-red-500/30 bg-red-500/5",
                                    badge: "bg-red-500/20 text-red-400"
                                },
                                {
                                    role: "Modérateur",
                                    desc: "Supervise les échanges, gère les signalements et assiste les auteurs dans leurs publications.",
                                    icon: Layout,
                                    color: "border-blue-500/30 bg-blue-500/5",
                                    badge: "bg-blue-500/20 text-blue-400"
                                },
                                {
                                    role: "Comité de lecture",
                                    desc: "Évalue la qualité littéraire des manuscrits, donne des avis consultatifs et note les œuvres.",
                                    icon: Building2,
                                    color: "border-amber-500/30 bg-amber-500/5",
                                    badge: "bg-amber-500/20 text-amber-400"
                                },
                                {
                                    role: "Auteur",
                                    desc: "Soumet des manuscrits, suit ses statistiques de lecture et gère ses revenus.",
                                    icon: Cpu,
                                    color: "border-emerald-500/30 bg-emerald-500/5",
                                    badge: "bg-emerald-500/20 text-emerald-400"
                                }
                            ].map((r, i) => (
                                <div key={i} className={`glass-panel p-6 border-2 transition-all hover:scale-[1.02] ${r.color}`}>
                                    <div className="flex justify-between items-start mb-4">
                                        <div className={`p-3 rounded-2xl ${r.badge}`}>
                                            <r.icon size={24} />
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${r.badge}`}>Niveau {4 - i}</span>
                                    </div>
                                    <h4 className="text-lg font-black text-white mb-2">{r.role}</h4>
                                    <p className="text-sm text-slate-400 leading-relaxed mb-6">{r.desc}</p>
                                    <div className="flex items-center gap-2">
                                        <input type="checkbox" className="w-5 h-5 rounded-lg border-white/10 bg-black/40 text-cyan-500 focus:ring-offset-slate-900" defaultChecked />
                                        <span className="text-xs font-bold text-slate-300">Activer ce rôle sur la plateforme</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'ia' && (
                    <div className="max-w-3xl space-y-8">
                        <div className="glass-panel p-8 bg-slate-900/40 border border-cyan-500/20 shadow-xl shadow-cyan-500/5">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="p-4 bg-cyan-500/10 rounded-2xl text-cyan-400">
                                    <Server size={32} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-1">Passerelle IA (CORTEX)</h3>
                                    <p className="text-sm text-slate-500">Configuration des moteurs d'analyse automatisée</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <label className="block">
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">API Key (OpenAI / Gemini)</span>
                                    <div className="relative mt-2">
                                        <input type="password" value="sk-••••••••••••••••••••••••••••" className="pr-12 font-mono text-cyan-200" readOnly />
                                        <Shield className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                                    </div>
                                </label>

                                <div className="grid grid-cols-2 gap-6">
                                    <label className="block">
                                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Modèle d'Analyse Littéraire</span>
                                        <select className="mt-2 outline-none appearance-none">
                                            <option>GPT-4o (Premium)</option>
                                            <option>Claude 3.5 Sonnet</option>
                                            <option>Gemini 1.5 Flash</option>
                                        </select>
                                    </label>
                                    <label className="block">
                                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Niveau de Sensibilité IA</span>
                                        <select className="mt-2">
                                            <option>Élevé (Correction stricte)</option>
                                            <option>Moyen (Recommandé)</option>
                                            <option>Large (Auto-Correction)</option>
                                        </select>
                                    </label>
                                </div>

                                <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                        <span className="text-xs font-bold text-slate-400">Connexion établie avec le serveur d'analyse</span>
                                    </div>
                                    <button className="text-[10px] font-black uppercase tracking-widest text-cyan-400 hover:text-white transition-colors">Tester la latence</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'data' && (
                    <div className="max-w-2xl space-y-8">
                        <div className="glass-panel p-8 bg-red-900/10 border border-red-500/20">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="p-3 bg-red-500/20 rounded-xl text-red-400">
                                    <AlertTriangle size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">Zone de Danger</h3>
                                    <p className="text-sm text-slate-400">Actions irréversibles sur les données.</p>
                                </div>
                            </div>

                            <p className="text-sm text-slate-300 mb-6 leading-relaxed">
                                Cette action supprimera toutes les données locales (session utilisateur, configurations temporaires).
                                Les manuscrits (données de démonstration) seront réinitialisés à leur état d'origine lors du prochain rechargement.
                            </p>

                            <button
                                onClick={() => {
                                    if (window.confirm('Êtes-vous sûr de vouloir tout effacer ? Cette action vous déconnectera.')) {
                                        localStorage.clear();
                                        window.location.href = '/';
                                    }
                                }}
                                className="w-full py-4 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-red-500/20 flex items-center justify-center gap-2"
                            >
                                <LogOut size={20} />
                                Supprimer les données et Réinitialiser
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

