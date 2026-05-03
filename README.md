# 🕹️ GiftClaw

> AI-powered gift finder wrapped in a retro arcade claw machine game.

Tell us about your friend → AI suggests 8 personalized gifts → Play claw machine to reveal one → Share with your friend.

![GiftClaw Banner](public/og-image.png)

---

## ✨ Features

- **AI Gift Suggestions** — Powered by Gemini 2.5 Flash, generates 8 personalized gift ideas based on your friend's interests, hobbies, budget, and dislikes
- **Claw Machine Game** — Interactive arcade-style claw machine to reveal gift suggestions one by one
- **4 Themes** — Soft & Elegant 🌸, Bold & Cool ⚡, Cute & Playful 🧸, Classic Arcade 🎪
- **Smart Caching** — AI results cached in DB, no repeat API calls for the same profile
- **Rate Limiting** — Upstash Redis prevents API abuse (5 requests/min per IP)
- **Shareable Profiles** — Each friend profile has a unique URL to share

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
git clone https://github.com/your-username/giftclaw.git
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
│   ├── friends/
│   │   ├── new/page.tsx            # Create friend profile form
│   │   └── [id]/
│   │       ├── page.tsx            # Friend profile page
│   │       ├── gifts/page.tsx      # AI gift suggestions list
│   │       └── claw/page.tsx       # Claw machine game
├── components/
│   ├── claw-machine/
│   │   ├── claw-game.tsx           # Main game component (client)
│   │   ├── claw.tsx                # Animated claw component
│   │   ├── machine-frame.tsx       # Arcade cabinet frame
│   │   ├── prize-box.tsx           # Prize boxes
│   │   └── reveal-panel.tsx        # Gift reveal UI
│   └── ui/                         # Shared UI components
├── hooks/
│   └── use-claw-game.ts            # Game state machine (useReducer)
├── lib/
│   ├── actions/
│   │   ├── friend.ts               # Friend CRUD server actions
│   │   └── gift.ts                 # AI gift suggestions + caching
│   ├── gemini.ts                   # Google Gemini AI client
│   ├── prisma.ts                   # Prisma client singleton
│   ├── rate-limit.ts               # Upstash rate limiter
│   ├── themes.ts                   # Theme definitions
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
1. User fills friend profile form
   → Name, interests, hobbies, dislikes, budget, theme

2. Server Action saves to PostgreSQL via Prisma

3. On /gifts page:
   → Check DB cache for existing suggestions
   → If none: rate limit check → call Gemini AI → cache result
   → Return 8 personalized gift ideas

4. On /claw page:
   → Shuffle gift order (different every visit)
   → User controls claw with ◀ GRAB ▶ or keyboard arrows
   → Claw drops, grabs prize, lifts up
   → Reveal panel shows the gift suggestion

5. Share the profile URL with your friend!
```

---

## 🔒 Abuse Protection

- **Rate limiting** — 5 AI requests per IP per minute via Upstash Redis sliding window
- **Input validation** — Zod schema validates all form inputs server-side
- **DB caching** — Same profile never calls AI twice, cached indefinitely

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