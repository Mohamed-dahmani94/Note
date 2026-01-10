import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { Mail, BookOpen, PenTool } from 'lucide-react';

const Landing = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const isRTL = i18n.language === 'ar';

    return (
        <div className="min-h-screen flex flex-col bg-[#FDFBF7] text-[#1A1A1A] font-sans overflow-x-hidden selection:bg-[#9274AC]/20">

            {/* --- DECORATIVE BACKGROUND ELEMENTS --- */}
            {/* Top Right Purple Book Spine */}
            <div className={`absolute top-0 ${isRTL ? 'left-0' : 'right-0'} w-32 h-64 bg-[#9274AC] rounded-b-lg shadow-2xl opacity-90 z-0 hidden md:block`}>
                <div className="h-full w-4 bg-[#D4AF37] ml-4 opacity-50"></div> {/* Gold spine accent */}
            </div>
            {/* Floating Paper Left */}
            <div className={`absolute top-40 ${isRTL ? 'right-[-50px]' : 'left-[-50px]'} w-64 h-80 bg-white shadow-xl rotate-12 z-0 hidden lg:block border border-gray-100`}></div>


            {/* --- HEADER --- */}
            <header className="sticky top-0 z-50 bg-[#FDFBF7]/90 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

                    {/* Logo */}
                    <div className="flex items-center gap-2 z-10">
                        <div className="w-12 h-12 bg-transparent border-2 border-[#9274AC] text-[#9274AC] rounded-full flex items-center justify-center font-bold text-lg shadow-sm">
                            Note
                        </div>
                    </div>

                    {/* Nav (Centered) */}
                    <nav className="hidden md:flex gap-10 text-base font-medium text-gray-600 z-10">
                        <a href="#" className="hover:text-[#9274AC] transition-colors relative group">
                            {t('menu_home')}
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#9274AC] transition-all group-hover:w-full"></span>
                        </a>
                        <a href="#" className="hover:text-[#9274AC] transition-colors relative group">
                            {t('menu_books')}
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#9274AC] transition-all group-hover:w-full"></span>
                        </a>
                        <a href="#" className="hover:text-[#9274AC] transition-colors relative group">
                            {t('menu_about')}
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#9274AC] transition-all group-hover:w-full"></span>
                        </a>
                    </nav>

                    {/* Right Actions */}
                    <div className="flex items-center gap-4 z-10">
                        <LanguageSwitcher />
                        <button
                            onClick={() => navigate('/connexion')}
                            className="bg-[#1A1A1A] text-white px-6 py-2 rounded-md font-bold hover:bg-gray-800 transition-all text-sm shadow-lg hover:shadow-xl"
                        >
                            {t('login_btn')}
                        </button>
                    </div>
                </div>
            </header>

            {/* --- HERO SECTION --- */}
            <section className="flex-1 flex flex-col justify-center items-center text-center px-6 py-12 relative z-10">

                {/* Main Title Area */}
                <div className="max-w-4xl mx-auto relative">
                    <h1 className="text-6xl md:text-8xl font-black text-[#1A1A1A] mb-4 tracking-tight leading-none font-cairo">
                        {i18n.language === 'ar' ? 'دار نوت للنشر' : 'Note Publishing'}
                    </h1>
                    <p className="text-2xl md:text-4xl text-gray-500 font-light mb-8">
                        {t('hero_subtitle', "Where words come to life")}
                    </p>
                    <p className="text-gray-600 max-w-2xl mx-auto mb-12 text-lg leading-relaxed">
                        {t('hero_desc', "Note Publishing gathers the scattered words, infusing them with life, turning manuscripts into masterpieces.")}
                    </p>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col md:flex-row gap-6 w-full max-w-md justify-center">
                    <button
                        onClick={() => navigate('/connexion')}
                        className="bg-[#1A1A1A] text-white px-8 py-4 rounded-lg text-lg font-bold shadow-lg hover:transform hover:-translate-y-1 transition-all flex items-center justify-center gap-3"
                    >
                        {t('login_btn')}
                    </button>
                    <button
                        onClick={() => navigate('/connexion')}
                        className="bg-[#9274AC] text-white px-8 py-4 rounded-lg text-lg font-bold shadow-lg hover:bg-opacity-90 hover:transform hover:-translate-y-1 transition-all flex items-center justify-center gap-3"
                    >
                        <PenTool className="w-5 h-5" />
                        {t('become_writer')}
                    </button>
                </div>

                {/* Bottom Deco */}
                <div className="mt-20 w-full max-w-5xl h-2 bg-gradient-to-r from-transparent via-[#9274AC] to-transparent opacity-20"></div>

            </section>

            {/* --- FEATURETE / "ABOUT" MOCKUP SECTION --- */}
            <section className="py-20 px-6 max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center relative z-10">
                {/* Text Side */}
                <div className={`${isRTL ? 'order-1 md:order-1' : 'order-1 md:order-1'}`}>
                    <div className="border-l-4 border-[#9274AC] pl-6 py-2">
                        <h2 className="text-3xl font-bold mb-4">{t('menu_about')}</h2>
                        <p className="text-gray-600 leading-relaxed text-lg">
                            {t('about_text', "Note Publishing isn't just a publisher; we are partners in your creative journey. We honor the written word and strive to bring every story to the world with the dignity it deserves.")}
                        </p>
                    </div>
                </div>

                {/* Visual Side (Book Frame) */}
                <div className="relative h-80 w-full bg-white shadow-2xl border-8 border-[#D4AF37]/20 p-8 flex items-center justify-center rotate-2 hover:rotate-0 transition-all duration-500">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-[#9274AC] clip-path-polygon"></div>
                    <BookOpen className="w-24 h-24 text-[#9274AC] opacity-20" />
                    <p className="absolute bottom-4 left-4 text-xs text-gray-300">EST. 2026</p>
                </div>
            </section>

            {/* --- FOOTER --- */}
            <footer className="bg-white border-t border-gray-100 py-12 relative z-10">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-[#9274AC] rounded-full"></div>
                        <span className="font-bold text-xl tracking-tighter">Note.dz</span>
                    </div>

                    <p className="text-gray-500 text-sm">{t('footer_text')}</p>

                    <a href="mailto:contact@notedz.com" className="text-[#9274AC] font-medium hover:underline">
                        {t('contact_us')}
                    </a>
                </div>
                {/* Bottom bar decor */}
                <div className="h-2 w-32 bg-[#9274AC] absolute bottom-0 left-10"></div>
                <div className="h-2 w-16 bg-[#D4AF37] absolute bottom-0 left-44"></div>
            </footer>
        </div>
    );
};

export default Landing;
