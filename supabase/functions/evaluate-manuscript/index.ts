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
        console.log(`[Gemini V1.3] Démarrage de l'analyse pour ID: ${manuscriptId}`)

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
            throw new Error(`Data fetch error: ${manuscriptError?.message || 'Manuscript not found'}`)
        }

        // 2. Fetch Author Profile
        const { data: profile } = await supabaseClient
            .from('profiles')
            .select('*')
            .eq('id', manuscript.user_id)
            .single()

        // 3. Mark as processing
        await supabaseClient.from('publications').update({ ai_status: 'processing' }).eq('id', manuscriptId)

        // 4. Fetch Custom Prompt
        const { data: setting } = await supabaseClient
            .from('admin_settings')
            .select('value')
            .eq('key', 'ai_manuscript_prompt')
            .single()

        const promptTemplate = setting?.value || "Analyze this manuscript and return JSON only: {{title}}"

        // 5. Extract text from file (Simplifié pour V1.3)
        let extractedText = "Texte non disponible dans cette analyse rapide."
        const filePath = manuscript.file_doc_url || manuscript.file_pdf_url

        if (filePath) {
            console.log(`[Gemini V1.3] Téléchargement: ${filePath}`)
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

        // 6. Build the final prompt
        const authorContent = profile ? JSON.stringify(profile) : "{}"
        const finalPrompt = promptTemplate
            .replace("{{title}}", manuscript.title_main || "Sans titre")
            .replace("{{summary}}", manuscript.summary || "Pas de résumé")
            .replace("{{keywords}}", manuscript.keywords || "Pas de mots-clés")
            .replace("{{content}}", extractedText)
            .replace("{{author_profile}}", authorContent)

        // 7. Gemini Call (RE-FIXED VERSION V1.3)
        console.log("[Gemini V1.3] Calling Google API (1.5 Flash)...")
        const geminiKey = Deno.env.get('GEMINI_API_KEY')
        if (!geminiKey) throw new Error("GEMINI_API_KEY is missing in Supabase Secrets.")

        // Using v1beta for better JSON support
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`

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
            console.error(`[Gemini V1.3] API Error: ${apiErr}`)
            throw new Error(`Gemini API Error ${response.status}: ${apiErr}`)
        }

        const geminiData = await response.json()
        let resultText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text

        if (!resultText) throw new Error("Empty response from Gemini.")

        // Clean resultText if Gemini included markdown
        resultText = resultText.replace(/```json\n?/, '').replace(/\n?```/, '').trim()
        const aiResult = JSON.parse(resultText)

        // 8. Update DB
        console.log("[Gemini V1.3] Saving institutional report...")
        const { error: dbUpdateError } = await supabaseClient.from('publications').update({
            ai_score: Math.round(aiResult.final_evaluation?.overall_score || 0),
            ai_detailed_review: aiResult,
            ai_status: 'completed'
        }).eq('id', manuscriptId)

        if (dbUpdateError) throw new Error(`Database Update failed: ${dbUpdateError.message}`)

        return new Response(JSON.stringify({ success: true, version: "V1.3 (Gemini)" }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })

    } catch (error) {
        console.error(`[Gemini V1.3 FATAL] ${error.message}`)
        return new Response(JSON.stringify({
            error: error.message,
            version: "V1.3 (Gemini)",
            tip: "Check logs at Supabase Dashboard for full context."
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        })
    }
})
