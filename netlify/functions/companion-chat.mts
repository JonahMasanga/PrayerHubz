import type { Config, Context } from '@netlify/functions'

const MODEL = 'gemini-3-flash-preview'

const SYSTEM_PROMPT = `You are a highly compassionate, deeply empathetic sanctuary companion and counselor named "Pat" from the local church's prayer intercession crew. You are a real, warm Christian peer answering messages from your desk. NEVER, under any circumstances, reveal that you are an AI, a machine, software, a robot, a bot, or a large language model. If directly asked, calmly assure them that you are Pat, sitting at the sanctuary desk to pray with them. Do not use bullet points, list items, robotic lists, or bold structural titles. Speak with profound warmth and colloquial grace (e.g., "grace and peace to you", "lifting you up").
In each reply:
1. Validate their spirit's mood or challenge with deep, understanding human empathy.
2. Thread in exactly ONE relevant Bible Scripture passage naturally into the flow of conversation.
3. Conclude with a customized, deeply personal 2-3 sentence prayer written specifically for them.
Keep your overall response natural and under 130 words so it feels like a real chat message.`

const FALLBACKS = [
  "I hear you, and my heart goes out to you. Let's stand together on Matthew 11:28: 'Come to me, all you who are weary and burdened, and I will give you rest.' Let's pray: Father, wrap my dear friend in Your comfort right now. Ease their heavy mind. Amen.",
  "Thank you for sharing your heart with me. Let's rest on Psalm 46:1: 'God is our refuge and strength, an ever-present help in trouble.' Lord, grant my brother/sister the reassurance that You are holding them tight in the palm of Your hands. Amen.",
  "Your strength in opening up about this is beautiful. Let's remember Isaiah 41:10, not to fear, for our God is with you. I'm praying: Heavenly Father, quiet their anxious thoughts and pour out Your overwhelming peace upon their walk today. Amen.",
]

export default async (req: Request, context: Context) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 })
  }

  const { messages } = await req.json()
  if (!Array.isArray(messages) || messages.length === 0) {
    return Response.json({ error: 'Missing messages' }, { status: 400 })
  }

  const contents = messages.map((m) => ({
    role: m.role === 'user' ? 'user' : 'model',
    parts: [{ text: m.text }],
  }))

  const baseUrl = Netlify.env.get('GOOGLE_GEMINI_BASE_URL')
  const apiKey = Netlify.env.get('GEMINI_API_KEY')

  try {
    const response = await fetch(`${baseUrl}/v1beta/models/${MODEL}:generateContent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey ?? '',
      },
      body: JSON.stringify({
        contents,
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
      }),
    })

    if (!response.ok) throw new Error('Model request failed')

    const result = await response.json()
    const replyText = result?.candidates?.[0]?.content?.parts?.[0]?.text

    if (!replyText) throw new Error('Empty model response')

    return Response.json({ text: replyText.trim() })
  } catch {
    const fallback = FALLBACKS[Math.floor(Math.random() * FALLBACKS.length)]
    return Response.json({ text: fallback })
  }
}

export const config: Config = {
  path: '/api/companion-chat',
}
