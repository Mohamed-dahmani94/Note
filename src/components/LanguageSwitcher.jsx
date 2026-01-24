import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, ChevronDown } from 'lucide-react';

const LanguageSwitcher = () => {
    const { i18n } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
        setIsOpen(false);
    };

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const languages = [
        { code: 'fr', label: 'Français' },
        { code: 'ar', label: 'العربية' },
        { code: 'en', label: 'English' }
    ];

    const currentLang = languages.find(l => l.code === i18n.language) || languages[0];

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-full border border-gray-200 hover:border-[#9274AC] hover:text-[#9274AC] transition-all bg-white text-gray-700 shadow-sm"
            >
                <Globe className="w-4 h-4" />
                <span className="uppercase text-xs font-bold">{currentLang.code}</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className={`absolute top-full mt-2 w-40 bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden z-50 py-1 ${document.dir === 'rtl' ? 'left-0' : 'right-0'}`}>
                    {languages.map((lang) => (
                        <button
                            key={lang.code}
                            onClick={() => changeLanguage(lang.code)}
                            className={`w-full text-start px-4 py-3 text-sm transition-colors flex items-center justify-between
                                ${i18n.language === lang.code
                                    ? 'bg-[#9274AC]/10 text-[#9274AC] font-bold'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-[#9274AC]'
                                }`}
                        >
                            <span>{lang.label}</span>
                            {i18n.language === lang.code && <div className="w-2 h-2 rounded-full bg-[#9274AC]"></div>}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default LanguageSwitcher;
