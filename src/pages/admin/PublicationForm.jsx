import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../supabaseClient.js';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { Save, Printer, CheckCircle, Upload, Plus, Trash } from 'lucide-react';

const PublicationForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { user } = useAuth(); // Need user to set user_id
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        editor_name: 'Dar note',
        title_main: '',
        title_secondary: '',
        title_parallel: '',
        language: 'Arabe',
        publisher_1: '', place_1: '',
        publisher_2: '', place_2: '', publication_year: '',
        summary: '',
        abstract: '',
        keywords: '',
        isbn: '',
        position: 'en saisie',
        collection_title: '',
        collection_number: '',
        main_author_name: '',
        main_author_firstname: '',
        // Co-authors array instead of individual fields
        co_authors: [], 
        page_count: '',
        illustrations: '',
        volume_count: '',
        format: '',
        // Dates
        date_validation_request: null,
        date_validation: null,
        date_isbn: null,
        date_depot: null
    });

    // ... (rest of the code until around line 440) ...

    // Helper to manage co-authors
    const addCoAuthor = () => {
        if (formData.co_authors.length >= 5) return;
        setFormData(prev => ({
            ...prev,
            co_authors: [...prev.co_authors, { name: '', firstname: '', role: 'Préparation' }]
        }));
    };

    const removeCoAuthor = (index) => {
        setFormData(prev => ({
            ...prev,
            co_authors: prev.co_authors.filter((_, i) => i !== index)
        }));
    };

    const handleCoAuthorChange = (index, field, value) => {
        const newAuthors = [...formData.co_authors];
        newAuthors[index] = { ...newAuthors[index], [field]: value };
        setFormData(prev => ({ ...prev, co_authors: newAuthors }));
    };

    // ... (rest of imports and setup)



    // Check permissions
    const isAuthor = user?.app_metadata?.role === 'author';
    // Locked if author AND status is NOT 'en saisie'
    const isLocked = isAuthor && formData.position !== 'en saisie';

    useEffect(() => {
        if (id) {
            fetchPublication();
        }
    }, [id]);

    useEffect(() => {
        // Auto-fill author name for new publications
        if (!id && user) {
            const fullName = user.user_metadata?.full_name || '';
            // Simple split for demo purposes (Last First)
            const parts = fullName.split(' ');
            const lastName = parts[0] || '';
            const firstName = parts.slice(1).join(' ') || '';
            
            setFormData(prev => ({
                ...prev,
                main_author_name: lastName,
                main_author_firstname: firstName
            }));
        }
    }, [id, user]);

    const fetchPublication = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('publications')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            if (data) setFormData(data);
        } catch (err) {
            console.error("Error fetching publication:", err);
            alert("Erreur chargement: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const [files, setFiles] = useState({ doc: null, pdf: null });

    const handleFileChange = (e, type) => {
        if (e.target.files && e.target.files[0]) {
            setFiles(prev => ({ ...prev, [type]: e.target.files[0] }));
        }
    };

    const uploadFileToStorage = async (file, type) => {
        // Sanitize names for folder paths (remove special chars)
        const sanitize = (str) => str?.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'unknown';

        const authorName = sanitize(user.user_metadata?.full_name || 'author');
        const bookTitle = sanitize(formData.title_main || 'untitled');
        const fileExt = file.name.split('.').pop();

        // Structure: author_name/book_title/type.ext
        const filePath = `${authorName}/${bookTitle}/${type}.${fileExt}`;

        // Upsert (overwrite) if exists to keep it clean
        const { error } = await supabase.storage
            .from('manuscripts')
            .upload(filePath, file, { upsert: true });

        if (error) throw error;
        return filePath;
    };

    const downloadFile = async (path) => {
        try {
            const { data, error } = await supabase.storage
                .from('manuscripts')
                .createSignedUrl(path, 60); // Valid for 60 seconds

            if (error) throw error;
            globalThis.open(data.signedUrl, '_blank');
        } catch (err) {
            alert("Erreur lors du téléchargement: " + err.message);
        }
    };

    // UI State for Full Text toggle
    const [isFullTextOpen, setIsFullTextOpen] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // 1. Upload Files if present
            let docPath = formData.file_doc_url;
            let pdfPath = formData.file_pdf_url;

            if (files.doc) {
                docPath = await uploadFileToStorage(files.doc, 'doc');
            }
            if (files.pdf) {
                pdfPath = await uploadFileToStorage(files.pdf, 'pdf');
            }

            const dataToSave = {
                ...formData,
                file_doc_url: docPath,
                file_pdf_url: pdfPath
            };

            let savedData;
            if (id) {
                // UPDATE
                const { data, error } = await supabase
                    .from('publications')
                    .update(dataToSave)
                    .eq('id', id)
                    .select(); // Select to ensure we get data back if needed, mainly consistency
                
                if (error) throw error;
                savedData = data;
            } else {
                // INSERT
                const { data, error } = await supabase
                    .from('publications')
                    .insert([{ ...dataToSave, user_id: user.id }])
                    .select(); // CRITICAL: Get the new ID
                
                if (error) throw error;
                savedData = data;
            }

            const pubId = id || (savedData && savedData[0]?.id);

            alert("Publication sauvegardée avec succès !");

            // Redirect based on role
            const isAuthor = user.app_metadata?.role === 'author';
            navigate(isAuthor ? '/author' : '/admin/content');

        } catch (err) {
            console.error("Error saving publication:", err);
            alert("Erreur lors de la sauvegarde : " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleRequestValidation = async () => {
        setLoading(true);

        try {
            // 1. Check if profile is complete
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('full_name, birth_date, birth_place, nationality, id_card_number, id_card_type, address, phone')
                .eq('id', user.id)
                .single();

            if (profileError) throw profileError;

            // 2. Validate required fields
            const requiredFields = {
                'Nom complet': profile.full_name,
                'Date de naissance': profile.birth_date,
                'Lieu de naissance': profile.birth_place,
                'Nationalité': profile.nationality,
                'Numéro de pièce d\'identité': profile.id_card_number,
                'Type de pièce d\'identité': profile.id_card_type,
                'Adresse': profile.address,
                'Téléphone': profile.phone
            };

            const missingFields = Object.entries(requiredFields)
                .filter(([_, value]) => !value || value.trim() === '')
                .map(([field, _]) => field);

            if (missingFields.length > 0) {
                setLoading(false);
                const fieldsList = missingFields.join(', ');
                alert(
                    `⚠️ Profil incomplet !\n\n` +
                    `Avant de soumettre votre manuscrit pour validation, vous devez compléter les informations suivantes :\n\n` +
                    `${fieldsList}\n\n` +
                    `Vous allez être redirigé vers votre profil.`
                );
                navigate('/author/profile');
                return;
            }

            // 3. If profile is complete, proceed with validation request
            if (!confirm("Une fois la demande envoyée, vous ne pourrez plus modifier le manuscrit. Continuer ?")) {
                setLoading(false);
                return;
            }

            const updates = {
                position: 'en attente',
                date_validation_request: new Date().toISOString()
            };

            const { error } = await supabase
                .from('publications')
                .update(updates)
                .eq('id', id);

            if (error) throw error;

            alert("✅ Demande de validation envoyée avec succès !");
            navigate('/author');

        } catch (err) {
            console.error(err);
            alert("Erreur : " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAdminValidation = async () => {
        if (!confirm("Valider ce manuscrit ? Cela enregistrera la date de validation.")) return;

        setLoading(true);
        try {
            const updates = {
                position: 'validé',
                date_validation: new Date().toISOString()
            };

            const { error } = await supabase
                .from('publications')
                .update(updates)
                .eq('id', id);

            if (error) throw error;

            alert("Manuscrit validé avec succès !");
            navigate('/admin/content');
            setFormData(prev => ({ ...prev, ...updates }));

        } catch (err) {
            console.error(err);
            alert("Erreur : " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        globalThis.print();
    };

    // Check admin role for showing validation button
    const isAdmin = user?.app_metadata?.role === 'admin';

    return (
        <div className="max-w-7xl mx-auto pb-10 print:pb-0">
            {/* Top Actions - Hidden on Print */}
            <div className="flex justify-between items-center mb-6 print:hidden">
                <h1 className="text-2xl font-bold text-gray-800">
                    Fiche de la Publication
                    {isLocked && <span className="ml-3 text-sm text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">🔒 Lecture Seule (En attente de validation)</span>}
                </h1>
                <div className="flex gap-2">
                    {/* Admin Validation Button */}
                    {isAdmin && id && (
                        <button
                            type="button"
                            onClick={handleAdminValidation}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow-sm text-sm font-medium flex items-center gap-2"
                        >
                            <CheckCircle className="w-4 h-4" /> Valider
                        </button>
                    )}

                    {/* Print Button - Visible to EVERYONE (Author & Admin) */}
                    <button
                        type="button"
                        onClick={handlePrint}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded shadow-sm text-sm font-medium flex items-center gap-2"
                        title="Imprimer"
                    >
                        <Printer className="w-4 h-4" /> Imprimer
                    </button>

                    {!isLocked && (
                        <button
                            type="submit"
                            onClick={handleSubmit}
                            disabled={loading}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow-sm flex items-center gap-2 text-sm font-medium"
                        >
                            <Save className="w-4 h-4" /> Sauvegarder (Brouillon)
                        </button>
                    )}

                    {/* Show Validation Request Button for Authors only if Draft */}
                    {isAuthor && formData.position === 'en saisie' && id && (
                        <button
                            type="button"
                            onClick={handleRequestValidation}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow-sm text-sm font-medium"
                        >
                            Envoyer pour Validation
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={() => navigate(isAuthor ? '/author' : '/admin/content')}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded shadow-sm text-sm font-medium"
                    >
                        Fermer
                    </button>
                </div>
            </div>

            <form className="grid grid-cols-1 lg:grid-cols-2 gap-8 print:hidden" onSubmit={handleSubmit}>
                <fieldset disabled={isLocked} className="contents">

                    {/* --- LEFT COLUMN --- */}
                    <div className="space-y-4">

                        {/* Editor */}
                        <div className="flex flex-col sm:grid sm:grid-cols-[120px_1fr] items-center gap-4">
                            <label className="font-bold text-gray-700">Éditeur</label>
                            <input
                                name="editor_name"
                                value={formData.editor_name}
                                onChange={handleChange}
                                className="w-full bg-gray-100 border border-gray-300 rounded px-3 py-1.5"
                                disabled
                            />
                        </div>

                        {/* Titles */}
                        <div className="flex flex-col sm:grid sm:grid-cols-[120px_1fr] items-center gap-4">
                            <label className="font-bold text-gray-700">Titre Principal *</label>
                            <input
                                name="title_main"
                                value={formData.title_main}
                                onChange={handleChange}
                                required
                                className="w-full bg-white border-2 border-blue-500 rounded px-3 py-1.5 focus:outline-none"
                            />
                        </div>
                        <div className="flex flex-col sm:grid sm:grid-cols-[120px_1fr] items-center gap-4">
                            <label className="text-gray-500">Titre secondaire</label>
                            <input
                                name="title_secondary"
                                value={formData.title_secondary}
                                onChange={handleChange}
                                className="w-full bg-white border border-blue-300 rounded px-3 py-1.5"
                            />
                        </div>
                        <div className="flex flex-col sm:grid sm:grid-cols-[120px_1fr] items-center gap-4">
                            <label className="text-gray-500">Titre parallèle</label>
                            <input
                                name="title_parallel"
                                value={formData.title_parallel}
                                onChange={handleChange}
                                className="w-full bg-white border border-blue-300 rounded px-3 py-1.5"
                            />
                        </div>

                        {/* === RE-ORGANIZED: AUTHORS SECTION === */}
                        <div className="border-t pt-4 mt-6 border-blue-100 bg-blue-50/50 p-4 rounded-xl">
                            <h3 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
                                <span className="w-1 h-4 bg-blue-500 rounded-full"></span>
                                Informations Auteurs
                            </h3>
                            
                            {/* Main Author */}
                            <div className="space-y-4">
                                <label className="text-sm font-bold text-gray-700 block bg-white/50 px-2 py-1 rounded inline-block">Auteur principal</label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="flex flex-col gap-1">
                                        <label className="text-xs text-gray-500">Nom *</label>
                                        <input
                                            name="main_author_name"
                                            value={formData.main_author_name}
                                            onChange={handleChange}
                                            className="w-full bg-white border border-blue-300 rounded px-3 py-1.5"
                                            required
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label className="text-xs text-gray-500">Prénom *</label>
                                        <input
                                            name="main_author_firstname"
                                            value={formData.main_author_firstname}
                                            onChange={handleChange}
                                            className="w-full bg-white border border-blue-300 rounded px-3 py-1.5"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Co-Authors Dynamic List */}
                            <div className="mt-4 pt-4 border-t border-blue-100">
                                <div className="flex justify-between items-center mb-2">
                                    <label className="text-sm font-bold text-gray-700 block bg-white/50 px-2 py-1 rounded inline-block">
                                        Co-Auteurs (Max 5)
                                    </label>
                                    {formData.co_authors.length < 5 && (
                                        <button
                                            type="button"
                                            onClick={addCoAuthor}
                                            className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded flex items-center gap-1"
                                            disabled={isLocked}
                                        >
                                            <Plus className="w-3 h-3" /> Ajouter
                                        </button>
                                    )}
                                </div>

                                <div className="space-y-3">
                                    {formData.co_authors.map((author, index) => (
                                        <div key={index} className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_1fr_30px] gap-2 items-end bg-white p-2 rounded border border-blue-100">
                                            <div className="flex flex-col gap-1">
                                                <label className="text-[10px] text-gray-500">Nom</label>
                                                <input
                                                    value={author.name}
                                                    onChange={(e) => handleCoAuthorChange(index, 'name', e.target.value)}
                                                    className="w-full bg-gray-50 border border-gray-200 rounded px-2 py-1 text-sm"
                                                    placeholder="Nom"
                                                />
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <label className="text-[10px] text-gray-500">Prénom</label>
                                                <input
                                                    value={author.firstname}
                                                    onChange={(e) => handleCoAuthorChange(index, 'firstname', e.target.value)}
                                                    className="w-full bg-gray-50 border border-gray-200 rounded px-2 py-1 text-sm"
                                                    placeholder="Prénom"
                                                />
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <label className="text-[10px] text-gray-500">Fonction</label>
                                                <select
                                                    value={author.role}
                                                    onChange={(e) => handleCoAuthorChange(index, 'role', e.target.value)}
                                                    className="w-full bg-gray-50 border border-gray-200 rounded px-2 py-1 text-sm"
                                                >
                                                    <option>Préparation</option>
                                                    <option>Traduction</option>
                                                    <option>Illustration</option>
                                                    <option>Co-auteur</option>
                                                </select>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeCoAuthor(index)}
                                                className="text-red-500 hover:bg-red-50 p-1 rounded mb-0.5"
                                                title="Supprimer"
                                                disabled={isLocked}
                                            >
                                                <Trash className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                    {formData.co_authors.length === 0 && (
                                        <p className="text-xs text-gray-400 italic text-center py-2">Aucun co-auteur ajouté.</p>
                                    )}
                                </div>
                            </div>
                        </div>


                        {/* Language */}
                        <div className="flex flex-col sm:grid sm:grid-cols-[120px_1fr] items-center gap-4 mt-6">
                            <label className="text-gray-500">Langue</label>
                            <select
                                name="language"
                                value={formData.language}
                                onChange={handleChange}
                                className="w-full sm:w-40 bg-white border border-blue-300 rounded px-3 py-1.5"
                            >
                                <option>Arabe</option>
                                <option>Français</option>
                                <option>Anglais</option>
                            </select>
                        </div>

                        {/* Publication Details */}
                        {(isAdmin || formData.publisher_1 || formData.place_1 || formData.publisher_2 || formData.place_2 || formData.publication_year) && (
                            <div className="space-y-4 mt-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
                                <h3 className="font-bold text-gray-600 mb-2">Données de l'édition (Réservé Admin)</h3>
                                
                                {/* First Line: Publisher 1 & Place 1 */}
                                <div className="flex flex-col sm:flex-row gap-4">
                                    {(isAdmin || formData.publisher_1) && (
                                        <div className="flex-1 flex flex-col gap-1">
                                            <label className="text-xs text-gray-500">Éditeur *</label>
                                            {isAdmin ? (
                                                <input
                                                    name="publisher_1"
                                                    value={formData.publisher_1}
                                                    onChange={handleChange}
                                                    className="w-full bg-white border border-blue-300 rounded px-3 py-1.5"
                                                />
                                            ) : (
                                                <div className="w-full bg-white border border-gray-200 rounded px-3 py-1.5 text-gray-700">
                                                    {formData.publisher_1}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    
                                    {(isAdmin || formData.place_1) && (
                                        <div className="w-full sm:w-40 flex flex-col gap-1">
                                            <label className="text-xs text-gray-500">Lieu *</label>
                                            {isAdmin ? (
                                                <input
                                                    name="place_1"
                                                    value={formData.place_1}
                                                    onChange={handleChange}
                                                    className="w-full bg-white border border-blue-300 rounded px-3 py-1.5"
                                                />
                                            ) : (
                                                <div className="w-full bg-white border border-gray-200 rounded px-3 py-1.5 text-gray-700">
                                                    {formData.place_1}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Second Line: Publisher 2, Place 2, Year */}
                                {(isAdmin || formData.publisher_2 || formData.place_2 || formData.publication_year) && (
                                    <div className="flex flex-col sm:flex-row gap-4">
                                        {(isAdmin || formData.publisher_2) && (
                                            <div className="flex-1 flex flex-col gap-1">
                                                <label className="text-xs text-gray-500">Co-Éditeur</label>
                                                {isAdmin ? (
                                                    <input
                                                        name="publisher_2"
                                                        value={formData.publisher_2}
                                                        onChange={handleChange}
                                                        className="w-full bg-white border border-blue-300 rounded px-3 py-1.5"
                                                    />
                                                ) : (
                                                    <div className="w-full bg-white border border-gray-200 rounded px-3 py-1.5 text-gray-700">
                                                        {formData.publisher_2}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        
                                        {(isAdmin || formData.place_2) && (
                                            <div className="w-full sm:w-40 flex flex-col gap-1">
                                                <label className="text-xs text-gray-500">Lieu</label>
                                                {isAdmin ? (
                                                    <input
                                                        name="place_2"
                                                        value={formData.place_2}
                                                        onChange={handleChange}
                                                        className="w-full bg-white border border-blue-300 rounded px-3 py-1.5"
                                                    />
                                                ) : (
                                                    <div className="w-full bg-white border border-gray-200 rounded px-3 py-1.5 text-gray-700">
                                                        {formData.place_2}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        
                                        {(isAdmin || formData.publication_year) && (
                                            <div className="w-full sm:w-24 flex flex-col gap-1">
                                                <label className="text-xs text-gray-500">Année</label>
                                                {isAdmin ? (
                                                    <input
                                                        name="publication_year"
                                                        value={formData.publication_year}
                                                        onChange={handleChange}
                                                        className="w-full bg-white border border-blue-300 rounded px-3 py-1.5"
                                                    />
                                                ) : (
                                                    <div className="w-full bg-white border border-gray-200 rounded px-3 py-1.5 text-gray-700">
                                                        {formData.publication_year}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Content Textareas */}
                        <div className="space-y-4 mt-4">
                            <div className="flex flex-col gap-2">
                                <label className="font-bold text-gray-700">Sommaire *</label>
                                <textarea
                                    name="summary"
                                    value={formData.summary}
                                    onChange={handleChange}
                                    rows={4}
                                    className="w-full bg-white border border-blue-300 rounded px-3 py-2"
                                ></textarea>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="font-bold text-gray-700">Résumé *</label>
                                <textarea
                                    name="abstract"
                                    value={formData.abstract}
                                    onChange={handleChange}
                                    rows={4}
                                    className="w-full bg-white border border-blue-300 rounded px-3 py-2"
                                ></textarea>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="font-bold text-gray-700">Mots Clés *</label>
                                <textarea
                                    name="keywords"
                                    value={formData.keywords}
                                    onChange={handleChange}
                                    rows={2}
                                    className="w-full bg-white border border-blue-300 rounded px-3 py-2"
                                ></textarea>
                            </div>
                        </div>

                        {/* --- FILES UPLOAD --- */}
                        <div className="mt-6 border-t pt-4 border-gray-100">
                            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <Upload className="w-5 h-5 text-note-purple" />
                                Fichiers du Manuscrit
                            </h3>

                            <div className="space-y-4">
                                {/* DOC/DOCX */}
                                <div className="flex flex-col sm:grid sm:grid-cols-[120px_1fr] items-center gap-4">
                                    <label className="font-bold text-gray-700">Format Word</label>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="file"
                                            accept=".doc,.docx"
                                            onChange={(e) => handleFileChange(e, 'doc')}
                                            className="block w-full text-sm text-gray-500
                                                file:mr-4 file:py-2 file:px-4
                                                file:rounded-full file:border-0
                                                file:text-sm file:font-semibold
                                                file:bg-blue-50 file:text-blue-700
                                                hover:file:bg-blue-100"
                                            disabled={isLocked}
                                        />
                                        {formData.file_doc_url && (
                                            <a
                                                href="#"
                                                onClick={(e) => { e.preventDefault(); downloadFile(formData.file_doc_url); }}
                                                className="text-sm text-blue-600 underline whitespace-nowrap"
                                            >
                                                Voir fichier actuel
                                            </a>
                                        )}
                                    </div>
                                </div>

                                {/* PDF */}
                                <div className="flex flex-col sm:grid sm:grid-cols-[120px_1fr] items-center gap-4">
                                    <label className="font-bold text-gray-700">Format PDF</label>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="file"
                                            accept=".pdf"
                                            onChange={(e) => handleFileChange(e, 'pdf')}
                                            className="block w-full text-sm text-gray-500
                                                file:mr-4 file:py-2 file:px-4
                                                file:rounded-full file:border-0
                                                file:text-sm file:font-semibold
                                                file:bg-red-50 file:text-red-700
                                                hover:file:bg-red-100"
                                            disabled={isLocked}
                                        />
                                        {formData.file_pdf_url && (
                                            <a
                                                href="#"
                                                onClick={(e) => { e.preventDefault(); downloadFile(formData.file_pdf_url); }}
                                                className="text-sm text-red-600 underline whitespace-nowrap"
                                            >
                                                Voir fichier actuel
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* --- RIGHT COLUMN --- */}
                    <div className="space-y-4 lg:border-l lg:pl-8 border-gray-100">

                        {/* ISBN : ADMIN ONLY EDIT, AUTHOR READ-ONLY IF SET, HIDDEN IF EMPTY */}
                        {(isAdmin || formData.isbn) && (
                            <div className="flex flex-col sm:grid sm:grid-cols-[120px_1fr] items-center gap-4">
                                <label className="font-bold text-gray-800">ISBN</label>
                                {isAdmin ? (
                                    <input
                                        name="isbn"
                                        value={formData.isbn}
                                        onChange={handleChange}
                                        className="w-64 bg-white border border-blue-300 rounded px-3 py-1.5 bg-blue-50"
                                        placeholder="000-0-00-000000-0"
                                    />
                                ) : (
                                    <div className="w-64 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded text-gray-600 font-mono">
                                        {formData.isbn}
                                    </div>
                                )}
                            </div>
                        )}
                        {/* Position - Only Admin can see/edit, OR Author can see but readonly?
                        The requirement says Author should not validate. Let's make it read-only or hidden.
                        Let's show it read-only for feedback.
                    */}
                        <div className="flex flex-col sm:grid sm:grid-cols-[120px_1fr] items-center gap-4">
                            <label className="font-bold text-gray-800">Position</label>
                            <input
                                name="position"
                                value={formData.position}
                                onChange={handleChange}
                                className={`w-64 bg-gray-100 border border-blue-300 rounded px-3 py-1.5 ${user?.app_metadata?.role === 'author' ? 'opacity-70 cursor-not-allowed' : ''}`}
                                // Disable if author to prevent them forcing it?
                                // Actually RLS "Authors can update own" should probably restrict this column,
                                // but UI disabling is good first step.
                                disabled={user?.app_metadata?.role === 'author'}
                            />
                        </div>

                        {/* Dates Display */}
                        <div className="ml-[136px] text-sm text-gray-600 space-y-1 mb-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
                            <div className="flex justify-between w-64">
                                <span>Création :</span>
                                <span className="font-bold">{formData.created_at ? new Date(formData.created_at).toLocaleDateString() : '-'}</span>
                            </div>
                            <div className="flex justify-between w-64">
                                <span>Demande validation :</span>
                                <span className={formData.date_validation_request ? "font-semibold text-blue-600" : ""}>
                                    {formData.date_validation_request ? new Date(formData.date_validation_request).toLocaleDateString() : '-'}
                                </span>
                            </div>
                            <div className="flex justify-between w-64">
                                <span>Validation Admin :</span>
                                <span className={formData.date_validation ? "font-semibold text-green-600" : ""}>
                                    {formData.date_validation ? new Date(formData.date_validation).toLocaleDateString() : '-'}
                                </span>
                            </div>
                            <div className="flex justify-between w-64">
                                <span>Date ISBN :</span>
                                <span>{formData.date_isbn ? new Date(formData.date_isbn).toLocaleDateString() : '-'}</span>
                            </div>
                            <div className="flex justify-between w-64">
                                <span>Dépôt Légal :</span>
                                <span>{formData.date_depot ? new Date(formData.date_depot).toLocaleDateString() : '-'}</span>
                            </div>
                        </div>

                        {/* Collection */}
                        <div className="flex flex-col sm:grid sm:grid-cols-[120px_1fr] items-center gap-4">
                            <label className="text-gray-500">Collection :</label>
                            <div className="w-full space-y-2">
                                <div className="flex items-center gap-4">
                                    <span className="text-gray-500 w-16">Titre</span>
                                    <input
                                        name="collection_title"
                                        value={formData.collection_title}
                                        onChange={handleChange}
                                        className="flex-1 bg-white border border-blue-300 rounded px-3 py-1.5"
                                    />
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-gray-500 w-16">Numéro</span>
                                    <input
                                        name="collection_number"
                                        value={formData.collection_number}
                                        onChange={handleChange}
                                        className="w-24 bg-white border border-blue-300 rounded px-3 py-1.5"
                                    />
                                </div>
                            </div>
                        </div>



                        {/* Description / Technical Details */}
                        <div className="mt-8 bg-gray-50 border border-gray-200 rounded-xl p-4">
                            <h3 className="font-bold text-gray-700 mb-2">Description Technique</h3>
                            
                            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 mb-4 text-xs text-yellow-800">
                                <p className="font-bold">Note Importante :</p>
                                <p>Ces informations sont à titre indicatif. L'auteur peut proposer ces détails, mais la maison d'édition se réserve le droit exclusif de décider ou modifier la forme technique finale de l'ouvrage.</p>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center gap-4">
                                    <span className="text-gray-500 w-32 text-sm">Nombre de pages</span>
                                    <input
                                        name="page_count"
                                        value={formData.page_count}
                                        onChange={handleChange}
                                        className="flex-1 bg-white border border-gray-300 rounded px-3 py-1.5 text-sm"
                                        placeholder="Ex: 250"
                                    />
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-gray-500 w-32 text-sm">Illustrations</span>
                                    <input
                                        name="illustrations"
                                        value={formData.illustrations}
                                        onChange={handleChange}
                                        className="flex-1 bg-white border border-gray-300 rounded px-3 py-1.5 text-sm"
                                        placeholder="Ex: Oui, N&B"
                                    />
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-gray-500 w-32 text-sm">Nombre de tomes</span>
                                    <input
                                        name="volume_count"
                                        value={formData.volume_count}
                                        onChange={handleChange}
                                        className="flex-1 bg-white border border-gray-300 rounded px-3 py-1.5 text-sm"
                                        placeholder="Ex: 1"
                                    />
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-gray-500 w-32 text-sm">Format</span>
                                    <input
                                        name="format"
                                        value={formData.format}
                                        onChange={handleChange}
                                        className="flex-1 bg-white border border-gray-300 rounded px-3 py-1.5 text-sm"
                                        placeholder="Ex: 15x21 cm"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Full Text */}
                        <div className="mt-8 border-t pt-8">
                            <button
                                type="button"
                                onClick={() => setIsFullTextOpen(!isFullTextOpen)}
                                className="flex items-center gap-2 font-bold text-gray-800 mb-4 hover:text-blue-600 transition-colors"
                            >
                                {isFullTextOpen ? '▼' : '►'} Texte Intégral
                            </button>
                            
                            {isFullTextOpen && (
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                    <textarea
                                        name="full_text"
                                        value={formData.full_text || ''}
                                        onChange={handleChange}
                                        rows={15}
                                        className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-sm font-mono"
                                        placeholder="Collez ici le texte intégral du manuscrit..."
                                        disabled={isLocked}
                                    />
                                </div>
                            )}
                        </div>

                    </div>
                </fieldset>
            </form>

            {/* --- PRINT TEMPLATE (Visible only when printing) --- */}
            <div className="hidden print:block font-serif text-black p-8 max-w-[210mm] mx-auto bg-white">
                {/* Header */}
                <div className="flex justify-between items-end border-b-2 border-black pb-4 mb-8">
                    <div>
                        <h1 className="text-4xl font-bold font-sans text-note-purple mb-1">Note.dz</h1>
                        <p className="text-sm text-gray-600">Plateforme d'édition numérique</p>
                    </div>
                    <div className="text-right">
                        <h2 className="text-xl font-bold uppercase tracking-wider">Fiche Manuscrit</h2>
                        <p className="text-sm mt-1">Ref: {id ? id.split('-')[0] : 'N/A'}</p>
                        <p className="text-sm">Imprimé le : {new Date().toLocaleDateString()}</p>
                    </div>
                </div>

                {/* Status Badge */}
                <div className="mb-6 flex justify-end">
                    <span className="border border-black px-3 py-1 text-sm font-bold uppercase rounded">
                        Statut : {formData.position}
                    </span>
                </div>

                {/* Main Info */}
                <div className="grid grid-cols-1 gap-6 mb-8">
                    <div className="border border-black p-4">
                        <h3 className="font-bold border-b border-black mb-3 pb-1 uppercase text-sm">Identification</h3>
                        <div className="grid grid-cols-[150px_1fr] gap-y-2 text-sm">
                            <span className="font-bold">Titre Principal :</span>
                            <span className="text-lg font-bold">{formData.title_main}</span>

                            <span className="font-bold">Titre Secondaire :</span>
                            <span>{formData.title_secondary || '-'}</span>

                            <span className="font-bold">ISBN :</span>
                            <span className="font-mono">{formData.isbn || 'Non attribué'}</span>

                            <span className="font-bold">Langue :</span>
                            <span>{formData.language}</span>

                            <span className="font-bold">Collection :</span>
                            <span>{formData.collection_title ? `${formData.collection_title} (N°${formData.collection_number})` : '-'}</span>
                        </div>
                    </div>

                    <div className="border border-black p-4">
                        <h3 className="font-bold border-b border-black mb-3 pb-1 uppercase text-sm">Auteurs</h3>
                        <div className="grid grid-cols-[150px_1fr] gap-y-2 text-sm">
                            <span className="font-bold">Auteur Principal :</span>
                            <span className="uppercase">{formData.main_author_name} {formData.main_author_firstname}</span>

                            {formData.co_authors && formData.co_authors.length > 0 && (
                                <>
                                    <span className="font-bold max-w-[150px]">Autres Auteurs :</span>
                                    <div className="flex flex-col">
                                        {formData.co_authors.map((author, index) => (
                                            <span key={index}>
                                                {author.name} {author.firstname} ({author.role})
                                            </span>
                                        ))}
                                    </div>
                                </>
                            )}

                            <span className="font-bold">Éditeur :</span>
                            <span>{formData.editor_name}</span>
                        </div>
                    </div>

                    <div className="border border-black p-4">
                        <h3 className="font-bold border-b border-black mb-3 pb-1 uppercase text-sm">Détails Techniques</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="grid grid-cols-[100px_1fr] gap-y-1">
                                <span className="font-bold">Format :</span> <span>{formData.format || '-'}</span>
                                <span className="font-bold">Pages :</span> <span>{formData.page_count || '-'}</span>
                            </div>
                            <div className="grid grid-cols-[100px_1fr] gap-y-1">
                                <span className="font-bold">Volumes :</span> <span>{formData.volume_count || '-'}</span>
                                <span className="font-bold">Illustrations :</span> <span>{formData.illustrations || '-'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="border border-black p-4">
                        <h3 className="font-bold border-b border-black mb-3 pb-1 uppercase text-sm">Contenu</h3>
                        <div className="space-y-4 text-sm">
                            <div>
                                <span className="font-bold block mb-1">Résumé :</span>
                                <p className="text-justify leading-relaxed">{formData.abstract || '-'}</p>
                            </div>
                            <div>
                                <span className="font-bold block mb-1">Sommaire :</span>
                                <p className="whitespace-pre-line text-xs">{formData.summary || '-'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Validation */}
                <div className="mt-12 pt-4 border-t-2 border-black grid grid-cols-2 gap-8 text-sm">
                    <div>
                        <p className="font-bold mb-8">Signature Auteur :</p>
                        <div className="h-0.5 w-32 bg-black"></div>
                    </div>
                    <div>
                        <p className="font-bold mb-2">Validation Administration :</p>
                        <p>Date : {formData.date_validation ? new Date(formData.date_validation).toLocaleDateString() : 'En attente'}</p>
                        <p>Dépôt Légal : {formData.date_depot ? new Date(formData.date_depot).toLocaleDateString() : '-'}</p>
                    </div>
                </div>
            </div>
        </div >
    );
};

export default PublicationForm;
