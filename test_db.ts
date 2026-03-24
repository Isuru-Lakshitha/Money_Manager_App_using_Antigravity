import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

async function testSupabase() {
  console.log("Testing Supabase Connection...")
  
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error("Missing environment variables in .env.local")
    return
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  try {
    console.log("1. Testing Tables...")
    const tables = ['categories', 'accounts', 'transactions', 'loans', 'loan_payments', 'budgets', 'goals', 'tags']
    
    for (const t of tables) {
       const { data, error } = await supabase.from(t).select('*').limit(1).returns<any[]>()
       if (error) {
         console.log(`[❌] Table ${t}: ${error.code} - ${error.message} - ${error.details}`)
       } else {
         console.log(`[✅] Table ${t}: Accessible (${data.length} rows)`)
       }
    }

    console.log("2. Checking transaction columns...")
    const { data: tx, error: txError } = await supabase.from('transactions').select('id, type, amount, fee_amount, account_id, to_account_id, category_id, loan_id, date, notes').limit(1)
    if (txError) {
       console.log(`[❌] Transactions columns: ${txError.message}`)
    } else {
       console.log(`[✅] Transactions columns: Valid`)
    }

  } catch (err: any) {
    console.error("Fatal exception:", err)
  }
}

testSupabase()
