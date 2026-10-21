import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock, Newspaper } from 'lucide-react';
import { SEO } from '@/components/SEO';
import { JsonLd } from '@/components/JsonLd';
import ContentPageHeader from '@/components/ContentPageHeader';
import BlogCover from '@/components/BlogCover';
import Footer from '@/sections/Footer';
import {
  blogPostPath,
  blogReadingMinutes,
  formatBlogDate,
  listPublishedBlogPosts,
  type BlogPost,
} from '@/lib/blog-posts';
import { BLOG_PATH, SHOP_PATH } from '@/lib/routes';
import { PAGE_SEO } from '@/lib/seo-constants';
import { buildBreadcrumbJsonLd } from '@/lib/seo-breadcrumbs';
import { Skeleton } from '@/components/ui/skeleton';

function PostMeta({ post }: { post: BlogPost }) {
  const date = formatBlogDate(post.published_at);
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] uppercase tracking-[0.18em] text-[#7C8599]">
      {date ? <span>{date}</span> : null}
      {date ? <span className="h-1 w-1 rounded-full bg-[#4B5468]" /> : null}
      <span className="inline-flex items-center gap-1.5">
        <Clock className="h-3 w-3" />
        {blogReadingMinutes(post.body_markdown)} min read
      </span>
    </div>
  );
}

function FeaturedPost({ post }: { post: BlogPost }) {
  return (
    <Link
      to={blogPostPath(post.slug)}
      className="group grid overflow-hidden rounded-3xl border border-[rgba(244,246,250,0.08)] bg-[rgba(17,24,39,0.6)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[rgba(167,139,250,0.35)] hover:shadow-[0_24px_60px_-24px_rgba(139,92,246,0.35)] md:grid-cols-[1.15fr_1fr]"
    >
      <div className="relative aspect-[16/10] overflow-hidden md:aspect-auto md:min-h-[340px]">
        <BlogCover
          title={post.title}
          imageUrl={post.cover_image_url}
          large
          eager
          className="transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <span className="absolute left-4 top-4 rounded-full border border-white/10 bg-black/40 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white/80 backdrop-blur">
          Latest
        </span>
      </div>
      <div className="flex flex-col justify-center gap-4 p-6 sm:p-8 lg:p-10">
        <PostMeta post={post} />
        <h2 className="text-2xl font-bold leading-tight text-[#F4F6FA] sm:text-3xl lg:text-[2rem]">
          {post.title}
        </h2>
        {post.excerpt ? (
          <p className="text-base leading-relaxed text-[#A9B3C7]">{post.excerpt}</p>
        ) : null}
        <span className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-[#C4B5FD]">
          Read article
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}

function PostCard({ post }: { post: BlogPost }) {
  return (
    <Link
      to={blogPostPath(post.slug)}
      className="group flex flex-col overflow-hidden rounded-2xl border border-[rgba(244,246,250,0.08)] bg-[rgba(17,24,39,0.6)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[rgba(167,139,250,0.35)]"
    >
      <div className="relative aspect-[16/9] overflow-hidden">
        <BlogCover
          title={post.title}
          imageUrl={post.cover_image_url}
          className="transition-transform duration-500 group-hover:scale-[1.04]"
        />
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5 sm:p-6">
        <PostMeta post={post} />
        <h2 className="text-lg font-semibold leading-snug text-[#F4F6FA] sm:text-xl">{post.title}</h2>
        {post.excerpt ? (
          <p className="line-clamp-3 text-sm leading-relaxed text-[#A9B3C7]">{post.excerpt}</p>
        ) : null}
        <span className="mt-auto inline-flex items-center gap-1.5 pt-2 text-xs font-bold uppercase tracking-[0.14em] text-[#A78BFA]">
          Read
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}

export default function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    listPublishedBlogPosts()
      .then((data) => {
        if (!cancelled) setPosts(data);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const [featured, ...rest] = posts;

  return (
    <>
      <SEO title={PAGE_SEO.blog.title} description={PAGE_SEO.blog.description} />
      <JsonLd
        id="blog-breadcrumbs"
        data={buildBreadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Blog', path: BLOG_PATH },
        ])}
      />
      <div className="relative min-h-screen overflow-hidden" style={{ background: '#070A12' }}>
        <div className="absolute inset-0 grid-overlay opacity-60 pointer-events-none" />
        <div
          className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[900px] -translate-x-1/2 rounded-full opacity-40 blur-3xl"
          style={{ background: 'radial-gradient(closest-side, rgba(139,92,246,0.35), transparent)' }}
        />
        <ContentPageHeader />

        <main className="relative z-10 px-6 lg:px-12 py-12 lg:py-16">
          <div className="mx-auto max-w-6xl">
            <header className="mb-12 text-center lg:mb-16">
              <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-[rgba(167,139,250,0.2)] bg-[rgba(139,92,246,0.12)]">
                <Newspaper className="h-7 w-7 text-[#A78BFA]" />
              </div>
              <span className="eyebrow mb-4 block">LEARN</span>
              <h1 className="mb-4 text-3xl font-bold text-[#F4F6FA] sm:text-4xl md:text-5xl">
                PEPLAB <span className="gradient-text">Blog</span>
              </h1>
              <p className="mx-auto max-w-2xl text-base text-[#A9B3C7] sm:text-lg">
                Research literacy, COA guidance, and practical notes for Australian laboratory buyers.
              </p>
            </header>

            {loading ? (
              <div className="space-y-6">
                <Skeleton className="h-[340px] w-full rounded-3xl" />
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-72 w-full rounded-2xl" />
                  ))}
                </div>
              </div>
            ) : !featured ? (
              <div className="rounded-2xl border border-[rgba(244,246,250,0.08)] bg-[rgba(17,24,39,0.6)] p-10 text-center">
                <p className="text-[#A9B3C7]">No published posts yet. Check back soon.</p>
              </div>
            ) : (
              <div className="space-y-10">
                <FeaturedPost post={featured} />
                {rest.length > 0 ? (
                  <section>
                    <h2 className="mb-5 font-mono text-xs uppercase tracking-[0.25em] text-[#7C8599]">
                      More articles
                    </h2>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {rest.map((post) => (
                        <PostCard key={post.id} post={post} />
                      ))}
                    </div>
                  </section>
                ) : null}
              </div>
            )}

            <div className="mt-16 flex flex-col items-center justify-between gap-4 rounded-2xl border border-[rgba(46,209,180,0.18)] bg-[linear-gradient(135deg,rgba(46,209,180,0.08),rgba(59,130,246,0.06))] p-6 text-center sm:flex-row sm:p-8 sm:text-left">
              <div>
                <p className="text-lg font-semibold text-[#F4F6FA]">Lab-tested research peptides</p>
                <p className="text-sm text-[#A9B3C7]">HPLC tested, with batch certificates of analysis.</p>
              </div>
              <Link
                to={SHOP_PATH}
                className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[#2ED1B4] px-5 py-3 text-sm font-bold text-[#04121A] transition-colors hover:bg-[#5EEAD4]"
              >
                Browse the shop
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
