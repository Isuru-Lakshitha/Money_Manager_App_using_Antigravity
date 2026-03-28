import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    let apiKey = process.env.GEMINI_API_KEY
    let fallbackLog = ''
    if (!apiKey) {
      try {
        const fs = require('fs')
        const path = require('path')
        const envPath = path.join(process.cwd(), '.env.local')
        if (fs.existsSync(envPath)) {
          const envFile = fs.readFileSync(envPath, 'utf-8')
          const match = envFile.match(/GEMINI_API_KEY=([^\s\r\n]+)/)
          if (match) apiKey = match[1].trim()
          else fallbackLog = 'Regex failed to match GEMINI_API_KEY inside file.'
        } else {
          fallbackLog = `File not found at: ${envPath}`
        }
      } catch (e: any) {
        fallbackLog = `Require FS failed: ${e.message}`
      }
    }
    
    if (!apiKey) {
      return NextResponse.json({ error: `Missing GEMINI_API_KEY. Fallback Error: ${fallbackLog} | CWD: ${process.cwd()}` }, { status: 400 })
    }

    const { messages, financialContext } = await req.json()
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const systemPrompt = `You are Void, an elite, highly intelligent AI personal economist natively integrated into the user's Money Manager app. 
You speak precisely, clearly, and professionally, but with a touch of premium cyberpunk flair. 

The user has securely provided their real-time financial context below in JSON format.
Analyze this context to answer their specific questions. Be incredibly accurate. If they ask about spending, sum up the transactions precisely.

[FINANCIAL CONTEXT START]
${financialContext}
[FINANCIAL CONTEXT END]

User Guidelines:
1. Try to use Markdown (bolding, lists) to format your answers elegantly.
2. If they ask a generic finance question, answer it using modern global best practices.
3. Keep responses concise unless explicitly asked for a deep dive.`

    // Convert messages array to Gemini format
    const rawHistory = messages.slice(0, -1).map((m: any) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }]
    }))
    
    // Gemini API strictly requires history to begin with 'user', alternate strictly, and end with 'model' before a new user message
    let history: any[] = []
    let expectedRole = 'user'
    for (const msg of rawHistory) {
      if (msg.role === expectedRole) {
        history.push(msg)
        expectedRole = expectedRole === 'user' ? 'model' : 'user'
      }
    }
    
    // Pop trailing 'user' if the history doesn't neatly end with a 'model' reply
    if (history.length > 0 && history[history.length - 1].role !== 'model') {
       history.pop()
    }
    
    let currentMessage = messages[messages.length - 1].content

    // Inject system prompt invisibly into the first organically sent user message
    if (history.length === 0) {
       currentMessage = `${systemPrompt}\n\nUSER QUERY:\n${currentMessage}`
    }

    const chat = model.startChat({ history })
    const result = await chat.sendMessage(currentMessage)
    const responseText = result.response.text()

    return NextResponse.json({ reply: responseText })
  } catch (error: any) {
    console.error("Gemini Chat Error:", error)
    return NextResponse.json({ error: error.message || 'AI request failed' }, { status: 500 })
  }
}
