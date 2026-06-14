#!/usr/bin/env bash
set -euo pipefail

# Certification Study Center — First-time setup
# Usage: ./setup.sh

echo "=== Certification Study Center Setup ==="
echo ""

# Check Node.js
if ! command -v node >/dev/null 2>&1; then
  echo "Error: Node.js is required (20+). Download it from https://nodejs.org/"
  exit 1
fi

NODE_MAJOR=$(node -e "process.stdout.write(process.versions.node.split('.')[0])")
if [ "$NODE_MAJOR" -lt 20 ]; then
  echo "Error: Node.js 20+ is required. You have $(node -v)."
  echo "Download the latest LTS from https://nodejs.org/"
  exit 1
fi

# Check npm
if ! command -v npm >/dev/null 2>&1; then
  echo "Error: npm is required. It is bundled with Node.js — reinstall Node.js from https://nodejs.org/"
  exit 1
fi

echo "Node.js $(node -v) detected."
echo ""

# Environment file
if [ ! -f .env.local ]; then
  if [ -f .env.example ]; then
    cp .env.example .env.local
    echo "Created .env.local from .env.example"
    echo "All variables are optional. The app runs without Datadog RUM/APM credentials."
    echo ""
  fi
else
  echo ".env.local already exists — skipping."
  echo ""
fi

# Dependencies
echo "Installing dependencies..."
npm install

echo ""
echo "Validating question banks..."
npm run validate-questions

echo ""
echo "=== Setup complete! ==="
echo ""
echo "Next steps:"
echo "  1. Optionally edit .env.local to add Datadog RUM/APM credentials"
echo "  2. Start the dev server: npm run dev"
echo "  3. Open: http://localhost:3000"
echo ""
echo "Other commands:"
echo "  npm test                    Run tests"
echo "  npm run lint                Run ESLint"
echo "  npm run typecheck           TypeScript check"
echo "  npm run validate-questions  Validate all question banks"
echo ""
echo "Using Claude Code? CLAUDE.md has the full architecture and command reference."
