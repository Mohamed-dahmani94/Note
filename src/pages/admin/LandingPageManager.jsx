import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLandingContent } from '../../contexts/LandingContentContext';
import ImageUploader from '../../components/ImageUploader';

const LandingPageManager = () => {
    const { t } = useTranslation();
    const {
        content,
        loading,
        saving,
        saveStatus,
        saveContent,
        updateField,
        updateStat,
        deleteStat,
        updateAuthor,
        deleteAuthor,
        addAuthor,
    } = useLandingContent();

    const handleSave = () => {
        saveContent(content);
    };

    const handleCancel = () => {
        window.location.reload();
    };

    const handleAddAuthor = () => {
        addAuthor({
            name: 'كاتب جديد',
            book: 'عنوان الكتاب',
            image: '',
            featured: false,
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <span className="material-symbols-outlined text-primary text-5xl animate-spin">progress_activity</span>
                    <p className="mt-4 text-on-surface-variant">جاري تحميل المحتوى...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen max-w-6xl mx-auto font-body text-on-surface pb-8">
            {/* TopAppBar */}
            <header className="flex justify-between items-center mb-12">
                <div>
                    <h2 className="text-3xl font-headline font-bold text-primary tracking-tight">إدارة المحتوى</h2>
                    <p className="text-on-surface-variant/60 font-body mt-2">تعديل وتنسيق الصفحة الرئيسية لمنصة نوت</p>
                </div>
                <div className="flex items-center gap-4">
                    {saveStatus === 'saved' && (
                        <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
                            <span className="material-symbols-outlined text-base">check_circle</span>
                            تم الحفظ بنجاح
                        </span>
                    )}
                    {saveStatus === 'error' && (
                        <span className="flex items-center gap-1 text-red-500 text-sm font-medium">
                            <span className="material-symbols-outlined text-base">error</span>
                            خطأ في الحفظ (تم الحفظ محلياً)
                        </span>
                    )}
                </div>
            </header>

            <div className="space-y-16">

                {/* ===== Section: Images de la page ===== */}
                <section>
                    <div className="flex items-center gap-4 mb-8">
                        <div className="h-px flex-1 bg-outline-variant/30"></div>
                        <h3 className="text-2xl font-headline text-primary">صور الصفحة الرئيسية</h3>
                        <div className="h-px flex-1 bg-outline-variant/30"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Hero Image */}
                        <div className="space-y-2">
                            <label className="block text-sm font-label text-on-surface-variant font-bold">صورة البطل الرئيسية</label>
                            <ImageUploader
                                currentImage={content.heroImage}
                                onImageUploaded={(url) => updateField('heroImage', url)}
                                folder="hero"
                                className="aspect-[4/5] rounded-lg overflow-hidden border border-outline-variant/30"
                                placeholderIcon="auto_stories"
                            />
                        </div>

                        {/* About Image */}
                        <div className="space-y-2">
                            <label className="block text-sm font-label text-on-surface-variant font-bold">صورة "من نحن"</label>
                            <ImageUploader
                                currentImage={content.aboutImage}
                                onImageUploaded={(url) => updateField('aboutImage', url)}
                                folder="about"
                                className="aspect-square rounded-lg overflow-hidden border border-outline-variant/30"
                                placeholderIcon="library_books"
                            />
                        </div>

                        {/* CTA Background Image */}
                        <div className="space-y-2">
                            <label className="block text-sm font-label text-on-surface-variant font-bold">خلفية قسم الدعوة</label>
                            <ImageUploader
                                currentImage={content.ctaImage}
                                onImageUploaded={(url) => updateField('ctaImage', url)}
                                folder="cta"
                                className="aspect-square rounded-lg overflow-hidden border border-outline-variant/30"
                                placeholderIcon="wallpaper"
                            />
                        </div>

                        {/* Typewriter Image */}
                        <div className="space-y-2">
                            <label className="block text-sm font-label text-on-surface-variant font-bold">صورة الآلة الكاتبة</label>
                            <ImageUploader
                                currentImage={content.typewriterImage}
                                onImageUploaded={(url) => updateField('typewriterImage', url)}
                                folder="decor"
                                className="aspect-square rounded-lg overflow-hidden border border-outline-variant/30"
                                placeholderIcon="keyboard"
                            />
                        </div>
                    </div>
                </section>

                {/* ===== Section: Why Choose Note ===== */}
                <section aria-labelledby="why-choose-title">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="h-px flex-1 bg-outline-variant/30"></div>
                        <h3 className="text-2xl font-headline text-primary" id="why-choose-title">لماذا تختار "نوت"؟</h3>
                        <div className="h-px flex-1 bg-outline-variant/30"></div>
                    </div>

                    <div className="bg-surface-container-low p-8 rounded-xl shadow-sm space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="block text-sm font-label text-on-surface-variant font-bold">العنوان الرئيسي للمقطع</label>
                                <input
                                    className="w-full bg-white border border-outline-variant/30 rounded-md focus:border-primary focus:ring-1 focus:ring-primary transition-all px-4 py-3 font-headline text-xl"
                                    type="text"
                                    value={content.aboutTitle}
                                    onChange={(e) => updateField('aboutTitle', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-label text-on-surface-variant font-bold">العنوان الفرعي</label>
                                <input
                                    className="w-full bg-white border border-outline-variant/30 rounded-md focus:border-primary focus:ring-1 focus:ring-primary transition-all px-4 py-3 font-body"
                                    type="text"
                                    value={content.aboutSubtitle}
                                    onChange={(e) => updateField('aboutSubtitle', e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-label text-on-surface-variant font-bold">وصف القسم</label>
                            <textarea
                                className="w-full bg-white border border-outline-variant/30 rounded-md focus:border-primary focus:ring-1 focus:ring-primary transition-all px-4 py-3 font-body h-28 resize-none"
                                value={content.aboutDescription}
                                onChange={(e) => updateField('aboutDescription', e.target.value)}
                            ></textarea>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
                            {content.stats.map((stat, index) => (
                                <div key={index} className="bg-white p-6 rounded-lg border border-outline-variant/20 hover:border-primary/40 transition-all group">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="h-12 w-12 bg-primary/10 rounded-md flex items-center justify-center text-primary">
                                            <span className="material-symbols-outlined">{stat.icon}</span>
                                        </div>
                                        <button onClick={() => deleteStat(index)} className="text-red-400 hover:text-red-600 transition-colors">
                                            <span className="material-symbols-outlined text-sm">delete</span>
                                        </button>
                                    </div>
                                    <input
                                        className="w-full bg-transparent border-0 border-b border-outline-variant/30 focus:border-primary focus:ring-0 font-headline text-2xl text-primary font-bold mb-2 outline-none"
                                        type="text"
                                        value={stat.value}
                                        onChange={(e) => updateStat(index, 'value', e.target.value)}
                                    />
                                    <textarea
                                        className="w-full bg-transparent border-0 border-b border-outline-variant/30 focus:border-primary focus:ring-0 text-sm font-body h-20 resize-none outline-none"
                                        placeholder="الوصف القصيرة"
                                        value={stat.description}
                                        onChange={(e) => updateStat(index, 'description', e.target.value)}
                                    ></textarea>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-end pt-4 gap-4">
                            <button onClick={handleCancel} className="px-6 py-2 border-2 border-primary/20 text-primary hover:bg-primary/5 font-semibold rounded-md transition-all">إلغاء</button>
                            <button onClick={handleSave} disabled={saving} className="px-8 py-2 bg-primary text-white font-semibold rounded-md hover:opacity-90 shadow-md transition-all disabled:opacity-50 flex items-center gap-2">
                                {saving && <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>}
                                حفظ التغييرات
                            </button>
                        </div>
                    </div>
                </section>

                {/* ===== Section: Authors with Image Upload ===== */}
                <section aria-labelledby="authors-title">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4 flex-1">
                            <h3 className="text-2xl font-headline text-primary shrink-0" id="authors-title">مبدعون من مجتمعنا</h3>
                            <div className="h-px w-full bg-outline-variant/30"></div>
                        </div>
                        <button onClick={handleAddAuthor} className="mr-6 px-4 py-2 bg-secondary text-white rounded-md flex items-center gap-2 font-semibold hover:opacity-90 transition-colors whitespace-nowrap">
                            <span className="material-symbols-outlined text-base">person_add</span>
                            إضافة مبدع
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {content.authors.map((author, index) => (
                            <div key={index} className="bg-white rounded-xl overflow-hidden shadow-sm group flex flex-col border border-outline-variant/20">
                                {/* Author Image with Upload */}
                                <ImageUploader
                                    currentImage={author.image}
                                    onImageUploaded={(url) => updateAuthor(index, 'image', url)}
                                    folder={`authors/${index}`}
                                    className="h-56 w-full"
                                    placeholderIcon="person"
                                />

                                <div className="p-6 flex-1 space-y-4">
                                    <div className="space-y-1">
                                        <label className="block text-[10px] font-label text-on-surface-variant/60 uppercase tracking-widest">اسم الكاتب</label>
                                        <input
                                            className="w-full bg-transparent border-0 border-b border-outline-variant/30 focus:border-primary focus:ring-0 font-headline text-lg outline-none"
                                            type="text"
                                            value={author.name}
                                            onChange={(e) => updateAuthor(index, 'name', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="block text-[10px] font-label text-on-surface-variant/60 uppercase tracking-widest">عنوان الكتاب</label>
                                        <input
                                            className="w-full bg-transparent border-0 border-b border-outline-variant/30 focus:border-primary focus:ring-0 font-body italic text-primary outline-none"
                                            type="text"
                                            value={author.book}
                                            onChange={(e) => updateAuthor(index, 'book', e.target.value)}
                                        />
                                    </div>
                                    <div className="flex justify-between items-center pt-4 border-t border-outline-variant/10">
                                        <button onClick={() => deleteAuthor(index)} className="text-red-500 flex items-center gap-1 text-sm hover:underline">
                                            <span className="material-symbols-outlined text-base">delete</span> حذف
                                        </button>
                                        <label className="flex items-center gap-2 text-sm text-on-surface-variant cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={author.featured || false}
                                                onChange={(e) => updateAuthor(index, 'featured', e.target.checked)}
                                                className="rounded border-outline-variant text-primary focus:ring-primary"
                                            />
                                            مميز
                                        </label>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {/* Add New Card */}
                        <div onClick={handleAddAuthor} className="bg-surface-container-low border-2 border-dashed border-outline-variant/50 rounded-xl overflow-hidden flex flex-col items-center justify-center p-8 group hover:border-primary/50 hover:bg-white transition-all cursor-pointer min-h-[400px]">
                            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined text-4xl">add_circle</span>
                            </div>
                            <p className="mt-4 font-headline text-primary font-bold">إضافة بطاقة مبدع جديد</p>
                            <p className="text-xs text-on-surface-variant/60 font-body mt-2">انقر لاختيار صورة وبيانات الكاتب</p>
                        </div>
                    </div>
                </section>
            </div>

            {/* Footer / Save */}
            <footer className="mt-20 p-6 bg-white rounded-lg flex flex-col md:flex-row items-center justify-between gap-6 border border-outline-variant/20 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                        <div className={`h-2 w-2 rounded-full ${saveStatus === 'saved' ? 'bg-green-500' : 'bg-primary'}`}></div>
                        <div className={`h-2 w-2 rounded-full ${saveStatus === 'saved' ? 'bg-green-500' : 'bg-primary'}`}></div>
                        <div className="h-2 w-2 rounded-full bg-outline-variant"></div>
                        <div className="h-2 w-2 rounded-full bg-outline-variant"></div>
                    </div>
                    <span className="text-sm font-label text-on-surface-variant">
                        {saveStatus === 'saved' ? 'تم نشر التغييرات بنجاح ✓' : saveStatus === 'saving' ? 'جاري الحفظ...' : 'جميع التغييرات تم حفظها كمسودة'}
                    </span>
                </div>
                <div className="flex items-center gap-4">
                    <a href="/" target="_blank" rel="noopener noreferrer" className="text-primary font-bold text-sm px-4 py-2 hover:bg-primary/5 rounded">معاينة الصفحة</a>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-primary text-white px-8 py-3 rounded-md font-bold shadow-md hover:bg-primary-container transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                        {saving ? (
                            <span className="material-symbols-outlined animate-spin">progress_activity</span>
                        ) : (
                            <span className="material-symbols-outlined">publish</span>
                        )}
                        نشر التعديلات الحالية
                    </button>
                </div>
            </footer>
        </div>
    );
};

export default LandingPageManager;
