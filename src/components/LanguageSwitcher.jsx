import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const LanguageSwitcher = () => {
    const { i18n } = useTranslation();

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    return (
        <div className="relative group">
            <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors text-slate-300 hover:text-white">
                <Globe className="w-5 h-5" />
                <span className="uppercase text-sm font-medium">{i18n.language.split('-')[0]}</span>
            </button>

            {/* Dropdown */}
            <div className={`absolute top-full mt-2 w-32 bg-slate-900 border border-slate-700 rounded-lg shadow-xl overflow-hidden hidden group-hover:block z-50 ${document.dir === 'rtl' ? 'left-0' : 'right-0'}`}>
                <button
                    onClick={() => changeLanguage('fr')}
                    className={`w-full text-start px-4 py-2 text-sm hover:bg-slate-800 transition-colors ${i18n.language === 'fr' ? 'text-violet-400 font-bold' : 'text-slate-300'}`}
                >
                    Français
                </button>
                <button
                    onClick={() => changeLanguage('ar')}
                    className={`w-full text-start px-4 py-2 text-sm hover:bg-slate-800 transition-colors font-arabic ${i18n.language === 'ar' ? 'text-violet-400 font-bold' : 'text-slate-300'}`}
                >
                    العربية
                </button>
                <button
                    onClick={() => changeLanguage('en')}
                    className={`w-full text-start px-4 py-2 text-sm hover:bg-slate-800 transition-colors ${i18n.language === 'en' ? 'text-violet-400 font-bold' : 'text-slate-300'}`}
                >
                    English
                </button>
            </div>
        </div>
    );
};

export default LanguageSwitcher;
