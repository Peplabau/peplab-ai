/**
 * Lightweight Markdown → safe HTML for blog posts.
 * Supports headings, paragraphs, lists, links, bold, italic, code, blockquotes.
 */

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function inlineMarkdown(text: string): string {
  let html = escapeHtml(text);
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  html = html.replace(
    /\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g,
    (_match, label: string, href: string) => {
      const internalMatch = href.match(
        /^https?:\/\/(?:www\.)?peplab\.(?:com\.au|ai)(\/.*)?$/i,
      );
      const resolvedHref = internalMatch ? internalMatch[1] || '/' : href;
      const externalAttrs = internalMatch ? '' : ' target="_blank" rel="noopener noreferrer"';
      return `<a href="${resolvedHref}"${externalAttrs}>${label}</a>`;
    },
  );
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/(^|[^*\w])\*([^*]+)\*(?!\*)/g, '$1<em>$2</em>');
  return html;
}

function slugifyHeading(text: string): string {
  return (
    text
      .replace(/[`*_[\]()]/g, '')
      .toLowerCase()
      .replace(/&[a-z]+;/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 80) || 'section'
  );
}

export type MarkdownHeading = { id: string; text: string; level: 2 | 3 };

function createHeadingIdFactory() {
  const seen = new Map<string, number>();
  return (text: string) => {
    const base = slugifyHeading(text);
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    return count === 0 ? base : `${base}-${count + 1}`;
  };
}

/** h2/h3 headings in document order; ids match those emitted by `markdownToHtml`. */
export function extractMarkdownHeadings(markdown: string): MarkdownHeading[] {
  const nextId = createHeadingIdFactory();
  const headings: MarkdownHeading[] = [];
  let inCode = false;
  for (const raw of (markdown || '').replace(/\r\n/g, '\n').split('\n')) {
    const trimmed = raw.trim();
    if (trimmed.startsWith('```')) {
      inCode = !inCode;
      continue;
    }
    if (inCode) continue;
    const m = trimmed.match(/^(#{1,3})\s+(.+)$/);
    if (!m) continue;
    const id = nextId(m[2]);
    if (m[1].length === 2 || m[1].length === 3) {
      headings.push({ id, text: m[2].replace(/[`*_]/g, ''), level: m[1].length as 2 | 3 });
    }
  }
  return headings;
}

export function markdownToHtml(markdown: string): string {
  const lines = (markdown || '').replace(/\r\n/g, '\n').split('\n');
  const out: string[] = [];
  const nextId = createHeadingIdFactory();
  let i = 0;

  const flushParagraph = (buf: string[]) => {
    const text = buf.join(' ').trim();
    if (text) out.push(`<p>${inlineMarkdown(text)}</p>`);
    buf.length = 0;
  };

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      i += 1;
      continue;
    }

    const heading = trimmed.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      const level = heading[1].length;
      out.push(`<h${level} id="${nextId(heading[2])}">${inlineMarkdown(heading[2])}</h${level}>`);
      i += 1;
      continue;
    }

    if (trimmed.startsWith('> ')) {
      const quote: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('> ')) {
        quote.push(lines[i].trim().replace(/^>\s?/, ''));
        i += 1;
      }
      out.push(`<blockquote><p>${inlineMarkdown(quote.join(' '))}</p></blockquote>`);
      continue;
    }

    if (/^[-*]\s+/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^[-*]\s+/, ''));
        i += 1;
      }
      out.push(
        `<ul>${items.map((item) => `<li>${inlineMarkdown(item)}</li>`).join('')}</ul>`,
      );
      continue;
    }

    if (/^\d+\.\s+/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+\.\s+/, ''));
        i += 1;
      }
      out.push(
        `<ol>${items.map((item) => `<li>${inlineMarkdown(item)}</li>`).join('')}</ol>`,
      );
      continue;
    }

    if (trimmed.startsWith('```')) {
      const code: string[] = [];
      i += 1;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        code.push(lines[i]);
        i += 1;
      }
      if (i < lines.length) i += 1;
      out.push(`<pre><code>${escapeHtml(code.join('\n'))}</code></pre>`);
      continue;
    }

    const para: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !lines[i].trim().match(/^#{1,3}\s/) &&
      !lines[i].trim().startsWith('> ') &&
      !/^[-*]\s+/.test(lines[i].trim()) &&
      !/^\d+\.\s+/.test(lines[i].trim()) &&
      !lines[i].trim().startsWith('```')
    ) {
      para.push(lines[i].trim());
      i += 1;
    }
    flushParagraph(para);
  }

  return out.join('\n');
}
