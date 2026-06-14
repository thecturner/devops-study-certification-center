# Certification Study Center

**Version:** 0.1.0 | **Port:** 3000 | **Stack:** Next.js 16 + TypeScript + Tailwind v4 + Zustand

## What

A no-auth, no-database practice quiz app for technical certification exams. Questions are served
server-side with answers stripped; grading happens in a stateless API route. Session state lives
in browser sessionStorage only.

## Quick Start

```bash
./setup.sh              # First-time setup
npm run dev             # Start development server (http://localhost:3000)
npm test                # Run unit + integration tests
```

## Commands

```bash
# Development
npm install             # Install dependencies
npm run dev             # Start dev server
npm run lint            # Run ESLint
npm run typecheck       # Run tsc --noEmit
npm run build           # Production build (standalone output)

# Testing
npm test                # Jest unit + integration tests
npm run test:unit       # Unit tests only
npm run test:integration  # Integration tests only (--runInBand)
npm run test:e2e        # Playwright E2E tests

# Validation
npm run validate-questions  # Validate all question banks against Zod schema

# Docker
cp .env.example .env.local
docker build -t cert-study-center:local .
docker run --rm -p 3000:3000 cert-study-center:local
# Mac / Colima users: run `colima start` before docker commands
```

## Architecture

```
src/
├── app/                     # Next.js App Router (pages + API routes)
│   ├── page.tsx             # Home: certification picker
│   ├── configure/           # Quiz setup form (count, topics, difficulty)
│   ├── quiz/                # Active quiz runner
│   ├── results/             # Score, topic breakdown, study guide
│   └── api/quiz/            # grade/, generate/, feedback/ routes
├── components/
│   ├── quiz/                # QuizRunner, QuestionCard, QuizConfigForm, etc.
│   └── ui/                  # shadcn/ui primitives
├── lib/
│   ├── questions/           # loader.ts, selector.ts, schema.ts
│   ├── grading/             # engine.ts, question-feedback.ts
│   ├── study-guide/         # generator.ts
│   ├── datadog/             # rum.ts, tracer.ts (optional, guarded by env vars)
│   ├── store.ts             # Zustand client state
│   └── session.ts           # sessionStorage mirror
├── data/
│   ├── questions/           # Datadog Fundamentals bank (11 domains, JSON)
│   └── certifications/      # All other cert banks (K8s, AWS, GCP, Azure, etc.)
└── types/quiz.ts            # All shared TypeScript types
```

API routes strip `correct` and `explanation` from questions before responding. The `/api/quiz/grade`
route re-loads questions from the bank server-side to perform authoritative grading. The client
never receives answers until after submission.

## Key Files

```
src/types/quiz.ts                  # Single source of truth for all types
src/lib/questions/schema.ts        # Zod schema every question is validated against
src/lib/questions/loader.ts        # Per-cert in-memory question cache
src/lib/questions/selector.ts      # Filtering, balanced selection, answer stripping
src/lib/grading/engine.ts          # gradeQuiz() — stateless, server-side only
src/lib/study-guide/generator.ts   # Post-quiz study guide generation
src/lib/store.ts                   # Zustand session store + sessionStorage mirror
src/lib/constants.ts               # PASS_THRESHOLD_PCT = 70
scripts/generate-questions.ts      # Dev-only: Claude-assisted question generation (needs ANTHROPIC_API_KEY)
scripts/validate-questions.ts      # CI validation script
```

## Configuration

All configuration is via environment variables. See `.env.example`:

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_DD_APPLICATION_ID` | No | Datadog RUM application ID |
| `NEXT_PUBLIC_DD_CLIENT_TOKEN` | No | Datadog RUM client token |
| `NEXT_PUBLIC_DD_ENV` | No | Environment label for RUM (e.g. `production`) |
| `DD_API_KEY` | No | Datadog API key for server-side APM tracing |
| `DD_SERVICE` | No | APM service name |
| `DD_ENV` | No | APM environment label |
| `ANTHROPIC_API_KEY` | No (dev only) | Used by `scripts/generate-questions.ts` only |

The app runs fully without any of these set.

## Adding Questions

1. Add questions to the relevant JSON file in `src/data/questions/` (Datadog) or
   `src/data/certifications/<cert>/` (other vendors).
2. Each question must match the Zod schema in `src/lib/questions/schema.ts`.
3. Run `npm run validate-questions` to verify.
4. IDs must be globally unique within a cert bank.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).
