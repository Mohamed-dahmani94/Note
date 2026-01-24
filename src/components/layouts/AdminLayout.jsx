import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import {
    LayoutDashboard,
    Users,
    BookOpen,
    Settings,
    LogOut,
    Menu,
    X,
    Bell
} from 'lucide-react';
import LanguageSwitcher from '../LanguageSwitcher';

const AdminLayout = () => {
    const { user, logout } = useAuth();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/connexion');
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    const navItems = [
        { path: '/admin', end: true, icon: LayoutDashboard, label: t('dashboard') },
        { path: '/admin/users', icon: Users, label: t('users') },
        { path: '/admin/content', icon: BookOpen, label: t('content') },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex font-sans">

            {/* --- SIDEBAR --- */}
            <aside
                className={`
                    fixed inset-y-0 start-0 z-30 w-64 bg-white border-e border-gray-200 transition-transform duration-300 ease-in-out
                    ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0 md:w-20 lg:w-64'}
                    print:hidden
                `}
            >
                <div className="h-full flex flex-col">
                    {/* Logo Area */}
                    <div className="h-16 flex items-center justify-center border-b border-gray-100">
                        <span className="text-xl font-bold text-note-purple">
                            {isSidebarOpen ? 'Note.dz Admin' : 'N.'}
                        </span>
                    </div>

                    {/* Nav Links */}
                    <nav className="flex-1 py-6 px-3 space-y-1">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                end={item.end}
                                className={({ isActive }) => `
                                    flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group
                                    ${isActive
                                        ? 'bg-note-purple/10 text-note-purple font-medium'
                                        : 'text-gray-500 hover:bg-gray-100/80 hover:text-gray-900'}
                                `}
                                title={!isSidebarOpen ? item.label : ''}
                            >
                                <item.icon className={`w-5 h-5 ${isSidebarOpen ? '' : 'mx-auto'}`} />
                                <span className={`whitespace-nowrap ${isSidebarOpen ? 'block' : 'hidden lg:block'}`}>
                                    {item.label}
                                </span>
                            </NavLink>
                        ))}
                    </nav>

                    {/* Footer / User Wrapper */}
                    <div className="p-4 border-t border-gray-100">
                        <NavLink
                            to="/admin/profile"
                            className={`flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors ${isSidebarOpen ? '' : 'justify-center'}`}
                        >
                            <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-note-purple font-bold">
                                {user?.full_name?.charAt(0) || 'A'}
                            </div>
                            <div className={`overflow-hidden transition-all ${isSidebarOpen ? 'w-auto opacity-100' : 'w-0 opacity-0 lg:w-auto lg:opacity-100'}`}>
                                <p className="text-sm font-medium text-gray-700 truncate">{user?.full_name || t('admin')}</p>
                                <p className="text-xs text-gray-400 truncate text-left">{t('my_profile')}</p>
                            </div>
                        </NavLink>
                    </div>
                </div>
            </aside>

            {/* --- MAIN CONTENT WRAPPER --- */}
            <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'ml-64 lg:ml-64' : 'ml-0 md:ml-20 lg:ml-64'} rtl:ml-0 rtl:mr-64 print:m-0`}>

                {/* Header */}
                <header className="h-16 bg-white border-b border-gray-200 sticky top-0 z-20 px-4 md:px-8 flex items-center justify-between print:hidden">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 md:hidden"
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                        <h2 className="text-lg font-semibold text-gray-800">
                            {/* Breadcrumb or Page Title could go here */}

                        </h2>
                    </div>

                    <div className="flex items-center gap-4">
                        <LanguageSwitcher />
                        <button className="p-2 relative rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                        </button>
                        <div className="h-6 w-px bg-gray-200 mx-1"></div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 text-sm font-medium text-red-500 hover:text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            <span className="hidden md:inline">{t('logout', 'Déconnexion')}</span>
                        </button>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-6 md:p-8 overflow-y-auto w-full">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
