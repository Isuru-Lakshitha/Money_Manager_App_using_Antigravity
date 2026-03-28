# Implementation Plan: Enhancements & Bug Fixes

This document outlines the approach to address the five key issues you've highlighted in your request.

## User Review Required

> [!WARNING]
> **Database Migration Needed**: To make Goals time-based, we need to add a `deadline` column to the `goals` table in your Supabase database. You will need to run a quick SQL command in your Supabase SQL Editor:
> `ALTER TABLE goals ADD COLUMN deadline date;`
> Let me know if you would like me to provide a script to run this automatically for you.

> [!IMPORTANT]
> **OCR Accuracy**: Currently, the app uses `Tesseract.js` (running entirely in your browser) to scan receipts. While we can improve its parsing code to try and detect categories and source accounts (e.g., searching for "Visa", "Cash", "Restaurant"), Tesseract is fundamentally basic text extraction. 
> 
> **Question for you**: Would you like to keep using Tesseract with an improved logic parser, or would you prefer I integrate Google Gemini (via `@google/generative-ai`) which will guarantee incredible accuracy for extracting Amounts, Categories, and Source Accounts? If Gemini, you will need to provide a free API key.

## Proposed Changes

---
### Authentication & Login Flow

To fix the issue where you have to refresh the page after logging in to successfully reach the dashboard:

#### [MODIFY] [page.tsx](file:///c:/Users/Isuru/Downloads/Antigravity/src/app/login/page.tsx)
- Replace `window.location.href = '/dashboard'` with Next.js specific routing (`router.refresh()` followed by `router.push('/dashboard')`). This gives `middleware.ts` the proper time to recognize the Supabase session cookie before rendering the protected dashboard.

---
### Time-Based Goals

Goals will be updated to include a target deadline.

#### [MODIFY] [schema.sql](file:///c:/Users/Isuru/Downloads/Antigravity/supabase/schema.sql)
- Append the `deadline date` column to the `goals` table creation script.

#### [MODIFY] [index.ts](file:///c:/Users/Isuru/Downloads/Antigravity/src/store/index.ts)
- Add `deadline?: string` to the `Goal` TypeScript interface.

#### [MODIFY] [api.ts](file:///c:/Users/Isuru/Downloads/Antigravity/src/utils/supabase/api.ts)
- Update `createGoal`, `getGoals`, and `updateGoal` functions to map the `target_date`/`deadline` column to and from the database.

#### [MODIFY] [AddGoalModal.tsx](file:///c:/Users/Isuru/Downloads/Antigravity/src/components/goals/AddGoalModal.tsx)
- Add a new date input field to allow selecting a target date/deadline.

#### [MODIFY] [page.tsx](file:///c:/Users/Isuru/Downloads/Antigravity/src/app/dashboard/goals/page.tsx)
- Enhance the UI cards to display the selected deadline and dynamically calculate the "days remaining" to reach the goal.

---
### Multi-Currency Settings

The underlying logic for Multi-Currency already exists in your store and database, but there is no User Interface to actually configure it.

#### [MODIFY] [page.tsx](file:///c:/Users/Isuru/Downloads/Antigravity/src/app/dashboard/settings/page.tsx)
- Inject a new beautifully-styled "Preferences / Currency" section into the settings dashboard, allowing users to actively switch their Base Currency between USD, EUR, GBP, LKR, etc.

---
### Investment Tab

#### [MODIFY] [BottomNav.tsx](file:///c:/Users/Isuru/Downloads/Antigravity/src/components/layout/BottomNav.tsx)
- Add an "Investments" nav item linking to `/dashboard/investments` with a relevant icon (`TrendingUp`).

#### [NEW] [page.tsx](file:///c:/Users/Isuru/Downloads/Antigravity/src/app/dashboard/investments/page.tsx)
- Create the core skeleton page for the new Investments view, applying the glass-morphic standard UI layout.

---
### OCR Receipt Scanner Improvements

#### [MODIFY] [ReceiptScannerModal.tsx](file:///c:/Users/Isuru/Downloads/Antigravity/src/components/transactions/ReceiptScannerModal.tsx)
- Update the Tesseract output parser to use enhanced Regex.
- Implement keyword mappings to infer the **Source Account** (e.g. text containing "cash", "visa", "mastercard") and **Category** (e.g. text containing "market", "food", "uber").
- Update the callback `onScanComplete` to also pass back `suggestedCategory` and `suggestedAccount`.

## Open Questions
- Please confirm if you want to proceed with Tesseract string parsing improvements for OCR, or if I should integrate Gemini for more robust AI vision receipt scanning.
- Note that adding the Investment tab only creates the visual shell for managing investments. Do you have a specific database schema you want to track for investments (e.g. Stocks, Crypto, Real Estate)? Or should I keep it visual-only for now?

## Verification Plan
1. Test login form to assure smooth transition to `/dashboard` without manual refreshes.
2. Verify Settings page allows toggling currency and see the changes reflect universally.
3. Add a new goal with a deadline and verify it renders gracefully.
4. Test Bottom Navigation to ensure the new Investments tab functions.
5. Simulate a receipt scan to verify the new categorization logic works.
