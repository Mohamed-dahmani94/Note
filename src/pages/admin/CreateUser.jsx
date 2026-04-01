import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { supabase } from '../../supabaseClient'; // Default client for profiles
import { ArrowLeft, Save, User, Mail, Lock } from 'lucide-react';

// Create a separate client for creation to avoid replacing the current session
// This is a "hack" for client-side admin creation without Edge Functions
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://ueeensmyaqsbruezyjwe.supabase.co";
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_Pwkeq6QyrIgUvLSbo8prGQ_9LF83oBu";

const tempClient = createClient(supabaseUrl, supabaseKey, {
    auth: {
        persistSession: false, // CRITICAL: Don't store this session (prevents logout)
        autoRefreshToken: false,
        detectSessionInUrl: false,
        storageKey: 'temp-admin-creation' // Unique key to avoid conflict warning
    }
});

const CreateUser = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        fullName: '',
        role: 'author'
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // 1. Create User (using temp client)
            const { data: authData, error: authError } = await tempClient.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        full_name: formData.fullName,
                        // Note: We can try to set role here, but our Trigger might overwrite it 
                        // or we might need to rely on default.
                        // Since we switched to Custom Claims, we might want to set app_metadata here?
                        // But users can't set their own app_metadata. 
                        // So relying on Trigger + manually updating role later is safer.
                    }
                }
            });

            if (authError) throw authError;

            // 2. Profile Creation handled by Trigger automatically
            // We do NOT manual upsert anymore to avoid RLS strict policy blocks.

            if (formData.role === 'admin') {
                alert("L'utilisateur a été créé avec le rôle 'Auteur' par défaut. Veuillez modifier son rôle en 'Admin' depuis la liste.");
            } else {
                alert("Utilisateur créé avec succès !");
            }

            navigate('/admin/users');

        } catch (err) {
            console.error("Creation error:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-8 flex items-center gap-4">
                <button
                    onClick={() => navigate('/admin/users')}
                    className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Ajouter un utilisateur</h1>
                    <p className="text-gray-500 text-sm">Créer un nouveau compte manuellement</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 space-y-6">
                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-100 text-sm">
                        {error}
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom Complet</label>
                    <div className="relative group">
                        <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                        <input
                            name="fullName"
                            type="text"
                            required
                            value={formData.fullName}
                            onChange={handleChange}
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 pl-10 pr-4 focus:ring-2 focus:ring-note-purple/20 focus:border-note-purple outline-none"
                            placeholder="John Doe"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <div className="relative group">
                        <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                        <input
                            name="email"
                            type="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 pl-10 pr-4 focus:ring-2 focus:ring-note-purple/20 focus:border-note-purple outline-none"
                            placeholder="john@example.com"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe provisoire</label>
                    <div className="relative group">
                        <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                        <input
                            name="password"
                            type="password"
                            required
                            minLength={6}
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 pl-10 pr-4 focus:ring-2 focus:ring-note-purple/20 focus:border-note-purple outline-none"
                            placeholder="••••••"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rôle</label>
                    <select
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-gray-900 focus:ring-2 focus:ring-note-purple/20 focus:border-note-purple outline-none"
                    >
                        <option value="author">Auteur</option>
                        <option value="admin">Administrateur</option>
                    </select>
                </div>

                <div className="pt-4 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={() => navigate('/admin/users')}
                        className="px-6 py-2 border border-gray-200 text-gray-600 rounded-lg font-bold hover:bg-white transition-colors"
                    >
                        Annuler
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2 bg-note-purple text-white rounded-lg font-bold hover:bg-violet-700 shadow-md flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Création...' : 'Créer le compte'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateUser;
