import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { manuscriptId } = await req.json()
        console.log(`[Expertise IA] Début de l'analyse pour ID: ${manuscriptId}`)

        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // 1. Fetch Publication data (Separate from profile to avoid schema cache issues)
        console.log("[Expertise IA] Chargement des données de publication...")
        const { data: manuscript, error: manuscriptError } = await supabaseClient
            .from('publications')
            .select('*')
            .eq('id', manuscriptId)
            .single()

        if (manuscriptError || !manuscript) {
            console.error("[Expertise IA] Erreur chargement publication:", manuscriptError)
            throw new Error(`Manuscrit non trouvé: ${manuscriptError?.message}`)
        }

        // 1b. Fetch Profile data separately
        console.log("[Expertise IA] Chargement du profil auteur...")
        const { data: profile } = await supabaseClient
            .from('profiles')
            .select('*')
            .eq('id', manuscript.user_id)
            .single()

        // 2. Update status to 'processing'
        await supabaseClient
            .from('publications')
            .update({ ai_status: 'processing' })
            .eq('id', manuscriptId)

        // 3. Fetch custom prompt
        console.log("[Expertise IA] Chargement du prompt de configuration...")
        const { data: setting } = await supabaseClient
            .from('admin_settings')
            .select('value')
            .eq('key', 'ai_manuscript_prompt')
            .single()

        const promptTemplate = setting?.value || "Analyse ce manuscrit: {{title}}"

        // 4. Download file from Storage (if exists)
        let extractedText = "Aucun texte extrait du fichier."
        const filePath = manuscript.file_doc_url || manuscript.file_pdf_url

        if (filePath) {
            console.log(`[Expertise IA] Téléchargement du fichier: ${filePath}`)
            const { data: fileBlob, error: downloadError } = await supabaseClient
                .storage
                .from('manuscripts')
                .download(filePath)

            if (!downloadError && fileBlob) {
                const arrayBuffer = await fileBlob.arrayBuffer()
                if (filePath.endsWith('.docx')) {
                    console.log("[Expertise IA] Extraction texte DOCX...")
                    try {
                        const mammoth = await import("https://esm.sh/mammoth@1.6.0")
                        const result = await mammoth.extractRawText({ arrayBuffer: arrayBuffer })
                        extractedText = result.value
                        console.log(`[Expertise IA] Texte extrait (${extractedText.length} caractères)`)
                    } catch (extErr) {
                        console.error("[Expertise IA] Échec extraction DOCX:", extErr)
                        extractedText = "Erreur lors de l'extraction du texte du fichier DOCX."
                    }
                } else if (filePath.endsWith('.pdf')) {
                    extractedText = "Extraction PDF non supportée nativement dans cette version."
                }
            } else if (downloadError) {
                console.warn("[Expertise IA] Avertissement: Fichier non trouvé dans le storage:", downloadError.message)
            }
        }

        // 5. Prepare final prompt
        const authorInfo = profile ? JSON.stringify(profile) : "Inconnu (Profil manquant)"
        const finalPrompt = promptTemplate
            .replace("{{title}}", manuscript.title_main || "Sans titre")
            .replace("{{summary}}", manuscript.summary || "Aucun")
            .replace("{{keywords}}", manuscript.keywords || "Aucun")
            .replace("{{content}}", extractedText)
            .replace("{{author_profile}}", authorInfo)

        // 6. Call Gemini API
        console.log("[Expertise IA] Appel API Google Gemini 1.5 Pro...")
        const geminiKey = Deno.env.get('GEMINI_API_KEY')
        if (!geminiKey) throw new Error("GEMINI_API_KEY non configurée dans les secrets Supabase.")

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: finalPrompt }] }],
                    generationConfig: {
                        response_mime_type: "application/json",
                    }
                })
            }
        )

        if (!response.ok) {
            const errText = await response.text()
            console.error("[Expertise IA] Erreur API Gemini:", errText)
            throw new Error(`Gemini API Error: ${response.status} ${response.statusText}`)
        }

        const geminiData = await response.json()
        const resultText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text

        if (!resultText) {
            console.error("[Expertise IA] Réponse Gemini vide:", geminiData)
            throw new Error("L'IA n'a pas renvoyé de contenu textuel.")
        }

        let aiResult;
        try {
            aiResult = JSON.parse(resultText)
        } catch (parseErr) {
            console.error("[Expertise IA] Erreur parsing JSON IA:", resultText)
            throw new Error("Le format de réponse de l'IA n'est pas un JSON valide.")
        }

        console.log("[Expertise IA] Analyse réussie, mise à jour DB...")

        // 7. Update database with final result
        const { error: updateError } = await supabaseClient
            .from('publications')
            .update({
                ai_score: Math.round(aiResult.final_evaluation?.overall_score || 0),
                ai_detailed_review: aiResult,
                ai_status: 'completed'
            })
            .eq('id', manuscriptId)

        if (updateError) throw updateError

        return new Response(JSON.stringify({ success: true, data: aiResult }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })

    } catch (error) {
        console.error(`[Expertise IA] Erreur fatale: ${error.message}`)
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        })
    }
})
