import { useState } from 'react';
import { Search, Filter, MoreVertical, UserPlus, Mail, Shield, CheckCircle2, XCircle } from 'lucide-react';

export default function Users() {
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');

    // Mock Users Data with multiple roles
    // Mock Users Data - EMPTY for testing
    const [users, setUsers] = useState([]);

    const rolesMap = {
        admin: { label: "Administrateur", color: "bg-red-500/10 text-red-400 border-red-500/20" },
        mod: { label: "Modérateur", color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
        comite: { label: "Comité de lecture", color: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
        auteur: { label: "Auteur", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === 'all' || user.roles.includes(roleFilter);
        return matchesSearch && matchesRole;
    });

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black text-white tracking-tight">Gestion des Utilisateurs</h2>
                    <p className="text-slate-400 font-medium">Gérez les accès et les rôles de la plateforme</p>
                </div>
                <button className="btn-primary flex items-center gap-2 px-6 py-3 rounded-2xl whitespace-nowrap">
                    <UserPlus size={20} />
                    Nouvel Utilisateur
                </button>
            </div>

            {/* --- FILTERS --- */}
            <div className="glass-panel p-4 flex flex-col lg:flex-row gap-4 bg-slate-900/40">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input
                        type="text"
                        placeholder="Rechercher par nom ou email..."
                        className="w-full bg-slate-950/50 border-white/5 pl-12 pr-4 py-3 rounded-xl focus:border-cyan-500 transition-all outline-none text-white text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex flex-wrap gap-2 items-center">
                    <Filter size={18} className="text-slate-500 mr-2" />
                    <button
                        onClick={() => setRoleFilter('all')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${roleFilter === 'all' ? 'bg-white text-slate-900' : 'bg-white/5 text-slate-400 hover:text-white'}`}
                    >
                        Tous
                    </button>
                    {Object.entries(rolesMap).map(([key, config]) => (
                        <button
                            key={key}
                            onClick={() => setRoleFilter(key)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${roleFilter === key ? config.color : 'bg-white/5 text-slate-400 border-transparent hover:border-white/10'}`}
                        >
                            {config.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* --- USERS TABLE --- */}
            <div className="glass-panel overflow-hidden bg-slate-900/20 border-white/5">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-white/5 border-b border-white/5">
                                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Utilisateur</th>
                                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Rôles</th>
                                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Statut</th>
                                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Inscription</th>
                                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredUsers.map((user) => (
                                <tr key={user.id} className="group hover:bg-white/[0.02] transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center font-bold text-white border border-white/10 group-hover:scale-110 transition-transform">
                                                {user.name.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <div>
                                                <div className="font-bold text-white">{user.name}</div>
                                                <div className="text-xs text-slate-500 flex items-center gap-1">
                                                    <Mail size={12} /> {user.email}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-1">
                                            {user.roles.map(role => (
                                                <span key={role} className={`px-2 py-0.5 rounded-full text-[10px] font-black border uppercase tracking-tighter ${rolesMap[role]?.color}`}>
                                                    {rolesMap[role]?.label}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {user.status === 'active' ? (
                                            <span className="flex items-center gap-1.5 text-emerald-500 text-xs font-bold">
                                                <CheckCircle2 size={14} /> Actif
                                            </span>
                                        ) : user.status === 'pending' ? (
                                            <span className="flex items-center gap-1.5 text-amber-500 text-xs font-bold">
                                                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></div> En attente
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1.5 text-slate-500 text-xs font-bold">
                                                <XCircle size={14} /> Inactif
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-400 font-medium">
                                        {user.joinDate}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="p-2 text-slate-600 hover:text-white transition-colors">
                                            <MoreVertical size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredUsers.length === 0 && (
                    <div className="py-20 flex flex-col items-center text-slate-500">
                        <Shield size={48} className="mb-4 opacity-20" />
                        <p className="font-bold">Aucun utilisateur trouvé</p>
                        <p className="text-sm">Essayez de modifier vos filtres ou votre recherche</p>
                    </div>
                )}
            </div>
        </div>
    );
}
