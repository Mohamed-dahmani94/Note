import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../supabaseClient';

const AdminRoute = ({ children }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        // Simple loading spinner or skeleton
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-note-purple"></div>
                <p className="text-gray-400 text-sm">Chargement de la session...</p>
                {/* Fallback if stuck */}
                <button
                    onClick={() => window.location.reload()}
                    className="mt-4 text-xs text-gray-400 hover:text-gray-600 underline"
                >
                    Si c'est trop long, cliquez ici
                </button>
            </div>
        );
    }

    // 2. Check if user is logged in
    if (!user) {
        return <Navigate to="/connexion" state={{ from: location }} replace />;
    }

    // 3. Check for Admin Role (Supports both JWT and DB Profile)
    const isAdmin = user.app_metadata?.role === 'admin' || user.role === 'admin';

    if (!isAdmin) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
                <div className="bg-white p-8 rounded-2xl shadow-lg border border-red-100 max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500 font-bold text-2xl">!</div>
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Accès Refusé</h1>
                    <p className="text-gray-500 mb-6">
                        Compte connecté : <strong>{user.email}</strong><br />
                        Rôle détecté : <span className="inline-block bg-gray-100 px-2 py-0.5 rounded text-sm font-mono mt-2">{user.role || 'undefined'}</span>
                    </p>
                    <div className="flex flex-col gap-3">
                        <button
                            onClick={() => window.location.href = '/'}
                            className="bg-gray-100 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-200 transition-all"
                        >
                            Retour à l'accueil
                        </button>
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
            </div>
        );
    }

    return children;
};

export default AdminRoute;
