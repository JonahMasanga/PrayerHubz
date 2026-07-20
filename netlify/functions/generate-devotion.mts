import type { Config, Context } from '@netlify/functions'

const TEXT_MODEL = 'gemini-3-flash-preview'
const IMAGE_MODEL = 'gemini-2.5-flash-image'

export default async (req: Request, context: Context) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 })
  }

  const { topic } = await req.json()
  if (!topic || typeof topic !== 'string') {
    return Response.json({ error: 'Missing topic' }, { status: 400 })
  }

  const baseUrl = Netlify.env.get('GOOGLE_GEMINI_BASE_URL')
  const apiKey = Netlify.env.get('GEMINI_API_KEY')
  const headers = {
    'Content-Type': 'application/json',
    'x-goog-api-key': apiKey ?? '',
  }

  const textResponse = await fetch(`${baseUrl}/v1beta/models/${TEXT_MODEL}:generateContent`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: `Generate a daily devotion in JSON format with fields "title", "scripture", "scripture_text", "content", "reflection", "author", "read_time" about topic ${topic}`,
            },
          ],
        },
      ],
      generationConfig: { responseMimeType: 'application/json' },
    }),
  })

  if (!textResponse.ok) {
    return Response.json({ error: 'Failed to generate devotion' }, { status: 502 })
  }

  const textResult = await textResponse.json()
  const raw = textResult?.candidates?.[0]?.content?.parts?.[0]?.text
  let devotion
  try {
    devotion = JSON.parse(raw)
  } catch {
    return Response.json({ error: 'Failed to parse devotion' }, { status: 502 })
  }

  let image = null
  try {
    const imageResponse = await fetch(`${baseUrl}/v1beta/models/${IMAGE_MODEL}:generateContent`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `A serene, peaceful, and beautiful digital painting illustrating the spiritual concept of ${topic}, soft lighting, inspiring landscape, no text`,
              },
            ],
          },
        ],
      }),
    })

    if (imageResponse.ok) {
      const imageResult = await imageResponse.json()
      const parts = imageResult?.candidates?.[0]?.content?.parts ?? []
      const imagePart = parts.find((p: any) => p.inlineData?.data)
      if (imagePart) {
        const mimeType = imagePart.inlineData.mimeType || 'image/png'
        image = `data:${mimeType};base64,${imagePart.inlineData.data}`
      }
    }
  } catch {
    // Image generation is a bonus; devotion text is still returned without it.
  }

  return Response.json({ devotion, image })
}

export const config: Config = {
  path: '/api/generate-devotion',
}
