import { NextResponse } from 'next/server'
import Tesseract from 'tesseract.js'

export async function POST(request: Request) {
  try {
    const { image } = await request.json()
    
    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    }

    // Run traditional text extraction (No AI)
    const result = await Tesseract.recognize(
      image,
      'eng',
      { logger: m => console.log('Tesseract:', m) }
    );
    
    const text = result.data.text;
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    
    // Advanced Heuristics Engine
    let totalAmount = 0;
    let category = "Other";
    let sourceAccount = "cash";
    let notes = "Unknown Store";

    if (lines.length > 0) {
      // First line usually has the store name. Strip weird symbols
      notes = lines[0].replace(/[^a-zA-Z0-9\s&'-]/g, '').trim() || "Unknown Store";
    }

    const amountRegex = /\$?\s*(\d{1,5}(?:[.,]\d{2}))/; 
    
    // Reverse scan for main total
    for (let i = lines.length - 1; i >= 0; i--) {
      const line = lines[i].toLowerCase();
      if (line.includes('total') || line.includes('amount') || line.includes('due') || line.includes('balance') || line.includes('sum')) {
        const match = line.match(amountRegex);
        if (match && match[1]) {
          totalAmount = parseFloat(match[1].replace(',', '.'));
          break; // Stop at the first reliable match from the bottom
        }
      }
    }
    
    // Fallback if "Total" wasn't clearly found
    if (totalAmount === 0) {
      const bottomLines = lines.slice(Math.max(0, lines.length - 15));
      let maxAmount = 0;
      for (const line of bottomLines) {
        const match = line.match(amountRegex);
        if (match && match[1]) {
           const val = parseFloat(match[1].replace(',', '.'));
           if (val > maxAmount) maxAmount = val;
        }
      }
      totalAmount = maxAmount;
    }

    // Category Classification
    const fullText = text.toLowerCase();
    if (fullText.match(/coffee|starbucks|cafe|bakery|restaurant|burger|pizza|kitchen|grill/i)) {
      category = "Food & Dining";
    } else if (fullText.match(/market|grocery|mart|walmart|target|super/i)) {
      category = "Groceries";
    } else if (fullText.match(/uber|lyft|taxi|gas|station|shell|chevron/i)) {
      category = "Transportation";
    } else if (fullText.match(/electric|water|utility|power|verizon|at&t|wifi/i)) {
      category = "Utilities";
    } else if (fullText.match(/amazon|bestbuy|apple|store|plaza|mall|boutique/i)) {
      category = "Shopping";
    }

    // Payment Source Classification
    if (fullText.match(/visa|mastercard|amex|credit|card|discover/i)) {
      sourceAccount = "credit";
    } else if (fullText.match(/cash/i)) {
      sourceAccount = "cash";
    }

    return NextResponse.json({
      amount: totalAmount,
      category: category,
      sourceAccount: sourceAccount,
      notes: notes,
      raw_text: text // For debugging
    });
    
  } catch (error: any) {
    console.error('OCR Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
