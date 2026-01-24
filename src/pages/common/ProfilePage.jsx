import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../supabaseClient';
import { Save, Upload, User, Briefcase, GraduationCap, Book, Globe, Key, Mail } from 'lucide-react';

const ProfilePage = () => {
    const { user, fetchProfile } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [idFile, setIdFile] = useState(null);
    const [passwordData, setPasswordData] = useState({
        newPassword: '',
        confirmPassword: ''
    });

    const [formData, setFormData] = useState({
        full_name: '',
        birth_date: '',
        birth_place: '',
        nationality: '',
        id_card_number: '',
        id_card_type: 'CNI',
        id_card_url: '',
        address: '',
        phone: '',
        // Professional
        profession: '',
        professional_status: '',
        employer: '',
        activity_field: '',
        experience_years: '',
        // Academic
        last_degree: '',
        specialty: '',
        university: '',
        degree_year: '',
        high_school_level: '',
        high_school_name: '',
        bac_year: '',
        // Literary
        has_published: false,
        published_works: '',
        literary_genres: '',
        writing_languages: '',
        // Social
        social_facebook: '',
        social_instagram: '',
        social_twitter: '',
        social_linkedin: '',
        social_youtube: '',
        website: ''
    });

    useEffect(() => {
        if (user) loadProfile();
    }, [user]);

    const loadProfile = async () => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (error) throw error;
            if (data) {
                // Merge data and ensure no null values
                const cleanData = Object.keys(data).reduce((acc, key) => {
                    acc[key] = data[key] ?? '';
                    return acc;
                }, {});

                setFormData(prev => ({
                    ...prev,
                    ...cleanData,
                    has_published: data.has_published === true
                }));
            }
        } catch (err) {
            console.error("Error loading profile:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({ ...prev, [name]: value }));
    };

    const handleChangePassword = async () => {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            alert("Les mots de passe ne correspondent pas !");
            return;
        }

        if (passwordData.newPassword.length < 6) {
            alert("Le mot de passe doit contenir au moins 6 caractères !");
            return;
        }

        try {
            const { error } = await supabase.auth.updateUser({
                password: passwordData.newPassword
            });

            if (error) throw error;

            alert("Mot de passe modifié avec succès !");
            setPasswordData({ newPassword: '', confirmPassword: '' });
        } catch (err) {
            console.error("Error updating password:", err);
            alert("Erreur : " + err.message);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setIdFile(e.target.files[0]);
        }
    };

    const uploadIdentityDoc = async () => {
        if (!idFile) return formData.id_card_url;

        const fileExt = idFile.name.split('.').pop();
        const fileName = `id_${Date.now()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { error } = await supabase.storage
            .from('identity_documents')
            .upload(filePath, idFile, { upsert: true });

        if (error) throw error;
        return filePath;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            const idDocPath = await uploadIdentityDoc();

            const updates = {
                ...formData,
                id_card_url: idDocPath,
                updated_at: new Date()
            };

            const { error } = await supabase
                .from('profiles')
                .update(updates)
                .eq('id', user.id);

            if (error) throw error;

            alert("Profil mis à jour avec succès !");
            // Refresh context profile if needed (mostly for name changes)
            await fetchProfile(user);

        } catch (err) {
            console.error("Error updating profile:", err);
            alert("Erreur : " + err.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Chargement...</div>;

    return (
        <div className="max-w-5xl mx-auto pb-20">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Mon Profil</h1>
            <p className="text-gray-500 mb-8">Complétez vos informations pour finaliser votre dossier auteur.</p>

            <form onSubmit={handleSubmit} className="space-y-8">

                {/* 0. PARAMÈTRES DU COMPTE */}
                <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-6 border-b pb-4">
                        <div className="p-2 bg-green-50 text-green-600 rounded-lg"><Key className="w-5 h-5" /></div>
                        <h2 className="text-xl font-bold text-gray-800">Paramètres du Compte</h2>
                    </div>

                    <div className="space-y-6">
                        {/* Email (Read-only, display current) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email de connexion</label>
                            <div className="flex items-center gap-3">
                                <Mail className="w-5 h-5 text-gray-400" />
                                <input
                                    type="email"
                                    value={user?.email || ''}
                                    disabled
                                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 text-gray-600 cursor-not-allowed"
                                />
                                <span className="text-xs text-gray-500">Non modifiable</span>
                            </div>
                        </div>

                        {/* Password Change */}
                        <div className="border-t pt-4">
                            <h3 className="font-bold text-gray-800 mb-4">Changer le mot de passe</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nouveau mot de passe</label>
                                    <input
                                        type="password"
                                        name="newPassword"
                                        value={passwordData.newPassword}
                                        onChange={handlePasswordChange}
                                        placeholder="Au moins 6 caractères"
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirmer le mot de passe</label>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        value={passwordData.confirmPassword}
                                        onChange={handlePasswordChange}
                                        placeholder="Retapez le mot de passe"
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                    />
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={handleChangePassword}
                                disabled={!passwordData.newPassword || !passwordData.confirmPassword}
                                className="mt-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                            >
                                Mettre à jour le mot de passe
                            </button>
                        </div>
                    </div>
                </section>

                {/* 1. INFORMATIONS PERSONNELLES */}
                <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-6 border-b pb-4">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><User className="w-5 h-5" /></div>
                        <h2 className="text-xl font-bold text-gray-800">Informations Personnelles</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
                            <input
                                name="full_name"
                                value={formData.full_name}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nationalité</label>
                            <input
                                name="nationality"
                                value={formData.nationality}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date de naissance</label>
                            <input
                                type="date"
                                name="birth_date"
                                value={formData.birth_date || ''}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Lieu de naissance</label>
                            <input
                                name="birth_place"
                                value={formData.birth_place || ''}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                            />
                        </div>

                        {/* ID */}
                        <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4 mt-2 bg-gray-50 p-4 rounded-xl">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Type de pièce</label>
                                <select
                                    name="id_card_type"
                                    value={formData.id_card_type}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                >
                                    <option value="CNI">Carte Nationale</option>
                                    <option value="Passeport">Passeport</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Numéro de pièce</label>
                                <input
                                    name="id_card_number"
                                    value={formData.id_card_number || ''}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Scan de la pièce</label>
                                <div className="flex gap-2 items-center">
                                    <input
                                        type="file"
                                        accept=".pdf,.jpg,.png"
                                        onChange={handleFileChange}
                                        className="w-full text-sm text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-xs file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                    />
                                    {formData.id_card_url && <span className="text-xs text-green-600 font-bold whitespace-nowrap">Fichier reçu</span>}
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Adresse de résidence</label>
                            <input
                                name="address"
                                value={formData.address || ''}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                            <input
                                name="phone"
                                value={formData.phone || ''}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                            />
                        </div>
                    </div>
                </section>

                {/* 2. INFORMATIONS PROFESSIONNELLES */}
                <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-6 border-b pb-4">
                        <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><Briefcase className="w-5 h-5" /></div>
                        <h2 className="text-xl font-bold text-gray-800">Parcours Professionnel</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Profession actuelle</label>
                            <input
                                name="profession"
                                value={formData.profession || ''}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                            <select
                                name="professional_status"
                                value={formData.professional_status || ''}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                            >
                                <option value="">Choisir...</option>
                                <option value="Salarié">Salarié</option>
                                <option value="Indépendant">Indépendant</option>
                                <option value="Étudiant">Étudiant</option>
                                <option value="Sans emploi">Sans emploi</option>
                                <option value="Autre">Autre</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Employeur / Institution</label>
                            <input
                                name="employer"
                                value={formData.employer || ''}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Domaine d'activité</label>
                            <input
                                name="activity_field"
                                value={formData.activity_field || ''}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Années d'expérience</label>
                            <input
                                type="number"
                                name="experience_years"
                                value={formData.experience_years || ''}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                            />
                        </div>
                    </div>
                </section>

                {/* 3. INFORMATIONS ACADÉMIQUES */}
                <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-6 border-b pb-4">
                        <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><GraduationCap className="w-5 h-5" /></div>
                        <h2 className="text-xl font-bold text-gray-800">Parcours Académique</h2>
                    </div>

                    <h3 className="font-bold text-gray-800 font-sm mb-4 uppercase text-xs tracking-wider">Études Universitaires</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Dernier diplôme</label>
                            <input
                                name="last_degree"
                                value={formData.last_degree || ''}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Spécialité</label>
                            <input
                                name="specialty"
                                value={formData.specialty || ''}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Université / Établissement</label>
                            <input
                                name="university"
                                value={formData.university || ''}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Année d'obtention</label>
                            <input
                                type="number"
                                name="degree_year"
                                value={formData.degree_year || ''}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                            />
                        </div>
                    </div>

                    <h3 className="font-bold text-gray-800 font-sm mb-4 uppercase text-xs tracking-wider pt-4 border-t border-gray-50">Études Secondaires</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Niveau atteint</label>
                            <input
                                name="high_school_level"
                                value={formData.high_school_level || ''}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Lycée fréquenté</label>
                            <input
                                name="high_school_name"
                                value={formData.high_school_name || ''}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Année du Bac</label>
                            <input
                                type="number"
                                name="bac_year"
                                value={formData.bac_year || ''}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                            />
                        </div>
                    </div>
                </section>

                {/* 4. EXPÉRIENCE LITTÉRAIRE */}
                <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-6 border-b pb-4">
                        <div className="p-2 bg-red-50 text-red-600 rounded-lg"><Book className="w-5 h-5" /></div>
                        <h2 className="text-xl font-bold text-gray-800">Expérience Littéraire</h2>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <label className="block text-sm font-medium text-gray-700">Avez-vous déjà publié ?</label>
                            <label className="inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="has_published"
                                    checked={formData.has_published}
                                    onChange={handleChange}
                                    className="sr-only peer"
                                />
                                <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>

                        {formData.has_published && (
                            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Détails (Titres, Éditeurs, Années)</label>
                                <textarea
                                    name="published_works"
                                    value={formData.published_works || ''}
                                    onChange={handleChange}
                                    rows={3}
                                    placeholder="Ex: 'Le Voyage' (2020), Éditions X..."
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                />
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Genres littéraires pratiqués</label>
                                <input
                                    name="literary_genres"
                                    value={formData.literary_genres || ''}
                                    onChange={handleChange}
                                    placeholder="Roman, Poésie, Essai..."
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Langue(s) d'écriture</label>
                                <input
                                    name="writing_languages"
                                    value={formData.writing_languages || ''}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* 5. RÉSEAUX SOCIAUX */}
                <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-6 border-b pb-4">
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><Globe className="w-5 h-5" /></div>
                        <h2 className="text-xl font-bold text-gray-800">Présence en Ligne</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {['Facebook', 'Instagram', 'Twitter', 'LinkedIn', 'YouTube'].map(social => (
                            <div key={social}>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{social}</label>
                                <input
                                    name={`social_${social.toLowerCase()}`}
                                    value={formData[`social_${social.toLowerCase()}`] || ''}
                                    onChange={handleChange}
                                    placeholder={`Lien ${social}`}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                />
                            </div>
                        ))}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Site Web / Blog</label>
                            <input
                                name="website"
                                value={formData.website || ''}
                                onChange={handleChange}
                                placeholder="https://..."
                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                            />
                        </div>
                    </div>
                </section>

                <div className="flex justify-end pt-4 pb-12">
                    <button
                        type="submit"
                        disabled={saving}
                        className="bg-note-purple hover:bg-violet-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg flex items-center gap-2"
                    >
                        <Save className="w-5 h-5" />
                        {saving ? 'Enregistrement...' : 'Enregistrer mon Profil'}
                    </button>
                </div>

            </form>
        </div>
    );
};

export default ProfilePage;
