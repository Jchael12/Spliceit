# SplitInk

A responsive, mobile-first bill-splitting app built as a frontend MVP. SplitInk
keeps groups, shared expenses, balances, settlements and activity in one
paper-themed workspace.

## Run it

```bash
npm install
npm run dev
```

Open the URL printed by Vite (usually `http://localhost:5173`).

Build for production:

```bash
npm run build
npm run preview
```

## What it does

- Dashboard with balances, group spend, unread notifications and recent activity
- First-run Help guide with a guided tour, plus a Help button on desktop and mobile
- Groups with members, expenses, balances, settlements and an activity trail
- Expenses with equal, exact-amount and percentage splits
- Comments on expenses
- Invitation-only groups and Accept / Decline invite actions
- Settlements that simplify debts and update balances immediately
- Notifications and a settings page for profile, currency and paper surface
- Client-side CRUD for groups and expenses

## Important: demo data is in memory

There is no authentication, backend, database or payment processing. All state
lives in `AppContext`; refreshing the page resets the demo data. Settings calls
this out in the UI.

## Stack

- React 19 + Vite
- React Router
- Tailwind CSS 4
- PlopUI (`@plop-ui/react`)
- Lucide icons

## Structure

```text
src/
  components/        shared UI, cards, modals and forms
  context/           in-memory app store and actions
  data/              mock users, groups, expenses and notifications
  lib/               balance math, split logic and formatting helpers
  pages/             routed screens
```
