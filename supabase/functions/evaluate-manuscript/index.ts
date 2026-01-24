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
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // 1. Fetch Publication data
        console.log(`Expertise IA: Chargement du manuscrit ${manuscriptId}`)
        const { data: manuscript, error: manuscriptError } = await supabaseClient
            .from('publications')
            .select('*, profiles(*)')
            .eq('id', manuscriptId)
            .single()

        if (manuscriptError || !manuscript) {
            throw new Error(`Manuscrit non trouvé: ${manuscriptError?.message}`)
        }

        // 2. Update status to 'processing'
        await supabaseClient
            .from('publications')
            .update({ ai_status: 'processing' })
            .eq('id', manuscriptId)

        // 3. Fetch custom prompt
        const { data: setting } = await supabaseClient
            .from('admin_settings')
            .select('value')
            .eq('key', 'ai_manuscript_prompt')
            .single()

        const promptTemplate = setting?.value || "Analyse ce manuscrit: {{title}}"

        // 4. Download file from Storage (if exists)
        let extractedText = ""
        const filePath = manuscript.file_doc_url || manuscript.file_pdf_url

        if (filePath) {
            console.log(`Expertise IA: Téléchargement du fichier ${filePath}`)
            const { data: fileBlob, error: downloadError } = await supabaseClient
                .storage
                .from('manuscripts')
                .download(filePath)

            if (!downloadError && fileBlob) {
                const arrayBuffer = await fileBlob.arrayBuffer()
                const uint8Array = new Uint8Array(arrayBuffer)

                if (filePath.endsWith('.docx')) {
                    console.log("Expertise IA: Extraction texte DOCX...")
                    // Using mammoth for DOCX extraction
                    const mammoth = await import("https://esm.sh/mammoth@1.6.0")
                    const result = await mammoth.extractRawText({ arrayBuffer: arrayBuffer })
                    extractedText = result.value
                } else if (filePath.endsWith('.pdf')) {
                    console.log("Expertise IA: Extraction texte PDF...")
                    // Simple extraction for PDF (Heuristic) or using a parser
                    extractedText = "Extraction PDF en cours... (Texte brut non encore supporté à 100% dans Deno sans binaire externe)"
                } else {
                    // Plain text fallback
                    extractedText = new TextDecoder().decode(uint8Array).substring(0, 10000)
                }
            }
        }

        // 5. Prepare final prompt
        const authorInfo = JSON.stringify(manuscript.profiles || "Inconnu")
        const finalPrompt = promptTemplate
            .replace("{{title}}", manuscript.title_main || "Sans titre")
            .replace("{{summary}}", manuscript.summary || "Aucun")
            .replace("{{keywords}}", manuscript.keywords || "Aucun")
            .replace("{{content}}", extractedText)
            .replace("{{author_profile}}", authorInfo)

        // 6. Call Gemini API
        console.log("Expertise IA: Envoi à Google Gemini...")
        const geminiKey = Deno.env.get('GEMINI_API_KEY')
        if (!geminiKey) throw new Error("GEMINI_API_KEY non configurée")

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${geminiKey}`,
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

        const geminiData = await response.json()
        const resultText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text

        if (!resultText) {
            throw new Error("L'IA n'a pas renvoyé de résultat valide.")
        }

        const aiResult = JSON.parse(resultText)

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
        console.error(`Expertise IA Erreur: ${error.message}`)
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        })
    }
})
