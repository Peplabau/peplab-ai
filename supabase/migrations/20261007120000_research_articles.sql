-- Research Library compound articles (admin CMS → public research pages).

CREATE TABLE IF NOT EXISTS public.research_articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL,
  name text NOT NULL,
  category text NOT NULL DEFAULT '',
  product_slug text,
  card_title text NOT NULL DEFAULT '',
  card_description text NOT NULL DEFAULT '',
  seo_title text NOT NULL DEFAULT '',
  seo_description text NOT NULL DEFAULT '',
  eyebrow text NOT NULL DEFAULT '',
  h1 text NOT NULL DEFAULT '',
  subtitle text NOT NULL DEFAULT '',
  intro text NOT NULL DEFAULT '',
  what_is_heading text NOT NULL DEFAULT '',
  what_is_body text NOT NULL DEFAULT '',
  feature_rows jsonb NOT NULL DEFAULT '[]'::jsonb,
  mechanism_heading text NOT NULL DEFAULT '',
  mechanism_intro text NOT NULL DEFAULT '',
  mechanism_sections jsonb NOT NULL DEFAULT '[]'::jsonb,
  mechanism_footer text NOT NULL DEFAULT '',
  findings_heading text NOT NULL DEFAULT '',
  findings_sections jsonb NOT NULL DEFAULT '[]'::jsonb,
  glance_rows jsonb NOT NULL DEFAULT '[]'::jsonb,
  safety_body text NOT NULL DEFAULT '',
  coa_heading text NOT NULL DEFAULT '',
  coa_body text NOT NULL DEFAULT '',
  faqs jsonb NOT NULL DEFAULT '[]'::jsonb,
  related jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'published')),
  author_name text,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS research_articles_slug_unique_idx
  ON public.research_articles (lower(trim(slug)));

CREATE INDEX IF NOT EXISTS research_articles_status_idx
  ON public.research_articles (status);

CREATE INDEX IF NOT EXISTS research_articles_updated_idx
  ON public.research_articles (updated_at DESC);

CREATE OR REPLACE FUNCTION public.set_research_articles_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS research_articles_set_updated_at ON public.research_articles;
CREATE TRIGGER research_articles_set_updated_at
  BEFORE UPDATE ON public.research_articles
  FOR EACH ROW
  EXECUTE PROCEDURE public.set_research_articles_updated_at();

ALTER TABLE public.research_articles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS research_articles_public_read_published ON public.research_articles;
CREATE POLICY research_articles_public_read_published ON public.research_articles
  FOR SELECT
  USING (status = 'published');

DROP POLICY IF EXISTS research_articles_admin_select ON public.research_articles;
CREATE POLICY research_articles_admin_select ON public.research_articles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

DROP POLICY IF EXISTS research_articles_admin_insert ON public.research_articles;
CREATE POLICY research_articles_admin_insert ON public.research_articles
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

DROP POLICY IF EXISTS research_articles_admin_update ON public.research_articles;
CREATE POLICY research_articles_admin_update ON public.research_articles
  FOR UPDATE
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

DROP POLICY IF EXISTS research_articles_admin_delete ON public.research_articles;
CREATE POLICY research_articles_admin_delete ON public.research_articles
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );
