import { supabase } from '@/lib/supabase';

export type ResearchArticleStatus = 'draft' | 'published';

export type ResearchFeatureRow = { feature: string; details: string };
export type ResearchSectionBlock = { title: string; body: string; link_label?: string; link_url?: string };
export type ResearchGlanceRow = { area: string; investigated: string; distinction: string };
export type ResearchFaq = { q: string; a: string };
export type ResearchRelated = {
  label: string;
  slug?: string;
  /** PRODUCT | CATEGORY | RESEARCH — defaults to RESEARCH when slug is set */
  kind?: 'product' | 'category' | 'research';
  href?: string;
};

export type ResearchArticle = {
  id: string;
  slug: string;
  name: string;
  category: string;
  product_slug: string | null;
  card_title: string;
  card_description: string;
  seo_title: string;
  seo_description: string;
  eyebrow: string;
  h1: string;
  subtitle: string;
  intro: string;
  what_is_heading: string;
  what_is_body: string;
  feature_rows: ResearchFeatureRow[];
  mechanism_heading: string;
  mechanism_intro: string;
  mechanism_sections: ResearchSectionBlock[];
  mechanism_footer: string;
  findings_heading: string;
  findings_sections: ResearchSectionBlock[];
  glance_rows: ResearchGlanceRow[];
  safety_body: string;
  coa_heading: string;
  coa_body: string;
  faqs: ResearchFaq[];
  related: ResearchRelated[];
  status: ResearchArticleStatus;
  author_name: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export type ResearchArticleInput = Omit<
  ResearchArticle,
  'id' | 'created_at' | 'updated_at'
> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

export const DEFAULT_COA_BODY = `Analytical methods answer different questions. A Certificate of Analysis should identify the submitted sample and report the actual measurements performed.

• **Purity:** Chromatographic testing measures detected components under specified conditions; a percentage alone does not establish vial content.
• **Identity:** Appropriate methods, such as mass spectrometry with complementary analysis where needed, assess consistency with the stated material.
• **Content:** A validated quantitative assay measures the amount of the specified analyte or each blend component.

Check the sample or batch identifier, laboratory, testing date, methods and assay basis. Only describe a property as verified when the report includes a suitable measurement.

Purity does not establish sterility, endotoxin status or clinical effectiveness. Explore PEPLAB’s Quality & Testing information and available COA Results, checking whether a report covers the material and batch being assessed.`;

export function emptyResearchArticle(): ResearchArticleInput {
  return {
    slug: '',
    name: '',
    category: '',
    product_slug: '',
    card_title: '',
    card_description: '',
    seo_title: '',
    seo_description: '',
    eyebrow: '',
    h1: '',
    subtitle: '',
    intro: '',
    what_is_heading: '',
    what_is_body: '',
    feature_rows: [{ feature: '', details: '' }],
    mechanism_heading: '',
    mechanism_intro: '',
    mechanism_sections: [{ title: '', body: '' }],
    mechanism_footer: '',
    findings_heading: '',
    findings_sections: [{ title: '', body: '' }],
    glance_rows: [{ area: '', investigated: '', distinction: '' }],
    safety_body: '',
    coa_heading: '',
    coa_body: DEFAULT_COA_BODY,
    faqs: [{ q: '', a: '' }],
    related: [],
    status: 'draft',
    author_name: null,
    published_at: null,
  };
}

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

export function normalizeResearchArticle(row: Record<string, unknown>): ResearchArticle {
  return {
    id: String(row.id ?? ''),
    slug: String(row.slug ?? '').trim(),
    name: String(row.name ?? ''),
    category: String(row.category ?? ''),
    product_slug: row.product_slug ? String(row.product_slug) : null,
    card_title: String(row.card_title ?? ''),
    card_description: String(row.card_description ?? ''),
    seo_title: String(row.seo_title ?? ''),
    seo_description: String(row.seo_description ?? ''),
    eyebrow: String(row.eyebrow ?? ''),
    h1: String(row.h1 ?? ''),
    subtitle: String(row.subtitle ?? ''),
    intro: String(row.intro ?? ''),
    what_is_heading: String(row.what_is_heading ?? ''),
    what_is_body: String(row.what_is_body ?? ''),
    feature_rows: asArray<ResearchFeatureRow>(row.feature_rows),
    mechanism_heading: String(row.mechanism_heading ?? ''),
    mechanism_intro: String(row.mechanism_intro ?? ''),
    mechanism_sections: asArray<ResearchSectionBlock>(row.mechanism_sections),
    mechanism_footer: String(row.mechanism_footer ?? ''),
    findings_heading: String(row.findings_heading ?? ''),
    findings_sections: asArray<ResearchSectionBlock>(row.findings_sections),
    glance_rows: asArray<ResearchGlanceRow>(row.glance_rows),
    safety_body: String(row.safety_body ?? ''),
    coa_heading: String(row.coa_heading ?? ''),
    coa_body: String(row.coa_body ?? ''),
    faqs: asArray<ResearchFaq>(row.faqs),
    related: asArray<ResearchRelated>(row.related).map((r) => ({
      label: String((r as ResearchRelated).label ?? ''),
      slug: (r as ResearchRelated).slug?.trim() || undefined,
      kind: (r as ResearchRelated).kind,
      href: (r as ResearchRelated).href?.trim() || undefined,
    })),
    status: row.status === 'published' ? 'published' : 'draft',
    author_name: row.author_name ? String(row.author_name) : null,
    published_at: row.published_at ? String(row.published_at) : null,
    created_at: String(row.created_at ?? ''),
    updated_at: String(row.updated_at ?? ''),
  };
}

function toDbPayload(input: ResearchArticleInput) {
  const slug = input.slug.trim().toLowerCase().replace(/^\/+|\/+$/g, '');
  const status: ResearchArticleStatus = input.status === 'published' ? 'published' : 'draft';
  return {
    slug,
    name: input.name.trim(),
    category: input.category.trim(),
    product_slug: input.product_slug?.trim() || null,
    card_title: input.card_title.trim(),
    card_description: input.card_description.trim(),
    seo_title: input.seo_title.trim(),
    seo_description: input.seo_description.trim(),
    eyebrow: input.eyebrow.trim(),
    h1: input.h1.trim(),
    subtitle: input.subtitle.trim(),
    intro: input.intro,
    what_is_heading: input.what_is_heading.trim(),
    what_is_body: input.what_is_body,
    feature_rows: input.feature_rows ?? [],
    mechanism_heading: input.mechanism_heading.trim(),
    mechanism_intro: input.mechanism_intro,
    mechanism_sections: input.mechanism_sections ?? [],
    mechanism_footer: input.mechanism_footer,
    findings_heading: input.findings_heading.trim(),
    findings_sections: input.findings_sections ?? [],
    glance_rows: input.glance_rows ?? [],
    safety_body: input.safety_body,
    coa_heading: input.coa_heading.trim(),
    coa_body: input.coa_body,
    faqs: input.faqs ?? [],
    related: (input.related ?? []).map((r) => ({
      label: r.label,
      slug: r.slug?.trim() || undefined,
      kind: r.kind,
      href: r.href?.trim() || undefined,
    })),
    status,
    author_name: input.author_name?.trim() || null,
    published_at:
      status === 'published'
        ? input.published_at || new Date().toISOString()
        : input.published_at,
  };
}

export async function listResearchArticlesAdmin(): Promise<ResearchArticle[]> {
  const { data, error } = await supabase
    .from('research_articles')
    .select('*')
    .order('updated_at', { ascending: false });
  if (error) {
    console.error('listResearchArticlesAdmin:', error);
    return [];
  }
  return (data || []).map((row) => normalizeResearchArticle(row as Record<string, unknown>));
}

export async function listPublishedResearchArticles(): Promise<ResearchArticle[]> {
  const { data, error } = await supabase
    .from('research_articles')
    .select('*')
    .eq('status', 'published')
    .order('name', { ascending: true });
  if (error) {
    console.error('listPublishedResearchArticles:', error);
    return [];
  }
  return (data || []).map((row) => normalizeResearchArticle(row as Record<string, unknown>));
}

export async function getPublishedResearchArticleBySlug(
  slug: string,
): Promise<ResearchArticle | null> {
  const normalized = slug.trim().toLowerCase();
  if (!normalized) return null;
  const { data, error } = await supabase
    .from('research_articles')
    .select('*')
    .eq('status', 'published')
    .ilike('slug', normalized)
    .maybeSingle();
  if (error) {
    console.error('getPublishedResearchArticleBySlug:', error);
    return null;
  }
  if (!data) return null;
  return normalizeResearchArticle(data as Record<string, unknown>);
}

export async function getResearchArticleById(id: string): Promise<ResearchArticle | null> {
  const { data, error } = await supabase
    .from('research_articles')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) {
    console.error('getResearchArticleById:', error);
    return null;
  }
  if (!data) return null;
  return normalizeResearchArticle(data as Record<string, unknown>);
}

export async function upsertResearchArticle(
  input: ResearchArticleInput,
): Promise<{ ok: true; article: ResearchArticle } | { ok: false; error: string }> {
  const payload = toDbPayload(input);
  if (!payload.slug) return { ok: false, error: 'Slug is required' };
  if (!payload.name) return { ok: false, error: 'Name is required' };

  if (input.id) {
    const { data, error } = await supabase
      .from('research_articles')
      .update(payload)
      .eq('id', input.id)
      .select('*')
      .single();
    if (error) return { ok: false, error: error.message };
    return { ok: true, article: normalizeResearchArticle(data as Record<string, unknown>) };
  }

  const { data, error } = await supabase
    .from('research_articles')
    .insert(payload)
    .select('*')
    .single();
  if (error) return { ok: false, error: error.message };
  return { ok: true, article: normalizeResearchArticle(data as Record<string, unknown>) };
}

export async function deleteResearchArticle(
  id: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { error } = await supabase.from('research_articles').delete().eq('id', id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function setResearchArticleStatus(
  id: string,
  status: ResearchArticleStatus,
): Promise<{ ok: true; article: ResearchArticle } | { ok: false; error: string }> {
  const patch: Record<string, unknown> = { status };
  if (status === 'published') {
    patch.published_at = new Date().toISOString();
  }
  const { data, error } = await supabase
    .from('research_articles')
    .update(patch)
    .eq('id', id)
    .select('*')
    .single();
  if (error) return { ok: false, error: error.message };
  return { ok: true, article: normalizeResearchArticle(data as Record<string, unknown>) };
}

/** Upsert seed articles by slug (admin only). Does not overwrite newer DB edits if skipExisting. */
export async function seedResearchArticles(
  articles: ResearchArticleInput[],
  opts?: { overwrite?: boolean },
): Promise<{ ok: true; upserted: number } | { ok: false; error: string }> {
  let upserted = 0;
  for (const article of articles) {
    const slug = article.slug.trim().toLowerCase();
    const { data: existing } = await supabase
      .from('research_articles')
      .select('id')
      .ilike('slug', slug)
      .maybeSingle();

    if (existing?.id && !opts?.overwrite) {
      continue;
    }

    const result = await upsertResearchArticle({
      ...article,
      id: existing?.id,
      status: 'published',
      published_at: article.published_at || new Date().toISOString(),
    });
    if (!result.ok) return result;
    upserted += 1;
  }
  return { ok: true, upserted };
}

export function researchCompoundPath(slug: string): string {
  return `/research/compounds/${slug.trim().replace(/^\/+|\/+$/g, '')}`;
}
