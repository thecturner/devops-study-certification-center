# Datadog Fundamentals Practice Quiz

Next.js app for practicing Datadog Fundamentals questions with:
- auto-mixed or custom-filtered quiz generation
- learning mode with per-question feedback
- results, topic breakdowns, and retry-missed flow

Question bank status: 11 domains, 544 questions.

## Local Development

Prerequisites:
- Node.js 20+
- npm

Install dependencies:

```bash
npm install
```

Copy the environment template and fill in your values (optional — the app runs without Datadog RUM/APM):

```bash
cp .env.example .env.local
```

Run the app:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Quality Checks

```bash
npm run lint
npm run typecheck
npm run test:unit
npm run test:integration
npm run test:e2e
```

## Docker

Build the image:

```bash
docker build -t dd-fundamentals-practice:local .
```

Run the container:

```bash
docker run --rm -p 3000:3000 dd-fundamentals-practice:local
```

## Mac Terminal Quickstart (Dockerized)

If Docker is not running yet:

```bash
# Docker Desktop users
open -a Docker

# Colima users
colima start
```

Verify Docker is ready:

```bash
docker info
```

Option A: Build and run locally from source:

```bash
git clone https://github.com/thecturner/dd-foundations-site.git
cd dd-foundations-site
docker build -t dd-fundamentals-practice:local .
docker run --rm --name dd-foundations -p 3000:3000 dd-fundamentals-practice:local
```

Option B: Run a prebuilt image from a registry:

```bash
docker pull <registry>/<image>:<tag>
docker run --rm --name dd-foundations -p 3000:3000 <registry>/<image>:<tag>
```

Open:

```text
http://localhost:3000
```

Stop:

```bash
docker stop dd-foundations
```

## Configuration

Copy `.env.example` to `.env.local` and fill in your values. All variables are optional — the app works without them:

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_DD_APPLICATION_ID` | Datadog RUM application ID |
| `NEXT_PUBLIC_DD_CLIENT_TOKEN` | Datadog RUM client token |
| `NEXT_PUBLIC_DD_ENV` | Environment label for RUM |
| `DD_API_KEY` | Datadog API key for server-side APM |
| `DD_SERVICE` | APM service name |
| `DD_ENV` | APM environment label |

## Notes

- App routes live under `src/app`.
- Question data lives under `src/data/questions`.
- Session state is browser-scoped and intentionally clearable via the UI.

## CI/CD

The included GitHub Actions workflow (`.github/workflows/ci-cd.yml`) runs lint, type check, unit tests, integration tests, Lighthouse, E2E tests, dependency audit, SAST, secret scan, and a container smoke test on every pull request and push to `main`.

The publish workflow (`.github/workflows/publish.yml`) builds and pushes a multi-arch container image to a registry of your choice (configured via `AWS_REGION`, `ECR_REPOSITORY`, and `AWS_ROLE_TO_ASSUME` repository variables/secrets). Adapt it to your preferred registry.
