import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { manuscriptId } = await req.json()
        console.log(`[Gemini V1.6] DEBUT - ID: ${manuscriptId}`)

        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // 1. Manuscrit
        const { data: manuscript, error: manuscriptError } = await supabaseClient
            .from('publications')
            .select('*')
            .eq('id', manuscriptId)
            .single()

        if (manuscriptError || !manuscript) throw new Error(`[DB] Manuscrit non trouvé: ${manuscriptError?.message}`)

        // 2. Profil
        const { data: profile } = await supabaseClient.from('profiles').select('*').eq('id', manuscript.user_id).single()

        // 3. Status
        await supabaseClient.from('publications').update({ ai_status: 'processing' }).eq('id', manuscriptId)

        // 4. Prompt
        const { data: setting } = await supabaseClient.from('admin_settings').select('value').eq('key', 'ai_manuscript_prompt').single()
        const promptTemplate = setting?.value || "Analyse multicritère pour: {{title}}"

        // 5. Extraction (Correction Storage)
        let extractedText = "Texte non extrait."
        const filePath = manuscript.file_doc_url || manuscript.file_pdf_url
        if (filePath) {
            // Nettoyage du path si c'est une URL complète
            const pathOnly = filePath.includes('bucket/') ? filePath.split('bucket/')[1] : filePath
            console.log(`[Storage] Téléchargement de ${pathOnly}...`)

            const { data: fileBlob, error: downloadError } = await supabaseClient.storage.from('manuscripts').download(pathOnly)

            if (fileBlob && !downloadError) {
                const arrayBuffer = await fileBlob.arrayBuffer()
                if (pathOnly.endsWith('.docx')) {
                    try {
                        const mammoth = await import("https://esm.sh/mammoth@1.6.0")
                        const result = await mammoth.extractRawText({ arrayBuffer })
                        extractedText = result.value
                        console.log(`[Mammoth] Succès extraction (${extractedText.length} chars)`)
                    } catch (e: any) {
                        console.error("[Mammoth] Erreur:", e.message)
                    }
                }
            } else {
                console.warn("[Storage] Échec download:", downloadError?.message)
            }
        }

        // 6. Prompt Final
        const finalPrompt = promptTemplate
            .replace("{{title}}", manuscript.title_main || "")
            .replace("{{summary}}", manuscript.summary || "")
            .replace("{{keywords}}", manuscript.keywords || "")
            .replace("{{content}}", extractedText)
            .replace("{{author_profile}}", JSON.stringify(profile || {}))

        // 7. Gemini (Switch to 2.0-flash + v1beta)
        console.log("[Gemini] Envoi à gpt-2.0-flash...")
        const geminiKey = Deno.env.get('GEMINI_API_KEY')
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`

        const response = await fetch(geminiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: finalPrompt }] }],
                generationConfig: { responseMimeType: "application/json" }
            })
        })

        if (!response.ok) {
            const err = await response.text()
            console.error("[Gemini] Erreur API:", err)
            throw new Error(`Gemini Error ${response.status}`)
        }

        const geminiData = await response.json()
        let resultText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text
        if (!resultText) throw new Error("IA sans réponse.")

        resultText = resultText.replace(/```json\n?/, '').replace(/\n?```/, '').trim()
        const aiResult = JSON.parse(resultText)

        // 8. Fin
        console.log("[Gemini] Analyse OK. Sauvegarde...")
        await supabaseClient.from('publications').update({
            ai_score: Math.round(aiResult.final_evaluation?.overall_score || 0),
            ai_detailed_review: aiResult,
            ai_status: 'completed'
        }).eq('id', manuscriptId)

        return new Response(JSON.stringify({ success: true, version: "V1.6" }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })

    } catch (error: any) {
        console.error(`[FATAL V1.6] ${error.message}`)
        return new Response(JSON.stringify({ error: error.message, version: "V1.6" }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        })
    }
})
