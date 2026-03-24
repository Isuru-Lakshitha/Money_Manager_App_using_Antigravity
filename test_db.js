"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const supabase_js_1 = require("@supabase/supabase-js");
const dotenv = __importStar(require("dotenv"));
dotenv.config({ path: '.env.local' });
async function testSupabase() {
    console.log("Testing Supabase Connection...");
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        console.error("Missing environment variables in .env.local");
        return;
    }
    const supabase = (0, supabase_js_1.createClient)(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    try {
        console.log("1. Testing Tables...");
        const tables = ['categories', 'accounts', 'transactions', 'loans', 'loan_payments', 'budgets', 'goals', 'tags'];
        for (const t of tables) {
            const { data, error } = await supabase.from(t).select('*').limit(1).returns();
            if (error) {
                console.log(`[❌] Table ${t}: ${error.code} - ${error.message} - ${error.details}`);
            }
            else {
                console.log(`[✅] Table ${t}: Accessible (${data.length} rows)`);
            }
        }
        console.log("2. Checking transaction columns...");
        const { data: tx, error: txError } = await supabase.from('transactions').select('id, type, amount, fee_amount, account_id, to_account_id, category_id, loan_id, date, notes').limit(1);
        if (txError) {
            console.log(`[❌] Transactions columns: ${txError.message}`);
        }
        else {
            console.log(`[✅] Transactions columns: Valid`);
        }
    }
    catch (err) {
        console.error("Fatal exception:", err);
    }
}
testSupabase();
