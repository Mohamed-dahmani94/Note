import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Clock, CheckCircle, Plus } from 'lucide-react';

const AuthorDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({ total: 0, pending: 0, validated: 0 });
    const [recentManuscripts, setRecentManuscripts] = useState([]);

    useEffect(() => {
        if (user) fetchStats();
    }, [user]);

    const fetchStats = async () => {
        try {
            // Count total
            const { count: total, error: err1 } = await supabase
                .from('publications')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id);

            // Count pending (en attente)
            const { count: pending, error: err2 } = await supabase
                .from('publications')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id)
                .eq('position', 'en attente');

            // Count validated
            const { count: validated, error: err3 } = await supabase
                .from('publications')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id)
                .eq('position', 'validé');

            setStats({
                total: total || 0,
                pending: pending || 0,
                validated: validated || 0
            });

            // Fetch recent
            const { data } = await supabase
                .from('publications')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(5);

            setRecentManuscripts(data || []);

        } catch (error) {
            console.error("Error fetching dashboard stats:", error);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Bienvenue, {user?.full_name?.split(' ')[0]}</h1>
                    <p className="text-gray-500">Gérez vos publications et suivez leur statut.</p>
                </div>
                <button
                    onClick={() => navigate('/author/content/new')}
                    className="bg-note-purple hover:bg-violet-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm"
                >
                    <Plus className="w-4 h-4" /> Nouveau Manuscrit
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                        <BookOpen className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-400 font-medium">Total Publications</p>
                        <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                        <Clock className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-400 font-medium">En Attente</p>
                        <p className="text-2xl font-bold text-gray-800">{stats.pending}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-green-50 text-green-600 rounded-xl">
                        <CheckCircle className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-400 font-medium">Validés</p>
                        <p className="text-2xl font-bold text-gray-800">{stats.validated}</p>
                    </div>
                </div>
            </div>

            {/* Recent Table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="font-bold text-gray-800">Vos manuscrits récents</h2>
                </div>
                <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-50 border-b border-gray-200 text-xs uppercase font-medium text-gray-500">
                        <tr>
                            <th className="px-6 py-4">Titre</th>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4">Statut</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {recentManuscripts.length === 0 ? (
                            <tr><td colSpan="4" className="text-center py-8 text-gray-400">Aucun manuscrit trouvé.</td></tr>
                        ) : (
                            recentManuscripts.map(m => (
                                <tr key={m.id} className="hover:bg-gray-50/50">
                                    <td className="px-6 py-4 font-medium text-gray-900">{m.title_main}</td>
                                    <td className="px-6 py-4">{new Date(m.created_at).toLocaleDateString()}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs border ${m.position === 'validé' ? 'bg-green-50 text-green-700 border-green-100' :
                                                m.position === 'en attente' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                                    'bg-gray-50 text-gray-600 border-gray-200'
                                            }`}>
                                            {m.position}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button onClick={() => navigate(`/author/content/${m.id}`)} className="text-note-purple hover:underline">Modifier</button>
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

export default AuthorDashboard;
