import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { BookOpen, CheckCircle, XCircle, Clock, Eye, FileText, Download } from 'lucide-react';

const ContentManager = () => {
    const navigate = useNavigate();
    const [manuscripts, setManuscripts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        fetchManuscripts();
    }, []);

    const fetchManuscripts = async () => {
        setLoading(true);
        try {
            // Fetch publications (since we created 'publications' table, use that instead of 'manuscripts' if that was the plan?)
            // The user asked for the form which saves to 'publications'.
            // So this manager should display 'publications'.
            let query = supabase
                .from('publications')
                .select('*') // We might want to join user info if we had author relationship, but 'publications' has explicit author fields
                .order('created_at', { ascending: false });

            const { data, error } = await query;

            if (error) throw error;
            setManuscripts(data || []);
        } catch (err) {
            console.error("Error fetching manuscripts:", err);
            // Handle specific case where table might not exist
            if (err.code === '42P01') {
                setError("La table 'publications' n'existe pas encore dans Supabase.");
            } else {
                setError(err.message);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id, newStatus) => {
        try {
            const { error } = await supabase
                .from('publications')
                .update({ position: newStatus }) // The form uses 'position' for status (e.g. 'en saisie')
                .eq('id', id);

            if (error) throw error;

            // Optimistic Update
            setManuscripts(manuscripts.map(m =>
                m.id === id ? { ...m, position: newStatus } : m
            ));
        } catch (err) {
            alert("Erreur lors de la mise à jour : " + err.message);
        }
    };

    const filteredManuscripts = statusFilter === 'all'
        ? manuscripts
        : manuscripts.filter(m => m.position === statusFilter); // Using 'position' as status

    if (loading) return <div className="p-8 text-center text-gray-500">Chargement des publications...</div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-800">Gestion des Publications</h1>
                <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-gray-200">
                    <button
                        onClick={() => setStatusFilter('all')}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${statusFilter === 'all' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                        Tous
                    </button>
                    <button
                        onClick={() => setStatusFilter('en saisie')}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${statusFilter === 'en saisie' ? 'bg-amber-50 text-amber-700' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                        En saisie
                    </button>
                    <button
                        onClick={() => setStatusFilter('validé')}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${statusFilter === 'validé' ? 'bg-green-50 text-green-700' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                        Validés
                    </button>
                </div>
                <button
                    onClick={() => navigate('/admin/content/new')}
                    className="bg-note-purple hover:bg-violet-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                    + Nouvelle Publication
                </button>
            </div>

            {error && (
                <div className="bg-amber-50 text-amber-800 p-4 rounded-lg border border-amber-200 flex items-start gap-3">
                    <Clock className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-bold">Attention</h4>
                        <p>{error}</p>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-50 border-b border-gray-200 text-xs uppercase font-medium text-gray-500">
                        <tr>
                            <th className="px-6 py-4">Titre</th>
                            <th className="px-6 py-4">Auteur</th>
                            <th className="px-6 py-4">Collection</th>
                            <th className="px-6 py-4">Statut</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredManuscripts.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-12 text-center text-gray-400">
                                    Aucune publication trouvée.
                                </td>
                            </tr>
                        ) : (
                            filteredManuscripts.map((m) => (
                                <tr key={m.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900">{m.title_main || 'Sans titre'}</div>
                                        {m.title_secondary && <div className="text-xs text-gray-400">{m.title_secondary}</div>}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
                                                {(m.main_author_name || '?').charAt(0)}
                                            </div>
                                            <span className="truncate max-w-[150px]">
                                                {m.main_author_name} {m.main_author_firstname}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">
                                        {m.collection_title || '-'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <select
                                            value={m.position || 'en saisie'}
                                            onChange={(e) => handleUpdateStatus(m.id, e.target.value)}
                                            className={`text-xs font-medium px-2 py-1 rounded-full border outline-none cursor-pointer ${m.position === 'validé' ? 'bg-green-50 text-green-700 border-green-100' :
                                                    m.position === 'en attente' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                                        'bg-gray-50 text-gray-700 border-gray-200'
                                                }`}
                                        >
                                            <option value="en saisie">En saisie</option>
                                            <option value="en attente">Demande validation</option>
                                            <option value="validé">Validé</option>
                                            <option value="rejeté">Rejeté</option>
                                        </select>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => navigate(`/admin/content/${m.id}`)}
                                                className="p-1 text-gray-400 hover:text-note-purple transition-colors"
                                                title="Modifier"
                                            >
                                                <FileText className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ContentManager;
