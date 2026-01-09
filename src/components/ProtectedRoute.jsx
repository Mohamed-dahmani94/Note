import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ children, allowedRoles }) {
    const { user } = useAuth();
    const location = useLocation();

    if (!user) {
        // Redirect to login while saving the attempted location
        return <Navigate to="/connexion" state={{ from: location }} replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Logic for unauthorized access (e.g., Author trying to access Admin)
        // For strict separation, we redirect them to their OWN dashboard, or a 403 page.
        // Here we redirect to their respective home to avoid them getting stuck.
        if (user.role === 'admin') return <Navigate to="/admin" replace />;
        if (user.role === 'author') return <Navigate to="/auteur/dashboard" replace />;
        return <Navigate to="/" replace />;
    }

    return children;
}
