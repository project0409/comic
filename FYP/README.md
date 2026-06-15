# FYP — Next.js UI Prototype

Tech: Next.js (App Router) · Tailwind CSS v4 · Framer Motion · Zustand · Howler.js · PWA

## Run locally

```bash
npm install
npm run dev
```

Then open http://localhost:3000

## Key routes

- `/` — Home / Discovery
- `/series/s1` — Series detail
- `/read/c1` — Immersive Reader (canvas, flip/scroll, guided view, reactions, Lore Master)
- `/vault` — Personal Vault / Scrapbook
- `/wallet` — Coin Wallet
- `/dashboard/writer` — Writer upload dashboard
- `/dashboard/analytics` — Analytics dashboard
- `/dashboard/admin` — Admin publishing gate (separate admin login: `/admin/login`)
- `/login` / `/register` — Auth screens

## Mock API routes (wire to your backend later)

- `GET /api/series/`
- `GET /api/series/:id/chapters`
- `GET /api/chapters/:id/pages`
- `POST /api/loremaster/ask`
- `POST /api/interactions/react`
- `POST /api/economy/unlock`
- `GET /api/user/wallet`
