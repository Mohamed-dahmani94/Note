import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import { Save, ArrowLeft, X, Printer, CheckCircle, Upload } from 'lucide-react';

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
        author_2_name: '',
        author_2_firstname: '',
        author_2_role: 'Préparation',
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

    // Check permissions
    const isAuthor = user?.app_metadata?.role === 'author';
    // Locked if author AND status is NOT 'en saisie'
    const isLocked = isAuthor && formData.position !== 'en saisie';

    useEffect(() => {
        if (id) {
            fetchPublication();
        }
    }, [id]);

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

    const downloadFile = async (path, type) => {
        try {
            const { data, error } = await supabase.storage
                .from('manuscripts')
                .createSignedUrl(path, 60); // Valid for 60 seconds

            if (error) throw error;
            window.open(data.signedUrl, '_blank');
        } catch (err) {
            alert("Erreur lors du téléchargement: " + err.message);
        }
    };

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

            let result;
            if (id) {
                // UPDATE
                result = await supabase
                    .from('publications')
                    .update(dataToSave)
                    .eq('id', id);
            } else {
                // INSERT
                // Add user_id so RLS allows it and we track ownership
                result = await supabase
                    .from('publications')
                    .insert([{ ...dataToSave, user_id: user.id }]);
            }

            if (result.error) throw result.error;

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
        window.print();
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
                            onClick={handleAdminValidation}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow-sm text-sm font-medium flex items-center gap-2"
                        >
                            <CheckCircle className="w-4 h-4" /> Valider
                        </button>
                    )}

                    {/* Print Button - Visible to EVERYONE (Author & Admin) */}
                    <button
                        onClick={handlePrint}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded shadow-sm text-sm font-medium flex items-center gap-2"
                        title="Imprimer"
                    >
                        <Printer className="w-4 h-4" /> Imprimer
                    </button>

                    {!isLocked && (
                        <button
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
                            onClick={handleRequestValidation}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow-sm text-sm font-medium"
                        >
                            Envoyer pour Validation
                        </button>
                    )}

                    <button
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

                        {/* Language */}
                        <div className="flex flex-col sm:grid sm:grid-cols-[120px_1fr] items-center gap-4">
                            <label className="text-gray-500">Langue</label>
                            <select
                                name="language"
                                value={formData.language}
                                onChange={handleChange}
                                className="w-40 bg-white border border-blue-300 rounded px-3 py-1.5"
                            >
                                <option>Arabe</option>
                                <option>Français</option>
                                <option>Anglais</option>
                            </select>
                        </div>

                        {/* Publication Details */}
                        <div className="space-y-2 mt-4">
                            <div className="flex flex-col sm:grid sm:grid-cols-[120px_1fr] items-center gap-4">
                                <label className="text-gray-500">Publication :</label>
                                <div className="flex gap-4 items-center w-full">
                                    <span className="text-gray-500 w-16">Éditeur *</span>
                                    <input
                                        name="publisher_1"
                                        value={formData.publisher_1}
                                        onChange={handleChange}
                                        className="flex-1 bg-white border border-blue-300 rounded px-3 py-1.5"
                                    />
                                </div>
                            </div>
                            <div className="flex flex-col sm:grid sm:grid-cols-[120px_1fr] items-center gap-4">
                                <div></div> {/* Spacer */}
                                <div className="flex gap-4 items-center w-full">
                                    <span className="text-gray-500 w-16">Lieu *</span>
                                    <input
                                        name="place_1"
                                        value={formData.place_1}
                                        onChange={handleChange}
                                        className="w-40 bg-white border border-blue-300 rounded px-3 py-1.5"
                                    />
                                </div>
                            </div>

                            {/* Second Publisher Line */}
                            <div className="flex flex-col sm:grid sm:grid-cols-[120px_1fr] items-center gap-4 mt-2">
                                <div></div> {/* Spacer */}
                                <div className="flex gap-4 items-center w-full">
                                    <span className="text-gray-500 w-16">Éditeur</span>
                                    <input
                                        name="publisher_2"
                                        value={formData.publisher_2}
                                        onChange={handleChange}
                                        className="flex-1 bg-white border border-blue-300 rounded px-3 py-1.5"
                                    />
                                </div>
                            </div>
                            <div className="flex flex-col sm:grid sm:grid-cols-[120px_1fr] items-center gap-4">
                                <div></div> {/* Spacer */}
                                <div className="flex gap-4 items-center w-full">
                                    <span className="text-gray-500 w-16">Lieu</span>
                                    <input
                                        name="place_2"
                                        value={formData.place_2}
                                        onChange={handleChange}
                                        className="w-40 bg-white border border-blue-300 rounded px-3 py-1.5"
                                    />
                                    <span className="text-gray-500 ml-2">Année</span>
                                    <input
                                        name="publication_year"
                                        value={formData.publication_year}
                                        onChange={handleChange}
                                        className="w-24 bg-white border border-blue-300 rounded px-3 py-1.5"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Content Textareas */}
                        <div className="flex flex-col sm:grid sm:grid-cols-[120px_1fr] gap-4 mt-4">
                            <label className="text-gray-500 mt-2">Sommaire *</label>
                            <textarea
                                name="summary"
                                value={formData.summary}
                                onChange={handleChange}
                                rows={4}
                                className="w-full bg-white border border-blue-300 rounded px-3 py-2"
                            ></textarea>
                        </div>
                        <div className="flex flex-col sm:grid sm:grid-cols-[120px_1fr] gap-4">
                            <label className="text-gray-500 mt-2">Résumé *</label>
                            <textarea
                                name="abstract"
                                value={formData.abstract}
                                onChange={handleChange}
                                rows={4}
                                className="w-full bg-white border border-blue-300 rounded px-3 py-2"
                            ></textarea>
                        </div>
                        <div className="flex flex-col sm:grid sm:grid-cols-[120px_1fr] gap-4">
                            <label className="text-gray-500 mt-2">Mots Clés *</label>
                            <textarea
                                name="keywords"
                                value={formData.keywords}
                                onChange={handleChange}
                                rows={2}
                                className="w-full bg-white border border-blue-300 rounded px-3 py-2"
                            ></textarea>
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
                                                onClick={(e) => { e.preventDefault(); downloadFile(formData.file_doc_url, 'doc'); }}
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
                                                onClick={(e) => { e.preventDefault(); downloadFile(formData.file_pdf_url, 'pdf'); }}
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
                    <div className="space-y-4 border-l pl-8 border-gray-100">

                        {/* ISBN */}
                        <div className="flex flex-col sm:grid sm:grid-cols-[120px_1fr] items-center gap-4">
                            <label className="font-bold text-gray-800">ISBN</label>
                            <input
                                name="isbn"
                                value={formData.isbn}
                                onChange={handleChange}
                                className="w-64 bg-white border border-blue-300 rounded px-3 py-1.5 bg-blue-50"
                            />
                        </div>

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

                        {/* Authors */}
                        <div className="flex flex-col sm:grid sm:grid-cols-[120px_1fr] gap-4 mt-6">
                            <label className="text-gray-500 mt-2">Auteur principal :</label>
                            <div className="w-full space-y-2">
                                <div className="flex items-center gap-4">
                                    <span className="text-gray-500 w-16">Nom *</span>
                                    <input
                                        name="main_author_name"
                                        value={formData.main_author_name}
                                        onChange={handleChange}
                                        className="flex-1 bg-white border border-blue-300 rounded px-3 py-1.5"
                                    />
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-gray-500 w-16">Prénom *</span>
                                    <input
                                        name="main_author_firstname"
                                        value={formData.main_author_firstname}
                                        onChange={handleChange}
                                        className="flex-1 bg-white border border-blue-300 rounded px-3 py-1.5"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Second Author */}
                        <div className="flex flex-col sm:grid sm:grid-cols-[120px_1fr] gap-4 mt-4">
                            <label className="text-gray-500 mt-2">Auteur :</label>
                            <div className="w-full space-y-2">
                                <div className="flex items-center gap-4">
                                    <span className="text-gray-500 w-16">Nom</span>
                                    <input
                                        name="author_2_name"
                                        value={formData.author_2_name}
                                        onChange={handleChange}
                                        className="flex-1 bg-white border border-blue-300 rounded px-3 py-1.5"
                                    />
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-gray-500 w-16">Prénom</span>
                                    <input
                                        name="author_2_firstname"
                                        value={formData.author_2_firstname}
                                        onChange={handleChange}
                                        className="flex-1 bg-white border border-blue-300 rounded px-3 py-1.5"
                                    />
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-gray-500 w-16">Fonction</span>
                                    <select
                                        name="author_2_role"
                                        value={formData.author_2_role}
                                        onChange={handleChange}
                                        className="flex-1 bg-white border border-blue-300 rounded px-3 py-1.5"
                                    >
                                        <option>Préparation</option>
                                        <option>Traduction</option>
                                        <option>Illustration</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="flex flex-col sm:grid sm:grid-cols-[120px_1fr] gap-4 mt-8">
                            <label className="text-gray-500 mt-2">Description :</label>
                            <div className="w-full space-y-2">
                                <div className="flex items-center gap-4">
                                    <span className="text-gray-500 w-32">Nombre de pages</span>
                                    <input
                                        name="page_count"
                                        value={formData.page_count}
                                        onChange={handleChange}
                                        className="flex-1 bg-white border border-blue-300 rounded px-3 py-1.5"
                                    />
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-gray-500 w-32">Illustrations</span>
                                    <input
                                        name="illustrations"
                                        value={formData.illustrations}
                                        onChange={handleChange}
                                        className="flex-1 bg-white border border-blue-300 rounded px-3 py-1.5"
                                    />
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-gray-500 w-32">Nombre de tomes</span>
                                    <input
                                        name="volume_count"
                                        value={formData.volume_count}
                                        onChange={handleChange}
                                        className="flex-1 bg-white border border-blue-300 rounded px-3 py-1.5"
                                    />
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-gray-500 w-32">Format</span>
                                    <input
                                        name="format"
                                        value={formData.format}
                                        onChange={handleChange}
                                        className="flex-1 bg-white border border-blue-300 rounded px-3 py-1.5"
                                    />
                                </div>
                            </div>
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

                            {formData.author_2_name && (
                                <>
                                    <span className="font-bold">Auteur Secondaire :</span>
                                    <span>{formData.author_2_name} {formData.author_2_firstname} ({formData.author_2_role})</span>
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
