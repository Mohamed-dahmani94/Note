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
        console.log(`[Gemini V1.4] Démarrage de l'analyse pour ID: ${manuscriptId}`)

        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // 1. Publication
        const { data: manuscript, error: manuscriptError } = await supabaseClient
            .from('publications')
            .select('*')
            .eq('id', manuscriptId)
            .single()

        if (manuscriptError || !manuscript) throw new Error(`Data fetch error: ${manuscriptError?.message}`)

        // 2. Profile
        const { data: profile } = await supabaseClient
            .from('profiles')
            .select('*')
            .eq('id', manuscript.user_id)
            .single()

        // 3. Status -> processing
        await supabaseClient.from('publications').update({ ai_status: 'processing' }).eq('id', manuscriptId)

        // 4. Prompt
        const { data: setting } = await supabaseClient
            .from('admin_settings')
            .select('value')
            .eq('key', 'ai_manuscript_prompt')
            .single()

        const promptTemplate = setting?.value || "Analyze this manuscript and return JSON only: {{title}}"

        // 5. Content extraction (Simplifié)
        let extractedText = "Le texte n'a pas pu être extrait."
        const filePath = manuscript.file_doc_url || manuscript.file_pdf_url
        if (filePath) {
            console.log(`[V1.4] Téléchargement: ${filePath}`)
            const { data: fileBlob } = await supabaseClient.storage.from('manuscripts').download(filePath)
            if (fileBlob) {
                const arrayBuffer = await fileBlob.arrayBuffer()
                if (filePath.endsWith('.docx')) {
                    try {
                        const mammoth = await import("https://esm.sh/mammoth@1.6.0")
                        const result = await mammoth.extractRawText({ arrayBuffer })
                        extractedText = result.value
                    } catch (e) { console.error("Mammoth error", e) }
                }
            }
        }

        // 6. Final Prompt
        const finalPrompt = promptTemplate
            .replace("{{title}}", manuscript.title_main || "Sans titre")
            .replace("{{summary}}", manuscript.summary || "Pas de résumé")
            .replace("{{keywords}}", manuscript.keywords || "Pas de mots-clés")
            .replace("{{content}}", extractedText)
            .replace("{{author_profile}}", JSON.stringify(profile || {}))

        // 7. Gemini Call (V1.4 - Using v1 stable endpoint)
        console.log("[V1.4] Envoi à Gemini (v1 stable)...")
        const geminiKey = Deno.env.get('GEMINI_API_KEY')
        if (!geminiKey) throw new Error("GEMINI_API_KEY is missing in secrets.")

        // Using v1 endpoint which is more stable in some regions
        const geminiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${geminiKey}`

        const response = await fetch(geminiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: finalPrompt }] }],
                generationConfig: {
                    responseMimeType: "application/json"
                }
            })
        })

        if (!response.ok) {
            const apiErr = await response.text()
            console.error(`[V1.4] Error detail: ${apiErr}`)
            throw new Error(`Gemini API Error ${response.status}`)
        }

        const geminiData = await response.json()
        let resultText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text

        if (!resultText) throw new Error("Réponse IA vide.")

        // Nettoyage JSON
        resultText = resultText.replace(/```json\n?/, '').replace(/\n?```/, '').trim()
        const aiResult = JSON.parse(resultText)

        // 8. DB Update
        console.log("[V1.4] Enregistrement du rapport...")
        await supabaseClient.from('publications').update({
            ai_score: Math.round(aiResult.final_evaluation?.overall_score || 0),
            ai_detailed_review: aiResult,
            ai_status: 'completed'
        }).eq('id', manuscriptId)

        return new Response(JSON.stringify({ success: true, model: "gemini-1.5-flash" }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })

    } catch (error) {
        console.error(`[V1.4] Erreur: ${error.message}`)
        return new Response(JSON.stringify({ error: error.message, version: "V1.4" }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        })
    }
})
