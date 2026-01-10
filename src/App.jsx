import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './components/LanguageSwitcher';

function App() {
    const { t, i18n } = useTranslation();

    // Dynamic RTL/LTR handling
    useEffect(() => {
        const dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.dir = dir;
        document.documentElement.lang = i18n.language;
    }, [i18n.language]);

    return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4">

            {/* Navbar Placeholder */}
            <div className="fixed top-0 w-full p-4 flex justify-between items-center max-w-7xl mx-auto">
                <h1 className="text-xl font-bold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                    Note.dz
                </h1>
                <LanguageSwitcher />
            </div>

            <div className="text-center max-w-2xl">
                <h1 className="text-5xl font-bold mb-6 leading-tight">
                    {t('welcome')}
                </h1>
                <p className="text-slate-400 text-xl mb-8">
                    {t('subtitle')}
                </p>

                <div className="flex gap-4 justify-center">
                    <button className="bg-violet-600 hover:bg-violet-700 text-white px-8 py-3 rounded-full font-medium transition-all transform hover:scale-105">
                        {t('start')}
                    </button>
                    <button className="bg-slate-800 hover:bg-slate-700 text-white px-8 py-3 rounded-full font-medium transition-all">
                        {t('login')}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default App
