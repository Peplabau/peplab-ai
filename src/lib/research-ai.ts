import { CONFIG } from '@/lib/config';
import { supabase } from '@/lib/supabase';
import {
  DEFAULT_COA_BODY,
  emptyResearchArticle,
  type ResearchArticleInput,
  type ResearchFaq,
  type ResearchFeatureRow,
  type ResearchGlanceRow,
  type ResearchRelated,
  type ResearchSectionBlock,
} from '@/lib/research-articles';

/** OpenAI parse can take well over the app's default 15s fetch timeout. */
const AI_PARSE_TIMEOUT_MS = 120_000;

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

/** Prefer non-empty AI/user strings so SEO fields are never left blank when a fallback exists. */
function asFilled(value: unknown, fallback = ''): string {
  if (typeof value === 'string' && value.trim()) return value.trim();
  if (typeof fallback === 'string' && fallback.trim()) return fallback.trim();
  return '';
}

function firstSentence(text: string, max = 160): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (!clean) return '';
  const match = clean.match(/^(.+?[.!?])(\s|$)/);
  const sentence = (match?.[1] || clean).trim();
  if (sentence.length <= max) return sentence;
  return `${sentence.slice(0, max - 1).trimEnd()}…`;
}


function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

/** Merge OpenAI JSON into a ResearchArticleInput, keeping any existing id. */
export function mergeAiArticleIntoInput(
  ai: Record<string, unknown>,
  existing?: ResearchArticleInput | null,
): ResearchArticleInput {
  const base = emptyResearchArticle();
  const featureRows = asArray<ResearchFeatureRow>(ai.feature_rows)
    .map((r) => ({
      feature: asString(r?.feature),
      details: asString(r?.details),
    }))
    .filter((r) => r.feature || r.details);
  const mechanismSections = asArray<ResearchSectionBlock>(ai.mechanism_sections)
    .map((r) => ({
      title: asString(r?.title),
      body: asString(r?.body),
      link_label: asString(r?.link_label) || undefined,
      link_url: asString(r?.link_url) || undefined,
    }))
    .filter((r) => r.title || r.body);
  const findingsSections = asArray<ResearchSectionBlock>(ai.findings_sections)
    .map((r) => ({
      title: asString(r?.title),
      body: asString(r?.body),
      link_label: asString(r?.link_label) || undefined,
      link_url: asString(r?.link_url) || undefined,
    }))
    .filter((r) => r.title || r.body);
  const glanceRows = asArray<ResearchGlanceRow>(ai.glance_rows)
    .map((r) => ({
      area: asString(r?.area),
      investigated: asString(r?.investigated),
      distinction: asString(r?.distinction),
    }))
    .filter((r) => r.area || r.investigated || r.distinction);
  const faqs = asArray<ResearchFaq>(ai.faqs)
    .map((r) => ({ q: asString(r?.q), a: asString(r?.a) }))
    .filter((r) => r.q || r.a);
  const related = asArray<ResearchRelated>(ai.related)
    .map((r) => ({
      label: asString(r?.label),
      slug: asString(r?.slug) || undefined,
      kind: r?.kind,
      href: asString(r?.href) || undefined,
    }))
    .filter((r) => r.label);

  const name = asFilled(ai.name, existing?.name || base.name);
  const slug = asFilled(ai.slug, existing?.slug || base.slug)
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  const intro = asFilled(ai.intro, existing?.intro || '');
  const whatIsBody = asFilled(ai.what_is_body, existing?.what_is_body || '');
  const cardDescription = asFilled(
    ai.card_description,
    existing?.card_description || firstSentence(whatIsBody || intro, 180),
  );
  const seoDescription = asFilled(
    ai.seo_description,
    existing?.seo_description ||
      firstSentence(cardDescription || whatIsBody || intro, 160) ||
      (name
        ? `${name} research overview: classification, mechanism and primary sources. Research use only — PEPLAB Australia.`
        : ''),
  );

  return {
    ...base,
    ...existing,
    slug,
    name,
    category: asFilled(ai.category, existing?.category || ''),
    product_slug: asFilled(ai.product_slug, existing?.product_slug || ''),
    card_title: asFilled(ai.card_title, existing?.card_title || (name ? `What is ${name}?` : '')),
    card_description: cardDescription,
    seo_title: asFilled(
      ai.seo_title,
      existing?.seo_title || (name ? `${name} Research Overview | PEPLAB Australia` : ''),
    ),
    seo_description: seoDescription,
    eyebrow: asFilled(ai.eyebrow, asFilled(ai.category, existing?.eyebrow || '')),
    h1: asFilled(ai.h1, existing?.h1 || (name ? `${name} Research Overview` : '')),
    subtitle: asFilled(ai.subtitle, existing?.subtitle || ''),
    intro,
    what_is_heading: asFilled(
      ai.what_is_heading,
      existing?.what_is_heading || (name ? `What Is ${name}?` : ''),
    ),
    what_is_body: whatIsBody,
    feature_rows: featureRows.length ? featureRows : existing?.feature_rows?.length
      ? existing.feature_rows
      : base.feature_rows,
    mechanism_heading: asString(ai.mechanism_heading, existing?.mechanism_heading || ''),
    mechanism_intro: asString(ai.mechanism_intro, existing?.mechanism_intro || ''),
    mechanism_sections: mechanismSections.length
      ? mechanismSections
      : existing?.mechanism_sections?.length
        ? existing.mechanism_sections
        : base.mechanism_sections,
    mechanism_footer: asString(ai.mechanism_footer, existing?.mechanism_footer || ''),
    findings_heading: asString(ai.findings_heading, existing?.findings_heading || ''),
    findings_sections: findingsSections.length
      ? findingsSections
      : existing?.findings_sections?.length
        ? existing.findings_sections
        : base.findings_sections,
    glance_rows: glanceRows.length
      ? glanceRows
      : existing?.glance_rows?.length
        ? existing.glance_rows
        : base.glance_rows,
    safety_body: asString(ai.safety_body, existing?.safety_body || ''),
    coa_heading: asString(
      ai.coa_heading,
      existing?.coa_heading || `Understanding ${name} Testing and COAs`,
    ),
    coa_body: asString(ai.coa_body, existing?.coa_body || DEFAULT_COA_BODY),
    faqs: faqs.length ? faqs : existing?.faqs?.length ? existing.faqs : base.faqs,
    related: related.length ? related : existing?.related || [],
    status: 'draft',
    author_name: ai.author_name == null ? existing?.author_name ?? null : asString(ai.author_name) || null,
    published_at: null,
  };
}

export async function parseResearchDocumentWithAi(opts: {
  documentText: string;
  compoundName?: string;
}): Promise<
  | { ok: true; article: ResearchArticleInput; truncated?: boolean; model?: string }
  | { ok: false; error: string }
> {
  const document_text = opts.documentText.trim();
  if (!document_text) return { ok: false, error: 'Paste or upload a document first.' };

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();
  if (sessionError || !session?.access_token) {
    return { ok: false, error: 'Please sign in again as admin, then retry.' };
  }

  const baseUrl = CONFIG.SUPABASE_URL.replace(/\/$/, '');
  const anonKey = CONFIG.SUPABASE_ANON_KEY;
  if (!baseUrl || !anonKey) {
    return { ok: false, error: 'Supabase is not configured in this environment.' };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), AI_PARSE_TIMEOUT_MS);

  try {
    // Bypass the global 15s supabase fetch timeout — AI needs longer.
    const res = await fetch(`${baseUrl}/functions/v1/research-ai-parse`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
        apikey: anonKey,
      },
      body: JSON.stringify({
        document_text,
        compound_name: opts.compoundName?.trim() || undefined,
      }),
      signal: controller.signal,
    });

    const payload = (await res.json().catch(() => null)) as
      | {
          error?: unknown;
          message?: unknown;
          article?: Record<string, unknown>;
          truncated?: boolean;
          model?: string;
        }
      | null;

    if (!res.ok) {
      const msg =
        payload?.error != null
          ? String(payload.error)
          : payload?.message != null
            ? String(payload.message)
            : `Edge function failed (${res.status})`;
      return { ok: false, error: msg };
    }

    if (payload?.error != null) {
      return { ok: false, error: String(payload.error) };
    }

    const articleRaw = payload?.article;
    if (!articleRaw || typeof articleRaw !== 'object') {
      return { ok: false, error: 'AI did not return a structured article.' };
    }

    return {
      ok: true,
      article: mergeAiArticleIntoInput(articleRaw),
      truncated: Boolean(payload?.truncated),
      model: String(payload?.model || ''),
    };
  } catch (err: unknown) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      return {
        ok: false,
        error: 'AI processing timed out. Try a shorter document, then retry.',
      };
    }
    const message = err instanceof Error ? err.message : 'Failed to reach the AI edge function';
    if (/failed to fetch|networkerror|load failed/i.test(message)) {
      return {
        ok: false,
        error:
          'Could not reach the research-ai-parse function. Confirm it is deployed and OPENAI_API_KEY is set in Supabase secrets.',
      };
    }
    return { ok: false, error: message };
  } finally {
    clearTimeout(timer);
  }
}

async function extractPdfText(file: File): Promise<string> {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  // Vite resolves this to a worker asset URL
  const workerMod = await import('pdfjs-dist/legacy/build/pdf.worker.min.mjs?url');
  pdfjs.GlobalWorkerOptions.workerSrc = workerMod.default;

  const data = new Uint8Array(await file.arrayBuffer());
  const doc = await pdfjs.getDocument({ data }).promise;
  const pages: string[] = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const line = content.items
      .map((item) => ('str' in item ? String((item as { str: string }).str) : ''))
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
    if (line) pages.push(line);
  }
  const text = pages.join('\n\n').trim();
  if (!text) {
    throw new Error('No extractable text found in this PDF (it may be image-only).');
  }
  return text;
}

async function extractDocxText(file: File): Promise<string> {
  const mammoth = await import('mammoth');
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  const text = (result.value || '').trim();
  if (!text) throw new Error('No extractable text found in this Word document.');
  return text;
}

/** Read research docs in the browser: .txt/.md/.html/.csv/.json/.docx/.pdf */
export async function readDocumentFileAsText(file: File): Promise<string> {
  const name = file.name.toLowerCase();
  const type = (file.type || '').toLowerCase();

  if (name.endsWith('.pdf') || type === 'application/pdf') {
    return extractPdfText(file);
  }

  if (
    name.endsWith('.docx') ||
    type ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    return extractDocxText(file);
  }

  if (name.endsWith('.doc')) {
    throw new Error(
      'Legacy .doc is not supported — save as .docx or PDF, or paste the text.',
    );
  }

  const okExt = /\.(txt|md|markdown|html?|csv|json)$/i.test(name);
  const okType =
    type.startsWith('text/') || type === 'application/json' || type === '';
  if (!okExt && !okType) {
    throw new Error('Use a .pdf, .docx, .txt, .md, or .html file — or paste the text.');
  }
  return file.text();
}
