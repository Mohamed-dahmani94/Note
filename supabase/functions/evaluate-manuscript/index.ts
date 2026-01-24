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
        console.log(`[Gemini V1.5] Lancement de l'expertise pour ID: ${manuscriptId}`)

        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // 1. Récupération du Manuscrit
        const { data: manuscript, error: manuscriptError } = await supabaseClient
            .from('publications')
            .select('*')
            .eq('id', manuscriptId)
            .single()

        if (manuscriptError || !manuscript) throw new Error(`DB Fetch Error: ${manuscriptError?.message}`)

        // 2. Récupération du profil auteur
        const { data: profile } = await supabaseClient
            .from('profiles')
            .select('*')
            .eq('id', manuscript.user_id)
            .single()

        // 3. Mise à jour statut -> processing
        await supabaseClient.from('publications').update({ ai_status: 'processing' }).eq('id', manuscriptId)

        // 4. Récupération du prompt
        const { data: setting } = await supabaseClient
            .from('admin_settings')
            .select('value')
            .eq('key', 'ai_manuscript_prompt')
            .single()

        const promptTemplate = setting?.value || "Analyse ce manuscrit et réponds en JSON: {{title}}"

        // 5. Extraction simplifiée (on évite mammoth pour tester la stabilité)
        let extractedText = "L'analyse complète du texte est activée. (Simulation texte extrait)."

        // 6. Construction du prompt final
        const finalPrompt = promptTemplate
            .replace("{{title}}", manuscript.title_main || "")
            .replace("{{summary}}", manuscript.summary || "")
            .replace("{{keywords}}", manuscript.keywords || "")
            .replace("{{content}}", extractedText)
            .replace("{{author_profile}}", JSON.stringify(profile || {}))

        // 7. Appel Gemini API (Version 1.5 - Correction SNAKE_CASE)
        console.log("[Gemini V1.5] Envoi à Gemini 1.5 Flash (v1beta)...")
        const geminiKey = Deno.env.get('GEMINI_API_KEY')
        if (!geminiKey) throw new Error("Clé GEMINI_API_KEY manquante dans les secrets.")

        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`

        const response = await fetch(geminiUrl, {
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
        })

        if (!response.ok) {
            const apiError = await response.text()
            console.error(`[Gemini V1.5] API REJECTED: ${apiError}`)
            throw new Error(`Gemini API Error ${response.status}`)
        }

        const geminiData = await response.json()
        let resultText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text

        if (!resultText) throw new Error("L'IA a renvoyé une réponse vide.")

        // Nettoyage Markdown si présent
        resultText = resultText.replace(/```json\n?/, '').replace(/\n?```/, '').trim()
        const aiResult = JSON.parse(resultText)

        // 8. Enregistrement en base de données
        console.log("[Gemini V1.5] Succès! Enregistrement du rapport...")
        const { error: updateError } = await supabaseClient.from('publications').update({
            ai_score: Math.round(aiResult.final_evaluation?.overall_score || 0),
            ai_detailed_review: aiResult,
            ai_status: 'completed'
        }).eq('id', manuscriptId)

        if (updateError) throw new Error(`DB Save Error: ${updateError.message}`)

        return new Response(JSON.stringify({ success: true, version: "1.5" }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })

    } catch (error) {
        console.error(`[Gemini V1.5 FATAL] ${error.message}`)
        return new Response(JSON.stringify({ error: error.message, version: "V1.5" }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        })
    }
})
