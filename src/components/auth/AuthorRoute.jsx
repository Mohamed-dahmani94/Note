import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../supabaseClient';

const AuthorRoute = ({ children }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-note-purple"></div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/connexion" state={{ from: location }} replace />;
    }

    // Strict role check: Must be 'author' (or 'admin' if we want admins to see it too, but better separate)
    // Actually, allowing admins to see author view is good for debugging, but let's stick to author only or admin.
    const isAuthor = user.app_metadata?.role === 'author' || user.role === 'author';
    const isAdmin = user.app_metadata?.role === 'admin' || user.role === 'admin';

    if (!isAuthor && !isAdmin) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
                <div className="bg-white p-8 rounded-2xl shadow-lg border border-red-100 max-w-md w-full text-center">
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Accès Refusé</h1>
                    <p className="text-gray-500 mb-6">
                        Compte connecté : <strong>{user.email}</strong><br />
                        Rôle requis : Auteur
                    </p>
                    <button
                        onClick={async () => {
                            await supabase.auth.signOut();
                            window.location.href = '/connexion';
                        }}
                        className="bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700 transition-all shadow-md"
                    >
                        Se déconnecter
                    </button>
                </div>
            </div>
        );
    }

    return children;
};

export default AuthorRoute;
