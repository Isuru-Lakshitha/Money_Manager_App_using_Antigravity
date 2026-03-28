import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function POST(request: Request) {
  try {
    const { image } = await request.json()
    
    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      return NextResponse.json({ error: 'Gemini API key not configured. Please add GEMINI_API_KEY to .env.local' }, { status: 500 })
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    // parse base64
    const base64Data = image.split(',')[1] || image
    const mimeType = image.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/)?.[1] || 'image/jpeg'

    const prompt = `
      You are an expert financial receipt analyzer. Look at this receipt image.
      Extract the following information and output it strictly as a JSON object:
      {
        "amount": (the total numerical amount, e.g., 24.50),
        "category": (guess the category, ONE OF: "Food & Dining", "Groceries", "Shopping", "Transportation", "Utilities", "Other"),
        "sourceAccount": (guess the source account, ONE OF "cash", "bank", "credit". If you see VISA, MASTERCARD, AMEX -> credit/bank. If you see cash -> cash. Default to "cash"),
        "notes": (A short note about the vendor, e.g., "Starbucks Coffee")
      }
      ONLY OUTPUT VALID JSON. No markdown formatting tags.
    `

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Data,
          mimeType: mimeType
        }
      }
    ])

    const response = await result.response
    let text = response.text()
    
    // Clean up markdown
    text = text.replace(/```json/g, '').replace(/```/g, '').trim()
    
    const json = JSON.parse(text)
    
    return NextResponse.json(json)
    
  } catch (error: any) {
    console.error('OCR Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
