import { supabase } from '@/lib/supabase';
import { BLOG_PATH } from '@/lib/routes';

export type BlogPostStatus = 'draft' | 'published';
export type BlogTopicSource = 'suggested' | 'custom';

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body_markdown: string;
  cover_image_url: string;
  seo_title: string;
  seo_description: string;
  status: BlogPostStatus;
  author_name: string | null;
  topic_source: BlogTopicSource;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export type BlogPostInput = Omit<BlogPost, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

export function emptyBlogPost(): BlogPostInput {
  return {
    slug: '',
    title: '',
    excerpt: '',
    body_markdown: '',
    cover_image_url: '',
    seo_title: '',
    seo_description: '',
    status: 'draft',
    author_name: 'PEPLAB',
    topic_source: 'custom',
    published_at: null,
  };
}

export function blogPostPath(slug: string): string {
  const s = slug.trim().replace(/^\/+|\/+$/g, '');
  return `${BLOG_PATH}/${s}`;
}

export function blogReadingMinutes(markdown: string): number {
  const words = (markdown || '').replace(/[#>*`_[\]()-]/g, ' ').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

export function formatBlogDate(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function normalizeBlogPost(row: Record<string, unknown>): BlogPost {
  const topicSource = String(row.topic_source ?? 'custom');
  return {
    id: String(row.id ?? ''),
    slug: String(row.slug ?? '').trim(),
    title: String(row.title ?? ''),
    excerpt: String(row.excerpt ?? ''),
    body_markdown: String(row.body_markdown ?? ''),
    cover_image_url: String(row.cover_image_url ?? ''),
    seo_title: String(row.seo_title ?? ''),
    seo_description: String(row.seo_description ?? ''),
    status: row.status === 'published' ? 'published' : 'draft',
    author_name: row.author_name == null ? null : String(row.author_name),
    topic_source: topicSource === 'suggested' ? 'suggested' : 'custom',
    published_at: row.published_at == null ? null : String(row.published_at),
    created_at: String(row.created_at ?? ''),
    updated_at: String(row.updated_at ?? ''),
  };
}

function toDbPayload(input: BlogPostInput): Record<string, unknown> {
  const status: BlogPostStatus = input.status === 'published' ? 'published' : 'draft';
  return {
    slug: input.slug.trim().toLowerCase(),
    title: input.title.trim(),
    excerpt: input.excerpt.trim(),
    body_markdown: input.body_markdown,
    cover_image_url: input.cover_image_url.trim(),
    seo_title: input.seo_title.trim(),
    seo_description: input.seo_description.trim(),
    status,
    author_name: input.author_name?.trim() || null,
    topic_source: input.topic_source === 'suggested' ? 'suggested' : 'custom',
    published_at:
      status === 'published'
        ? input.published_at || new Date().toISOString()
        : input.published_at,
  };
}

export async function listBlogPostsAdmin(): Promise<BlogPost[]> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .order('updated_at', { ascending: false });
  if (error) {
    console.error('listBlogPostsAdmin:', error);
    return [];
  }
  return (data || []).map((row) => normalizeBlogPost(row as Record<string, unknown>));
}

export async function listPublishedBlogPosts(): Promise<BlogPost[]> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('status', 'published')
    .order('published_at', { ascending: false });
  if (error) {
    console.error('listPublishedBlogPosts:', error);
    return [];
  }
  return (data || []).map((row) => normalizeBlogPost(row as Record<string, unknown>));
}

export async function getPublishedBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const normalized = slug.trim().toLowerCase();
  if (!normalized) return null;
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('status', 'published')
    .ilike('slug', normalized)
    .maybeSingle();
  if (error) {
    console.error('getPublishedBlogPostBySlug:', error);
    return null;
  }
  if (!data) return null;
  return normalizeBlogPost(data as Record<string, unknown>);
}

export async function upsertBlogPost(
  input: BlogPostInput,
): Promise<{ ok: true; post: BlogPost } | { ok: false; error: string }> {
  const payload = toDbPayload(input);
  if (!payload.slug) return { ok: false, error: 'Slug is required' };
  if (!payload.title) return { ok: false, error: 'Title is required' };

  if (input.id) {
    const { data, error } = await supabase
      .from('blog_posts')
      .update(payload)
      .eq('id', input.id)
      .select('*')
      .single();
    if (error) return { ok: false, error: error.message };
    return { ok: true, post: normalizeBlogPost(data as Record<string, unknown>) };
  }

  const { data, error } = await supabase
    .from('blog_posts')
    .insert(payload)
    .select('*')
    .single();
  if (error) return { ok: false, error: error.message };
  return { ok: true, post: normalizeBlogPost(data as Record<string, unknown>) };
}

export async function deleteBlogPost(
  id: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { error } = await supabase.from('blog_posts').delete().eq('id', id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function setBlogPostStatus(
  id: string,
  status: BlogPostStatus,
): Promise<{ ok: true; post: BlogPost } | { ok: false; error: string }> {
  const patch: Record<string, unknown> = { status };
  if (status === 'published') {
    patch.published_at = new Date().toISOString();
  }
  const { data, error } = await supabase
    .from('blog_posts')
    .update(patch)
    .eq('id', id)
    .select('*')
    .single();
  if (error) return { ok: false, error: error.message };
  return { ok: true, post: normalizeBlogPost(data as Record<string, unknown>) };
}
