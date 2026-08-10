#!/usr/bin/env bash
# Apply peplab.ai-specific static + env files to a project copy.
# Run from the repo root:  bash deploy/peplab-ai/apply.sh
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
AI="$ROOT/deploy/peplab-ai"

cp "$AI/index.html" "$ROOT/index.html"
cp "$AI/public/robots.txt" "$ROOT/public/robots.txt"
cp "$AI/public/sitemap.xml" "$ROOT/public/sitemap.xml"
cp "$AI/.env.example" "$ROOT/.env.example"

# Open storefront defaults (when env vars are unset in dev).
sed -i "s#const DEFAULT_LOGIN_ONLY_HOSTS = 'peplab.com.au,www.peplab.com.au'#const DEFAULT_LOGIN_ONLY_HOSTS = ''#" "$ROOT/src/lib/domain.ts"
sed -i "s#'https://peplab.com.au'#'https://peplab.ai'#g" "$ROOT/src/lib/config.ts"
sed -i "s#'https://peplab.com.au'#'https://peplab.ai'#g" "$ROOT/src/landing/lib/site.ts"
sed -i "s#return 'peplab.com.au'#return 'peplab.ai'#" "$ROOT/src/lib/domain.ts"

# Merchant feeds for Google Shopping (ai storefront URLs).
if [ -f "$ROOT/peplab-ai-merchant-feed.csv" ]; then
  sed -i 's|https://peplab.com.au/|https://peplab.ai/|g' "$ROOT/peplab-ai-merchant-feed.csv"
fi
if [ -f "$ROOT/peplab-ai-merchant-feed.tsv" ]; then
  sed -i 's|https://peplab.com.au/|https://peplab.ai/|g' "$ROOT/peplab-ai-merchant-feed.tsv"
fi

echo "Applied peplab.ai deploy files:"
echo "  index.html, public/robots.txt, public/sitemap.xml, .env.example"
echo "  src/lib/domain.ts, src/lib/config.ts, src/landing/lib/site.ts (defaults)"
echo "  merchant feeds (if present)"
echo ""
echo "Next: copy .env.example → .env, add Supabase keys, deploy to Vercel with peplab.ai domain only."
