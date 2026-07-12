-- Optional photo on customer reviews (product photo, unboxing, lab setup, etc.)
ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS image_url text;

COMMENT ON COLUMN public.reviews.image_url IS 'Public URL of an optional review photo stored in Supabase Storage';
