import type { Config, Context } from '@netlify/functions'

const MODEL = 'gemini-3-flash-preview'

export default async (req: Request, context: Context) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 })
  }

  const { text, type } = await req.json()
  if (!text || typeof text !== 'string') {
    return Response.json({ error: 'Missing text' }, { status: 400 })
  }

  const systemPrompt =
    type === 'prayer'
      ? 'You are a compassionate editor. Rewrite this prayer request to be clear, heartfelt, and reverent. Keep it under 4 sentences. Do not add any conversational filler, just return the polished text.'
      : 'You are a joyous editor. Rewrite this testimony/praise report to be uplifting, clear, and glorifying to God. Keep it under 4 sentences. Do not add conversational filler.'

  const baseUrl = Netlify.env.get('GOOGLE_GEMINI_BASE_URL')
  const apiKey = Netlify.env.get('GEMINI_API_KEY')

  const response = await fetch(`${baseUrl}/v1beta/models/${MODEL}:generateContent`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey ?? '',
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text }] }],
      systemInstruction: { parts: [{ text: systemPrompt }] },
    }),
  })

  if (!response.ok) {
    return Response.json({ error: 'Failed to polish text' }, { status: 502 })
  }

  const result = await response.json()
  const polished = result?.candidates?.[0]?.content?.parts?.[0]?.text

  if (!polished) {
    return Response.json({ error: 'No response from model' }, { status: 502 })
  }

  return Response.json({ text: polished.trim() })
}

export const config: Config = {
  path: '/api/polish-text',
}
