import { NextResponse } from 'next/server'
import { triggerAICare } from '../../../lib/aicare'
import { logToHedera } from '../../../lib/hedera'

type ChatRequest = {
  message: string
  history?: Array<{ role: 'user' | 'assistant'; content: string }>
  sessionId?: string
  userId?: string
}

export async function POST(req: Request) {
  try {
    const body: ChatRequest = await req.json()

    // Validate input
    if (!body.message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    console.log("Chat API received:", { message: body.message, hasHistory: !!body.history })

    // Build the prompt with history
    const prompt = [
      'You are a supportive HR mental wellness assistant.',
      ...(body.history || []).map(h => `${h.role}: ${h.content}`),
      `user: ${body.message}`,
    ].join('\n')

    // Call IBM AICare/Orchestrate agent
    const response = await triggerAICare({ 
      message: body.message, 
      prompt,
      sessionId: body.sessionId,
      userId: body.userId,
    })

    // Handle different response formats from Watson or fallback
    let reply: string;
    
    if (response?.reply) {
      // Fallback AI format: { reply: "...", fallback: true }
      reply = response.reply;
    } else if (response?.text) {
      // Watson format: { text: "..." }
      reply = response.text;
    } else if (response?.result) {
      // Alternative Watson format: { result: "..." }
      reply = response.result;
    } else if (response?.message) {
      // Generic format: { message: "..." }
      reply = response.message;
    } else if (typeof response === 'string') {
      // Direct string response
      reply = response;
    } else {
      // Unknown format, stringify it
      reply = JSON.stringify(response);
    }

    console.log("Chat API responding with:", reply.substring(0, 100))

    // Log to Hedera for audit trail
    await logToHedera(`USER: ${body.message}`)
    await logToHedera(`AGENT: ${reply}`)

    return NextResponse.json({ 
      reply,
      success: true 
    })
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    console.error("Chat API error:", errorMsg)
    
    // Return user-friendly error
    return NextResponse.json({ 
      error: "Failed to process chat message",
      details: errorMsg,
      reply: "Sorry, I encountered an error processing your message. Please try again."
    }, { status: 500 })
  }
}
