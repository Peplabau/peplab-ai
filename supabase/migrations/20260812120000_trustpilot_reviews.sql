-- Trustpilot reviews mirrored into Supabase (hybrid: Apify sync + admin edit/hide).
-- Homepage reads visible rows + trustpilot_stats; no live Trustpilot widgets required.

CREATE TABLE IF NOT EXISTS public.trustpilot_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id text NOT NULL,
  author_name text,
  rating integer NOT NULL DEFAULT 5
    CHECK (rating >= 1 AND rating <= 5),
  title text,
  body text,
  reviewed_at timestamptz,
  is_verified boolean NOT NULL DEFAULT false,
  source_url text,
  is_visible boolean NOT NULL DEFAULT true,
  admin_edited boolean NOT NULL DEFAULT false,
  raw jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS trustpilot_reviews_external_id_idx
  ON public.trustpilot_reviews (external_id);

CREATE INDEX IF NOT EXISTS trustpilot_reviews_visible_reviewed_at_idx
  ON public.trustpilot_reviews (is_visible, reviewed_at DESC)
  WHERE is_visible = true;

CREATE TABLE IF NOT EXISTS public.trustpilot_stats (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  trust_score numeric(3, 1),
  review_count integer NOT NULL DEFAULT 0 CHECK (review_count >= 0),
  stars_breakdown jsonb NOT NULL DEFAULT '{}'::jsonb,
  last_synced_at timestamptz,
  last_sync_error text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.trustpilot_stats (id, trust_score, review_count)
VALUES (1, NULL, 0)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.trustpilot_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trustpilot_stats ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS trustpilot_reviews_public_select ON public.trustpilot_reviews;
CREATE POLICY trustpilot_reviews_public_select ON public.trustpilot_reviews
  FOR SELECT
  USING (is_visible = true);

DROP POLICY IF EXISTS trustpilot_reviews_admin_all ON public.trustpilot_reviews;
CREATE POLICY trustpilot_reviews_admin_all ON public.trustpilot_reviews
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

DROP POLICY IF EXISTS trustpilot_stats_public_select ON public.trustpilot_stats;
CREATE POLICY trustpilot_stats_public_select ON public.trustpilot_stats
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS trustpilot_stats_admin_all ON public.trustpilot_stats;
CREATE POLICY trustpilot_stats_admin_all ON public.trustpilot_stats
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

COMMENT ON TABLE public.trustpilot_reviews IS
  'Company-level Trustpilot reviews synced via Apify; admin can edit/hide without product_id.';
COMMENT ON COLUMN public.trustpilot_reviews.admin_edited IS
  'When true, re-sync must not overwrite title/body/rating/author_name.';
COMMENT ON COLUMN public.trustpilot_reviews.is_visible IS
  'Admin hide flag; re-sync must not flip hidden rows back to visible.';
