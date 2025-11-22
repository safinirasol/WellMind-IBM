import { NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'   // per your snippet

type ChatRequest = {
  message: string
  history?: Array<{ role: 'user' | 'assistant'; content: string }>
}

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY
const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash'

if (!apiKey) {
  console.warn('GEMINI_API_KEY not set; chat route will return 400')
}

const client = apiKey ? new GoogleGenAI({ apiKey }) : null

export async function POST(req: Request) {
  try {
    if (!client) {
      return NextResponse.json({ error: 'GEMINI_API_KEY not configured' }, { status: 400 })
    }

    const body: ChatRequest = await req.json()
    const prompt = [
      'You are a helpful HR care assistant. Provide a concise, user-friendly answer formatted in Markdown. Use bullets, bold for emphasis, and short sentences. Do not include raw JSON or metadata.',
      ...(body.history || []).map((h) => `${h.role}: ${h.content}`),
      `user: ${body.message}`,
    ].join('\n')

    try {
      const response = await client.models.generateContent({
        model: modelName,
        contents: prompt,
        // some SDKs use different param names — check docs; adjust if needed
        // e.g. { prompt: { text: prompt }, temperature: 0.2, maxOutputTokens: 512 }
      })

      // Depending on SDK, response shape may differ. Common: response.text or response.candidates
      const text = (response as any)?.text ?? (response as any)?.result ?? JSON.stringify(response)

      return NextResponse.json({ reply: text })
    } catch (err: any) {
      // Rate limit detection — SDK error may include status or code
      const msg = err?.message ?? String(err)
      const status = err?.status || err?.statusCode || null
      console.error('Gemini SDK error', status, msg)

      if (status === 429 || /rate limit/i.test(msg)) {
        return NextResponse.json({ reply: "I'm getting a lot of requests right now. Please try again in a moment." }, { status: 429 })
      }

      return NextResponse.json({ error: 'Gemini request failed', details: msg }, { status: 502 })
    }
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json({ error: 'Failed to process chat' }, { status: 500 })
  }
}