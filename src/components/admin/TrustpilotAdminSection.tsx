import { useCallback, useEffect, useState } from 'react';
import { CheckCircle, Eye, EyeOff, Pencil, Plus, RefreshCw, Star, Trash2, Upload, X } from 'lucide-react';
import {
  createTrustpilotReview,
  deleteTrustpilotReview,
  getTrustpilotAdminReviews,
  importTrustpilotReviewsBulk,
  invokeSyncTrustpilot,
  updateTrustpilotReview,
  type TrustpilotReviewRow,
  type TrustpilotStatsRow,
} from '@/lib/supabase-db';
import { trustpilotReviewMentionsGhkCu } from '@/lib/trustpilot-filters';

function formatSyncTime(iso: string | null | undefined): string {
  if (!iso) return 'Never';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 'Never';
  return d.toLocaleString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const JSON_PLACEHOLDER = `[
  {
    "author_name": "Alex M.",
    "rating": 5,
    "title": "Fast shipping",
    "body": "Arrived quickly and well packaged.",
    "reviewed_at": "2026-07-01",
    "is_verified": true
  }
]`;

export default function TrustpilotAdminSection() {
  const [reviews, setReviews] = useState<TrustpilotReviewRow[]>([]);
  const [stats, setStats] = useState<TrustpilotStatsRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [showAdd, setShowAdd] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [jsonText, setJsonText] = useState('');
  const [importing, setImporting] = useState(false);

  const [newAuthor, setNewAuthor] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [newVerified, setNewVerified] = useState(true);
  const [newVisible, setNewVisible] = useState(true);
  const [newDate, setNewDate] = useState('');

  const [editing, setEditing] = useState<TrustpilotReviewRow | null>(null);
  const [editAuthor, setEditAuthor] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editBody, setEditBody] = useState('');
  const [editRating, setEditRating] = useState(5);
  const [editVerified, setEditVerified] = useState(false);
  const [editVisible, setEditVisible] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await getTrustpilotAdminReviews();
      setReviews(data.reviews);
      setStats(data.stats);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load Trustpilot reviews');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSync = async () => {
    setSyncing(true);
    setSyncMessage(null);
    setError(null);
    try {
      const result = await invokeSyncTrustpilot();
      if (result.error) {
        setError(result.error);
        await load();
        return;
      }
      const imported = result.imported ?? 0;
      const total = result.totalMapped ?? 0;
      if (imported === 0 && total === 0) {
        setError(
          result.warning ||
            'Sync returned 0 reviews. In Apify: approve actor reviewly/trustpilot-review-scraper, enable residential proxy usage, then Sync again.',
        );
      } else {
        setSyncMessage(
          `Synced: ${imported} new, ${result.updated ?? 0} updated, ${result.skippedEdited ?? 0} admin-protected skipped (${total} total).`,
        );
      }
      await load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Sync failed');
    } finally {
      setSyncing(false);
    }
  };

  const handleAdd = async () => {
    if (!newBody.trim()) {
      setError('Review body is required');
      return;
    }
    setSaving(true);
    setError(null);
    const result = await createTrustpilotReview({
      author_name: newAuthor.trim() || null,
      title: newTitle.trim() || null,
      body: newBody.trim(),
      rating: newRating,
      is_verified: newVerified,
      is_visible: newVisible,
      reviewed_at: newDate ? new Date(newDate).toISOString() : null,
    });
    setSaving(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setShowAdd(false);
    setNewAuthor('');
    setNewTitle('');
    setNewBody('');
    setNewRating(5);
    setNewVerified(true);
    setNewVisible(true);
    setNewDate('');
    setSyncMessage('Review added. Homepage score updated from visible reviews.');
    await load();
  };

  const handleImportJson = async () => {
    setImporting(true);
    setError(null);
    setSyncMessage(null);
    try {
      const parsed = JSON.parse(jsonText) as unknown;
      const list = Array.isArray(parsed) ? parsed : [parsed];
      const items = list.map((row: unknown) => {
        const r = row as Record<string, unknown>;
        return {
          author_name: (r.author_name ?? r.author ?? null) as string | null,
          rating: Number(r.rating ?? 5),
          title: (r.title ?? null) as string | null,
          body: (r.body ?? r.text ?? r.content ?? '') as string,
          reviewed_at: (r.reviewed_at ?? r.date ?? null) as string | null,
          is_verified: r.is_verified !== false,
          is_visible: r.is_visible !== false,
          external_id: (r.external_id ?? r.id ?? undefined) as string | undefined,
        };
      });
      const missingBody = items.find((i) => !String(i.body || '').trim());
      if (missingBody) {
        setError('Each review needs a body (or text/content) field');
        setImporting(false);
        return;
      }
      const result = await importTrustpilotReviewsBulk(items);
      if (result.error) {
        setError(result.error);
        setImporting(false);
        return;
      }
      setShowImport(false);
      setJsonText('');
      setSyncMessage(`Imported ${result.imported} review(s). Homepage score recalculated.`);
      await load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid JSON');
    } finally {
      setImporting(false);
    }
  };

  const openEdit = (row: TrustpilotReviewRow) => {
    setEditing(row);
    setEditAuthor(row.author_name || '');
    setEditTitle(row.title || '');
    setEditBody(row.body || '');
    setEditRating(Math.max(1, Math.min(5, Number(row.rating) || 5)));
    setEditVerified(Boolean(row.is_verified));
    setEditVisible(row.is_visible !== false);
  };

  const handleSaveEdit = async () => {
    if (!editing) return;
    setSaving(true);
    setError(null);
    const result = await updateTrustpilotReview(editing.id, {
      author_name: editAuthor.trim() || null,
      title: editTitle.trim() || null,
      body: editBody.trim() || null,
      rating: editRating,
      is_verified: editVerified,
      is_visible: editVisible,
    });
    setSaving(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setEditing(null);
    await load();
  };

  const toggleVisible = async (row: TrustpilotReviewRow) => {
    if (row.is_visible === false && trustpilotReviewMentionsGhkCu(row)) {
      setError('Reviews that mention GHK-Cu stay hidden on the site.');
      return;
    }
    const next = row.is_visible === false;
    const result = await updateTrustpilotReview(row.id, { is_visible: next });
    if (result.error) {
      setError(result.error);
      return;
    }
    await load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this Trustpilot review from the site?')) return;
    setDeletingId(id);
    const result = await deleteTrustpilotReview(id);
    setDeletingId(null);
    if (result.error) {
      setError(result.error);
      return;
    }
    await load();
  };

  const fieldClass =
    'w-full px-3 py-2 rounded-lg bg-[rgba(7,10,18,0.5)] border border-[rgba(244,246,250,0.1)] text-[#F4F6FA]';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#F4F6FA]">Trustpilot reviews</h2>
          <p className="text-xs text-[#6B7280] mt-1">
            Score: {stats?.trust_score != null ? Number(stats.trust_score).toFixed(1) : '—'} ·{' '}
            {stats?.review_count ?? reviews.length} reviews · Updated:{' '}
            {formatSyncTime(stats?.last_synced_at)}
          </p>
          <p className="text-xs text-[#A9B3C7] mt-2 max-w-xl">
            Click <strong className="text-[#F4F6FA]">Sync from Trustpilot</strong> to pull live reviews
            (uses Apify + residential proxy). Add / Paste JSON is only a backup. Reviews that mention
            GHK-Cu are auto-hidden from the homepage and landing page.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          <button
            type="button"
            onClick={() => void handleSync()}
            disabled={syncing}
            className="px-4 py-2 rounded-xl bg-[#2ED1B4] text-[#070A12] font-semibold hover:bg-[#25b89d] disabled:opacity-50 flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Syncing… (up to ~5 min)' : 'Sync from Trustpilot'}
          </button>
          <button
            type="button"
            onClick={() => {
              setShowAdd(true);
              setError(null);
            }}
            className="px-4 py-2 rounded-xl border border-[rgba(244,246,250,0.15)] text-[#A9B3C7] font-semibold hover:text-[#F4F6FA] flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
          <button
            type="button"
            onClick={() => {
              setShowImport(true);
              setError(null);
            }}
            className="px-4 py-2 rounded-xl border border-[rgba(244,246,250,0.15)] text-[#A9B3C7] font-semibold hover:text-[#F4F6FA] flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Paste JSON
          </button>
        </div>
      </div>

      {syncMessage && (
        <p className="text-sm text-[#2ED1B4] rounded-xl border border-[rgba(46,209,180,0.25)] bg-[rgba(46,209,180,0.08)] px-4 py-3 whitespace-pre-wrap">
          {syncMessage}
        </p>
      )}
      {error && (
        <p className="text-sm text-[#EF4444] rounded-xl border border-[rgba(239,68,68,0.25)] bg-[rgba(239,68,68,0.08)] px-4 py-3">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-[#A9B3C7]">Loading…</p>
      ) : reviews.length === 0 ? (
        <div className="rounded-2xl border border-[rgba(244,246,250,0.08)] bg-[#111827] p-8 text-center text-sm text-[#A9B3C7]">
          No reviews yet. Click <strong className="text-[#F4F6FA]">Sync from Trustpilot</strong> to
          pull them from the live profile.
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((row) => (
            <div
              key={row.id}
              className={`rounded-xl border bg-[#111827] p-4 flex flex-col sm:flex-row sm:items-start gap-3 ${
                row.is_visible === false
                  ? 'border-[rgba(239,68,68,0.25)] opacity-70'
                  : 'border-[rgba(244,246,250,0.08)]'
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < (row.rating || 0)
                            ? 'fill-[#F59E0B] text-[#F59E0B]'
                            : 'text-[rgba(244,246,250,0.2)]'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium text-[#F4F6FA]">
                    {row.author_name || 'Anonymous'}
                  </span>
                  {row.is_verified && (
                    <span className="inline-flex items-center gap-1 text-[10px] text-[#22C55E]">
                      <CheckCircle className="w-3 h-3" /> Verified
                    </span>
                  )}
                  {row.admin_edited && (
                    <span className="text-[10px] uppercase tracking-wide text-[#A78BFA]">Edited</span>
                  )}
                  {row.is_visible === false && (
                    <span className="text-[10px] uppercase tracking-wide text-[#EF4444]">Hidden</span>
                  )}
                  {trustpilotReviewMentionsGhkCu(row) && (
                    <span className="text-[10px] uppercase tracking-wide text-[#F59E0B]">
                      GHK-Cu filtered
                    </span>
                  )}
                </div>
                {row.title && <p className="text-sm text-[#F4F6FA] font-medium mb-0.5">{row.title}</p>}
                <p className="text-sm text-[#A9B3C7] line-clamp-2">{row.body}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => void toggleVisible(row)}
                  className="p-2 rounded-lg border border-[rgba(244,246,250,0.1)] text-[#A9B3C7] hover:text-[#F4F6FA]"
                  title={row.is_visible === false ? 'Show on homepage' : 'Hide from homepage'}
                >
                  {row.is_visible === false ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => openEdit(row)}
                  className="p-2 rounded-lg border border-[rgba(244,246,250,0.1)] text-[#A9B3C7] hover:text-[#F4F6FA]"
                  title="Edit"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => void handleDelete(row.id)}
                  disabled={deletingId === row.id}
                  className="p-2 rounded-lg border border-[rgba(239,68,68,0.3)] text-[#EF4444] hover:bg-[rgba(239,68,68,0.1)] disabled:opacity-50"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAdd && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60"
          onClick={() => setShowAdd(false)}
        >
          <div
            className="bg-[#111827] border border-[rgba(244,246,250,0.08)] rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 flex justify-between items-center border-b border-[rgba(244,246,250,0.08)]">
              <h3 className="text-lg font-semibold text-[#F4F6FA]">Add review</h3>
              <button
                type="button"
                onClick={() => setShowAdd(false)}
                className="p-2 rounded-lg text-[#A9B3C7] hover:text-[#F4F6FA]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-[#A9B3C7] mb-1">Author</label>
                <input
                  type="text"
                  value={newAuthor}
                  onChange={(e) => setNewAuthor(e.target.value)}
                  className={fieldClass}
                />
              </div>
              <div>
                <label className="block text-sm text-[#A9B3C7] mb-1">Rating</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button key={s} type="button" onClick={() => setNewRating(s)} className="p-1">
                      <Star
                        className={`w-6 h-6 ${
                          s <= newRating
                            ? 'fill-[#F59E0B] text-[#F59E0B]'
                            : 'text-[rgba(244,246,250,0.2)]'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm text-[#A9B3C7] mb-1">Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className={fieldClass}
                />
              </div>
              <div>
                <label className="block text-sm text-[#A9B3C7] mb-1">Body</label>
                <textarea
                  value={newBody}
                  onChange={(e) => setNewBody(e.target.value)}
                  rows={4}
                  className={fieldClass}
                />
              </div>
              <div>
                <label className="block text-sm text-[#A9B3C7] mb-1">Review date</label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className={fieldClass}
                />
              </div>
              <label className="flex items-center gap-2 text-sm text-[#A9B3C7]">
                <input
                  type="checkbox"
                  checked={newVerified}
                  onChange={(e) => setNewVerified(e.target.checked)}
                />
                Verified
              </label>
              <label className="flex items-center gap-2 text-sm text-[#A9B3C7]">
                <input
                  type="checkbox"
                  checked={newVisible}
                  onChange={(e) => setNewVisible(e.target.checked)}
                />
                Visible on homepage
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAdd(false)}
                  className="px-4 py-2 rounded-xl border border-[rgba(244,246,250,0.2)] text-[#A9B3C7]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => void handleAdd()}
                  disabled={saving}
                  className="px-4 py-2 rounded-xl bg-[#2ED1B4] text-[#070A12] font-semibold disabled:opacity-50"
                >
                  {saving ? 'Saving…' : 'Add'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showImport && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60"
          onClick={() => setShowImport(false)}
        >
          <div
            className="bg-[#111827] border border-[rgba(244,246,250,0.08)] rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 flex justify-between items-center border-b border-[rgba(244,246,250,0.08)]">
              <h3 className="text-lg font-semibold text-[#F4F6FA]">Paste JSON reviews</h3>
              <button
                type="button"
                onClick={() => setShowImport(false)}
                className="p-2 rounded-lg text-[#A9B3C7] hover:text-[#F4F6FA]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-xs text-[#6B7280]">
                Array of objects with author_name, rating, title, body, reviewed_at, is_verified.
                Optional external_id for upserts.
              </p>
              <textarea
                value={jsonText}
                onChange={(e) => setJsonText(e.target.value)}
                rows={12}
                placeholder={JSON_PLACEHOLDER}
                className={`${fieldClass} font-mono text-xs`}
              />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowImport(false)}
                  className="px-4 py-2 rounded-xl border border-[rgba(244,246,250,0.2)] text-[#A9B3C7]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => void handleImportJson()}
                  disabled={importing || !jsonText.trim()}
                  className="px-4 py-2 rounded-xl bg-[#2ED1B4] text-[#070A12] font-semibold disabled:opacity-50"
                >
                  {importing ? 'Importing…' : 'Import'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {editing && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60"
          onClick={() => setEditing(null)}
        >
          <div
            className="bg-[#111827] border border-[rgba(244,246,250,0.08)] rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 flex justify-between items-center border-b border-[rgba(244,246,250,0.08)]">
              <h3 className="text-lg font-semibold text-[#F4F6FA]">Edit review</h3>
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="p-2 rounded-lg text-[#A9B3C7] hover:text-[#F4F6FA]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-[#A9B3C7] mb-1">Author</label>
                <input
                  type="text"
                  value={editAuthor}
                  onChange={(e) => setEditAuthor(e.target.value)}
                  className={fieldClass}
                />
              </div>
              <div>
                <label className="block text-sm text-[#A9B3C7] mb-1">Rating</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button key={s} type="button" onClick={() => setEditRating(s)} className="p-1">
                      <Star
                        className={`w-6 h-6 ${
                          s <= editRating
                            ? 'fill-[#F59E0B] text-[#F59E0B]'
                            : 'text-[rgba(244,246,250,0.2)]'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm text-[#A9B3C7] mb-1">Title</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className={fieldClass}
                />
              </div>
              <div>
                <label className="block text-sm text-[#A9B3C7] mb-1">Body</label>
                <textarea
                  value={editBody}
                  onChange={(e) => setEditBody(e.target.value)}
                  rows={4}
                  className={fieldClass}
                />
              </div>
              <label className="flex items-center gap-2 text-sm text-[#A9B3C7]">
                <input
                  type="checkbox"
                  checked={editVerified}
                  onChange={(e) => setEditVerified(e.target.checked)}
                />
                Verified
              </label>
              <label className="flex items-center gap-2 text-sm text-[#A9B3C7]">
                <input
                  type="checkbox"
                  checked={editVisible}
                  onChange={(e) => setEditVisible(e.target.checked)}
                />
                Visible on homepage
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="px-4 py-2 rounded-xl border border-[rgba(244,246,250,0.2)] text-[#A9B3C7]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => void handleSaveEdit()}
                  disabled={saving}
                  className="px-4 py-2 rounded-xl bg-[#2ED1B4] text-[#070A12] font-semibold disabled:opacity-50"
                >
                  {saving ? 'Saving…' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
