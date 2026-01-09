import { Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Register from './pages/auth/Register';
import Login from './pages/auth/Login';
import AuthorLayout from './layouts/AuthorLayout';
import AdminLayout from './layouts/AdminLayout';
import AuthorDashboard from './pages/author/Dashboard';
import NewSubmission from './pages/author/NewSubmission';
import AdminDashboard from './pages/admin/Dashboard';
import Settings from './pages/admin/Settings';
import Users from './pages/admin/Users';
import Manuscripts from './pages/admin/Manuscripts';
import SubmissionDetail from './pages/admin/SubmissionDetail';
import PublicSubmission from './pages/PublicSubmission';
import { AuthProvider } from './contexts/AuthContext';
import { ConfigProvider } from './contexts/ConfigContext';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <ConfigProvider>
        <div className="min-h-screen text-slate-100">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/soumission-rapide" element={<PublicSubmission />} />
            <Route path="/connexion" element={<Login />} />
            <Route path="/inscription" element={<Register />} />

            {/* PROTECTED: Author Routes (Only 'author' role) */}
            <Route
              path="/auteur"
              element={
                <ProtectedRoute allowedRoles={['author']}>
                  <AuthorLayout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<AuthorDashboard />} />
              <Route path="category-other" element={<NewSubmission />} />
              <Route path="nouvelle-soumission" element={<NewSubmission />} />
              <Route path="profil" element={<AuthorDashboard />} /> {/* Placeholder */}
            </Route>

            {/* PROTECTED: Admin Routes (Only 'admin' role) */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="soumissions" element={<Manuscripts />} />
              <Route path="soumissions/:id" element={<SubmissionDetail />} />
              <Route path="utilisateurs" element={<Users />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Routes>
        </div>
      </ConfigProvider>
    </AuthProvider>
  )
}

export default App
