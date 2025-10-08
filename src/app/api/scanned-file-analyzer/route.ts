import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import pdf from 'pdf-parse'
import Tesseract from 'tesseract.js'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  console.log('API appelée !')
  try {
    console.log('--- Début analyse PDF ---')
    const formData = await request.formData()
    const file = formData.get('file') as File

    console.log('Fichier reçu:', file?.name, file?.type, file?.size)

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 })
    }

    // Convertir le fichier en buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    console.log('Buffer créé, taille:', buffer.length)

    const analysisPrompt = `Analyse ce document de courrier et extrait les informations suivantes au format JSON strict:
{
  "expediteur": "nom/adresse de l'expéditeur",
  "destinataire": "nom/adresse du destinataire", 
  "objet": "objet/sujet du courrier",
  "confidence": 0.95
}

Instructions:
- Cherche attentivement les mentions "De:", "From:", "Expéditeur:", ou les adresses d'expédition
- Cherche "À:", "To:", "Destinataire:", "Madame", "Monsieur", ou les adresses de destination
- Pour l'objet, cherche "Objet:", "Subject:", "Ref:", "Référence:" ou déduis le sujet principal
- Assigne un score de confiance entre 0 et 1
- Si une information n'est pas trouvée, utilise "Non détecté"
- Réponds UNIQUEMENT avec le JSON, sans texte supplémentaire
`

    let textContent = ''

    if (file.type === 'application/pdf') {
      // PDF
      const pdfData = await pdf(buffer)
      textContent = pdfData.text
      if (!textContent.trim()) {
        throw new Error('Le PDF ne contient pas de texte lisible')
      }
    } else if (file.type.startsWith('image/')) {
      // Image → OCR avec Tesseract
      const { data: { text } } = await Tesseract.recognize(buffer, 'fra')
      textContent = text
      if (!textContent.trim()) {
        throw new Error('L\'image ne contient pas de texte lisible')
      }
    } else {
      return NextResponse.json(
        { error: 'Format de fichier non pris en charge. Seuls les PDF et images sont autorisés.' },
        { status: 400 }
      )
    }

    // Envoi à l'IA pour analyse
    const response = await openai.chat.completions.create({
      model: "gpt-5-mini",
      messages: [
        {
          role: "user",
          content: `${analysisPrompt}\n\nContenu du PDF:\n${textContent}`
        }
      ],
      max_tokens: 500,
      temperature: 0.1
    })

    const content = response.choices[0]?.message?.content
    if (!content) throw new Error('Aucune réponse de l\'IA')

      console.log('Réponse GPT brute:', response.choices[0]?.message?.content)

    let analysisResult
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      const jsonString = jsonMatch ? jsonMatch[0] : content
      analysisResult = JSON.parse(jsonString)
    } catch (parseError) {
      console.error('Erreur de parsing JSON:', content)
      throw new Error('Format de réponse invalide de l\'IA')
    }

    const result = {
      expediteur: analysisResult.expediteur || 'Non détecté',
      destinataire: analysisResult.destinataire || 'Non détecté',
      objet: analysisResult.objet || 'Non détecté',
      confidence: Math.min(Math.max(analysisResult.confidence || 0, 0), 1)
    }

    return NextResponse.json(result)

  } catch (error) {
    console.error('Erreur lors de l\'analyse:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
