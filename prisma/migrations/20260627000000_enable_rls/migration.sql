-- Enable Row Level Security on all tables.
-- Prisma connects as the postgres superuser (bypasses RLS), so app behaviour
-- is unchanged. Enabling RLS with no permissive policies closes the Supabase
-- PostgREST endpoint for the anon/authenticated roles entirely.

ALTER TABLE "friends" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "gift_suggestions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "game_results" ENABLE ROW LEVEL SECURITY;
