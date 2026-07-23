# Supabase migrations

Apply in order — either via the CLI or the Dashboard SQL Editor.

## Option A — Supabase CLI

```
npx supabase login
npx supabase link --project-ref ttzrwmtlmbpykfbbuzgb
npx supabase db push
```

Then load dev seed data (optional, safe to skip in production):

```
npx supabase db execute -f supabase/seed.sql
```

## Option B — Dashboard SQL Editor

Open https://supabase.com/dashboard/project/ttzrwmtlmbpykfbbuzgb/sql/new and run each file
in `migrations/` **in filename order** (0001, 0002, 0003, 0004), then optionally `seed.sql`.

## Regenerating TypeScript types

Once linked via the CLI:

```
npx supabase gen types typescript --linked > src/types/database.ts
```
