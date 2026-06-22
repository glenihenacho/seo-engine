# seo-engine

Scheduled content engine: reads client briefs from Airtable, generates SEO blog posts via OpenRouter (any model — Claude, GPT, Gemini), writes drafts or published documents to Sanity. Replaces the previous Gumloop flow.

## Layout

- `CLAUDE.md` — project memory, loaded as the cached system prompt on every generation run.
- `agents/seo-writer.md` — subagent definition for the writer (model, role, output contract).
- `tools/` — typed wrappers around Airtable and Sanity. Workflows call them directly in v1; future versions can hand them to subagents as Claude Agent SDK tools.
- `workflows/` — trigger.dev tasks. `weekly-schedule.ts` is the Sunday cron that fans out future runs. `single-client.ts` runs one client (both CLI and task). `seed-author.ts` seeds the default `AI Content` author into one client dataset.
- `lib/` — shared infra: env loading, models, ID building, markdown→PortableText, logger, generation.
- `studio/` — Sanity Studio app holding the canonical `post` + `author` schema. One workspace per client dataset, all sharing the same schema.
- `tests/` — vitest suite for the highest-value logic (Airtable mapping, workflow routing, payload shape).

## Setup

```bash
nvm use
pnpm install
cp .env.example .env
# fill in AIRTABLE_API_KEY and OPENROUTER_API_KEY at minimum
```

## Local run (dry-run, prints would-be Sanity payload)

```bash
pnpm cli --client recXXXXXXXXXXXX --dry-run
```

Generation routes through OpenRouter's universal `/v1/chat/completions`. Swap models by changing `MODEL_NAME` in `.env` — `anthropic/claude-sonnet-4.6`, `openai/gpt-5`, `google/gemini-2.5-pro`, etc. No code change.

## Checks

```bash
pnpm typecheck
pnpm lint
pnpm test
```

## Sanity Studio

The canonical post schema lives in `studio/`. One-time setup:

```bash
pnpm sanity:install                                # installs studio deps
export SANITY_STUDIO_PROJECT_ID=<projectId>
export SANITY_STUDIO_DATASETS=acme,beta-co         # comma-separated client datasets
pnpm sanity:dev                                    # boots Studio at localhost:3333
pnpm sanity:schema:deploy                          # publishes the schema metadata
pnpm sanity:deploy                                 # deploys hosted Studio
```

The workspace switcher lists every dataset in `SANITY_STUDIO_DATASETS`. Adding a new client = add their dataset slug to that env var and redeploy.

## Seeding the default author

Every dataset needs an `author.ai-content` document so generated posts have a reference to attach to:

```bash
pnpm cli:seed-author --dataset acme
```

Idempotent (safe to rerun). Run once per new client dataset before the first Greenlit publish.

## Real writes

The Airtable `Sanity Status` field is the routing switch:

- `Off` — skip entirely.
- `Dry Run` — generate the post and print the would-be payload; no Sanity write.
- `Needs Review` — write to Sanity as a draft.
- `Greenlit` — write to Sanity as a published document.

The CLI accepts `--dry-run` as a one-off override (forces no write regardless of status):

```bash
pnpm cli --client recXXXXXXXXXXXX --dry-run
```

## How scheduling works

Per-client cadence is driven by the `Content Schedules` table in Airtable. Each Active row links to a Client and carries:

- `Posting Windows` — JSON array `[{day:0..6 (0=Sun), start:"HH:MM", end:"HH:MM"}, ...]`. One window = one weekly post.
- `Posts per week` — sanity-check; warns if it doesn't match window count.

`seo-engine.weekly-schedule` runs Sundays at 00:00 UTC. For each Active schedule and each window, it picks a random whole hour in `[startHour, endHour)`, computes the next UTC datetime on the right weekday, and `batchTrigger`s a future `seo-engine.single-client` run at that moment. Trigger.dev holds the run and fires it on schedule.

Idempotency key: `${clientRecordId}-${scheduleRecordId}-${YYYY-MM-DD}`. Rerunning the compiler the same week is a no-op. Editing a window mid-week only affects days that haven't been keyed yet.

The `single-client` task is queued with `concurrencyLimit: 4` so clustered slots don't burst Airtable or OpenRouter.

## Deploy

trigger.dev tasks live in `workflows/`. Deploy with `pnpm trigger:deploy` once Sanity credentials are configured.
