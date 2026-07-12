-- Track Trustpilot review-request emails so we don't spam customers twice.
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS review_request_email_sent boolean NOT NULL DEFAULT false;
