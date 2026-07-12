-- Product detail page fields: rich description, technical specs JSON, lab preparation guide.
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS long_description text,
  ADD COLUMN IF NOT EXISTS lab_preparation text,
  ADD COLUMN IF NOT EXISTS technical_specs jsonb;

COMMENT ON COLUMN products.long_description IS 'Extended storefront description shown on the product detail page.';
COMMENT ON COLUMN products.lab_preparation IS 'Markdown-style lab preparation guide (## section headings).';
COMMENT ON COLUMN products.technical_specs IS 'Structured technical properties JSON for the product detail page.';
