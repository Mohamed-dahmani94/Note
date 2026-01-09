import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Upload, Link as LinkIcon, ArrowRight, Check, Loader } from 'lucide-react';
import { mockSocialAnalysis } from '../../services/mockApi';

export default function Register() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);

    const [formData, setFormData] = useState({
        email: '', password: '', confirmPassword: '',
        fullName: '', dob: '', wilaya: '',
        idFile: null,
        instagram: '', tiktok: '', facebook: '',
        digitalCapital: 0
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        setFormData(prev => ({ ...prev, idFile: e.target.files[0] }));
    };

    const calculateScore = async () => {
        setAnalyzing(true);
        // Simulate checking multiple links
        let totalFollowers = 0;
        const links = [formData.instagram, formData.tiktok, formData.facebook].filter(Boolean);

        for (const link of links) {
            const result = await mockSocialAnalysis(link);
            totalFollowers += result.followers;
        }

        setFormData(prev => ({ ...prev, digitalCapital: totalFollowers }));
        setAnalyzing(false);
    };

    const nextStep = () => setStep(prev => prev + 1);
    const prevStep = () => setStep(prev => prev - 1);

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        // Simulate API registration
        setTimeout(() => {
            setLoading(false);
            navigate('/auteur/dashboard');
        }, 1500);
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-[url('https://images.unsplash.com/photo-1457369804613-52c61a468e7d?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center">
            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"></div>

            <div className="glass-panel w-full max-w-2xl p-8 relative z-10 animate-fade-in">
                {/* Progress Steps */}
                <div className="flex justify-between mb-8 relative">
                    <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-700 -z-10 rounded"></div>
                    {[1, 2, 3].map((s) => (
                        <div key={s} className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${step >= s ? 'bg-violet-600 text-white shadow-[0_0_15px_rgba(139,92,246,0.5)]' : 'bg-slate-800 text-slate-500'}`}>
                            {step > s ? <Check size={20} /> : s}
                        </div>
                    ))}
                </div>

                <h2 className="text-3xl font-bold mb-2 text-center text-white">
                    {step === 1 ? 'Créer un compte' : step === 2 ? 'Identité & KYC' : 'Capital Numérique'}
                </h2>
                <p className="text-center text-slate-400 mb-8">
                    {step === 1 ? 'Commencez votre voyage d\'auteur.' : step === 2 ? 'Nous vérifions l\'identité de chaque auteur.' : 'Vos réseaux sociaux boostent votre score.'}
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* STEP 1: ACCOUNT */}
                    {step === 1 && (
                        <div className="space-y-4 animate-slide-up">
                            <div className="space-y-2">
                                <label className="text-sm text-slate-300">Email professionnel</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 text-slate-500" size={20} />
                                    <input
                                        type="email" name="email" required
                                        className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-3 pl-10 text-white focus:border-violet-500 focus:outline-none transition-colors"
                                        placeholder="auteur@exemple.com"
                                        value={formData.email} onChange={handleChange}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm text-slate-300">Mot de passe</label>
                                    <input
                                        type="password" name="password" required
                                        className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-3 text-white focus:border-violet-500 focus:outline-none"
                                        placeholder="••••••••"
                                        value={formData.password} onChange={handleChange}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm text-slate-300">Confirmer</label>
                                    <input
                                        type="password" name="confirmPassword" required
                                        className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-3 text-white focus:border-violet-500 focus:outline-none"
                                        placeholder="••••••••"
                                        value={formData.confirmPassword} onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 2: KYC */}
                    {step === 2 && (
                        <div className="space-y-4 animate-slide-up">
                            <div className="space-y-2">
                                <label className="text-sm text-slate-300">Nom Complet (Identique à la carte)</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-3 text-slate-500" size={20} />
                                    <input
                                        type="text" name="fullName" required
                                        className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-3 pl-10 text-white focus:border-violet-500 focus:outline-none"
                                        placeholder="Nom Prénom"
                                        value={formData.fullName} onChange={handleChange}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm text-slate-300">Date de Naissance</label>
                                    <input
                                        type="date" name="dob" required
                                        className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-3 text-white focus:border-violet-500 focus:outline-none"
                                        value={formData.dob} onChange={handleChange}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm text-slate-300">Wilaya</label>
                                    <select
                                        name="wilaya" required
                                        className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-3 text-white focus:border-violet-500 focus:outline-none"
                                        value={formData.wilaya} onChange={handleChange}
                                    >
                                        <option value="">Choisir...</option>
                                        <option value="Alger">Alger</option>
                                        <option value="Oran">Oran</option>
                                        <option value="Constantine">Constantine</option>
                                        {/* Add more later */}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm text-slate-300">Pièce d'Identité (Scan/Photo)</label>
                                <div className="border-2 border-dashed border-slate-700 rounded-xl p-6 text-center hover:border-violet-500 transition-colors cursor-pointer bg-slate-800/30">
                                    <input type="file" id="id-upload" className="hidden" onChange={handleFileChange} />
                                    <label htmlFor="id-upload" className="cursor-pointer flex flex-col items-center gap-2">
                                        <Upload className="text-violet-400" size={32} />
                                        <span className="text-slate-400 text-sm">
                                            {formData.idFile ? formData.idFile.name : 'Cliquez pour uploader (PDF/JPG)'}
                                        </span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: SOCIAL */}
                    {step === 3 && (
                        <div className="space-y-6 animate-slide-up">
                            <div className="bg-violet-500/10 border border-violet-500/20 p-4 rounded-lg">
                                <p className="text-sm text-violet-200">
                                    💡 Astuce : Connecter vos réseaux sociaux permet à notre IA de mieux évaluer votre potentiel marketing. C'est optionnel mais recommandé.
                                </p>
                            </div>

                            <div className="space-y-3">
                                <div className="relative">
                                    <LinkIcon className="absolute left-3 top-3 text-pink-500" size={20} />
                                    <input
                                        type="url" name="instagram"
                                        className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-3 pl-10 text-white focus:border-pink-500 focus:outline-none"
                                        placeholder="Lien Instagram"
                                        value={formData.instagram} onChange={handleChange}
                                    />
                                </div>
                                <div className="relative">
                                    <LinkIcon className="absolute left-3 top-3 text-cyan-400" size={20} />
                                    <input
                                        type="url" name="tiktok"
                                        className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-3 pl-10 text-white focus:border-cyan-400 focus:outline-none"
                                        placeholder="Lien TikTok"
                                        value={formData.tiktok} onChange={handleChange}
                                    />
                                </div>
                                <div className="relative">
                                    <LinkIcon className="absolute left-3 top-3 text-blue-500" size={20} />
                                    <input
                                        type="url" name="facebook"
                                        className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-3 pl-10 text-white focus:border-blue-500 focus:outline-none"
                                        placeholder="Lien Facebook"
                                        value={formData.facebook} onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-between bg-slate-900/50 p-4 rounded-xl border border-slate-700">
                                <div className="text-sm text-slate-400">Capital Numérique Estimé</div>
                                <div className="text-2xl font-bold text-green-400 flex items-center gap-2">
                                    {formData.digitalCapital.toLocaleString()}
                                    <span className="text-xs text-slate-500 font-normal">Abonnés</span>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={calculateScore}
                                disabled={analyzing}
                                className="w-full py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm text-violet-300 transition-colors flex justify-center items-center gap-2"
                            >
                                {analyzing ? <Loader className="animate-spin" size={16} /> : 'Recalculer / Analyser les liens'}
                            </button>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex gap-4 pt-4 border-t border-slate-700/50">
                        {step > 1 && (
                            <button
                                type="button" onClick={prevStep}
                                className="px-6 py-2 rounded-xl text-slate-300 hover:bg-slate-800 transition-colors"
                            >
                                Retour
                            </button>
                        )}

                        {step < 3 ? (
                            <button
                                type="button" onClick={nextStep}
                                className="btn-primary flex-1 flex justify-center items-center gap-2"
                            >
                                Suivant <ArrowRight size={18} />
                            </button>
                        ) : (
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary flex-1 flex justify-center items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600"
                            >
                                {loading ? <Loader className="animate-spin" /> : 'Créer mon Espace Auteur'}
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}
