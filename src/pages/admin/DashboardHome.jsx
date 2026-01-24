import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Users, BookOpen, Clock, CheckCircle } from 'lucide-react';
import { supabase } from '../../supabaseClient';
import ProfileCompletionCard from '../../components/ProfileCompletionCard';

const StatCard = ({ title, value, icon: Icon, color, trend }) => (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start">
            <div>
                <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
                <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
            </div>
            <div className={`p-3 rounded-xl bg-${color}-50 text-${color}-600`}>
                <Icon className="w-6 h-6" />
            </div>
        </div>
        {trend && (
            <div className="mt-4 flex items-center text-xs">
                <span className={`font-medium ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {trend > 0 ? '+' : ''}{trend}%
                </span>
                <span className="text-gray-400 ml-2">vs last month</span>
            </div>
        )}
    </div>
);

const DashboardHome = () => {
    const { t } = useTranslation();
    const [counts, setCounts] = useState({ users: 0, publications: 0, pending: 0, validated: 0 });
    const [recentUsers, setRecentUsers] = useState([]);
    const [recentPubs, setRecentPubs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // 1. Counts
                const { count: usersCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
                const { count: pubCount } = await supabase.from('publications').select('*', { count: 'exact', head: true });
                const { count: pendingCount } = await supabase.from('publications').select('*', { count: 'exact', head: true }).eq('position', 'en attente');
                const { count: validCount } = await supabase.from('publications').select('*', { count: 'exact', head: true }).eq('position', 'validé');

                setCounts({
                    users: usersCount || 0,
                    publications: pubCount || 0,
                    pending: pendingCount || 0,
                    validated: validCount || 0
                });

                // 2. Recent Users
                const { data: rUsers } = await supabase
                    .from('profiles')
                    .select('*')
                    .order('created_at', { ascending: false })
                    .limit(5);
                setRecentUsers(rUsers || []);

                // 3. Recent Publications
                const { data: rPubs } = await supabase
                    .from('publications')
                    .select('*')
                    .order('created_at', { ascending: false })
                    .limit(5);
                setRecentPubs(rPubs || []);

            } catch (error) {
                console.error("Error loading dashboard:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const stats = [
        { title: "Total Utilisateurs", value: counts.users, icon: Users, color: "violet" },
        { title: "Total Manuscrits", value: counts.publications, icon: BookOpen, color: "blue" },
        { title: "En attente", value: counts.pending, icon: Clock, color: "amber" },
        { title: "Validés", value: counts.validated, icon: CheckCircle, color: "green" },
    ];

    if (loading) return <div className="p-8 text-center text-gray-500">Chargement du tableau de bord...</div>;

    return (
        <div className="space-y-8">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-800">
                    {t('admin_dashboard_title', 'Tableau de bord')}
                </h1>
                <p className="text-gray-500 mt-1">
                    {t('admin_dashboard_subtitle', 'Bienvenue dans votre espace de gestion.')}
                </p>
            </div>

            {/* Profile Completion Card */}
            <ProfileCompletionCard />

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <StatCard key={index} {...stat} />
                ))}
            </div>

            {/* Recent Activity Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Users */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="font-bold text-gray-800 mb-4">Inscriptions Récentes</h3>
                    <div className="space-y-4">
                        {recentUsers.length === 0 ? (
                            <p className="text-gray-400 text-sm">Aucun utilisateur récent.</p>
                        ) : (
                            recentUsers.map((u) => (
                                <div key={u.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold">
                                            {u.full_name?.charAt(0) || 'U'}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-800">{u.full_name || 'Utilisateur'}</p>
                                            <p className="text-xs text-gray-400">{u.email}</p>
                                        </div>
                                    </div>
                                    <span className="text-xs text-gray-400">
                                        {u.created_at ? new Date(u.created_at).toLocaleDateString() : ''}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Recent Submissions */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="font-bold text-gray-800 mb-4">Derniers Manuscrits</h3>
                    <div className="space-y-4">
                        {recentPubs.length === 0 ? (
                            <p className="text-gray-400 text-sm">Aucun manuscrit récent.</p>
                        ) : (
                            recentPubs.map((p) => (
                                <div key={p.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                                            <BookOpen className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-800 truncate max-w-[150px]">{p.title_main}</p>
                                            <p className="text-xs text-gray-400">{new Date(p.created_at).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${p.position === 'validé' ? 'bg-green-50 text-green-600' :
                                        p.position === 'en attente' ? 'bg-amber-50 text-amber-600' :
                                            'bg-gray-100 text-gray-600'
                                        }`}>
                                        {p.position}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardHome;
