-- ============================================================================
-- PATCH 0002 -- Fix "permission denied for table profiles" (and others)
-- ============================================================================
-- Cause: tables created via raw SQL did not receive the table-level GRANTs
-- that Supabase normally issues to its built-in roles. RLS policies only take
-- effect AFTER table-level privileges are granted, so without these grants
-- Postgres denies access before any policy is evaluated.
--
-- This patch grants the standard privileges to the anon and authenticated
-- roles. Row Level Security still governs WHICH rows each role can see/modify;
-- these grants just permit the operations at the table level so RLS can apply.
--
-- Safe to run multiple times.
-- ============================================================================

-- Allow the API roles to use the schema at all.
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Authenticated users: full DML at the table level (RLS narrows it per-row).
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public
  TO authenticated;

-- Anonymous (the TV display): NO direct table access. The leaderboards are
-- exposed exclusively through SECURITY DEFINER functions (get_*_leaderboard),
-- which already have EXECUTE granted to anon. Granting anon table access is
-- unnecessary and widens the surface, so we deliberately do NOT grant it.
-- (RLS would return zero rows anyway, but least-privilege is cleaner.)

-- Sequences (for any serial/identity columns) so inserts work.
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Make the same grants apply to any tables/sequences created in future.
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO authenticated;

-- ============================================================================
-- END PATCH 0002
-- ============================================================================
