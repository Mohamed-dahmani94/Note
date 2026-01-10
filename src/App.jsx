import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Landing from './pages/Landing';
import Login from './pages/auth/Login';

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
                        {/* Placeholder for Admin until recreated */}
                        <Route path="/admin" element={<div className="p-8 text-center text-2xl">Bienvenue Admin (Page en reconstruction)</div>} />
                    </Routes>
                </div>
            </AuthProvider>
        </BrowserRouter>
    )
}

export default App
