-- Increment helpful_count on approved reviews (homepage + product review likes)
CREATE OR REPLACE FUNCTION public.increment_review_helpful(review_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.reviews
  SET helpful_count = COALESCE(helpful_count, 0) + 1
  WHERE id = review_id
    AND is_approved = true;
END;
$$;

GRANT EXECUTE ON FUNCTION public.increment_review_helpful(uuid) TO anon, authenticated;
