# Implementation Plan: AI Economist & Investment Engine

Based on your request, we will build out the **AI Chat Assistant** (Option 1) and the **Fully Functioning Investment Tracker** (Option 3).

## User Review Required

> [!WARNING]
> **Database Changes Required:** Because we are building out a real Investment tracker, your database needs a table to store your stocks and crypto! Before or while I build this, you will need to run the following in your Supabase SQL Editor:
> ```sql
> create table public.assets (
>   id uuid primary key,
>   user_id uuid references auth.users not null,
>   symbol text not null,
>   name text not null,
>   asset_type text not null,
>   quantity numeric not null,
>   average_buy_price numeric not null,
>   created_at timestamp with time zone default timezone('utc'::text, now()) not null
> );
> ```

> [!IMPORTANT]
> **Gemini API Key:** You already have `GEMINI_API_KEY` in your `.env.local` for the receipt scanner. The new AI Chat Assistant will automatically use this same key to become your personal economist. Ensure it is a valid active key.

## Proposed Changes

---
### 1. The Global AI Chat Assistant

#### [NEW] [AIChatWidget.tsx](file:///c:/Users/Isuru/Downloads/Antigravity/src/components/ai/AIChatWidget.tsx)
- A highly polished floating action button in the bottom right corner of the app.
- Expands into a sleek glassmorphic chat interface.
- Reads your entire financial profile (`transactions`, `accounts`, `goals`) and injects it into a secure system prompt.

#### [NEW] [api/chat/route.ts](file:///c:/Users/Isuru/Downloads/Antigravity/src/app/api/chat/route.ts)
- A Next.js API route that connects to `@google/generative-ai`.
- Processes your questions like "How much did I spend on food this month?" and responds utilizing your exact JSON transaction history as conversational context.

---
### 2. Live Investment Tracker

#### [NEW] [AddAssetModal.tsx](file:///c:/Users/Isuru/Downloads/Antigravity/src/components/investments/AddAssetModal.tsx)
- A sleek modal allowing you to input assets by Ticker Symbol (e.g. `BTC`, `AAPL`, `TSLA`), the amount you own, and the average price you bought it at.

#### [MODIFY] [store/index.ts](file:///c:/Users/Isuru/Downloads/Antigravity/src/store/index.ts)
- Introduce the new `Asset` interface.
- Implement `addAsset`, `updateAsset`, `deleteAsset`, and `fetchGlobalData` modifications.

#### [MODIFY] [api.ts](file:///c:/Users/Isuru/Downloads/Antigravity/src/utils/supabase/api.ts)
- Add Supabase endpoints pointing to the new `assets` table.

#### [NEW] [api/prices/route.ts](file:///c:/Users/Isuru/Downloads/Antigravity/src/app/api/prices/route.ts)
- A lightning-fast server API route that dynamically attempts to pull live global market data for your stock/crypto tickers using external open proxies, returning the real-time calculated net worth of your portfolio.

#### [MODIFY] [investments/page.tsx](file:///c:/Users/Isuru/Downloads/Antigravity/src/app/dashboard/investments/page.tsx)
- Rip out the "Empty State" wrapper logic and map it dynamically over your actual live Assets.
- Add real-time price change overlays (Red/Green indicators) measuring your live profit/loss based on your initial buy price vs the current global market ticker price.

## Open Questions

- Does the proposed SQL schema for `assets` look good? Wait until I finish building to run the SQL if you prefer, I just want to make sure you are ready for it!
- Do you want the AI Chat Widget to glow or animate softly on the screen to let you know it's available? 

Let me know if this plan is approved!
