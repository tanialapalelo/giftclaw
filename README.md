# 🕹️ GiftClaw

> AI-powered gift finder wrapped in a retro arcade claw machine game.

Tell us about your friend → AI suggests 8 personalized gifts → Share the claw machine link → Your friend plays to reveal their gift vibes!

![GiftClaw Banner](public/og-image.png)

[![CI](https://github.com/tanialapalelo/giftclaw/actions/workflows/ci.yml/badge.svg)](https://github.com/tanialapalelo/giftclaw/actions/workflows/ci.yml)

---

## ✨ Features

- **AI Gift Suggestions** — Gemini 2.5 Flash generates 8 personalized gifts with unique per-gift emoji, based on interests, hobbies, budget, and dislikes
- **Claw Machine Game** — Interactive arcade-style claw machine; move with ◀ ▶ buttons or arrow keys, press GRAB or Space to drop the claw
- **Vibe Reveal System** — Each grab reveals a mood-based clue (not the gift name) — receiver picks up to 20 vibes across sessions
- **Grab History** — All grabs are persisted per session; gift giver sees exactly what was grabbed and what to buy
- **Edit Profile** — Gift giver can update the friend profile and set a link expiry date; editing clears cached AI results to regenerate fresh suggestions
- **Privacy by Design** — Budget, notes, and gift names are never exposed to the receiver. Two separate UUIDs: private `/friends/[id]` and shareable `/play/[shareToken]`
- **4 Themes** — Soft & Elegant 🌸, Bold & Cool ⚡, Cute & Playful 🧸, Classic Arcade 🎪
- **Smart Caching** — AI results cached in DB; no redundant API calls for the same profile
- **Rate Limiting** — Upstash Redis sliding window (5 requests/min per IP) prevents API abuse
- **Observability** — Sentry error tracking + Vercel Analytics + Speed Insights
- **Recent Profiles** — localStorage remembers your last 5 profiles, no login required

---

## 🛠️ Tech Stack

| Layer          | Technology                                                        |
| -------------- | ----------------------------------------------------------------- |
| Framework      | [Next.js 16](https://nextjs.org) (App Router, Turbopack)          |
| Language       | TypeScript (strict)                                               |
| Styling        | Tailwind CSS v4                                                   |
| Database       | PostgreSQL via [Supabase](https://supabase.com)                   |
| ORM            | [Prisma 7](https://prisma.io)                                     |
| AI             | [Google Gemini 2.5 Flash](https://ai.google.dev)                  |
| Rate Limiting  | [Upstash Redis](https://upstash.com)                              |
| Error Tracking | [Sentry](https://sentry.io)                                       |
| Analytics      | [Vercel Analytics](https://vercel.com/analytics) + Speed Insights |
| Testing        | Vitest (unit) + Playwright (e2e)                                  |
| CI             | GitHub Actions                                                    |
| Deployment     | [Vercel](https://vercel.com)                                      |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 22+
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

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

```env
# Required — PostgreSQL (Supabase)
DATABASE_URL="postgresql://postgres.xxxx:password@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"

# Required — Google Gemini AI
GEMINI_API_KEY="AIza..."

# Required — Upstash Redis (rate limiting)
UPSTASH_REDIS_REST_URL="https://xxxx.upstash.io"
UPSTASH_REDIS_REST_TOKEN="xxxx"

# Required — Sentry (error monitoring)
SENTRY_AUTH_TOKEN="sntrys_..."

# Optional — used for SEO/OG metadata (defaults to giftclaw.vercel.app)
NEXT_PUBLIC_APP_URL="https://your-domain.com"
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
│   ├── layout.tsx                  # Root layout — fonts, SEO metadata, analytics
│   ├── page.tsx                    # Landing page + recent profiles
│   ├── not-found.tsx               # Global 404
│   ├── global-error.tsx            # Global Sentry error boundary
│   ├── friends/
│   │   ├── new/page.tsx            # Create friend profile form
│   │   └── [id]/
│   │       ├── page.tsx            # Friend profile + share link (gift giver only)
│   │       ├── edit/page.tsx       # Edit friend profile
│   │       ├── error.tsx
│   │       └── gifts/page.tsx      # AI gift suggestions preview (gift giver only)
│   └── play/
│       └── [shareToken]/
│           └── page.tsx            # Claw machine — receiver link, no sensitive data
├── components/
│   ├── claw-machine/
│   │   ├── claw-game.tsx           # Main game orchestrator (client)
│   │   ├── claw.tsx                # Animated claw component
│   │   ├── machine-frame.tsx       # Arcade cabinet frame
│   │   ├── prize-box.tsx           # Prize box with per-gift emoji
│   │   └── reveal-panel.tsx        # Post-grab vibe reveal UI
│   ├── grab-history.tsx            # All grabbed vibes list
│   ├── play-client.tsx             # Play page client wrapper
│   ├── friend-form.tsx             # Create/edit friend profile form
│   ├── copy-link-button.tsx        # Copy /play/[shareToken] to clipboard
│   ├── mascot-bot.tsx              # Animated mascot
│   ├── personality-card.tsx        # Friend personality summary card
│   ├── recent-profiles.tsx         # localStorage recent profiles
│   └── ui/                         # Shared UI primitives (PixelButton, PixelCard)
├── hooks/
│   └── use-claw-game.ts            # Game state machine (useReducer + timers)
├── lib/
│   ├── actions/
│   │   ├── friend.ts               # Friend CRUD server actions
│   │   ├── game.ts                 # Game result server actions
│   │   └── gift.ts                 # AI gift suggestions + caching + rate limit
│   ├── constants.ts                # MAX_ATTEMPTS and other game constants
│   ├── gemini.ts                   # Google Gemini AI client + structured schema
│   ├── prisma.ts                   # Prisma client singleton
│   ├── rate-limit.ts               # Upstash sliding-window rate limiter
│   ├── themes.ts                   # Theme definitions (4 themes)
│   ├── utils.ts                    # isValidUUID + shared utilities
│   ├── validations.ts              # Zod schemas with honeypot + sanitization
│   └── vibe.ts                     # Category → emoji/tagline/mood-tags mapping
├── prisma/
│   ├── schema.prisma               # Friend, GiftSuggestion, GameResult models
│   └── migrations/
├── tests/
│   ├── unit/                       # Vitest unit tests
│   └── e2e/                        # Playwright end-to-end tests
└── types/
    └── index.ts                    # FriendProfile, GiftSuggestion, GiftAnalysisResult
```

---

## 🎮 How It Works

```
1. Gift giver fills friend profile form
   → Name, interests, hobbies, dislikes, budget, optional expiry date, theme

2. Server Action validates (Zod) + saves to PostgreSQL
   → Two UUIDs generated: id (private) + shareToken (shareable)

3. Gift giver visits /friends/[id]
   → Sees full profile including budget & notes
   → Previews AI suggestions at /friends/[id]/gifts
   → Copies /play/[shareToken] to share with friend
   → Can edit profile at any time (clears AI cache for fresh suggestions)

4. Receiver opens /play/[shareToken]
   → Sees only name + claw machine, zero budget/notes/gift names
   → Moves claw with ◀ ▶ or arrow keys, grabs with GRAB or Space
   → Claw drops to the visual box position → lifts → drops through chute
   → Reveal panel shows a mood-based vibe clue (not the gift name)
   → Up to 20 grab attempts across sessions; grabbed gifts become less likely
     to be grabbed again (remaining copies shown, fully-grabbed gifts removed)

5. Gift giver sees results on /friends/[id]
   → Exact gift names + price ranges for each grab
   → "GIFT TO BUY" section shows what to purchase

6. AI generation (lazy, on first visit):
   → Rate limit check (5 req/min/IP via Upstash sliding window)
   → Gemini 2.5 Flash generates 8 gifts with unique emoji per gift
   → Result cached in DB — subsequent visits served from cache
```

---

## 🔒 Privacy & Security

- **Two-UUID model** — `id` (private, gift giver only) and `shareToken` (receiver link). Receiver cannot reverse-engineer the private URL.
- **Field-level select** — `getFriendByShareToken` returns only `name`, `theme`, `shareToken`, `validUntil` — budget and notes never leave the server for receiver requests.
- **Rate limiting** — 5 AI requests per IP per minute via Upstash Redis sliding window; prevents both accidental and malicious Gemini API abuse.
- **Input sanitization** — Zod schema trims whitespace and strips HTML tags on all string inputs server-side.
- **Honeypot field** — Hidden `_honeypot` field in the create form; non-empty value rejects the submission silently.
- **UUID guard** — All `[id]` and `[shareToken]` routes validate format before hitting the DB.
- **Link expiry** — Gift giver can set a `validUntil` date; expired links show a locked screen.

---

## 🧪 Testing

```bash
# Unit tests (Vitest)
pnpm test

# Unit tests with coverage
pnpm test:coverage

# E2E tests (Playwright) — requires dev server running
pnpm test:e2e

# E2E with UI
pnpm test:e2e:ui
```

---

## 🤝 Contributing

This project follows a **PR-based workflow**. Direct pushes to `main` are not recommended.

```bash
# 1. Create a feature branch
git checkout -b feat/your-feature

# 2. Make changes, then commit
git add -A
git commit -m "feat: description of change"

# 3. Push the branch
git push origin feat/your-feature

# 4. Open a Pull Request on GitHub → CI runs automatically
#    (type-check + lint + unit tests + build)

# 5. Merge via "Squash and merge" for a clean main history
```

**Recommended branch protection rules** for `main` (GitHub → Settings → Branches):

- ✅ Require a pull request before merging
- ✅ Require status checks: `quality` and `build`
- ✅ Require branches to be up to date before merging

---

## 🎨 Themes

| Theme             | Vibe             | Colors                |
| ----------------- | ---------------- | --------------------- |
| ✨ Soft & Elegant | Pastel, romantic | Pink, rose            |
| ⚡ Bold & Cool    | Dark, cyberpunk  | Dark slate, cyan neon |
| 🧸 Cute & Playful | Fun, colorful    | Purple, fuchsia       |
| 🎪 Classic Arcade | Retro, nostalgic | Dark, yellow neon     |

---

## 📝 License

MIT — feel free to fork and build your own version!

---

<p align="center">Built with ❤️ for gifting season</p>
