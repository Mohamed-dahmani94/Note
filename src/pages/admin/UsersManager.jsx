import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import { MoreVertical, Shield, User, Edit, Trash2 } from 'lucide-react';

const UsersManager = () => {
    const { user: currentUser } = useAuth();
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Editing State (Deprecated in favor of detail page)
    const [editingUser, setEditingUser] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            // Note: 'profiles' table should be readable by admin
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setUsers(data || []);
        } catch (err) {
            console.error("Error fetching users:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (user) => {
        navigate(`/admin/users/${user.id}`);
    };

    const handleUpdateRole = async () => {
        if (!editingUser) return;

        try {
            const { error } = await supabase
                .from('profiles')
                .update({ role: roleSelect })
                .eq('id', editingUser.id);

            if (error) throw error;

            // Optimistic update
            setUsers(users.map(u => u.id === editingUser.id ? { ...u, role: roleSelect } : u));
            setEditingUser(null);
            alert("Rôle mis à jour avec succès !");
        } catch (err) {
            console.error("Error updating role:", err);
            alert("Erreur lors de la mise à jour : " + err.message);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Chargement des utilisateurs...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-bold text-gray-800">Gestion des Utilisateurs</h1>
                    <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-medium">
                        Total: {users.length}
                    </span>
                </div>
                <button
                    onClick={() => navigate('/admin/users/new')}
                    className="bg-note-purple hover:bg-violet-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                >
                    <span>+</span> Ajouter
                </button>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-100">
                    {error}
                </div>
            )}

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-50 border-b border-gray-200 text-xs uppercase font-medium text-gray-500">
                        <tr>
                            <th className="px-6 py-4">Utilisateur</th>
                            <th className="px-6 py-4">Role</th>
                            <th className="px-6 py-4">Nom Complet</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {users.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="px-6 py-12 text-center text-gray-400">
                                    Aucun utilisateur trouvé.
                                </td>
                            </tr>
                        ) : (
                            users.map((u) => (
                                <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-note-purple font-bold text-xs">
                                                {(u.full_name || u.email || '?').charAt(0).toUpperCase()}
                                            </div>
                                            <div className="font-medium text-gray-900">{u.email || 'N/A'}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${u.role === 'admin'
                                            ? 'bg-purple-50 text-purple-700 border-purple-100'
                                            : 'bg-gray-50 text-gray-600 border-gray-200'
                                            }`}>
                                            {u.role === 'admin' ? <Shield className="w-3 h-3" /> : <User className="w-3 h-3" />}
                                            {u.role || 'author'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">
                                        {u.full_name || '-'}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => handleEditClick(u)}
                                            className="text-gray-400 hover:text-note-purple p-2 rounded-lg hover:bg-gray-100 transition-all"
                                            title="Modifier le rôle"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Edit Modal (Deprecated) */}
            {editingUser && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm p-4">
                    {/* Placeholder if we ever need modal back, but now redirected */}
                </div>
            )}
        </div>
    );
};

export default UsersManager;
