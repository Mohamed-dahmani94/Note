import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { ArrowLeft, Save, Mail, Shield, User, Clock, Calendar } from 'lucide-react';

const UserDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState(null);

    // Form State
    const [fullName, setFullName] = useState('');
    const [role, setRole] = useState('author');

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
            setFullName(data.full_name || '');
            setRole(data.role || 'author');
        } catch (err) {
            console.error("Error fetching profile:", err);
            setError("Impossible de charger le profil. L'utilisateur n'existe peut-être pas.");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setUpdating(true);
        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    full_name: fullName,
                    role: role,
                    updated_at: new Date()
                })
                .eq('id', id);

            if (error) throw error;

            alert("Profil mis à jour avec succès !");
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
                redirectTo: `${window.location.origin}/update-password`,
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
            <button onClick={() => navigate('/admin/users')} className="text-note-purple hover:underline">
                Retour à la liste
            </button>
        </div>
    );

    return (
        <div className="max-w-3xl mx-auto">
            {/* Header */}
            <div className="mb-8 flex items-center gap-4">
                <button
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
                            {(fullName || profile.email).charAt(0).toUpperCase()}
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
                <div className="p-8 space-y-6">
                    {/* Full Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nom Complet</label>
                        <div className="relative group">
                            <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400 group-focus-within:text-note-purple" />
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 pl-10 pr-4 focus:ring-2 focus:ring-note-purple/20 focus:border-note-purple outline-none transition-all"
                                placeholder="Nom complet de l'utilisateur"
                            />
                        </div>
                    </div>

                    {/* Role */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Rôle Système</label>
                        <div className="relative group">
                            <Shield className="absolute left-3 top-2.5 h-5 w-5 text-gray-400 group-focus-within:text-note-purple" />
                            <select
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 pl-10 pr-4 focus:ring-2 focus:ring-note-purple/20 focus:border-note-purple outline-none appearance-none transition-all"
                            >
                                <option value="author">Auteur (Standard)</option>
                                <option value="admin">Administrateur (Accès complet)</option>
                            </select>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 ml-1">
                            * Les administrateurs ont accès au dashboard de gestion.
                        </p>
                    </div>

                    <hr className="border-gray-100 my-6" />

                    {/* Security Zone */}
                    <div>
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Shield className="w-5 h-5 text-gray-400" />
                            Sécurité
                        </h3>

                        <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                            <div>
                                <h4 className="font-bold text-yellow-800 text-sm">Réinitialisation du mot de passe</h4>
                                <p className="text-yellow-700 text-xs mt-1">
                                    Envoie un email sécurisé à l'utilisateur pour qu'il change son mot de passe.
                                </p>
                            </div>
                            <button
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
                        onClick={() => navigate('/admin/users')}
                        className="px-6 py-2 border border-gray-200 text-gray-600 rounded-lg font-bold hover:bg-white transition-colors"
                    >
                        Annuler
                    </button>
                    <button
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
