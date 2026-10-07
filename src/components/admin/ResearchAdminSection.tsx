import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import {
  ExternalLink,
  Eye,
  EyeOff,
  FileText,
  Pencil,
  RefreshCw,
  Save,
  Sparkles,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import {
  deleteResearchArticle,
  emptyResearchArticle,
  listResearchArticlesAdmin,
  researchCompoundPath,
  seedResearchArticles,
  setResearchArticleStatus,
  upsertResearchArticle,
  type ResearchArticle,
  type ResearchArticleInput,
  type ResearchArticleStatus,
} from '@/lib/research-articles';
import { RESEARCH_SEED_ARTICLES } from '@/lib/research-seed-data';
import {
  parseResearchDocumentWithAi,
  readDocumentFileAsText,
} from '@/lib/research-ai';

const inputClass =
  'w-full px-3 py-2.5 rounded-xl bg-[rgba(7,10,18,0.6)] border border-[rgba(244,246,250,0.12)] text-[#F4F6FA] text-sm placeholder:text-[#6B7280] focus:outline-none focus:border-[rgba(167,139,250,0.55)]';
const labelClass = 'block text-xs font-medium text-[#A9B3C7] mb-1.5';

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div className="mb-4">
      <label className={labelClass}>
        {label}
        {hint ? <span className="ml-1 font-normal text-[#6B7280]">· {hint}</span> : null}
      </label>
      {children}
    </div>
  );
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function contentReadySummary(article: ResearchArticleInput): string {
  const bits: string[] = [];
  if (article.intro.trim()) bits.push('intro');
  if (article.what_is_body.trim()) bits.push('what is');
  if (article.mechanism_sections.some((s) => s.body.trim())) bits.push('mechanism');
  if (article.findings_sections.some((s) => s.body.trim())) bits.push('findings');
  if (article.faqs.some((f) => f.q.trim())) bits.push(`${article.faqs.filter((f) => f.q.trim()).length} FAQs`);
  if (!bits.length) return 'No page content yet — upload a document and process with AI.';
  return `Page content ready: ${bits.join(' · ')}`;
}

export default function ResearchAdminSection() {
  const [articles, setArticles] = useState<ResearchArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [editing, setEditing] = useState<ResearchArticleInput | null>(null);
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [docText, setDocText] = useState('');
  const [docFileName, setDocFileName] = useState<string | null>(null);
  const [aiProcessing, setAiProcessing] = useState(false);
  const [aiDone, setAiDone] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      setArticles(await listResearchArticlesAdmin());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load research articles');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const closeEditor = () => {
    setEditing(null);
    setDocText('');
    setDocFileName(null);
    setAiDone(false);
  };

  const openNew = () => {
    setMessage(null);
    setError(null);
    setDocText('');
    setDocFileName(null);
    setAiDone(false);
    setEditing(emptyResearchArticle());
  };

  const openEdit = (article: ResearchArticle) => {
    setMessage(null);
    setError(null);
    setDocText('');
    setDocFileName(null);
    setAiDone(Boolean(article.intro || article.what_is_body));
    setEditing({ ...article, product_slug: article.product_slug || '' });
  };

  const patch = (partial: Partial<ResearchArticleInput>) => {
    setEditing((prev) => (prev ? { ...prev, ...partial } : prev));
  };

  const handleSave = async (status: ResearchArticleStatus) => {
    if (!editing) return;
    if (!editing.name.trim() || !editing.slug.trim()) {
      setError('Add a name and URL slug before saving.');
      return;
    }
    if (!editing.seo_title.trim() || !editing.seo_description.trim()) {
      setError('Fill SEO title and SEO description before saving.');
      return;
    }
    setSaving(true);
    setError(null);
    setMessage(null);
    const result = await upsertResearchArticle({
      ...editing,
      status,
      published_at:
        status === 'published'
          ? editing.published_at || new Date().toISOString()
          : editing.published_at,
    });
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setMessage(
      status === 'published'
        ? `Published “${result.article.name}”`
        : `Saved draft “${result.article.name}”`,
    );
    closeEditor();
    await load();
  };

  const handleAiProcess = async () => {
    if (!editing) return;
    setAiProcessing(true);
    setError(null);
    setMessage(null);
    const result = await parseResearchDocumentWithAi({
      documentText: docText,
      compoundName: editing.name || undefined,
    });
    setAiProcessing(false);
    if (!result.ok) {
      setError(result.error);
      setAiDone(false);
      return;
    }
    // AI fills page content + all SEO/listing fields; user can still edit SEO before save.
    setEditing({
      ...result.article,
      id: editing.id,
      created_at: editing.created_at,
      updated_at: editing.updated_at,
      status: 'draft',
    });
    setAiDone(true);
    setMessage(
      result.truncated
        ? 'AI filled page content and SEO fields (document was truncated). Review SEO, then save as draft or publish.'
        : 'AI filled page content and SEO fields. Review them below, then save as draft or publish.',
    );
  };

  const handleDocFile = async (file: File | null) => {
    if (!file) return;
    try {
      const text = await readDocumentFileAsText(file);
      setDocText(text);
      setDocFileName(file.name);
      setError(null);
      setAiDone(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not read that file');
    }
  };

  const handleDelete = async (article: ResearchArticle) => {
    if (!window.confirm(`Delete research page “${article.name}”? This cannot be undone.`)) return;
    const result = await deleteResearchArticle(article.id);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setMessage(`Deleted “${article.name}”`);
    if (editing?.id === article.id) closeEditor();
    await load();
  };

  const handleToggleStatus = async (article: ResearchArticle) => {
    const next = article.status === 'published' ? 'draft' : 'published';
    const result = await setResearchArticleStatus(article.id, next);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setMessage(
      next === 'published'
        ? `Published “${article.name}”`
        : `Unpublished “${article.name}” (now draft)`,
    );
    await load();
  };

  const handleSeed = async (overwrite: boolean) => {
    setSeeding(true);
    setError(null);
    setMessage(null);
    const result = await seedResearchArticles(RESEARCH_SEED_ARTICLES, { overwrite });
    setSeeding(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setMessage(
      overwrite
        ? `Seeded/overwrote ${result.upserted} articles`
        : `Seeded ${result.upserted} missing articles`,
    );
    await load();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-xl text-sm text-[#A9B3C7]">
          Upload a research document, let AI build the page, then set SEO and publish.
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void load()}
            className="inline-flex items-center gap-2 rounded-xl border border-[rgba(244,246,250,0.12)] px-3 py-2 text-sm text-[#A9B3C7] hover:text-[#F4F6FA]"
          >
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
          <button
            type="button"
            disabled={seeding}
            onClick={() => void handleSeed(false)}
            className="inline-flex items-center gap-2 rounded-xl border border-[rgba(244,246,250,0.12)] px-3 py-2 text-sm text-[#A9B3C7] hover:text-[#F4F6FA] disabled:opacity-50"
          >
            <Upload className="h-4 w-4" /> Seed defaults
          </button>
          <button
            type="button"
            onClick={openNew}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] px-3 py-2 text-sm font-semibold text-white"
          >
            <Sparkles className="h-4 w-4" /> Add research page
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-[rgba(239,68,68,0.35)] bg-[rgba(239,68,68,0.08)] p-3 text-sm text-[#EF4444]">
          {error}
        </div>
      )}
      {message && (
        <div className="rounded-xl border border-[rgba(167,139,250,0.35)] bg-[rgba(167,139,250,0.08)] p-3 text-sm text-[#A78BFA]">
          {message}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-[#A9B3C7]">Loading…</p>
      ) : articles.length === 0 ? (
        <div className="rounded-2xl border border-[rgba(244,246,250,0.08)] bg-[rgba(17,24,39,0.6)] p-8 text-center">
          <p className="mb-4 text-[#A9B3C7]">No research pages yet.</p>
          <button
            type="button"
            onClick={openNew}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] px-4 py-2.5 text-sm font-semibold text-white"
          >
            <Sparkles className="h-4 w-4" /> Upload a document to start
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-[rgba(244,246,250,0.08)]">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[rgba(244,246,250,0.08)] bg-[rgba(7,10,18,0.5)]">
                <th className="px-4 py-3 text-[#F4F6FA]">Name</th>
                <th className="px-4 py-3 text-[#F4F6FA]">Slug</th>
                <th className="px-4 py-3 text-[#F4F6FA]">Status</th>
                <th className="px-4 py-3 text-[#F4F6FA]">Updated</th>
                <th className="px-4 py-3 text-[#F4F6FA]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {articles.map((article) => (
                <tr
                  key={article.id}
                  className="border-b border-[rgba(244,246,250,0.06)] last:border-0"
                >
                  <td className="px-4 py-3 font-medium text-[#F4F6FA]">{article.name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-[#A9B3C7]">{article.slug}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        article.status === 'published'
                          ? 'bg-[rgba(167,139,250,0.15)] text-[#A78BFA]'
                          : 'bg-[rgba(244,246,250,0.08)] text-[#A9B3C7]'
                      }`}
                    >
                      {article.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-[#A9B3C7]">
                    {article.updated_at
                      ? new Date(article.updated_at).toLocaleString('en-AU')
                      : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(article)}
                        className="rounded-lg p-1.5 text-[#A9B3C7] hover:bg-[rgba(167,139,250,0.1)] hover:text-[#A78BFA]"
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleToggleStatus(article)}
                        className="rounded-lg p-1.5 text-[#A9B3C7] hover:bg-[rgba(167,139,250,0.1)] hover:text-[#A78BFA]"
                        title={article.status === 'published' ? 'Unpublish' : 'Publish'}
                      >
                        {article.status === 'published' ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                      {article.status === 'published' && (
                        <a
                          href={researchCompoundPath(article.slug)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-lg p-1.5 text-[#A9B3C7] hover:text-[#A78BFA]"
                          title="Open page"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => void handleDelete(article)}
                        className="rounded-lg p-1.5 text-[#A9B3C7] hover:bg-[rgba(239,68,68,0.1)] hover:text-[#EF4444]"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto bg-black/70 p-4 pt-10">
          <div className="mb-10 w-full max-w-xl rounded-2xl border border-[rgba(244,246,250,0.12)] bg-[#0B1020] shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-[rgba(244,246,250,0.08)] bg-[#0B1020] px-5 py-4">
              <div>
                <h2 className="text-lg font-bold text-[#F4F6FA]">
                  {editing.id ? 'Update research page' : 'New research page'}
                </h2>
                <p className="mt-0.5 text-xs text-[#6B7280]">
                  1. Upload document → 2. SEO → 3. Draft or Publish
                </p>
              </div>
              <button
                type="button"
                onClick={closeEditor}
                className="rounded-lg p-2 text-[#A9B3C7] hover:text-[#F4F6FA]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[70vh] space-y-5 overflow-y-auto p-5">
              {/* Step 1 — document */}
              <section className="rounded-2xl border border-[rgba(167,139,250,0.3)] bg-[rgba(139,92,246,0.07)] p-4">
                <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#A78BFA]">
                  Step 1 · Document
                </p>
                <p className="mb-3 text-sm text-[#A9B3C7]">
                  Upload a PDF or Word (.docx) file — or paste text. AI builds the full page
                  content for you.
                </p>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.txt,.md,.markdown,.html,.htm,.csv,.json,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,text/markdown,text/html"
                  className="hidden"
                  onChange={(e) => {
                    void handleDocFile(e.target.files?.[0] || null);
                    e.target.value = '';
                  }}
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="mb-3 flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-[rgba(167,139,250,0.4)] bg-[rgba(7,10,18,0.45)] px-4 py-8 text-center transition-colors hover:border-[rgba(167,139,250,0.7)] hover:bg-[rgba(7,10,18,0.65)]"
                >
                  <FileText className="h-8 w-8 text-[#A78BFA]" />
                  <span className="text-sm font-semibold text-[#F4F6FA]">
                    {docFileName ? docFileName : 'Click to upload document'}
                  </span>
                  <span className="text-xs text-[#6B7280]">.pdf, .docx, .txt, .md, or .html</span>
                </button>

                <textarea
                  className={`${inputClass} mb-3 min-h-[120px]`}
                  placeholder="Or paste research text here…"
                  value={docText}
                  onChange={(e) => {
                    setDocText(e.target.value);
                    setAiDone(false);
                  }}
                />

                <button
                  type="button"
                  disabled={aiProcessing || !docText.trim()}
                  onClick={() => void handleAiProcess()}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
                >
                  <Sparkles className="h-4 w-4" />
                  {aiProcessing ? 'Processing with AI…' : 'Process with AI'}
                </button>

                {(aiDone || editing.intro || editing.what_is_body) && (
                  <p className="mt-3 rounded-xl border border-[rgba(167,139,250,0.25)] bg-[rgba(7,10,18,0.4)] px-3 py-2 text-xs text-[#A9B3C7]">
                    {contentReadySummary(editing)}
                  </p>
                )}
              </section>

              {/* Step 2 — SEO */}
              <section>
                <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#A78BFA]">
                  Step 2 · SEO
                </p>
                <p className="mb-3 text-xs text-[#6B7280]">
                  These are filled automatically after AI processing — edit anytime before publish.
                </p>

                <Field label="Compound name" hint="shown on the page">
                  <input
                    className={inputClass}
                    value={editing.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      patch({
                        name,
                        slug: editing.slug || slugify(name),
                        seo_title:
                          editing.seo_title ||
                          (name ? `${name} Research Overview | PEPLAB` : ''),
                        h1: editing.h1 || (name ? `${name} Research Overview` : ''),
                        card_title: editing.card_title || (name ? `What is ${name}?` : ''),
                      });
                    }}
                    placeholder="Retatrutide"
                  />
                </Field>

                <Field label="URL slug" hint="/research/compounds/…">
                  <input
                    className={inputClass}
                    value={editing.slug}
                    onChange={(e) => patch({ slug: slugify(e.target.value) })}
                    placeholder="retatrutide"
                  />
                </Field>

                <Field label="SEO title" hint="browser tab / Google title">
                  <input
                    className={inputClass}
                    value={editing.seo_title}
                    onChange={(e) => patch({ seo_title: e.target.value })}
                    placeholder="Retatrutide Research Overview | PEPLAB Australia"
                  />
                </Field>

                <Field label="SEO description" hint="search snippet">
                  <textarea
                    className={`${inputClass} min-h-[88px]`}
                    value={editing.seo_description}
                    onChange={(e) => patch({ seo_description: e.target.value })}
                    placeholder="Short description for search results…"
                  />
                </Field>

                <Field label="Category" hint="optional">
                  <input
                    className={inputClass}
                    value={editing.category}
                    onChange={(e) =>
                      patch({ category: e.target.value, eyebrow: e.target.value })
                    }
                    placeholder="GLP-1 / Incretin"
                  />
                </Field>

                <Field label="Product slug" hint="vial image from shop, e.g. reta">
                  <input
                    className={inputClass}
                    value={editing.product_slug || ''}
                    onChange={(e) => patch({ product_slug: e.target.value })}
                    placeholder="reta"
                  />
                </Field>

                <Field label="Hub card title" hint="Find Your Compound list">
                  <input
                    className={inputClass}
                    value={editing.card_title}
                    onChange={(e) => patch({ card_title: e.target.value })}
                    placeholder="What is Retatrutide?"
                  />
                </Field>

                <Field label="Hub card description">
                  <textarea
                    className={`${inputClass} min-h-[72px]`}
                    value={editing.card_description}
                    onChange={(e) => patch({ card_description: e.target.value })}
                    placeholder="One-line summary for the compounds grid…"
                  />
                </Field>
              </section>
            </div>

            <div className="sticky bottom-0 flex flex-wrap items-center justify-end gap-2 border-t border-[rgba(244,246,250,0.08)] bg-[#0B1020] px-5 py-4">
              <button
                type="button"
                onClick={closeEditor}
                className="rounded-xl border border-[rgba(244,246,250,0.12)] px-4 py-2 text-sm text-[#A9B3C7]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={saving || aiProcessing}
                onClick={() => void handleSave('draft')}
                className="inline-flex items-center gap-2 rounded-xl border border-[rgba(167,139,250,0.45)] px-4 py-2 text-sm font-semibold text-[#A78BFA] hover:bg-[rgba(167,139,250,0.1)] disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {saving ? 'Saving…' : 'Save as draft'}
              </button>
              <button
                type="button"
                disabled={saving || aiProcessing}
                onClick={() => void handleSave('published')}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                <Eye className="h-4 w-4" />
                {saving ? 'Publishing…' : 'Publish'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
