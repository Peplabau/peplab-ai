import { useEffect, useMemo, useState, type MouseEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Clock, ShieldCheck } from 'lucide-react';
import { SEO } from '@/components/SEO';
import { JsonLd } from '@/components/JsonLd';
import ContentPageHeader from '@/components/ContentPageHeader';
import BlogCover from '@/components/BlogCover';
import Footer from '@/sections/Footer';
import {
  blogPostPath,
  blogReadingMinutes,
  formatBlogDate,
  getPublishedBlogPostBySlug,
  type BlogPost,
} from '@/lib/blog-posts';
import { extractMarkdownHeadings, markdownToHtml } from '@/lib/markdown';
import { BLOG_PATH, COA_ARCHIVE_PATH, SHOP_PATH } from '@/lib/routes';
import { buildBreadcrumbJsonLd } from '@/lib/seo-breadcrumbs';
import { Skeleton } from '@/components/ui/skeleton';

export default function BlogPostPage() {
  const { slug = '' } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeId, setActiveId] = useState('');

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Reset route state before loading a new slug.
    setLoading(true);
    setNotFound(false);
    getPublishedBlogPostBySlug(slug)
      .then((data) => {
        if (cancelled) return;
        if (!data) {
          setNotFound(true);
          setPost(null);
          return;
        }
        setPost(data);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const html = useMemo(
    () => (post ? markdownToHtml(post.body_markdown) : ''),
    [post],
  );
  const toc = useMemo(
    () => (post ? extractMarkdownHeadings(post.body_markdown).filter((h) => h.level === 2) : []),
    [post],
  );

  useEffect(() => {
    if (toc.length === 0 || typeof IntersectionObserver === 'undefined') return;
    const targets = toc
      .map((h) => document.getElementById(h.id))
      .filter((el): el is HTMLElement => Boolean(el));
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: '-96px 0px -65% 0px' },
    );
    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [toc, html]);

  const scrollToHeading = (id: string) => (e: MouseEvent) => {
    const el = document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setActiveId(id);
  };

  if (loading) {
    return (
      <div className="min-h-screen" style={{ background: '#070A12' }}>
        <ContentPageHeader backTo={BLOG_PATH} backLabel="Back to Blog" />
        <div className="mx-auto max-w-3xl space-y-4 px-6 py-16">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="mt-8 aspect-[21/9] w-full rounded-3xl" />
        </div>
      </div>
    );
  }

  if (notFound || !post) {
    return (
      <>
        <SEO title="Post not found | PEPLAB Blog" noIndex />
        <div className="min-h-screen" style={{ background: '#070A12' }}>
          <ContentPageHeader backTo={BLOG_PATH} backLabel="Back to Blog" />
          <main className="relative z-10 px-6 py-20 text-center">
            <h1 className="mb-4 text-2xl font-bold text-[#F4F6FA]">Post not found</h1>
            <p className="mb-6 text-[#A9B3C7]">This blog post is not published or the link is incorrect.</p>
            <Link to={BLOG_PATH} className="text-[#A78BFA] hover:underline">
              Back to Blog
            </Link>
          </main>
          <Footer />
        </div>
      </>
    );
  }

  const path = blogPostPath(post.slug);
  const date = formatBlogDate(post.published_at);
  const minutes = blogReadingMinutes(post.body_markdown);
  const author = post.author_name || 'PEPLAB';

  return (
    <>
      <SEO
        title={post.seo_title || `${post.title} | PEPLAB`}
        description={post.seo_description || post.excerpt}
        ogImage={post.cover_image_url || undefined}
      />
      <JsonLd
        id={`blog-${post.slug}-breadcrumbs`}
        data={buildBreadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Blog', path: BLOG_PATH },
          { name: post.title, path },
        ])}
      />
      <div className="relative min-h-screen overflow-x-clip" style={{ background: '#070A12' }}>
        <div className="absolute inset-0 grid-overlay opacity-60 pointer-events-none" />
        <div
          className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[900px] -translate-x-1/2 rounded-full opacity-40 blur-3xl"
          style={{ background: 'radial-gradient(closest-side, rgba(139,92,246,0.35), transparent)' }}
        />
        <ContentPageHeader backTo={BLOG_PATH} backLabel="Back to Blog" />

        <main className="relative z-10 px-6 lg:px-12 py-10 lg:py-14">
          <header className="mx-auto max-w-3xl text-center">
            <nav aria-label="Breadcrumb" className="mb-6 font-mono text-[11px] uppercase tracking-[0.2em] text-[#7C8599]">
              <Link to="/" className="hover:text-[#C4B5FD]">Home</Link>
              <span className="mx-2 text-[#4B5468]">/</span>
              <Link to={BLOG_PATH} className="hover:text-[#C4B5FD]">Blog</Link>
            </nav>
            <h1 className="mb-5 text-3xl font-bold leading-[1.15] tracking-tight text-[#F4F6FA] sm:text-4xl md:text-5xl">
              {post.title}
            </h1>
            {post.excerpt ? (
              <p className="mx-auto mb-7 max-w-2xl text-lg leading-relaxed text-[#A9B3C7]">{post.excerpt}</p>
            ) : null}
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-[#A9B3C7]">
              <span className="inline-flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#3B82F6] to-[#8B5CF6] text-[11px] font-bold text-white">
                  {author.charAt(0).toUpperCase()}
                </span>
                <span className="font-medium text-[#F4F6FA]">{author}</span>
              </span>
              {date ? (
                <>
                  <span className="h-1 w-1 rounded-full bg-[#4B5468]" />
                  <time dateTime={post.published_at ?? undefined}>{date}</time>
                </>
              ) : null}
              <span className="h-1 w-1 rounded-full bg-[#4B5468]" />
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                {minutes} min read
              </span>
            </div>
          </header>

          <div className="mx-auto mt-10 max-w-5xl overflow-hidden rounded-3xl border border-[rgba(244,246,250,0.08)] aspect-[16/9] sm:aspect-[21/9]">
            <BlogCover title={post.title} imageUrl={post.cover_image_url} large eager />
          </div>

          <div
            className={`mx-auto mt-12 grid max-w-5xl gap-10 ${toc.length > 1 ? 'lg:grid-cols-[minmax(0,1fr)_220px]' : ''}`}
          >
            <article className="min-w-0">
              {toc.length > 1 ? (
                <details className="blog-toc-mobile mb-8 rounded-2xl border border-[rgba(244,246,250,0.08)] bg-[rgba(17,24,39,0.6)] lg:hidden">
                  <summary className="cursor-pointer px-5 py-4 font-mono text-[11px] uppercase tracking-[0.2em] text-[#C4B5FD]">
                    In this article
                  </summary>
                  <ol className="space-y-2 px-5 pb-5 text-sm">
                    {toc.map((h) => (
                      <li key={h.id}>
                        <a href={`#${h.id}`} onClick={scrollToHeading(h.id)} className="text-[#A9B3C7] hover:text-[#F4F6FA]">
                          {h.text}
                        </a>
                      </li>
                    ))}
                  </ol>
                </details>
              ) : null}

              <div className="blog-prose" dangerouslySetInnerHTML={{ __html: html }} />

              <div className="mt-14 rounded-2xl border border-[rgba(46,209,180,0.18)] bg-[linear-gradient(135deg,rgba(46,209,180,0.08),rgba(59,130,246,0.06))] p-6 sm:p-8">
                <p className="mb-1 text-lg font-semibold text-[#F4F6FA]">Lab-tested research peptides</p>
                <p className="mb-5 text-sm text-[#A9B3C7]">
                  Every batch is HPLC tested, and certificates of analysis are published in the COA archive.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link
                    to={SHOP_PATH}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#2ED1B4] px-5 py-2.5 text-sm font-bold text-[#04121A] transition-colors hover:bg-[#5EEAD4]"
                  >
                    Browse the shop
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    to={COA_ARCHIVE_PATH}
                    className="inline-flex items-center gap-2 rounded-xl border border-[rgba(244,246,250,0.14)] px-5 py-2.5 text-sm font-semibold text-[#F4F6FA] transition-colors hover:border-[rgba(46,209,180,0.4)]"
                  >
                    <ShieldCheck className="h-4 w-4 text-[#2ED1B4]" />
                    View COAs
                  </Link>
                </div>
              </div>

              <div className="mt-10 flex flex-col gap-6 border-t border-[rgba(244,246,250,0.08)] pt-6 sm:flex-row sm:items-center sm:justify-between">
                <Link
                  to={BLOG_PATH}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-[#C4B5FD] hover:text-white"
                >
                  <ArrowLeft className="h-4 w-4" />
                  All articles
                </Link>
                <p className="text-xs text-[#6B7280] sm:max-w-md sm:text-right">
                  For research use only. Not for human consumption. PEPLAB products are intended for
                  laboratory research purposes only.
                </p>
              </div>
            </article>

            {toc.length > 1 ? (
              <aside className="hidden lg:block">
                <nav aria-label="Table of contents" className="sticky top-28">
                  <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.2em] text-[#7C8599]">
                    In this article
                  </p>
                  <ol className="space-y-1 border-l border-[rgba(244,246,250,0.08)]">
                    {toc.map((h) => (
                      <li key={h.id}>
                        <a
                          href={`#${h.id}`}
                          onClick={scrollToHeading(h.id)}
                          className={`-ml-px block border-l-2 py-1.5 pl-4 text-[13px] leading-snug transition-colors ${
                            activeId === h.id
                              ? 'border-[#A78BFA] text-[#F4F6FA]'
                              : 'border-transparent text-[#7C8599] hover:text-[#C9D1E0]'
                          }`}
                        >
                          {h.text}
                        </a>
                      </li>
                    ))}
                  </ol>
                </nav>
              </aside>
            ) : null}
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
