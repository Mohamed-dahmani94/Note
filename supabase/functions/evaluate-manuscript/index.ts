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
        console.log(`[V1.7] Analyse IA pour le manuscrit ID: ${manuscriptId}`)

        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // 1. Fetch Publication data
        const { data: manuscript, error: manuscriptError } = await supabaseClient
            .from('publications')
            .select('*')
            .eq('id', manuscriptId)
            .single()

        if (manuscriptError || !manuscript) {
            throw new Error(`Manuscrit ${manuscriptId} non trouvé dans la base de données.`)
        }

        // 2. Fetch Author Profile
        const { data: profile } = await supabaseClient
            .from('profiles')
            .select('*')
            .eq('id', manuscript.user_id)
            .single()

        // 3. Mark as processing
        await supabaseClient
            .from('publications')
            .update({ ai_status: 'processing' })
            .eq('id', manuscriptId)

        // 4. Fetch Custom Prompt from settings
        const { data: setting } = await supabaseClient
            .from('admin_settings')
            .select('value')
            .eq('key', 'ai_manuscript_prompt')
            .single()

        const promptTemplate = setting?.value || "Analyse ce manuscrit: {{title}}"

        // 5. Extract text from file
        let extractedText = "Aucun texte n'a pu être extrait du fichier."
        const filePath = manuscript.file_doc_url || manuscript.file_pdf_url

        if (filePath) {
            console.log(`[V1.7] Récupération du fichier: ${filePath}`)
            const { data: fileBlob, error: downloadError } = await supabaseClient
                .storage
                .from('manuscripts')
                .download(filePath)

            if (!downloadError && fileBlob) {
                const arrayBuffer = await fileBlob.arrayBuffer()
                if (filePath.endsWith('.docx')) {
                    try {
                        const mammoth = await import("https://esm.sh/mammoth@1.6.0")
                        const result = await mammoth.extractRawText({ arrayBuffer: arrayBuffer })
                        extractedText = result.value
                    } catch (extErr) {
                        console.error("[V1.7] Erreur extraction DOCX:", extErr)
                        extractedText = "Le fichier DOCX n'a pas pu être lu correctement."
                    }
                } else if (filePath.endsWith('.pdf')) {
                    extractedText = "L'extraction du texte PDF n'est pas encore activée (en cours de développement)."
                }
            }
        }

        // 6. Build the final prompt
        const finalPrompt = promptTemplate
            .replace("{{title}}", manuscript.title_main || "Titre inconnu")
            .replace("{{summary}}", manuscript.summary || "Pas de résumé")
            .replace("{{keywords}}", manuscript.keywords || "Pas de mots-clés")
            .replace("{{content}}", extractedText)
            .replace("{{author_profile}}", JSON.stringify(profile || "Données auteur non disponibles"))

        // 7. Call Gemini API (using snake_case for REST compatibility)
        console.log("[V1.7] Envoi à Gemini API...")
        const geminiKey = Deno.env.get('GEMINI_API_KEY')

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: finalPrompt }]
                    }],
                    generation_config: {
                        response_mime_type: "application/json"
                    }
                })
            }
        )

        if (!response.ok) {
            const errorText = await response.text()
            console.error(`[V1.7] Erreur Gemini (${response.status}):`, errorText)
            throw new Error(`Gemini API Error: ${response.status}`)
        }

        const geminiData = await response.json()
        let resultText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text

        if (!resultText) throw new Error("L'IA a renvoyé une réponse vide.")

        // Cleaning markdown if any (Gemini sometimes adds it even with response_mime_type)
        resultText = resultText.replace(/```json\n?/, '').replace(/\n?```/, '').trim()
        const aiResult = JSON.parse(resultText)

        // 8. Update Publication status and result
        console.log("[V1.7] Analyse terminée. Enregistrement des résultats...")
        const { error: updateError } = await supabaseClient
            .from('publications')
            .update({
                ai_score: Math.round(aiResult.final_evaluation?.overall_score || 0),
                ai_detailed_review: aiResult,
                ai_status: 'completed'
            })
            .eq('id', manuscriptId)

        if (updateError) throw updateError

        return new Response(JSON.stringify({ success: true, message: "Analyse terminée avec succès." }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })

    } catch (error) {
        console.error(`[V1.7] Erreur critique: ${error.message}`)
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        })
    }
})
