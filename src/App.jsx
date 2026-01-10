import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import LanguageSwitcher from './components/LanguageSwitcher';
import { AuthProvider } from './contexts/AuthContext';
import Login from './pages/auth/Login';

// Landing Component (Internal for simple structure)
const Landing = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
            {/* Navbar Placeholder */}
            <div className="fixed top-0 w-full p-6 flex justify-between items-center max-w-7xl mx-auto z-10">
                <h1 className="text-xl font-bold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                    Note.dz
                </h1>
                <LanguageSwitcher />
            </div>

            <div className="text-center max-w-2xl relative z-0">
                <h1 className="text-5xl font-bold mb-6 leading-tight">
                    {t('welcome')}
                </h1>
                <p className="text-slate-400 text-xl mb-8">
                    {t('subtitle')}
                </p>

                <div className="flex gap-4 justify-center">
                    <button
                        onClick={() => navigate('/connexion')}
                        className="bg-slate-800 hover:bg-slate-700 text-white px-8 py-3 rounded-full font-medium transition-all"
                    >
                        {t('login')}
                    </button>
                </div>
            </div>
        </div>
    );
}

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
                <div className="min-h-screen bg-slate-950 text-white selection:bg-violet-500/30">
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
