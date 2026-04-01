import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { useLandingContent } from '../contexts/LandingContentContext';

const Landing = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const { content, loading } = useLandingContent();

    return (
        <div className="bg-surface text-on-surface overflow-x-hidden font-body">
            {/* Top Navigation Bar */}
            <nav className="fixed top-0 w-full z-50 bg-[#fbf9f5]/80 dark:bg-[#1b1c1a]/80 backdrop-blur-xl shadow-[0_12px_40px_rgba(108,80,133,0.08)]">
                <div className="flex justify-between items-center w-full px-8 py-6 max-w-screen-2xl mx-auto">
                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-3">
                            <img alt="Logo" className="h-10 w-auto" src="https://lh3.googleusercontent.com/aida/ADBb0uhUCAFYnTp51DrlLGRYvjT_DreRniKUHBsYcSl-1fi0oFztIOFp_OYYYmas2jNKvxa0_E4U7dmcR6_xYlld4WF4n26cflI0vSHUlto1CBs3lCbn6Kx4qbQaOhWXy0YvinxDEaXvnOZ21Jg0zOczxAkO5B-SxxdFH_F0CsBpMb76eA7FOp97GkiUdKeDIsfbulal7dwOPj7jDvw1OioL5JQDhhtEGMfDgvg-BRHMgfuZL60-X1tYXV43nsydq4S7uLeWPYT4KKfFqw" />
                            <span className="text-2xl font-headline font-bold text-primary">نوت | Note</span>
                        </div>
                        <div className="hidden md:flex gap-6 items-center">
                            <a className="text-primary font-bold border-b-2 border-primary pb-1" href="#">الرئيسية</a>
                            <a className="text-on-surface/70 hover:text-primary transition-colors" href="#">من نحن</a>
                            <a className="text-on-surface/70 hover:text-primary transition-colors" href="#">المؤلفون</a>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <LanguageSwitcher />
                        <button onClick={() => navigate('/connexion')} className="hidden md:block px-5 py-2 text-primary hover:opacity-80 transition-all font-medium">تسجيل الدخول</button>
                        <button onClick={() => navigate('/connexion')} className="bg-primary text-on-primary px-6 py-2.5 rounded-md hover:bg-primary-container transition-all duration-300 shadow-lg shadow-primary/20">سجل الآن</button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <header className="relative pt-32 pb-20 md:pt-48 md:pb-40 px-6 overflow-hidden">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16 relative z-10">
                    <div className="flex-1 text-center md:text-right">
                        <span className="text-sm uppercase tracking-[0.2em] text-primary font-bold mb-6 block font-label">The Digital Manuscript</span>
                        <h1 className="text-5xl md:text-7xl font-black mb-8 leading-[1.1] tracking-tight">
                            نوت | <span className="text-primary italic">لسنا مجرد</span> دار نشر
                        </h1>
                        <p className="text-lg md:text-xl text-on-surface-variant max-w-2xl ml-auto mb-10 leading-relaxed font-light">
                            نحن نؤمن بأن كل كاتب هو عالم بحد ذاته. في "نوت"، نحول مسوداتك إلى تحف فنية رقمية وورقية، ونبني الجسور بين خيالك والقراء في كل مكان. رحلتك الأدبية تبدأ من هنا.
                        </p>
                        <div className="flex flex-wrap gap-6 justify-center md:justify-start">
                            <button onClick={() => navigate('/connexion')} className="editorial-gradient text-white px-8 py-4 rounded-md text-lg font-semibold hover:opacity-90 transition-all transform hover:scale-105 shadow-xl shadow-primary/30">انضم إلينا</button>
                            <button onClick={() => navigate('/connexion')} className="bg-surface-container-highest text-on-surface px-8 py-4 rounded-md text-lg font-semibold hover:bg-outline-variant transition-all border-b-2 border-primary/20">أرسل عملك</button>
                        </div>
                    </div>
                    <div className="flex-1 relative">
                        <div className="relative w-full aspect-[4/5] rounded-sm overflow-hidden shadow-2xl rotate-3 transform transition-transform hover:rotate-0 duration-700">
                            <img className="w-full h-full object-cover" src={content.heroImage} alt="Hero" />
                        </div>
                        <div className="absolute -bottom-6 -left-6 w-72 p-8 bg-[#FFD700] shadow-2xl -rotate-3 hidden lg:block z-20">
                            <p className="font-headline italic text-[#1b1c1a] text-xl leading-snug font-medium">"الكتابة هي الرسم بالكلمات، والنشر هو إعطاء تلك الرسوم حياة."</p>
                            <p className="mt-4 font-bold text-sm text-[#1b1c1a]/80">— فريق نوت</p>
                        </div>
                    </div>
                </div>
                <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 -z-10 skew-x-12 translate-x-1/2"></div>
            </header>

            {/* About Us Section — DYNAMIC from Admin */}
            <section className="py-24 px-6 bg-surface-container-low">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
                        <div className="md:col-span-5 order-2 md:order-1">
                            <div className="aspect-square bg-surface-variant relative rounded-sm overflow-hidden shadow-inner">
                                <img className="w-full h-full object-cover mix-blend-multiply opacity-80" src={content.aboutImage} alt="About" />
                            </div>
                        </div>
                        <div className="md:col-span-7 order-1 md:order-2 space-y-8">
                            <h2 className="text-4xl md:text-5xl font-bold leading-tight">
                                {content.aboutTitle}<br/>
                                <span className="text-primary/60 font-light">{content.aboutSubtitle}</span>
                            </h2>
                            <p className="text-xl leading-loose text-on-surface-variant italic border-r-4 border-primary pr-6">
                                {content.aboutDescription}
                            </p>

                            {/* Dynamic Stats from Admin */}
                            {content.stats && content.stats.length > 0 && (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-6">
                                    {content.stats.map((stat, index) => (
                                        <div key={index} className="text-center p-4 bg-white/60 backdrop-blur-sm rounded-lg">
                                            <span className="material-symbols-outlined text-primary text-2xl mb-2 block">{stat.icon}</span>
                                            <span className="block text-3xl font-headline text-primary font-bold mb-1">{stat.value}</span>
                                            <span className="text-xs text-on-surface-variant leading-relaxed">{stat.description}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Our Authors — DYNAMIC from Admin */}
            <section className="py-32 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex justify-between items-end mb-16">
                        <div>
                            <span className="text-sm uppercase tracking-[0.2em] text-primary font-bold mb-4 block font-label">Literary Icons</span>
                            <h2 className="text-4xl font-bold">مبدعون من مجتمعنا</h2>
                        </div>
                        <a className="text-primary font-semibold flex items-center gap-2 hover:gap-4 transition-all" href="#">
                            تصفح جميع المؤلفين <span className="material-symbols-outlined">arrow_back</span>
                        </a>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-6 h-auto md:h-[800px]">
                        {/* Featured Author (first featured one, or first author) */}
                        {content.authors && content.authors.length > 0 && (() => {
                            const featured = content.authors.find(a => a.featured) || content.authors[0];
                            return (
                                <div className="md:col-span-2 md:row-span-2 bg-surface-container relative overflow-hidden group min-h-[400px]">
                                    {featured.image ? (
                                        <img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" src={featured.image} alt={featured.name} />
                                    ) : (
                                        <div className="w-full h-full bg-surface-container-high flex items-center justify-center">
                                            <span className="material-symbols-outlined text-8xl text-on-surface-variant/20">person</span>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-10 text-white">
                                        <span className="bg-secondary text-on-secondary px-3 py-1 text-xs mb-4 w-fit rounded-full uppercase tracking-tighter">أكثر الكتب مبيعاً</span>
                                        <h3 className="text-3xl font-bold mb-2">{featured.name}</h3>
                                        <p className="text-white/70 italic">{featured.book}</p>
                                    </div>
                                </div>
                            );
                        })()}

                        {/* Other Authors */}
                        {content.authors && content.authors.filter(a => !(a.featured || a === content.authors[0])).slice(0, 1).map((author, index) => (
                            <div key={index} className="md:col-span-2 bg-surface-container-highest relative overflow-hidden group min-h-[300px]">
                                {author.image ? (
                                    <img className="w-full h-full object-cover group-hover:scale-105 transition-transform" src={author.image} alt={author.name} />
                                ) : (
                                    <div className="w-full h-full bg-surface-container-high flex items-center justify-center">
                                        <span className="material-symbols-outlined text-6xl text-on-surface-variant/20">person</span>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-primary/20 group-hover:bg-transparent transition-colors duration-300"></div>
                                <div className="absolute bottom-6 right-6 left-6 p-6 bg-white/90 backdrop-blur-md rounded-sm">
                                    <h3 className="text-xl font-bold text-primary">{author.name}</h3>
                                    <p className="text-sm text-on-surface-variant">{author.book}</p>
                                </div>
                            </div>
                        ))}

                        {/* CTA Card */}
                        <div className="bg-primary p-8 flex flex-col justify-center text-white text-center min-h-[300px]">
                            <span className="material-symbols-outlined text-4xl mb-4">edit_note</span>
                            <h3 className="text-lg font-bold mb-2">كن أنت المؤلف القادم</h3>
                            <p className="text-white/70 text-xs">نحن بانتظار مسودتك الأولى</p>
                        </div>

                        {/* Visual Card */}
                        <div className="bg-surface-container-low relative overflow-hidden group min-h-[300px]">
                            <img className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" src={content.typewriterImage} alt="Typewriter" />
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-24 px-6 bg-[#f2efea]">
                <div className="max-w-7xl mx-auto text-center mb-20">
                    <h2 className="text-4xl font-bold mb-4">رحلة مخطوطتك معنا</h2>
                    <p className="text-on-surface-variant">بسيطة، شفافة، واحترافية.</p>
                </div>
                <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 relative">
                    <div className="hidden md:flex absolute top-12 left-0 w-full justify-around -z-10 px-24">
                        <div className="flex gap-2">
                            <div className="w-2 h-2 rounded-full bg-outline-variant"></div>
                            <div className="w-2 h-2 rounded-full bg-outline-variant"></div>
                            <div className="w-2 h-2 rounded-full bg-outline-variant"></div>
                        </div>
                        <div className="flex gap-2">
                            <div className="w-2 h-2 rounded-full bg-outline-variant"></div>
                            <div className="w-2 h-2 rounded-full bg-outline-variant"></div>
                            <div className="w-2 h-2 rounded-full bg-outline-variant"></div>
                        </div>
                    </div>
                    <div className="flex flex-col items-center text-center group">
                        <div className="w-24 h-24 rounded-full bg-surface-container-lowest shadow-xl flex items-center justify-center mb-8 border-b-4 border-primary group-hover:scale-110 transition-transform">
                            <span className="material-symbols-outlined text-primary text-4xl">person_add</span>
                        </div>
                        <h3 className="text-2xl font-bold mb-4">1. إنشاء حساب</h3>
                        <p className="text-on-surface-variant leading-relaxed">انضم إلى مجتمعنا من خلال ملف تعريف يعكس هويتك الأدبية واهتماماتك.</p>
                    </div>
                    <div className="flex flex-col items-center text-center group">
                        <div className="w-24 h-24 rounded-full bg-surface-container-lowest shadow-xl flex items-center justify-center mb-8 border-b-4 border-primary group-hover:scale-110 transition-transform">
                            <span className="material-symbols-outlined text-primary text-4xl">upload_file</span>
                        </div>
                        <h3 className="text-2xl font-bold mb-4">2. أرسل عملك</h3>
                        <p className="text-on-surface-variant leading-relaxed">ارفع مخطوطتك عبر منصتنا الآمنة، وسيتولى فريق التقييم مراجعتها خلال أيام.</p>
                    </div>
                    <div className="flex flex-col items-center text-center group">
                        <div className="w-24 h-24 rounded-full editorial-gradient shadow-xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                            <span className="material-symbols-outlined text-white text-4xl">auto_stories</span>
                        </div>
                        <h3 className="text-2xl font-bold mb-4">3. انشر للعالم</h3>
                        <p className="text-on-surface-variant leading-relaxed">بمجرد القبول، نبدأ سوياً رحلة التصميم، التدقيق، والوصول إلى رفوف المكتبات.</p>
                    </div>
                </div>
            </section>

            {/* Call to Action Section */}
            <section className="py-32 px-6 relative overflow-hidden bg-primary">
                <div className="absolute inset-0 opacity-10">
                    <img className="w-full h-full object-cover" src={content.ctaImage} alt="CTA Background" />
                </div>
                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <h2 className="text-4xl md:text-6xl font-bold text-white mb-8 leading-tight">هل لديك حكاية لم تُروَ بعد؟</h2>
                    <p className="text-white/80 text-xl mb-12 max-w-2xl mx-auto leading-relaxed">
                        لا تدع كلماتك حبيسة الأدراج. نحن هنا لنمنح قصتك الصوت الذي تستحقه والمنصة التي تليق بها.
                    </p>
                    <div className="bg-surface p-2 rounded-lg max-w-md mx-auto flex flex-col sm:flex-row gap-2 shadow-2xl">
                        <input className="flex-grow border-none outline-none focus:ring-0 text-on-surface bg-transparent px-4 py-4 font-body" placeholder="بريدك الإلكتروني" type="email" />
                        <button className="editorial-gradient text-white px-8 py-4 rounded-md font-bold hover:opacity-90 transition-all whitespace-nowrap">ابدأ رحلتك الآن</button>
                    </div>
                    <p className="text-white/50 text-xs mt-6">بانضمامك إلينا، أنت توافق على شروط النشر وسياسة الخصوصية.</p>
                </div>
            </section>

            {/* Footer */}
            <footer className="w-full border-t border-[#6c5085]/10 bg-[#fbf9f5] dark:bg-[#1b1c1a]">
                <div className="flex flex-col md:flex-row justify-between items-center px-12 py-16 w-full gap-8 max-w-screen-2xl mx-auto">
                    <div className="flex flex-col items-center md:items-start gap-4">
                        <img alt="Note Logo" className="h-10 w-auto" src="https://lh3.googleusercontent.com/aida/ADBb0uhUCAFYnTp51DrlLGRYvjT_DreRniKUHBsYcSl-1fi0oFztIOFp_OYYYmas2jNKvxa0_E4U7dmcR6_xYlld4WF4n26cflI0vSHUlto1CBs3lCbn6Kx4qbQaOhWXy0YvinxDEaXvnOZ21Jg0zOczxAkO5B-SxxdFH_F0CsBpMb76eA7FOp97GkiUdKeDIsfbulal7dwOPj7jDvw1OioL5JQDhhtEGMfDgvg-BRHMgfuZL60-X1tYXV43nsydq4S7uLeWPYT4KKfFqw" />
                        <p className="text-[#1b1c1a]/60 dark:text-[#fbf9f5]/60 text-sm max-w-xs text-center md:text-right">© 2024 نوت للنشر والتوزيع. لسنا مجرد دار نشر. نحن بيئة للإبداع.</p>
                    </div>
                    <div className="flex flex-wrap justify-center gap-8">
                        <a className="font-sans text-sm tracking-wide uppercase text-[#1b1c1a]/60 dark:text-[#fbf9f5]/60 hover:text-primary transition-colors" href="#">اتصل بنا</a>
                        <a className="font-sans text-sm tracking-wide uppercase text-[#1b1c1a]/60 dark:text-[#fbf9f5]/60 hover:text-primary transition-colors" href="#">سياسة الخصوصية</a>
                        <a className="font-sans text-sm tracking-wide uppercase text-[#1b1c1a]/60 dark:text-[#fbf9f5]/60 hover:text-primary transition-colors" href="#">الأسئلة الشائعة</a>
                    </div>
                    <div className="flex gap-6">
                        <a className="text-[#1b1c1a]/60 hover:text-primary transition-all" href="#"><span className="material-symbols-outlined">social_leaderboard</span></a>
                        <a className="text-[#1b1c1a]/60 hover:text-primary transition-all" href="#"><span className="material-symbols-outlined">photo_camera</span></a>
                        <a className="text-[#1b1c1a]/60 hover:text-primary transition-all" href="#"><span className="material-symbols-outlined">brand_family</span></a>
                    </div>
                </div>
            </footer>

            {/* FAB for Quick Submission */}
            <button onClick={() => navigate('/connexion')} className="fixed bottom-8 left-8 w-16 h-16 rounded-full bg-secondary shadow-2xl flex items-center justify-center text-on-secondary hover:scale-110 transition-transform z-40">
                <span className="material-symbols-outlined text-3xl">add_circle</span>
            </button>
        </div>
    );
};

export default Landing;
