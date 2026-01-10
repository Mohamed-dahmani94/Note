import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { Mail, Facebook, Instagram, Twitter } from 'lucide-react';

const Landing = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex flex-col bg-white text-gray-900 font-sans">

            {/* --- HEADER --- */}
            <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

                    {/* Logo Section */}
                    <div className="flex items-center gap-2">
                        {/* Placeholder for Circular Logo */}
                        <div className="w-12 h-12 bg-note-purple text-white rounded-full flex items-center justify-center font-bold text-lg shadow-md border-2 border-note-purple">
                            Note
                        </div>
                    </div>

                    {/* Middle Navigation (Hidden on Mobile) */}
                    <nav className="hidden md:flex gap-8 text-sm font-medium text-gray-600">
                        <a href="#" className="hover:text-note-purple transition-colors">{t('menu_home')}</a>
                        <a href="#" className="hover:text-note-purple transition-colors">{t('menu_books')}</a>
                        <a href="#" className="hover:text-note-purple transition-colors">{t('menu_about')}</a>
                    </nav>

                    {/* Right Actions */}
                    <div className="flex items-center gap-4">
                        <LanguageSwitcher />
                        <button
                            onClick={() => navigate('/connexion')}
                            className="hidden md:block px-6 py-2 border-2 border-gray-900 text-gray-900 rounded-md font-bold hover:bg-gray-900 hover:text-white transition-all text-sm"
                        >
                            {t('login_btn')}
                        </button>
                    </div>
                </div>
            </header>

            {/* --- HERO SECTION --- */}
            <section className="flex-1 flex flex-col justify-center items-center text-center px-6 py-20 bg-gray-50/50">
                <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight max-w-4xl">
                    {t('hero_title')}
                </h1>
                <p className="text-xl md:text-2xl text-gray-500 mb-12 max-w-2xl font-light">
                    {t('hero_subtitle')}
                </p>

                <button
                    onClick={() => navigate('/connexion')}
                    className="bg-note-purple text-white px-10 py-4 rounded-full text-lg md:text-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all w-full md:w-auto max-w-sm"
                >
                    {t('become_writer')}
                </button>
            </section>

            {/* --- FOOTER --- */}
            <footer className="bg-gray-900 text-white py-12 text-center">
                <h3 className="text-xl font-bold mb-2">Note Publishing</h3>
                <p className="text-gray-400 mb-8 max-w-md mx-auto">{t('footer_text')}</p>

                <div className="flex justify-center gap-6 mb-8">
                    <Facebook className="w-6 h-6 text-gray-400 hover:text-note-purple cursor-pointer transition-colors" />
                    <Instagram className="w-6 h-6 text-gray-400 hover:text-note-purple cursor-pointer transition-colors" />
                    <Twitter className="w-6 h-6 text-gray-400 hover:text-note-purple cursor-pointer transition-colors" />
                </div>

                <a
                    href="mailto:contact@notedz.com"
                    className="inline-flex items-center gap-2 px-6 py-2 border border-note-purple text-note-purple rounded-md hover:bg-note-purple hover:text-white transition-all font-medium"
                >
                    <Mail className="w-4 h-4" />
                    {t('contact_us')}
                </a>

                <p className="mt-8 text-xs text-gray-600">
                    &copy; 2026 Note Publishing. All rights reserved.
                </p>
            </footer>
        </div>
    );
};

export default Landing;
