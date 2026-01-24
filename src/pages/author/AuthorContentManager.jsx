import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { BookOpen, Clock, FileText, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const AuthorContentManager = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
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
            const { data, error } = await supabase
                .from('publications')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setManuscripts(data || []);
        } catch (err) {
            console.error("Error fetching manuscripts:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const filteredManuscripts = statusFilter === 'all'
        ? manuscripts
        : manuscripts.filter(m => m.position === statusFilter);

    if (loading) return <div className="p-8 text-center text-gray-500">Chargement de vos publications...</div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">{t('my_manuscripts', 'Mes Manuscrits')}</h1>
                    <p className="text-gray-500 text-sm">Gérez et suivez l'état de vos soumissions.</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-gray-200">
                        <button
                            onClick={() => setStatusFilter('all')}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${statusFilter === 'all' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            {t('all', 'Tous')}
                        </button>
                        <button
                            onClick={() => setStatusFilter('en saisie')}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${statusFilter === 'en saisie' ? 'bg-amber-50 text-amber-700' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            {t('draft', 'Brouillon')}
                        </button>
                        <button
                            onClick={() => setStatusFilter('en attente')}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${statusFilter === 'en attente' ? 'bg-blue-50 text-blue-700' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            {t('pending', 'En attente')}
                        </button>
                        <button
                            onClick={() => setStatusFilter('validé')}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${statusFilter === 'validé' ? 'bg-green-50 text-green-700' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            {t('validated', 'Validé')}
                        </button>
                    </div>

                    <button
                        onClick={() => navigate('/author/content/new')}
                        className="bg-note-purple hover:bg-violet-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm transition-colors"
                    >
                        <Plus className="w-4 h-4" /> {t('new_manuscript', 'Nouveau Manuscrit')}
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 text-red-800 p-4 rounded-lg border border-red-200 flex items-start gap-3">
                    <div className="font-bold">Erreur : {error}</div>
                </div>
            )}

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600 min-w-[600px]">
                        <thead className="bg-gray-50 border-b border-gray-200 text-xs uppercase font-medium text-gray-500">
                            <tr>
                                <th className="px-6 py-4">Titre</th>
                                <th className="px-6 py-4">Collection</th>
                                <th className="px-6 py-4">Date de création</th>
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
                                        <td className="px-6 py-4 text-gray-500">
                                            {m.collection_title || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">
                                            {new Date(m.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${m.position === 'validé' ? 'bg-green-50 text-green-700 border-green-100' :
                                                    m.position === 'en attente' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                                        m.position === 'en saisie' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                                            'bg-gray-50 text-gray-700 border-gray-200'
                                                }`}>
                                                {m.position}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => navigate(`/author/content/${m.id}`)}
                                                className="inline-flex items-center gap-1 text-note-purple hover:underline font-medium"
                                            >
                                                <FileText className="w-4 h-4" />
                                                Modifier
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AuthorContentManager;
