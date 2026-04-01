-- =====================================================
-- MIGRATION: Landing Page Content + Image Storage
-- =====================================================
-- Comment exécuter cette migration:
-- 1. Allez sur https://supabase.com/dashboard
-- 2. Ouvrez votre projet (ueeensmyaqsbruezyjwe)
-- 3. Allez dans "SQL Editor" (menu gauche)
-- 4. Collez tout ce code et cliquez "Run"
-- =====================================================

-- 1. Créer la table landing_content
CREATE TABLE IF NOT EXISTS public.landing_content (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT now(),
    updated_by UUID REFERENCES auth.users(id)
);

-- 2. Activer RLS
ALTER TABLE public.landing_content ENABLE ROW LEVEL SECURITY;

-- 3. Tout le monde peut lire (page publique)
CREATE POLICY "Anyone can read landing content"
    ON public.landing_content FOR SELECT
    USING (true);

-- 4. Seuls les admins peuvent modifier
CREATE POLICY "Admins can update landing content"
    ON public.landing_content FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- 5. Seuls les admins peuvent insérer
CREATE POLICY "Admins can insert landing content"
    ON public.landing_content FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- 6. Insérer les données par défaut
INSERT INTO public.landing_content (content) VALUES ('{
    "aboutTitle": "لماذا تختار نوت؟",
    "aboutSubtitle": "أكثر من مجرد طباعة.",
    "aboutDescription": "نحن لا نبيع الكتب فحسب، نحن نصنع التجارب. في \"نوت\"، المؤلف هو الشريك الأول. نحن نوفر بيئة إبداعية متكاملة تشمل التدقيق اللغوي، التصميم الفني المستوحى من روح النص، والتسويق الرقمي الذكي.",
    "heroImage": "",
    "aboutImage": "",
    "ctaImage": "",
    "stats": [
        { "icon": "auto_stories", "value": "+500", "description": "أكثر من 500 كاتب نشط يشاركون إبداعاتهم يومياً عبر منصتنا." },
        { "icon": "star", "value": "98%", "description": "نسبة رضا المؤلفين عن جودة التحرير والتدقيق اللغوي الاحترافي." },
        { "icon": "public", "value": "12M", "description": "وصول المحتوى لملايين القراء حول العالم عبر شراكاتنا الإقليمية." }
    ],
    "authors": [
        { "name": "سارة العامر", "book": "رواية \"ظلال الأمس\"", "image": "", "featured": true },
        { "name": "أحمد كمال", "book": "مجموعة قصصية: \"نبض الشوارع\"", "image": "", "featured": false }
    ]
}'::jsonb);

-- =====================================================
-- 7. Créer le bucket de stockage "landing-images"
-- =====================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('landing-images', 'landing-images', true)
ON CONFLICT (id) DO NOTHING;

-- Tout le monde peut voir les images (page publique)
CREATE POLICY "Landing images are publicly accessible"
    ON storage.objects FOR SELECT
    USING ( bucket_id = 'landing-images' );

-- Les admins peuvent uploader des images
CREATE POLICY "Admins can upload landing images"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'landing-images'
        AND EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Les admins peuvent mettre à jour les images
CREATE POLICY "Admins can update landing images"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'landing-images'
        AND EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Les admins peuvent supprimer les images
CREATE POLICY "Admins can delete landing images"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'landing-images'
        AND EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );
