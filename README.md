# seo-engine

Scheduled content engine: reads client briefs from Airtable, generates SEO blog posts with Claude, writes drafts or published documents to Sanity. Replaces the previous Gumloop flow.

## Layout

- `CLAUDE.md` — project memory, loaded as the cached system prompt on every generation run.
- `agents/seo-writer.md` — subagent definition for the writer (model, role, output contract).
- `tools/` — typed wrappers around Airtable and Sanity. Workflows call them directly in v1; future versions can hand them to subagents as Claude Agent SDK tools.
- `workflows/` — trigger.dev tasks. `single-client.ts` runs one client (both CLI and task). `daily-run.ts` is the cron task.
- `lib/` — shared infra: env loading, models, ID building, markdown→PortableText, logger, generation.
- `tests/` — vitest suite for the highest-value logic (Airtable mapping, workflow routing, payload shape).

## Setup

```bash
nvm use
pnpm install
cp .env.example .env
# fill in AIRTABLE_API_KEY and ANTHROPIC_API_KEY at minimum
```

## Local run (dry-run, prints would-be Sanity payload)

```bash
pnpm cli --client recXXXXXXXXXXXX --dry-run
```

## Checks

```bash
pnpm typecheck
pnpm lint
pnpm test
```

## Deploy (PR #2)

trigger.dev tasks live in `workflows/`. Deploy with `pnpm trigger:deploy` once Sanity credentials are configured and the schema is confirmed.

## Status

PR #1 scaffolds the project and ships a working dry-run that reads from Airtable and prints a generated Sanity payload to stdout. Sanity writes are stubbed with log statements pending schema confirmation. PR #2 will plug in real Sanity writes and deploy the daily cron.
