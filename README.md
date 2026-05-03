# 🕹️ GiftClaw

> AI-powered gift finder wrapped in a retro arcade claw machine game.

Tell us about your friend → AI suggests 8 personalized gifts → Share the claw machine link → Your friend plays to reveal their gift!

![GiftClaw Banner](public/og-image.png)

---

## ✨ Features

- **AI Gift Suggestions** — Powered by Gemini 2.5 Flash, generates 8 personalized gift ideas based on interests, hobbies, budget, and dislikes
- **Claw Machine Game** — Interactive arcade-style claw machine to reveal a gift suggestion
- **Privacy by Design** — Gift giver's budget and notes are never exposed to the receiver. Two separate UUIDs: one private (`/friends/[id]`), one shareable (`/play/[shareToken]`)
- **4 Themes** — Soft & Elegant 🌸, Bold & Cool ⚡, Cute & Playful 🧸, Classic Arcade 🎪
- **Smart Caching** — AI results cached in DB, no repeat API calls for the same profile
- **Rate Limiting** — Upstash Redis prevents API abuse (5 requests/min per IP)
- **Recent Profiles** — localStorage remembers your last 5 profiles, no login required

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Next.js 16](https://nextjs.org) (App Router, Turbopack) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Database | PostgreSQL via [Supabase](https://supabase.com) |
| ORM | [Prisma 7](https://prisma.io) |
| AI | [Google Gemini 2.5 Flash](https://ai.google.dev) |
| Rate Limiting | [Upstash Redis](https://upstash.com) |
| Deployment | [Vercel](https://vercel.com) |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- pnpm
- PostgreSQL database (Supabase free tier works)
- Google AI Studio API key
- Upstash Redis database

### 1. Clone & Install

```bash
git clone https://github.com/tanialapalelo/giftclaw.git
cd giftclaw
pnpm install
```

### 2. Environment Variables

Create a `.env` file in the root:

```bash
# Database (Supabase)
DATABASE_URL="postgresql://postgres.xxxx:password@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"

# Google Gemini AI
GEMINI_API_KEY="AIza..."

# Upstash Redis (Rate Limiting)
UPSTASH_REDIS_REST_URL="https://xxxx.upstash.io"
UPSTASH_REDIS_REST_TOKEN="xxxx"
```

### 3. Database Setup

```bash
pnpm prisma generate
pnpm prisma migrate deploy
```

### 4. Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

---

## 📁 Project Structure

```
giftclaw/
├── app/
│   ├── page.tsx                    # Landing page + recent profiles
│   ├── not-found.tsx               # Global 404
│   ├── global-error.tsx            # Global error boundary
│   ├── friends/
│   │   ├── new/page.tsx            # Create friend profile form
│   │   └── [id]/
│   │       ├── page.tsx            # Friend profile + share button (gift giver only)
│   │       ├── error.tsx
│   │       ├── gifts/page.tsx      # AI gift suggestions list
│   │       └── gifts/error.tsx
│   └── play/
│       └── [shareToken]/
│           └── page.tsx            # Claw machine (receiver link, no sensitive data)
├── components/
│   ├── claw-machine/
│   │   ├── claw-game.tsx           # Main game component (client)
│   │   ├── claw.tsx                # Animated claw
│   │   ├── machine-frame.tsx       # Arcade cabinet frame
│   │   ├── prize-box.tsx           # Prize boxes
│   │   └── reveal-panel.tsx        # Gift reveal UI
│   ├── copy-link-button.tsx        # Copy /play/[shareToken] to clipboard
│   ├── error-display.tsx           # Shared error UI
│   ├── recent-profiles.tsx         # localStorage recent profiles
│   └── ui/                         # Shared UI primitives
├── hooks/
│   └── use-claw-game.ts            # Game state machine (useReducer)
├── lib/
│   ├── actions/
│   │   ├── friend.ts               # Friend CRUD + getFriendByShareToken
│   │   └── gift.ts                 # AI gift suggestions + caching
│   ├── gemini.ts                   # Google Gemini AI client
│   ├── prisma.ts                   # Prisma client singleton
│   ├── rate-limit.ts               # Upstash rate limiter
│   ├── themes.ts                   # Theme definitions
│   ├── utils.ts                    # isValidUUID + shared utilities
│   └── validations.ts              # Zod schemas
├── prisma/
│   ├── schema.prisma
│   └── migrations/
└── types/
    └── index.ts
```

---

## 🎮 How It Works

```
1. Gift giver fills friend profile form
   → Name, interests, hobbies, dislikes, budget, theme

2. Server Action saves to PostgreSQL
   → Two UUIDs generated: id (private) + shareToken (shareable)

3. Gift giver visits /friends/[id]
   → Sees full profile including budget & notes
   → Copies /play/[shareToken] link to share with friend

4. Receiver opens /play/[shareToken]
   → Only sees name + claw machine, zero budget/notes
   → Controls claw with ◀ GRAB ▶ or keyboard arrows
   → Claw drops, grabs prize, lifts up
   → Reveal panel shows the gift suggestion

5. AI generation (lazy, on first visit to /gifts or /play):
   → Rate limit check (5 req/min/IP via Upstash)
   → Call Gemini AI → cache result in DB
   → Subsequent visits use cached result
```

---

## 🔒 Privacy & Security

- **Two UUID model** — `id` (private, gift giver only) and `shareToken` (receiver link). Receiver cannot reverse-engineer the private URL.
- **Field-level select** — `getFriendByShareToken` only returns `name`, `theme`, `shareToken` — budget and notes never leave the server for receiver requests.
- **Rate limiting** — 5 AI requests per IP per minute via Upstash Redis sliding window
- **Input validation** — Zod schema validates all form inputs server-side
- **UUID guard** — All `[id]` routes validate UUID format before hitting DB

---

## 🎨 Themes

| Theme | Vibe | Colors |
|-------|------|--------|
| ✨ Soft & Elegant | Pastel, romantic | Pink, rose |
| ⚡ Bold & Cool | Dark, cyberpunk | Dark slate, cyan neon |
| 🧸 Cute & Playful | Fun, colorful | Purple, fuchsia |
| 🎪 Classic Arcade | Retro, nostalgic | Dark, yellow neon |

---

## 📝 License

MIT — feel free to fork and build your own version!

---

<p align="center">Built with ❤️ for gifting season</p>