import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';

// Default content (fallback if DB is empty)
const DEFAULT_CONTENT = {
    aboutTitle: 'لماذا تختار نوت؟',
    aboutSubtitle: 'أكثر من مجرد طباعة.',
    aboutDescription: 'نحن لا نبيع الكتب فحسب، نحن نصنع التجارب. في "نوت"، المؤلف هو الشريك الأول. نحن نوفر بيئة إبداعية متكاملة تشمل التدقيق اللغوي، التصميم الفني المستوحى من روح النص، والتسويق الرقمي الذكي.',
    heroImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCD4iKfTxbH-j5g9tC6aRUpYqKgPWkazVvjG0SauGidmyBCyCSKLwds9CyOI2GmmvybnYz6yFGjq7-PC9VP2bhCAuWYPrsUqowNkQUsvXKDvxvasWTebn6SfPhxyn8Vmm90ij5VXAu7H4Zp_fB-Cmd_NYZBxCydgs4bkI7kV8rmbnWTdT89YqS10SAT6jH7RtdHcw3B_7kEByBV7nXcW05D0XIKomjPQNdKyuqTcU9q7OdqUOfuAuh5MSn6haIqB0R1yl5MlYotLfg',
    aboutImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDb1tnPRu_9aqdtGxqhg4CHLsQLb_XXPO67_5Z7aEki4gf_EOQ8Mpuogufb-enhBCDREGmlyHmYj3efy_ljk9GE_1MhS0uiKV2HJu7yOTlvjszrXspEw-JO8UdnguGAzMSAejTfkuZ5AyuvPxdgssHtHQFjjFaIm1c2UIRT45fWROqApGaDRD0NcLnfsR24M2t-Cvh05rJBvwMeGtFDFMYT4vHFJyFva6X9s5s4TWKJMHFb6b5cQiqZ0T2NdvX7Hcdf6tuSaEMhHgs',
    ctaImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuARw4clr7AJiepRldLR5eTuxB7OGLsi21HA8lwwyQ97Z3XUQ4IJANapIWPsmj_FSl1_9xxGErF3qUOURu9ubb2zRedTR4TBTandG5G5kPM9dWHEDWJBCGCGPx8aqx1anNDwf8XMCOVgvD4FH7SCvlcfBTRpnW-7RWdNGriOYCdWdP0kiRAsCNtUl8zDO6FD4t5cL9TmslT7m2vNmX97qobSqD3I1exblW7zX_RfS6YGQeF0alOF0FyBsf6LSI_PZZrwSUjgu6hxYxQ',
    typewriterImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuADF71otbhvNaraG1JVDDBeMgQmRXdOS15rxG4LhTI_BYtjdb7bf_dKNxZHPgRfHrX91kuz2KMzscu7cXw_Jyc1NkdGMstkHSe96TopfRyv4-8K2v8QLr-z1qj7wq-RcEJptqe5E5kkiAiiGs0155YAMhq5IUkTECtv2gEMugZsWKlS1ANuaC1JiZuTXSGnQBfvs7tEAVzd4ZSEVRg9KcSoQ6mM-mpKp2eUmUlxpBLP_JODOBZMCQhM5PcACUgOgUlcl5-8Lqlwkc0',
    stats: [
        { icon: 'auto_stories', value: '+500', description: 'أكثر من 500 كاتب نشط يشاركون إبداعاتهم يومياً عبر منصتنا.' },
        { icon: 'star', value: '98%', description: 'نسبة رضا المؤلفين عن جودة التحرير والتدقيق اللغوي الاحترافي.' },
        { icon: 'public', value: '12M', description: 'وصول المحتوى لملايين القراء حول العالم عبر شراكاتنا الإقليمية.' },
    ],
    authors: [
        {
            name: 'سارة العامر',
            book: 'رواية "ظلال الأمس"',
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCqWJd1czE1EfH-RiFPX4pGCSAcGoNe6hzjxAUUsvRE4i0Mtyau31uR271OV4R_U6LUAt5xGlrKNcTB2-eLTZtwdJt-J1CnwsWCauFaR92UIoDdhm4G842MoR2LFWMwvDXIRNV8K4rTQOq5cSOMA7ZZR1Jmut_4YXId-yt6EPORKi_rjqG-QDMY2kQ4iMmBnYo-nZRptFTfKBxcohdcoUWTNjppMM3MkRHZLmMXlVmuK70YjYSYA5puVA7U47uWOuZECl-RKtqxf1Q',
            featured: true,
        },
        {
            name: 'أحمد كمال',
            book: 'مجموعة قصصية: "نبض الشوارع"',
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuASpdseKALDwzPV0N_l20eMYp51fOFCa8RvwqQTBihwj2xnkme_6XgZBL4DXC1RmHMktWPqdEZUVYa-XvUlCKD1zVYsqsA3-CrNZ3extUWizdcb0A7HqWu4X7Ij2imIb2nm7y0LVPy_5Uqw3T6pqVtKiz7yglwO6gWX4AwOJiRaC0GXhV9JQjulBIA8jPEqoLgIcCunIbwPgY19Z9LdHptteyEujs-xnYKJwoSIKwClzsErHDpNOywUx6y1CnyCgsns1byuAtXBj44',
            featured: false,
        },
    ],
};

const LandingContentContext = createContext();

export const useLandingContent = () => {
    const context = useContext(LandingContentContext);
    if (!context) {
        throw new Error('useLandingContent must be used within a LandingContentProvider');
    }
    return context;
};

export const LandingContentProvider = ({ children }) => {
    const [content, setContent] = useState(DEFAULT_CONTENT);
    const [rowId, setRowId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState('idle'); // idle | saving | saved | error

    // Fetch content: localStorage FIRST (instant), then Supabase as enhancement
    const fetchContent = useCallback(async () => {
        try {
            setLoading(true);

            // Step 1: Always load from localStorage first (instant, works without DB)
            const local = localStorage.getItem('landing_content');
            if (local) {
                try {
                    const parsed = JSON.parse(local);
                    setContent({ ...DEFAULT_CONTENT, ...parsed });
                } catch (e) {
                    console.warn('Invalid localStorage data, using defaults');
                }
            }

            // Step 2: Try to load from Supabase (overrides localStorage if available)
            const { data, error } = await supabase
                .from('landing_content')
                .select('*')
                .limit(1)
                .single();

            if (!error && data) {
                setRowId(data.id);
                const dbContent = { ...DEFAULT_CONTENT, ...data.content };
                setContent(dbContent);
                // Sync localStorage with DB data
                localStorage.setItem('landing_content', JSON.stringify(dbContent));
            } else {
                console.warn('Supabase not available, using localStorage/defaults:', error?.message);
            }
        } catch (err) {
            console.error('Error fetching landing content:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchContent();
    }, [fetchContent]);

    // Save content to Supabase (and localStorage as backup)
    const saveContent = useCallback(async (newContent) => {
        setSaving(true);
        setSaveStatus('saving');

        // Always save to localStorage immediately
        localStorage.setItem('landing_content', JSON.stringify(newContent));
        setContent(newContent);

        try {
            if (rowId) {
                // Update existing row
                const { error } = await supabase
                    .from('landing_content')
                    .update({
                        content: newContent,
                        updated_at: new Date().toISOString(),
                    })
                    .eq('id', rowId);

                if (error) throw error;
            } else {
                // Insert new row
                const { data, error } = await supabase
                    .from('landing_content')
                    .insert({ content: newContent })
                    .select()
                    .single();

                if (error) throw error;
                if (data) setRowId(data.id);
            }
            setSaveStatus('saved');
        } catch (err) {
            console.error('Error saving to Supabase:', err);
            setSaveStatus('error');
            // Data is still saved in localStorage, so it won't be lost
        } finally {
            setSaving(false);
            // Reset status after 3 seconds
            setTimeout(() => setSaveStatus('idle'), 3000);
        }
    }, [rowId]);

    // Update a specific field
    const updateField = useCallback((field, value) => {
        setContent(prev => ({ ...prev, [field]: value }));
    }, []);

    // Update a stat by index
    const updateStat = useCallback((index, field, value) => {
        setContent(prev => {
            const newStats = [...prev.stats];
            newStats[index] = { ...newStats[index], [field]: value };
            return { ...prev, stats: newStats };
        });
    }, []);

    // Delete a stat by index
    const deleteStat = useCallback((index) => {
        setContent(prev => ({
            ...prev,
            stats: prev.stats.filter((_, i) => i !== index),
        }));
    }, []);

    // Update an author by index
    const updateAuthor = useCallback((index, field, value) => {
        setContent(prev => {
            const newAuthors = [...prev.authors];
            newAuthors[index] = { ...newAuthors[index], [field]: value };
            return { ...prev, authors: newAuthors };
        });
    }, []);

    // Delete an author by index
    const deleteAuthor = useCallback((index) => {
        setContent(prev => ({
            ...prev,
            authors: prev.authors.filter((_, i) => i !== index),
        }));
    }, []);

    // Add a new author
    const addAuthor = useCallback((author) => {
        setContent(prev => ({
            ...prev,
            authors: [...prev.authors, { name: '', book: '', image: '', featured: false, ...author }],
        }));
    }, []);

    return (
        <LandingContentContext.Provider
            value={{
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
                fetchContent,
            }}
        >
            {children}
        </LandingContentContext.Provider>
    );
};

export default LandingContentContext;
