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
        console.log(`[V1.2 DEBUG] STARTING analysis for ID: ${manuscriptId}`)

        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // 1. Fetch Publication
        console.log("[V1.2] Fetching manuscript data...")
        const { data: manuscript, error: manuscriptError } = await supabaseClient
            .from('publications')
            .select('*')
            .eq('id', manuscriptId)
            .single()

        if (manuscriptError || !manuscript) {
            throw new Error(`DB Error: ${manuscriptError?.message || 'Manuscript not found'}`)
        }

        // 2. Fetch Profile
        console.log(`[V1.2] Fetching profile for user: ${manuscript.user_id}`)
        const { data: profile } = await supabaseClient
            .from('profiles')
            .select('*')
            .eq('id', manuscript.user_id)
            .single()

        // 3. Mark as processing
        await supabaseClient.from('publications').update({ ai_status: 'processing' }).eq('id', manuscriptId)

        // 4. Fetch Custom Prompt
        console.log("[V1.2] Fetching prompt content...")
        const { data: setting } = await supabaseClient
            .from('admin_settings')
            .select('value')
            .eq('key', 'ai_manuscript_prompt')
            .single()

        const promptTemplate = setting?.value || "Analyze this manuscript: {{title}}"

        // 5. Build raw meta prompt (Skip file extraction if it fails)
        console.log("[V1.2] Building final prompt...")
        let extractedText = "Texte non extrait (V1.2 Simplification)"

        const finalPrompt = promptTemplate
            .replace("{{title}}", manuscript.title_main || "Sans titre")
            .replace("{{summary}}", manuscript.summary || "Pas de résumé")
            .replace("{{keywords}}", manuscript.keywords || "Pas de mots-clés")
            .replace("{{content}}", extractedText)
            .replace("{{author_profile}}", JSON.stringify(profile || {}))

        // 6. OpenAI CALL
        const openAiKey = Deno.env.get('OPENAI_API_KEY')
        if (!openAiKey) {
            throw new Error("CRITICAL: OPENAI_API_KEY is null in Supabase Secrets!")
        }

        console.log("[V1.2] Calling OpenAI (gpt-4o)...")
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${openAiKey}`
            },
            body: JSON.stringify({
                model: "gpt-4o",
                messages: [
                    { role: "system", content: "Expert éditorial. Réponds uniquement en JSON valide." },
                    { role: "user", content: finalPrompt }
                ],
                temperature: 0.7
            })
        })

        if (!response.ok) {
            const apiErr = await response.text()
            console.error(`[V1.2] OpenAI API REJECTED: ${apiErr}`)
            throw new Error(`OpenAI API ${response.status}: ${apiErr}`)
        }

        const openAiData = await response.json()
        let resultText = openAiData.choices[0].message.content

        console.log("[V1.2] Analysis received successfully.")

        // Clean resultText (sometimes OpenAI adds ```json ... ```)
        resultText = resultText.replace(/```json\n?/, '').replace(/\n?```/, '').trim()
        const aiResult = JSON.parse(resultText)

        // 7. Update DB
        console.log("[V1.2] Saving result to database...")
        const { error: dbUpdateError } = await supabaseClient.from('publications').update({
            ai_score: Math.round(aiResult.final_evaluation?.overall_score || 0),
            ai_detailed_review: aiResult,
            ai_status: 'completed'
        }).eq('id', manuscriptId)

        if (dbUpdateError) throw new Error(`Result save error: ${dbUpdateError.message}`)

        return new Response(JSON.stringify({ success: true, version: "V1.2" }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })

    } catch (error) {
        console.error(`[V1.2 FATAL ERROR] ${error.message}`)
        return new Response(JSON.stringify({
            error: error.message,
            version: "V1.2",
            details: "Veuillez vérifier les logs Supabase pour plus de détails."
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        })
    }
})
