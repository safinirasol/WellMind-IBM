import { NextResponse } from 'next/server'
import { triggerAICare } from '../../../lib/aicare'
import { logToHedera } from '../../../lib/hedera'

type ChatRequest = {
  message: string
  history?: Array<{ role: 'user' | 'assistant'; content: string }>
}

export async function POST(req: Request) {
  try {
    const body: ChatRequest = await req.json()

    // Build the prompt
    const prompt = [
      'You are a supportive HR mental wellness assistant.',
      ...(body.history || []).map(h => `${h.role}: ${h.content}`),
      `user: ${body.message}`,
    ].join('\n')

    // Call IBM AICare agent
    const response = await triggerAICare({ message: body.message, prompt })

    const reply = response?.text || response

    // Log BOTH user and agent messages to Hedera
    await logToHedera(`USER: ${body.message}`)
    await logToHedera(`AGENT: ${reply}`)

    return NextResponse.json({ reply })
  } catch (error) {
    console.error("Chat API error:", error)
    return NextResponse.json({ error: "Failed to process chat" }, { status: 500 })
  }
}
