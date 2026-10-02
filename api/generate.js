import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Méthode non autorisée"
    });
  }

  try {
    const { course } = req.body;

    if (!course || !course.trim()) {
      return res.status(400).json({
        error: "Cours manquant"
      });
    }

    const response = await client.responses.create({
      model: "gpt-5.4-mini",
      instructions:
        "Tu es l'assistant pédagogique de RéviseAI. Transforme un cours scolaire en fiche de révision claire et en QCM adaptés au niveau de l'élève.",
      input: `Voici le cours de l'élève :

${course}

Crée :
1. Un titre
2. Un résumé clair
3. Les notions essentielles
4. 5 questions QCM avec 4 réponses possibles
5. La bonne réponse et une courte explication pour chaque question.

Réponds uniquement en JSON avec cette structure :
{
  "title": "",
  "summary": "",
  "key_points": [],
  "quiz": [
    {
      "question": "",
      "choices": ["", "", "", ""],
      "answer": 0,
      "explanation": ""
    }
  ]
}`
    });

    const text = response.output_text;

    let data;

    try {
      data = JSON.parse(text);
    } catch {
      return res.status(500).json({
        error: "Réponse IA invalide"
      });
    }

    return res.status(200).json(data);

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Erreur lors de la génération IA"
    });
  }
}