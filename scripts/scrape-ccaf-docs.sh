#!/usr/bin/env bash
# scripts/scrape-ccaf-docs.sh
#
# Generates CCAF exam questions from Anthropic documentation pages.
# Each invocation appends questions to the relevant topic file.
#
# Prerequisites:
#   ANTHROPIC_API_KEY must be set in the environment.
#
# Usage:
#   bash scripts/scrape-ccaf-docs.sh

set -euo pipefail

TSX="./node_modules/.bin/tsx"
SCRIPT="scripts/generate-questions.ts"

if [[ -z "${ANTHROPIC_API_KEY:-}" ]]; then
  echo "Error: ANTHROPIC_API_KEY is not set"
  exit 1
fi

run() {
  local url="$1" topic="$2" prefix="$3" start="$4"
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "  URL:    $url"
  echo "  Topic:  $topic  |  Prefix: $prefix  |  Start: $start"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  "$TSX" "$SCRIPT" \
    --url "$url" \
    --cert ccaf \
    --topic "$topic" \
    --id-prefix "$prefix" \
    --start-id "$start"
}

# ── Claude Code docs (docs.claude.com) ────────────────────────────────────────
run "https://docs.claude.com/en/docs/claude-code/settings"       claude-code  ccaf-settings   1
run "https://docs.claude.com/en/docs/claude-code/hooks"          claude-code  ccaf-hooks      1
run "https://docs.claude.com/en/docs/claude-code/skills"         claude-code  ccaf-skills     1
run "https://docs.claude.com/en/docs/claude-code/slash-commands" claude-code  ccaf-slash      1
run "https://docs.claude.com/en/docs/claude-code/sub-agents"     claude-code  ccaf-subagents  1
run "https://docs.claude.com/en/docs/claude-code/mcp"            claude-code  ccaf-mcp        1
run "https://docs.claude.com/en/docs/claude-code/headless-mode"  claude-code  ccaf-headless   1
run "https://docs.claude.com/en/docs/claude-code/memory"         claude-code  ccaf-memory     1

# ── Claude API docs (docs.anthropic.com) ──────────────────────────────────────
run "https://docs.anthropic.com/en/docs/build-with-claude/tool-use"          claude-api  ccaf-tool-use   1
run "https://docs.anthropic.com/en/docs/build-with-claude/structured-outputs" claude-api  ccaf-structured 1
run "https://docs.anthropic.com/en/api/messages-batches"                     claude-api  ccaf-batches    1

echo ""
echo "All pages scraped successfully."
