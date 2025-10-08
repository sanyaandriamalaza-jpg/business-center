import OpenAI from "openai";
import { NextResponse } from "next/server";

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

interface AnalysisResult {
    destinataire?: string | null;
    objet?: string | null;
    email?: string | null;
    resume?: string | null;
    raw?: string | null;
}

export async function POST(req: Request) {
    try {
        const { text } = (await req.json()) as { text?: string };

        if (!text || !text.trim()) {
            return NextResponse.json(
                { success: false, data: {}, error: "Aucun texte disponible pour être analysé" },
                { status: 400 }
            );
        }

        const prompt = `
        Tu es un assistant spécialisé pour une entreprise de service de domiciliation. 
        Analyse ce courrier et extrait les informations suivantes strictement au format JSON :

        {
        "expediteur": null,
        "destinataire": null,
        "email": null,
        "objet": null,
        "resume": null
        }

        - expediteur : nom ou entité qui a envoyé le courrier
        - destinataire : nom ou entité à qui le courrier est adressé
        - email : adresse email à qui le courrier est adressé
        - objet : sujet ou motif principal du courrier
        - resume : résumé clair, concis et lisible du contenu

        Ne mets **aucune phrase supplémentaire** en dehors du JSON, et si tu ne trouves pas les valeurs de chaque clé, mets simplement null.

        Texte du courrier :
        ${text}
        `;

        const response = await client.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: prompt }],
            temperature: 0,
            max_tokens: 500,
        });

        const contentRaw = response.choices[0].message?.content ?? "";

        let analysis: AnalysisResult = { destinataire: null, email: null, objet: null, resume: null, raw: undefined };
        let success = false;

        try {
            const cleanedString = contentRaw.replace(/```json\s*|```/g, '').trim();
            analysis = JSON.parse(cleanedString);
            success = true;
        } catch {
            analysis.raw = contentRaw.trim();
        }

        return NextResponse.json({ success, data: analysis });
    } catch (err: any) {
        console.error("Erreur lors de l'analyse :", err);
        return NextResponse.json(
            { success: false, data: {}, error: err.message || "Erreur inconnue" },
            { status: 500 }
        );
    }
}