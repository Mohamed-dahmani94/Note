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
        console.log(`[Version 1.2] Expertise IA pour ID: ${manuscriptId}`)

        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // 1. Fetch Publication
        const { data: manuscript, error: manuscriptError } = await supabaseClient
            .from('publications')
            .select('*')
            .eq('id', manuscriptId)
            .single()

        if (manuscriptError || !manuscript) {
            throw new Error(`Manuscrit ${manuscriptId} non trouvé.`)
        }

        // 1b. Fetch Profile
        const { data: profile } = await supabaseClient
            .from('profiles')
            .select('*')
            .eq('id', manuscript.user_id)
            .single()

        // 2. Status -> processing
        await supabaseClient.from('publications').update({ ai_status: 'processing' }).eq('id', manuscriptId)

        // 3. Prompt
        const { data: setting } = await supabaseClient.from('admin_settings').select('value').eq('key', 'ai_manuscript_prompt').single()
        const promptTemplate = setting?.value || "Analyse multicritère pour: {{title}}"

        // 4. Content extraction
        let extractedText = "Texte non disponible."
        const filePath = manuscript.file_doc_url || manuscript.file_pdf_url
        if (filePath) {
            console.log(`[V1.2] Téléchargement: ${filePath}`)
            const { data: fileBlob } = await supabaseClient.storage.from('manuscripts').download(filePath)
            if (fileBlob) {
                const arrayBuffer = await fileBlob.arrayBuffer()
                if (filePath.endsWith('.docx')) {
                    const mammoth = await import("https://esm.sh/mammoth@1.6.0")
                    const result = await mammoth.extractRawText({ arrayBuffer })
                    extractedText = result.value
                } else {
                    extractedText = "Format non supporté pour l'extraction intégrale (PDF/Autre)."
                }
            }
        }

        // 5. Final Prompt
        const finalPrompt = promptTemplate
            .replace("{{title}}", manuscript.title_main || "")
            .replace("{{summary}}", manuscript.summary || "")
            .replace("{{keywords}}", manuscript.keywords || "")
            .replace("{{content}}", extractedText)
            .replace("{{author_profile}}", JSON.stringify(profile || {}))

        // 6. Gemini Call (Stable v1 with 1.5 Flash)
        console.log("[V1.2] Envoi à Gemini 1.5 Flash...")
        const geminiKey = Deno.env.get('GEMINI_API_KEY')

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: finalPrompt }] }],
                    generationConfig: { response_mime_type: "application/json" }
                })
            }
        )

        if (!response.ok) {
            const errorBody = await response.text()
            console.error(`[V1.2] Erreur API: ${errorBody}`)
            throw new Error(`Gemini API Error: ${response.status}`)
        }

        const geminiData = await response.json()
        const resultText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text

        if (!resultText) throw new Error("Réponse IA vide.")

        const aiResult = JSON.parse(resultText)

        // 7. DB Update
        await supabaseClient.from('publications').update({
            ai_score: Math.round(aiResult.final_evaluation?.overall_score || 0),
            ai_detailed_review: aiResult,
            ai_status: 'completed'
        }).eq('id', manuscriptId)

        return new Response(JSON.stringify({ success: true }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })

    } catch (error) {
        console.error(`[V1.2] Erreur: ${error.message}`)
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        })
    }
})
