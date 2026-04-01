import React, { useRef, useState } from 'react';
import { supabase } from '../supabaseClient';

const ImageUploader = ({ currentImage, onImageUploaded, folder = 'general', className = '', placeholderIcon = 'image' }) => {
    const fileInputRef = useRef(null);
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState(null);

    const handleFileSelect = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file type
        const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!validTypes.includes(file.type)) {
            alert('الملف غير مدعوم. يرجى اختيار صورة (JPG, PNG, WebP, GIF)');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('حجم الملف كبير جداً. الحد الأقصى هو 5 ميغابايت');
            return;
        }

        // Show preview immediately
        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result);
        reader.readAsDataURL(file);

        // Upload to Supabase Storage
        setUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${folder}/${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;

            const { data, error } = await supabase.storage
                .from('landing-images')
                .upload(fileName, file, {
                    cacheControl: '3600',
                    upsert: false,
                });

            if (error) throw error;

            // Get public URL
            const { data: urlData } = supabase.storage
                .from('landing-images')
                .getPublicUrl(data.path);

            const publicUrl = urlData.publicUrl;

            onImageUploaded(publicUrl);
            setPreview(null); // Clear preview, real image will show
        } catch (err) {
            console.error('Error uploading image:', err);
            // Fallback: use the preview as a data URL
            if (preview) {
                onImageUploaded(preview);
            }
            alert('خطأ في رفع الصورة. تم استخدام الصورة محلياً.');
        } finally {
            setUploading(false);
        }
    };

    const displayImage = preview || currentImage;

    return (
        <div className={`relative group ${className}`}>
            {/* Image Display */}
            {displayImage ? (
                <img
                    src={displayImage}
                    alt=""
                    className="w-full h-full object-cover"
                />
            ) : (
                <div className="w-full h-full bg-surface-container-high flex items-center justify-center">
                    <span className="material-symbols-outlined text-6xl text-on-surface-variant/20">{placeholderIcon}</span>
                </div>
            )}

            {/* Upload overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="bg-white/90 backdrop-blur-md text-primary px-4 py-2 rounded-lg flex items-center gap-2 font-semibold shadow-xl hover:bg-white transition-all transform scale-90 group-hover:scale-100"
                >
                    {uploading ? (
                        <>
                            <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
                            جاري الرفع...
                        </>
                    ) : (
                        <>
                            <span className="material-symbols-outlined text-base">cloud_upload</span>
                            تغيير الصورة
                        </>
                    )}
                </button>
            </div>

            {/* Small floating button (always visible) */}
            <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="absolute bottom-3 right-3 bg-white/80 backdrop-blur-md text-primary p-2 rounded-full shadow-lg hover:bg-white transition-all z-10"
            >
                <span className="material-symbols-outlined text-sm">
                    {uploading ? 'progress_activity' : 'photo_camera'}
                </span>
            </button>

            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleFileSelect}
                className="hidden"
            />
        </div>
    );
};

export default ImageUploader;
