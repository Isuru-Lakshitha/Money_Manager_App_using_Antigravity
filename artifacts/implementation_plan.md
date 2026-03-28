# Navigation Overhaul, Investments Cleanup, & Bug Fixes

Here is the plan to address your feedback regarding the navigation bar, the dummy data on the Investments page, and the goal saving bug.

## User Review Required

> [!IMPORTANT]
> **Why your goals aren't saving:** The reason your goals disappear after you save them is because your Supabase database doesn't have the `deadline` column yet. When the app tries to save the new goal to the cloud, the database rejects it, and the app resets.
> **The Fix:** You **must** go to your Supabase SQL Editor and run this short command: 
> `ALTER TABLE goals ADD COLUMN deadline date;`
> I will also add an error alert to the Goal saving modal so that if it fails again in the future, it clearly tells you exactly what went wrong instead of silently failing.

> [!NOTE]
> **Navigation Bar Redesign:** You mentioned the nav bar is a mess (10 items is too many to show at once on a phone). I propose upgrading the `BottomNav.tsx` to a **macOS-style floating dock**. It will be a beautifully animated, scrollable glass pill. When you hover or tap on items, they will smoothly magnify (using `framer-motion`), and I will implement a sliding slick indicator behind the active tab.

## Proposed Changes

---
### Navigation Polish (macOS Dock Style)

#### [MODIFY] [BottomNav.tsx](file:///c:/Users/Isuru/Downloads/Antigravity/src/components/layout/BottomNav.tsx)
- Break away from the static grid/flex layout and implement a `framer-motion` powered layout.
- Introduce hover magnification (items scale up smoothly when hovered, like a Mac dock).
- Add a smooth sliding active background pill using `layoutId` so the active tab visually "slides" across the nav bar when you click different routes.
- Improve horizontal scrolling properties for mobile so it smoothly snaps.

---
### Investments Page Clean-up

#### [MODIFY] [page.tsx](file:///c:/Users/Isuru/Downloads/Antigravity/src/app/dashboard/investments/page.tsx)
- Remove the dummy hardcoded `VOO`, `BTC`, `AAPL` assets.
- Replace it with a stunning "Empty State" module that uses an animated illustration to prompt the user to "Connect a Broker" or "Add your first asset", making it clear that it's waiting for real data.

---
### Goals Bug Fix / Error Visibility

#### [MODIFY] [AddGoalModal.tsx](file:///c:/Users/Isuru/Downloads/Antigravity/src/components/goals/AddGoalModal.tsx)
- Enhance the `catch (error)` block in `handleSubmit` to trigger a browser alert or visible error text if Supabase rejects the insertion. This directly informs the user if a database column is missing.

#### [MODIFY] [api.ts](file:///c:/Users/Isuru/Downloads/Antigravity/src/utils/supabase/api.ts)
- Strip out `deadline` from the insertion payload if it is not explicitly provided by the user. This ensures standard goals (without deadlines) save successfully even if the database is slightly out of sync.

## Open Questions
- Does the macOS-style dock sound like the right approach for the navigation bar, or would you prefer I hide the extra items inside a "More" drawer menu?
- Please confirm if you are able to run the SQL command in Supabase for the goals issue, or let me know if you need help finding where to run it!
