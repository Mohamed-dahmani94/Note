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
        console.log(`[OpenAI V1.1] Démarrage de l'analyse pour ID: ${manuscriptId}`)

        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // 1. Data Fetch
        const { data: manuscript, error: manuscriptError } = await supabaseClient
            .from('publications')
            .select('*')
            .eq('id', manuscriptId)
            .single()

        if (manuscriptError || !manuscript) {
            throw new Error(`Erreur extraction base de données: ${manuscriptError?.message || 'Manuscrit introuvable'}`)
        }

        const { data: profile } = await supabaseClient
            .from('profiles')
            .select('*')
            .eq('id', manuscript.user_id)
            .single()

        // 2. Processing State
        await supabaseClient.from('publications').update({ ai_status: 'processing' }).eq('id', manuscriptId)

        // 3. Prompt Fetch
        const { data: setting } = await supabaseClient.from('admin_settings').select('value').eq('key', 'ai_manuscript_prompt').single()
        const promptTemplate = setting?.value || "Analyse ce manuscrit et réponds en JSON: {{title}}"

        // 4. Text Extraction (with safer import)
        let extractedText = "Aucun texte n'a pu être extrait du fichier."
        const filePath = manuscript.file_doc_url || manuscript.file_pdf_url

        if (filePath) {
            console.log(`[OpenAI V1.1] Téléchargement: ${filePath}`)
            const { data: fileBlob, error: storageError } = await supabaseClient.storage.from('manuscripts').download(filePath)
            if (storageError) {
                console.warn(`[OpenAI V1.1] Erreur storage: ${storageError.message}`)
            } else if (fileBlob) {
                const arrayBuffer = await fileBlob.arrayBuffer()
                if (filePath.endsWith('.docx')) {
                    try {
                        // Using a more reliable import for mammoth
                        const mammoth = await import("https://esm.sh/mammoth@1.6.0?no-check")
                        const result = await mammoth.extractRawText({ arrayBuffer })
                        extractedText = result.value
                        console.log(`[OpenAI V1.1] Texte extrait: ${extractedText.length} caractères`)
                    } catch (e) {
                        console.error("[OpenAI V1.1] Mammoth failed:", e.message)
                        extractedText = "Extraction DOCX impossible sur le serveur."
                    }
                }
            }
        }

        // 5. Final Prompt Assembly
        const finalPrompt = promptTemplate
            .replace("{{title}}", manuscript.title_main || "")
            .replace("{{summary}}", manuscript.summary || "")
            .replace("{{keywords}}", manuscript.keywords || "")
            .replace("{{content}}", extractedText)
            .replace("{{author_profile}}", JSON.stringify(profile || "Inconnu"))

        // 6. OpenAI Verification
        const openAiKey = Deno.env.get('OPENAI_API_KEY')
        if (!openAiKey || openAiKey === 'votre_cle_api') {
            throw new Error("OPENAI_API_KEY est manquante ou non configurée dans les secrets Supabase.")
        }

        // 7. OpenAI API Call
        console.log("[OpenAI V1.1] Appel GPT-4o...")
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${openAiKey}`
            },
            body: JSON.stringify({
                model: "gpt-4o",
                messages: [
                    { role: "system", content: "Vous êtes un expert en édition. Vous devez répondre EXCLUSIVEMENT au format JSON." },
                    { role: "user", content: finalPrompt }
                ],
                response_format: { type: "json_object" }
            })
        })

        if (!response.ok) {
            const errDetails = await response.text()
            console.error(`[OpenAI V1.1] API OpenAI Error: ${errDetails}`)
            throw new Error(`OpenAI API Error (${response.status}): ${errDetails}`)
        }

        const openAiData = await response.json()
        const resultText = openAiData.choices[0].message.content
        const aiResult = JSON.parse(resultText)

        // 8. Result Storage
        console.log("[OpenAI V1.1] Succès! Enregistrement...")
        await supabaseClient.from('publications').update({
            ai_score: Math.round(aiResult.final_evaluation?.overall_score || 0),
            ai_detailed_review: aiResult,
            ai_status: 'completed'
        }).eq('id', manuscriptId)

        return new Response(JSON.stringify({ success: true, version: "1.1" }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })

    } catch (error) {
        console.error(`[OpenAI V1.1 ERREUR] ${error.message}`)
        return new Response(JSON.stringify({
            error: error.message,
            tip: "Vérifiez que OPENAI_API_KEY est bien définie avec 'supabase secrets set'",
            version: "1.1"
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        })
    }
})
