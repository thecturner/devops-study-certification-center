# Certification Study Center

[![CI](https://github.com/thecturner/dd-foundations-site/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/thecturner/dd-foundations-site/actions/workflows/ci-cd.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Node 20+](https://img.shields.io/badge/node-20%2B-brightgreen)](https://nodejs.org/)
[![Next.js 16](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)

A free, open-source practice quiz app for technical certification exams. No account required.
Your session data stays in your browser and is never sent to a server.

## Certifications Covered

| Platform | Tracks |
|----------|--------|
| Datadog | Fundamentals (11 domains, 500+ questions) |
| Kubernetes | CKA, CKAD, CKS |
| AWS | Solutions Architect Associate/Professional, DevOps Professional |
| Google Cloud | Associate Cloud Engineer, Professional Cloud Architect, Professional Data Engineer |
| Azure | AZ-900, AZ-104, AZ-305 |
| ServiceNow | CSA, CIS-ITSM, CAD |
| ITIL 4 | Foundation, Managing Professional, Strategic Leader |
| Anthropic | Claude Certified Associate Foundations (CCAF) |

## Features

- Balanced auto-mix across domains, or hand-pick specific topics
- Single-choice, multi-choice, and true/false question types
- Per-difficulty filtering (easy / medium / hard)
- Learning mode: immediate per-question feedback with explanations
- Timed quiz option
- Flag questions for review
- Post-quiz score breakdown by topic and difficulty
- Personalized study guide highlighting weak areas
- Resume in-progress quiz after page reload
- Light and dark theme
- Optional Datadog RUM + APM integration via environment variables

## Quick Start

```bash
git clone https://github.com/thecturner/dd-foundations-site.git
cd dd-foundations-site
./setup.sh
```

Then open [http://localhost:3000](http://localhost:3000).

See [CLAUDE.md](CLAUDE.md) for a full command reference and architecture overview.

## Prerequisites

- Node.js 20+
- npm (bundled with Node.js)
- Docker (optional, for containerized runs)

## Manual Setup

```bash
npm install
cp .env.example .env.local   # all vars are optional
npm run dev
```

## Configuration

Copy `.env.example` to `.env.local`. Every variable is optional — the app runs without any of them.

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_DD_APPLICATION_ID` | Datadog RUM application ID |
| `NEXT_PUBLIC_DD_CLIENT_TOKEN` | Datadog RUM client token |
| `NEXT_PUBLIC_DD_ENV` | Environment label for RUM |
| `DD_API_KEY` | Datadog API key for server-side APM |
| `DD_SERVICE` | APM service name |
| `DD_ENV` | APM environment label |

## Development

```bash
npm run dev             # Start dev server
npm run lint            # ESLint
npm run typecheck       # TypeScript check
npm test                # Jest unit + integration tests
npm run test:e2e        # Playwright end-to-end tests
npm run validate-questions  # Validate all question banks
```

## Docker

```bash
docker build -t cert-study-center:local .
docker run --rm -p 3000:3000 cert-study-center:local
```

On macOS with Colima:

```bash
colima start
docker build -t cert-study-center:local .
docker run --rm -p 3000:3000 cert-study-center:local
```

## Using with Claude Code

This project includes a `CLAUDE.md` that gives Claude Code full context about the architecture,
commands, and key files.

```bash
claude    # Start Claude Code in the project root — it reads CLAUDE.md automatically
```

## How It Works

Questions are stored in JSON files under `src/data/`. The API routes serve questions with correct
answers stripped, so the client never sees them until after grading. Grading is stateless and
server-side: `/api/quiz/grade` re-loads each question by ID from the bank, scores the submitted
answers, and returns results along with explanations and a personalized study guide.

There is no database, no authentication, and no persistent storage. Everything is ephemeral to
the browser session.

## Contributing

Contributions are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines, including how
to add new questions and new certification tracks.

## License

MIT — see [LICENSE](LICENSE).
