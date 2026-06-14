# Contributing

Thank you for considering a contribution. This document covers everything you need to get started.

## Code of Conduct

Be respectful and constructive. Harassment or personal attacks of any kind are not acceptable.

## Ways to Contribute

- Report a bug
- Suggest a new question or flag an incorrect one
- Add or improve questions in an existing domain
- Add a new certification track
- Fix a UI or accessibility issue
- Improve documentation

## Development Setup

```bash
git clone https://github.com/thecturner/dd-foundations-site.git
cd dd-foundations-site
./setup.sh
npm run dev
```

The app is running at [http://localhost:3000](http://localhost:3000).

## Branch and PR Workflow

1. Fork the repository and create a branch from `main`.
2. Branch names should be short, lowercase, and hyphenated: `fix/monitor-question-typo`,
   `feat/add-gcp-sre-track`.
3. Make your changes.
4. Run quality checks locally before pushing (see below).
5. Open a pull request against `main` with a clear description of what changed and why.
6. Link any related issues in the PR body.

## Quality Checks

Run these before opening a PR:

```bash
npm run lint              # ESLint
npm run typecheck         # TypeScript
npm test                  # Jest unit + integration tests
npm run test:e2e          # Playwright E2E (requires a running dev server)
npm run validate-questions  # Validate all question banks
```

All of these run in CI on every PR. A red check blocks merge.

## Adding or Editing Questions

Questions are stored in JSON files. Each file exports an array of question objects that must
conform to the Zod schema in `src/lib/questions/schema.ts`.

### Datadog Fundamentals

Files live in `src/data/questions/`:

```
agents.json
apm.json
dashboards.json
infrastructure.json
logs.json
metrics.json
monitors.json
rum-synthetics.json
security.json
service-catalog.json
tagging.json
```

### Other Certification Tracks

Files live under `src/data/certifications/<cert-id>/`.

### Question Schema

Every question object requires these fields:

```json
{
  "id": "metrics-001",
  "type": "single_choice",
  "prompt": "Which metric type tracks the rate of change over time?",
  "choices": [
    { "id": "a", "text": "Gauge" },
    { "id": "b", "text": "Count" },
    { "id": "c", "text": "Rate" },
    { "id": "d", "text": "Distribution" }
  ],
  "correct": "c",
  "explanation": "Rate metrics measure the rate of change ...",
  "topics": ["metrics"],
  "difficulty": "easy",
  "version": 1
}
```

Rules:
- `id` must be unique within the cert bank. Use `<domain>-<number>` style (e.g. `metrics-042`).
- `type` is `single_choice`, `multi_choice`, or `true_false`.
- `correct` is a string for single/true-false, or an array of strings for multi-choice.
- `difficulty` is `easy`, `medium`, or `hard`.
- `topics` is an array of topic slugs defined in the cert's taxonomy.
- `version` starts at `1` and increments when a question is substantively edited.
- Optional: `refs` array with `{ "label": "...", "url": "..." }` entries pointing to official docs.

After editing, validate your changes:

```bash
npm run validate-questions
```

### Adding a New Certification Track

1. Create a directory under `src/data/certifications/<cert-id>/`.
2. Add a `questions/index.ts` that exports a `QUESTION_BANK` object keyed by domain.
3. Add the `CertificationId` value to `src/types/quiz.ts`.
4. Add an `importBank` case in `src/lib/questions/loader.ts`.
5. Add a card to `src/app/page.tsx`.
6. Run `npm run validate-questions` to confirm all questions parse correctly.

## Using Claude Code

This project includes a `CLAUDE.md` with full context. If you use Claude Code, start it from the
project root and it will pick up the architecture and command reference automatically.

The `scripts/generate-questions.ts` script uses the Anthropic API to generate new questions from
documentation pages. It requires `ANTHROPIC_API_KEY` in your environment. This script is
optional and dev-only — you do not need it to contribute.

## Commit Messages

Use conventional commits:

```
feat: add GCP Professional Cloud Architect track
fix: correct answer key for monitors-037
docs: update contributing guide with schema rules
chore: bump next to 16.2.4
```

## Reporting Bugs or Incorrect Questions

Use the GitHub issue templates. For an incorrect question, include the question ID (visible in
the URL during a quiz) and what the correct answer should be, with a reference to official
documentation.

## License

By contributing, you agree that your contributions are licensed under the project's
[MIT License](LICENSE).
