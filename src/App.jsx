import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Landing from './pages/Landing';
import Login from './pages/auth/Login';
import AdminLayout from './components/layouts/AdminLayout';
import AdminRoute from './components/auth/AdminRoute';
import DashboardHome from './pages/admin/DashboardHome';
import UsersManager from './pages/admin/UsersManager';
import UserDetails from './pages/admin/UserDetails';
import CreateUser from './pages/admin/CreateUser';
import ContentManager from './pages/admin/ContentManager';
import PublicationForm from './pages/admin/PublicationForm';
import AIEvaluationManager from './pages/admin/AIEvaluationManager';
import AuthorLayout from './components/layouts/AuthorLayout';
import AuthorRoute from './components/auth/AuthorRoute';
import AuthorDashboard from './pages/author/AuthorDashboard';
import AuthorContentManager from './pages/author/AuthorContentManager';
import ProfilePage from './pages/common/ProfilePage';

function App() {
    const { i18n } = useTranslation();

    // Dynamic RTL/LTR handling
    useEffect(() => {
        const dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.dir = dir;
        document.documentElement.lang = i18n.language;
    }, [i18n.language]);

    return (
        <BrowserRouter>
            <AuthProvider>
                <div className={`min-h-screen bg-white selection:bg-violet-500/30 font-sans`}>
                    <Routes>
                        <Route path="/" element={<Landing />} />
                        <Route path="/connexion" element={<Login />} />

                        {/* Admin Routes */}
                        <Route path="/admin" element={
                            <AdminRoute>
                                <AdminLayout />
                            </AdminRoute>
                        }>
                            <Route index element={<DashboardHome />} />
                            <Route path="users" element={<UsersManager />} />
                            <Route path="users/new" element={<CreateUser />} />
                            <Route path="users/:id" element={<UserDetails />} />
                            <Route path="content" element={<ContentManager />} />
                            <Route path="content/new" element={<PublicationForm />} />
                            <Route path="content/:id" element={<PublicationForm />} />
                            <Route path="ai-analysis" element={<AIEvaluationManager />} />
                            <Route path="profile" element={<ProfilePage />} />
                        </Route>

                        {/* Author Routes */}
                        <Route path="/author" element={
                            <AuthorRoute>
                                <AuthorLayout />
                            </AuthorRoute>
                        }>
                            <Route index element={<AuthorDashboard />} />
                            <Route path="content" element={<AuthorContentManager />} />
                            {/* We reuse ContentManager but we need to make sure it filters by user. 
                                Actually ContentManager queries ALL. We need to tweak ContentManager to respect RLS or filter by user if author.
                                Thanks to RLS "Authors can view own", ContentManager will naturally only return own rows! 
                                So we can reuse it! Cool.
                            */}
                            <Route path="content/new" element={<PublicationForm />} />
                            <Route path="content/:id" element={<PublicationForm />} />
                            <Route path="profile" element={<ProfilePage />} />
                        </Route>
                    </Routes>
                </div>
            </AuthProvider>
        </BrowserRouter>
    )
}

export default App
