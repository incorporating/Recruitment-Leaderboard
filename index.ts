CREATE TABLE profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name     TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  role          TEXT NOT NULL DEFAULT 'consultant'
                  CHECK (role IN ('consultant', 'admin')),
  is_active     BOOLEAN NOT NULL DEFAULT true,
  avatar_url    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE activities (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type          TEXT NOT NULL
                  CHECK (type IN ('sendout', 'client_meeting', 'candidate_call')),
  activity_date DATE NOT NULL DEFAULT CURRENT_DATE,
  source        TEXT NOT NULL DEFAULT 'manual'
                  CHECK (source IN ('manual', 'bullhorn')),
  bullhorn_id   TEXT UNIQUE,   -- prevents duplicate syncs from Bullhorn
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE revenue_entries (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount        NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  invoice_date  DATE NOT NULL DEFAULT CURRENT_DATE,
  description   TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE bullhorn_sync_log (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  synced_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  records_added   INTEGER NOT NULL DEFAULT 0,
  status          TEXT NOT NULL CHECK (status IN ('success', 'error')),
  error_message   TEXT
);

CREATE TABLE app_settings (
  key         TEXT PRIMARY KEY,
  value       TEXT,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_activities_user_date   ON activities(user_id, activity_date);
CREATE INDEX idx_activities_date        ON activities(activity_date);
CREATE INDEX idx_activities_bullhorn_id ON activities(bullhorn_id)
                                          WHERE bullhorn_id IS NOT NULL;
CREATE INDEX idx_revenue_user_date      ON revenue_entries(user_id, invoice_date);
CREATE INDEX idx_revenue_date           ON revenue_entries(invoice_date);

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER activities_updated_at
  BEFORE UPDATE ON activities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER revenue_updated_at
  BEFORE UPDATE ON revenue_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'consultant')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

CREATE OR REPLACE FUNCTION handle_user_email_change()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.email IS DISTINCT FROM OLD.email THEN
    UPDATE public.profiles SET email = NEW.email WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_email_change
  AFTER UPDATE OF email ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_user_email_change();

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE VIEW daily_leaderboard AS
SELECT
  p.id,
  p.full_name,
  COUNT(*) FILTER (WHERE a.type = 'sendout')         AS sendouts,
  COUNT(*) FILTER (WHERE a.type = 'client_meeting')  AS client_meetings,
  COUNT(*) FILTER (WHERE a.type = 'candidate_call')  AS candidate_calls,
  (
    COUNT(*) FILTER (WHERE a.type = 'sendout')        * 100 +
    COUNT(*) FILTER (WHERE a.type = 'client_meeting') * 25  +
    COUNT(*) FILTER (WHERE a.type = 'candidate_call') * 10
  ) AS total_points
FROM profiles p
LEFT JOIN activities a
  ON a.user_id = p.id
  AND a.activity_date = CURRENT_DATE
WHERE p.role = 'consultant' AND p.is_active = true
GROUP BY p.id, p.full_name
ORDER BY total_points DESC, sendouts DESC;

CREATE OR REPLACE VIEW monthly_kpi_leaderboard AS
SELECT
  p.id,
  p.full_name,
  COUNT(*) FILTER (WHERE a.type = 'sendout')         AS sendouts,
  COUNT(*) FILTER (WHERE a.type = 'client_meeting')  AS client_meetings,
  COUNT(*) FILTER (WHERE a.type = 'candidate_call')  AS candidate_calls,
  (
    COUNT(*) FILTER (WHERE a.type = 'sendout')        * 100 +
    COUNT(*) FILTER (WHERE a.type = 'client_meeting') * 25  +
    COUNT(*) FILTER (WHERE a.type = 'candidate_call') * 10
  ) AS total_points
FROM profiles p
LEFT JOIN activities a
  ON a.user_id = p.id
  AND DATE_TRUNC('month', a.activity_date) = DATE_TRUNC('month', CURRENT_DATE)
WHERE p.role = 'consultant' AND p.is_active = true
GROUP BY p.id, p.full_name
ORDER BY total_points DESC, sendouts DESC;

CREATE OR REPLACE VIEW monthly_revenue_leaderboard AS
SELECT
  p.id,
  p.full_name,
  COALESCE(SUM(r.amount), 0) AS total_revenue
FROM profiles p
LEFT JOIN revenue_entries r
  ON r.user_id = p.id
  AND DATE_TRUNC('month', r.invoice_date) = DATE_TRUNC('month', CURRENT_DATE)
WHERE p.role = 'consultant' AND p.is_active = true
GROUP BY p.id, p.full_name
ORDER BY total_revenue DESC;

CREATE OR REPLACE VIEW yearly_revenue_leaderboard AS
SELECT
  p.id,
  p.full_name,
  COALESCE(SUM(r.amount), 0) AS total_revenue
FROM profiles p
LEFT JOIN revenue_entries r
  ON r.user_id = p.id
  AND DATE_TRUNC('year', r.invoice_date) = DATE_TRUNC('year', CURRENT_DATE)
WHERE p.role = 'consultant' AND p.is_active = true
GROUP BY p.id, p.full_name
ORDER BY total_revenue DESC;

ALTER TABLE profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities        ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue_entries   ENABLE ROW LEVEL SECURITY;
ALTER TABLE bullhorn_sync_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings      ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_authenticated"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id OR is_admin())
  WITH CHECK (auth.uid() = id OR is_admin());

CREATE POLICY "profiles_admin_insert"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "profiles_admin_delete"
  ON profiles FOR DELETE
  TO authenticated
  USING (is_admin());

CREATE POLICY "activities_select_own_or_admin"
  ON activities FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "activities_insert_own_manual"
  ON activities FOR INSERT
  TO authenticated
  WITH CHECK (
    (auth.uid() = user_id AND source = 'manual') OR is_admin()
  );

CREATE POLICY "activities_delete_own_manual_or_admin"
  ON activities FOR DELETE
  TO authenticated
  USING (
    (auth.uid() = user_id AND source = 'manual') OR is_admin()
  );

CREATE POLICY "activities_update_admin"
  ON activities FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "revenue_select_own_or_admin"
  ON revenue_entries FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "revenue_insert_own"
  ON revenue_entries FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id OR is_admin());

CREATE POLICY "revenue_delete_own_or_admin"
  ON revenue_entries FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "revenue_update_admin"
  ON revenue_entries FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "sync_log_admin_all"
  ON bullhorn_sync_log FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "app_settings_admin_all"
  ON app_settings FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE OR REPLACE FUNCTION public.get_daily_leaderboard()
RETURNS SETOF daily_leaderboard
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT * FROM daily_leaderboard; $$;

CREATE OR REPLACE FUNCTION public.get_monthly_kpi_leaderboard()
RETURNS SETOF monthly_kpi_leaderboard
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT * FROM monthly_kpi_leaderboard; $$;

CREATE OR REPLACE FUNCTION public.get_monthly_revenue_leaderboard()
RETURNS SETOF monthly_revenue_leaderboard
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT * FROM monthly_revenue_leaderboard; $$;

CREATE OR REPLACE FUNCTION public.get_yearly_revenue_leaderboard()
RETURNS SETOF yearly_revenue_leaderboard
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT * FROM yearly_revenue_leaderboard; $$;

GRANT EXECUTE ON FUNCTION public.get_daily_leaderboard()           TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_monthly_kpi_leaderboard()     TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_monthly_revenue_leaderboard() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_yearly_revenue_leaderboard()  TO anon, authenticated;

ALTER PUBLICATION supabase_realtime ADD TABLE activities;
ALTER PUBLICATION supabase_realtime ADD TABLE revenue_entries;

GRANT USAGE ON SCHEMA public TO anon, authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public
  TO authenticated;

GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO authenticated;
