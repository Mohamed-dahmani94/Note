import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient.js';
import { ArrowLeft, Save, Mail, Shield, User, Calendar, Briefcase, GraduationCap, Book, Globe } from 'lucide-react';

const UserDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState(null);

    // Consolidated Form State
    const [formData, setFormData] = useState({
        full_name: '',
        role: 'author',
        birth_date: '',
        birth_place: '',
        nationality: '',
        id_card_number: '',
        id_card_type: 'CNI',
        address: '',
        phone: '',
        profession: '',
        professional_status: '',
        employer: '',
        activity_field: '',
        experience_years: '',
        last_degree: '',
        specialty: '',
        university: '',
        degree_year: '',
        high_school_level: '',
        high_school_name: '',
        bac_year: '',
        has_published: false,
        published_works: '',
        literary_genres: '',
        writing_languages: '',
        social_facebook: '',
        social_instagram: '',
        social_twitter: '',
        social_linkedin: '',
        social_youtube: '',
        website: ''
    });

    useEffect(() => {
        fetchUserProfile();
    }, [id]);

    const fetchUserProfile = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;

            setProfile(data);

            // Sync form data with DB data, ensuring no nulls and handling arrays
            const initialData = {};
            Object.keys(formData).forEach(key => {
                let val = data[key];
                // Handle array fields: Convert to comma-separated string for UI
                if (Array.isArray(val)) {
                    val = val.join(', ');
                }

                // Provide defaults for specific fields if they are null in DB
                if (key === 'id_card_type' && !val) val = 'CNI';

                initialData[key] = val ?? (key === 'has_published' ? false : '');
            });
            setFormData(initialData);

        } catch (err) {
            console.error("Error fetching profile:", err);
            setError("Impossible de charger le profil. L'utilisateur n'existe peut-être pas.");
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSave = async () => {
        setUpdating(true);
        try {
            // Prepare updates: Convert specific strings back to arrays for Supabase
            const updates = { ...formData };

            // 1. Explicit Array Fields
            const arrayFields = ['literary_genres', 'writing_languages'];
            arrayFields.forEach(field => {
                if (typeof updates[field] === 'string') {
                    const str = updates[field].trim();
                    updates[field] = str ? str.split(',').map(s => s.trim()).filter(Boolean) : null;
                }
            });

            // 2. Dynamic Safety: Convert ANY remaining empty strings to NULL
            const sanitizedData = Object.keys(updates).reduce((acc, key) => {
                const val = updates[key];
                // Exception: id_card_type should stay 'CNI' or 'Passeport', never null/empty if possible
                if (key === 'id_card_type' && !val) {
                    acc[key] = 'CNI';
                } else {
                    acc[key] = (val === '') ? null : val;
                }
                return acc;
            }, {});

            console.log("UserDetails: Sending sanitized data:", sanitizedData);

            const { error } = await supabase
                .from('profiles')
                .update({
                    ...sanitizedData,
                    updated_at: new Date()
                })
                .eq('id', id);

            if (error) throw error;

            alert("Profil mis à jour avec succès !");

            // Safety check for fetchUserProfile (it might not be available in all contexts)
            if (typeof fetchUserProfile === 'function') {
                await fetchUserProfile({ id }); // Note: UserDetails might be editing *another* user
            }
        } catch (err) {
            console.error("Error updating profile:", err);
            alert("Erreur lors de la mise à jour : " + err.message);
        } finally {
            setUpdating(false);
        }
    };

    const handlePasswordReset = async () => {
        if (!confirm(`Envoyer un email de réinitialisation de mot de passe à ${profile.email} ?`)) return;

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(profile.email, {
                redirectTo: `${globalThis.location.origin}/update-password`,
            });

            if (error) throw error;
            alert(`Email envoyé à ${profile.email} !`);
        } catch (err) {
            console.error("Error sending reset email:", err);
            if (err.message.includes("rate limit")) {
                alert("Trop de tentatives. Veuillez patienter quelques minutes avant de réessayer.");
            } else {
                alert("Erreur lors de l'envoi : " + err.message);
            }
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Chargement du profil...</div>;
    if (error) return (
        <div className="p-8 flex flex-col items-center">
            <div className="text-red-500 mb-4">{error}</div>
            <button type="button" onClick={() => navigate('/admin/users')} className="text-note-purple hover:underline">
                Retour à la liste
            </button>
        </div>
    );

    return (
        <div className="max-w-3xl mx-auto">
            {/* Header */}
            <div className="mb-8 flex items-center gap-4">
                <button
                    type="button"
                    onClick={() => navigate('/admin/users')}
                    className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Détails Utilisateur</h1>
                    <p className="text-gray-500 text-sm">Gestion du profil de {profile.email}</p>
                </div>
            </div>

            {/* Main Content */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                {/* ID Card Header */}
                <div className="bg-gray-50 p-6 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-violet-100 flex items-center justify-center text-note-purple font-bold text-2xl">
                            {(formData.full_name || profile.email).charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">{profile.email}</h2>
                            <div className="flex items-center gap-2 text-xs text-gray-500 font-mono mt-1">
                                <span>ID: {profile.id}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Inscrit le : {new Date(profile.created_at).toLocaleDateString()}
                        </div>
                        {/* Note: Supabase doesn't expose last_sign_in in public table by default without trigger */}
                    </div>
                </div>

                {/* Edit Form */}
                <div className="p-8 space-y-8">

                    {/* Basic & Account */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nom Complet</label>
                            <div className="relative group">
                                <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400 group-focus-within:text-note-purple" />
                                <input
                                    type="text"
                                    name="full_name"
                                    value={formData.full_name}
                                    onChange={handleInputChange}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 pl-10 pr-4 focus:ring-2 focus:ring-note-purple/20 focus:border-note-purple outline-none transition-all"
                                    placeholder="Nom complet"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Rôle Système</label>
                            <div className="relative group">
                                <Shield className="absolute left-3 top-2.5 h-5 w-5 text-gray-400 group-focus-within:text-note-purple" />
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleInputChange}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 pl-10 pr-4 focus:ring-2 focus:ring-note-purple/20 focus:border-note-purple outline-none appearance-none transition-all"
                                >
                                    <option value="author">Auteur (Standard)</option>
                                    <option value="admin">Administrateur (Accès complet)</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Section: Informations Personnelles */}
                    <div className="pt-6 border-t border-gray-100">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <User className="w-5 h-5 text-blue-500" />
                            Informations Personnelles
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Date de naissance</label>
                                <input type="date" name="birth_date" value={formData.birth_date} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-sm focus:border-note-purple outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Lieu de naissance</label>
                                <input name="birth_place" value={formData.birth_place} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-sm focus:border-note-purple outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Nationalité</label>
                                <input name="nationality" value={formData.nationality} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-sm focus:border-note-purple outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Téléphone</label>
                                <input name="phone" value={formData.phone} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-sm focus:border-note-purple outline-none" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Adresse</label>
                                <input name="address" value={formData.address} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-sm focus:border-note-purple outline-none" />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 bg-gray-50 p-4 rounded-xl">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Type d'identité</label>
                                <div className="space-y-1">
                                    <select
                                        name="id_card_type"
                                        value={formData.id_card_type}
                                        onChange={handleInputChange}
                                        className="w-full bg-white border border-gray-200 rounded-lg py-2 px-3 text-sm focus:border-note-purple outline-none"
                                    >
                                        <option value="CNI">Carte Nationale</option>
                                        <option value="Permis de conduire">Permis de conduire</option>
                                        <option value="Passeport">Passeport</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Numéro d'identité</label>
                                <input name="id_card_number" value={formData.id_card_number} onChange={handleInputChange} className="w-full bg-white border border-gray-200 rounded-lg py-2 px-3 text-sm focus:border-note-purple outline-none" />
                            </div>
                            {profile.id_card_url && (
                                <div className="md:col-span-2 mt-2">
                                    <span className="text-xs text-gray-500 block mb-1">Document d'identité :</span>
                                    <a href={`${supabase.storage.from('identity_documents').getPublicUrl(profile.id_card_url).data.publicUrl}`} target="_blank" rel="noreferrer" className="text-note-purple text-sm hover:underline font-medium">📄 Afficher le scan</a>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Section: Parcours Professionnel */}
                    <div className="pt-6 border-t border-gray-100">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Briefcase className="w-5 h-5 text-amber-500" />
                            Parcours Professionnel
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Profession</label>
                                <input name="profession" value={formData.profession} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-sm focus:border-note-purple outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Statut</label>
                                <input name="professional_status" value={formData.professional_status} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-sm focus:border-note-purple outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Employeur</label>
                                <input name="employer" value={formData.employer} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-sm focus:border-note-purple outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Expérience (années)</label>
                                <input type="number" name="experience_years" value={formData.experience_years} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-sm focus:border-note-purple outline-none" />
                            </div>
                        </div>
                    </div>

                    {/* Section: Parcours Académique */}
                    <div className="pt-6 border-t border-gray-100">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <GraduationCap className="w-5 h-5 text-purple-500" />
                            Parcours Académique
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Dernier diplôme</label>
                                <input name="last_degree" value={formData.last_degree} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-sm focus:border-note-purple outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Université</label>
                                <input name="university" value={formData.university} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-sm focus:border-note-purple outline-none" />
                            </div>
                        </div>
                    </div>

                    {/* Section: Expérience Littéraire */}
                    <div className="pt-6 border-t border-gray-100">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Book className="w-5 h-5 text-red-500" />
                            Expérience Littéraire
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <input type="checkbox" name="has_published" checked={formData.has_published} onChange={handleInputChange} className="w-4 h-4 accent-note-purple" />
                                <label className="text-sm text-gray-700">A déjà publié des ouvrages</label>
                            </div>
                            {formData.has_published && (
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Ouvrages publiés</label>
                                    <textarea name="published_works" value={formData.published_works} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-sm focus:border-note-purple outline-none" rows={2} />
                                </div>
                            )}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Genres</label>
                                    <input name="literary_genres" value={formData.literary_genres} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-sm focus:border-note-purple outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Langues d'écriture</label>
                                    <input name="writing_languages" value={formData.writing_languages} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-sm focus:border-note-purple outline-none" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section: Présence en Ligne */}
                    <div className="pt-6 border-t border-gray-100">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Globe className="w-5 h-5 text-indigo-500" />
                            Présence en Ligne
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Facebook</label>
                                <input name="social_facebook" value={formData.social_facebook} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-sm focus:border-note-purple outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Instagram</label>
                                <input name="social_instagram" value={formData.social_instagram} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-sm focus:border-note-purple outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Site Web</label>
                                <input name="website" value={formData.website} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-sm focus:border-note-purple outline-none" />
                            </div>
                        </div>
                    </div>

                    <hr className="border-gray-100 my-6" />

                    {/* Security Zone */}
                    <div className="pt-6 border-t border-gray-100">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Shield className="w-5 h-5 text-gray-400" />
                            Sécurité & Système
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <span className="text-xs text-gray-400 uppercase font-bold block mb-1">Dernière mise à jour</span>
                                <span className="text-sm text-gray-700">{profile.updated_at ? new Date(profile.updated_at).toLocaleString() : 'Jamais'}</span>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <span className="text-xs text-gray-400 uppercase font-bold block mb-1">ID Supabase</span>
                                <span className="text-xs text-gray-500 font-mono break-all">{profile.id}</span>
                            </div>
                        </div>

                        <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                            <div>
                                <h4 className="font-bold text-yellow-800 text-sm">Réinitialisation du mot de passe</h4>
                                <p className="text-yellow-700 text-xs mt-1">
                                    Envoie un email sécurisé à l'utilisateur pour qu'il change son mot de passe.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={handlePasswordReset}
                                className="whitespace-nowrap px-4 py-2 bg-white border border-yellow-200 text-yellow-700 hover:bg-yellow-100 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                            >
                                <Mail className="w-4 h-4" />
                                Envoyer l'email
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="bg-gray-50 p-6 border-t border-gray-200 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={() => navigate('/admin/users')}
                        className="px-6 py-2 border border-gray-200 text-gray-600 rounded-lg font-bold hover:bg-white transition-colors"
                    >
                        Annuler
                    </button>
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={updating}
                        className="px-6 py-2 bg-note-purple text-white rounded-lg font-bold hover:bg-violet-700 shadow-md flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed transform active:scale-95 transition-all"
                    >
                        <Save className="w-4 h-4" />
                        {updating ? 'Enregistrement...' : 'Enregistrer'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserDetails;
