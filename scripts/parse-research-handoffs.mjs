/**
 * Parse DocumentContent/*-Developer-Handoff.docx into ResearchArticleInput modules.
 * Run: node scripts/parse-research-handoffs.mjs
 */
import { writeFileSync, readdirSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import mammoth from 'mammoth';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const docDir = join(root, 'DocumentContent');
const outDir = join(docDir, '_extracted');

const PRODUCT_SLUG_BY_RESEARCH = {
  'bpc-157': 'bpc-157',
  'melanotan-2': 'mt-2',
  'melanotan-ii': 'mt-2',
  'pt-141': 'pt-141',
  klow: 'klow',
  kpv: 'kpv',
  semax: 'semax',
  hcg: 'hcg',
  'nad-plus': 'nad',
  ipamorelin: 'ipamorelin',
  'ss-31': 'ss-31',
  glow: 'glow',
};

function decode(text) {
  return text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

function stripTags(html) {
  return decode(
    html
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n')
      .replace(/<\/li>/gi, '\n')
      .replace(/<[^>]+>/g, ''),
  );
}

function titleCaseEyebrow(s) {
  return s
    .split('/')
    .map((part) =>
      part
        .trim()
        .toLowerCase()
        .replace(/\b([a-z])/g, (m) => m.toUpperCase())
        .replace(/\bAnd\b/g, 'and')
        .replace(/\bOf\b/g, 'of')
        .replace(/\bFor\b/g, 'for'),
    )
    .join(' / ');
}

function extractCopyHtml(html) {
  const start = html.search(/2\s+WEBSITE COPY START|WEBSITE COPY START/i);
  if (start < 0) return '';
  let slice = html.slice(start);
  const end = slice.search(/WEBSITE COPY END/i);
  if (end > 0) slice = slice.slice(0, end);
  return slice;
}

function splitSections(copyHtml) {
  /** @type {{ type: 'h1'|'h2'|'h3'|'p'|'table'|'ul'|'other', text: string, html: string }[]} */
  const parts = [];
  const re = /<(h[123]|p|table|ul)(\s[^>]*)?>([\s\S]*?)<\/\1>/gi;
  let m;
  while ((m = re.exec(copyHtml))) {
    const tag = m[1].toLowerCase();
    const inner = m[3];
    const full = m[0];
    if (tag === 'h1' || tag === 'h2' || tag === 'h3') {
      parts.push({ type: tag, text: stripTags(inner), html: full });
    } else if (tag === 'p') {
      const text = stripTags(inner);
      if (text && !/^WEBSITE COPY/i.test(text) && !/^2\s+WEBSITE/i.test(text)) {
        parts.push({ type: 'p', text, html: full });
      }
    } else if (tag === 'table') {
      parts.push({ type: 'table', text: '', html: full });
    } else if (tag === 'ul') {
      parts.push({ type: 'ul', text: '', html: full });
    }
  }
  return parts;
}

function parseTable(tableHtml) {
  const rows = [...tableHtml.matchAll(/<tr[\s\S]*?<\/tr>/gi)].map((tr) =>
    [...tr[0].matchAll(/<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/gi)].map((c) => stripTags(c[1])),
  );
  return rows.filter((r) => r.some(Boolean));
}

function parseListItems(ulHtml) {
  return [...ulHtml.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)].map((m) => stripTags(m[1]));
}

function anchorsIn(html) {
  return [...html.matchAll(/<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi)].map((m) => ({
    url: m[1],
    label: stripTags(m[2]),
  }));
}

function isStructuralH2(text) {
  return /^(what is|how does|.*research findings$|research findings at a glance|safety|understanding .*testing|frequently asked|explore peplab)/i.test(
    text,
  );
}

function seoField(html, label) {
  const re = new RegExp(`<strong>${label}:</strong>\\s*([^<]+)`, 'i');
  const m = html.match(re);
  return m ? decode(m[1]) : '';
}

function parseHandoff(html, fileName) {
  const seoTitle = seoField(html, 'Title tag');
  const seoDesc = seoField(html, 'Meta description');
  const suggestedUrl = seoField(html, 'Suggested URL');
  let slug = suggestedUrl.split('/').filter(Boolean).pop() || '';
  if (!slug) {
    slug = fileName
      .replace(/^PEPLAB-/i, '')
      .replace(/-Developer-Handoff\.docx$/i, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  const copyHtml = extractCopyHtml(html);
  if (!copyHtml) throw new Error(`No website copy in ${fileName}`);
  const parts = splitSections(copyHtml);

  let eyebrow = '';
  let h1 = '';
  let subtitle = '';
  const introParts = [];
  let what_is_heading = '';
  const whatIsParts = [];
  let mechanism_heading = '';
  let findings_heading = '';
  let coa_heading = '';
  let safety_body = '';
  let coa_body = '';
  /** @type {{feature:string,details:string}[]} */
  let feature_rows = [];
  /** @type {{area:string,investigated:string,distinction:string}[]} */
  let glance_rows = [];
  /** @type {{title:string,body:string}[]} */
  const mechanism_sections = [];
  /** @type {{title:string,body:string,link_label?:string,link_url?:string}[]} */
  const findings_sections = [];
  /** @type {{q:string,a:string}[]} */
  const faqs = [];
  /** @type {{label:string,slug?:string,kind?:string}[]} */
  const related = [];

  let mode = 'pre';
  let currentFinding = null;
  let currentMech = null;
  let currentFaq = null;
  const safetyParts = [];
  const coaParts = [];

  function flushFinding() {
    if (currentFinding) {
      findings_sections.push(currentFinding);
      currentFinding = null;
    }
  }
  function flushMech() {
    if (currentMech) {
      mechanism_sections.push(currentMech);
      currentMech = null;
    }
  }
  function flushFaq() {
    if (currentFaq && currentFaq.a) {
      faqs.push(currentFaq);
      currentFaq = null;
    } else {
      currentFaq = null;
    }
  }

  for (const part of parts) {
    if (part.type === 'p' && mode === 'pre' && !h1) {
      if (part.text === part.text.toUpperCase() && part.text.length < 100) {
        eyebrow = titleCaseEyebrow(part.text);
        continue;
      }
    }

    if (part.type === 'h1') {
      h1 = part.text;
      mode = 'after-h1';
      continue;
    }

    if (part.type === 'h2') {
      flushFinding();
      flushMech();
      flushFaq();

      if (mode === 'after-h1' && !isStructuralH2(part.text)) {
        subtitle = part.text;
        mode = 'intro';
        continue;
      }

      if (/^what is/i.test(part.text)) {
        what_is_heading = part.text;
        mode = 'what';
        continue;
      }
      if (/^how does/i.test(part.text)) {
        mechanism_heading = part.text;
        mode = 'mech';
        continue;
      }
      if (/research findings$/i.test(part.text) && !/glance/i.test(part.text)) {
        findings_heading = part.text;
        mode = 'findings';
        continue;
      }
      if (/glance/i.test(part.text)) {
        mode = 'glance';
        continue;
      }
      if (/^safety/i.test(part.text)) {
        mode = 'safety';
        continue;
      }
      if (/testing and coas|coa/i.test(part.text)) {
        coa_heading = part.text;
        mode = 'coa';
        continue;
      }
      if (/frequently asked/i.test(part.text)) {
        mode = 'faq';
        continue;
      }
      if (/explore peplab/i.test(part.text)) {
        mode = 'related';
        continue;
      }
      mode = 'other';
      continue;
    }

    if (part.type === 'h3') {
      if (mode === 'mech') {
        flushMech();
        currentMech = { title: part.text, body: '' };
      } else if (mode === 'findings') {
        flushFinding();
        currentFinding = { title: part.text, body: '' };
      } else if (mode === 'faq') {
        flushFaq();
        currentFaq = { q: part.text, a: '' };
      }
      continue;
    }

    if (part.type === 'table') {
      const rows = parseTable(part.html);
      const header = (rows[0] || []).map((c) => c.toLowerCase());
      if (header.some((h) => h.includes('feature'))) {
        feature_rows = rows.slice(1).map((r) => ({
          feature: r[0] || '',
          details: r.slice(1).join(' — '),
        }));
      } else if (header.some((h) => h.includes('research area') || h.includes('investigated'))) {
        glance_rows = rows.slice(1).map((r) => ({
          area: r[0] || '',
          investigated: r[1] || '',
          distinction: r[2] || '',
        }));
      }
      continue;
    }

    if (part.type === 'ul' && mode === 'coa') {
      for (const item of parseListItems(part.html)) {
        if (/^purity:/i.test(item)) coaParts.push(`• **Purity:** ${item.replace(/^purity:\s*/i, '')}`);
        else if (/^identity:/i.test(item)) coaParts.push(`• **Identity:** ${item.replace(/^identity:\s*/i, '')}`);
        else if (/^content:/i.test(item)) coaParts.push(`• **Content:** ${item.replace(/^content:\s*/i, '')}`);
        else coaParts.push(`• ${item}`);
      }
      continue;
    }

    if (part.type === 'p') {
      if (mode === 'intro') {
        introParts.push(part.text);
      } else if (mode === 'what') {
        whatIsParts.push(part.text);
      } else if (mode === 'mech' && currentMech) {
        currentMech.body = currentMech.body ? `${currentMech.body}\n\n${part.text}` : part.text;
      } else if (mode === 'findings' && currentFinding) {
        const links = anchorsIn(part.html);
        const read = links.find((a) => /^read /i.test(a.label));
        if (read) {
          currentFinding.link_label = read.label;
          currentFinding.link_url = read.url;
        } else if (!/^read the /i.test(part.text)) {
          currentFinding.body = currentFinding.body
            ? `${currentFinding.body}\n\n${part.text}`
            : part.text;
        }
      } else if (mode === 'safety') {
        safetyParts.push(part.text);
      } else if (mode === 'coa') {
        let t = part.text;
        // Prefer relative internal links in seeded copy
        t = t
          .replace(/https?:\/\/(www\.)?peplab\.com\.au\/standards/gi, '/standards')
          .replace(/https?:\/\/(www\.)?peplab\.com\.au\/coa/gi, '/coa')
          .replace(/https?:\/\/(www\.)?peplab\.ai\/standards/gi, '/standards')
          .replace(/https?:\/\/(www\.)?peplab\.ai\/coa/gi, '/coa');
        // Restore markdown-ish links from plain text if needed
        const withMd = part.html
          .replace(/<a[^>]+href="https?:\/\/(?:www\.)?peplab\.(?:com\.au|ai)\/standards"[^>]*>[\s\S]*?<\/a>/gi, '[Quality & Testing](/standards)')
          .replace(/<a[^>]+href="https?:\/\/(?:www\.)?peplab\.(?:com\.au|ai)\/coa"[^>]*>[\s\S]*?<\/a>/gi, '[COA Results](/coa)');
        const mdText = stripTags(
          withMd
            .replace(/\[Quality & Testing\]\(\/standards\)/g, '§Q§')
            .replace(/\[COA Results\]\(\/coa\)/g, '§C§'),
        )
          .replace(/§Q§/g, '[Quality & Testing](/standards)')
          .replace(/§C§/g, '[COA Results](/coa)');
        coaParts.push(mdText || t);
      } else if (mode === 'faq' && currentFaq) {
        currentFaq.a = currentFaq.a ? `${currentFaq.a} ${part.text}` : part.text;
      } else if (mode === 'related') {
        if (/^related research:/i.test(part.text) || anchorsIn(part.html).some((a) => /\/research\/compounds\//.test(a.url))) {
          for (const a of anchorsIn(part.html)) {
            if (!/\/research\/compounds\//.test(a.url)) continue;
            const relSlug = a.url.split('/').filter(Boolean).pop();
            related.push({ label: a.label, slug: relSlug, kind: 'research' });
          }
        }
      }
    }
  }

  flushFinding();
  flushMech();
  flushFaq();

  safety_body = safetyParts.join('\n\n');
  coa_body = coaParts.join('\n\n');
  const intro = introParts.join('\n\n');
  const what_is_body = whatIsParts.join('\n\n');
  const name = h1.replace(/\s+Research Overview$/i, '').trim() || slug;

  // card description: prefer first intro sentence; fall back to meta description
  const firstIntro = (intro.split(/\n\n/)[0] || '').replace(/\s+/g, ' ').trim();
  const sentence = firstIntro.match(/^[\s\S]{40,220}?[.!?]/);
  const card_description = (sentence ? sentence[0] : seoDesc || firstIntro).trim();

  return {
    slug,
    name,
    category: eyebrow || 'Research',
    product_slug: PRODUCT_SLUG_BY_RESEARCH[slug] || slug,
    card_title: what_is_heading || `What is ${name}?`,
    card_description,
    seo_title: seoTitle || `${name} Research | PEPLAB`,
    seo_description: seoDesc || card_description,
    eyebrow: eyebrow || 'Research',
    h1: h1 || `${name} Research Overview`,
    subtitle,
    intro,
    what_is_heading: what_is_heading || `What Is ${name}?`,
    what_is_body,
    feature_rows,
    mechanism_heading: mechanism_heading || `How Does ${name} Work?`,
    mechanism_intro: '',
    mechanism_sections,
    mechanism_footer: '',
    findings_heading: findings_heading || `${name} Research Findings`,
    findings_sections,
    glance_rows,
    safety_body,
    coa_heading: coa_heading || `Understanding ${name} Testing and COAs`,
    coa_body,
    faqs,
    related,
    status: 'published',
    author_name: null,
    published_at: '2026-10-08T00:00:00.000Z',
  };
}

function toTsLiteral(value, indent = 2) {
  const pad = ' '.repeat(indent);
  if (value === null) return 'null';
  if (typeof value === 'string') {
    if (value.includes('\n') || value.includes('`')) {
      return `\`${value.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$')}\``;
    }
    return JSON.stringify(value);
  }
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) {
    if (!value.length) return '[]';
    return `[\n${value.map((v) => `${pad}  ${toTsLiteral(v, indent + 2)},`).join('\n')}\n${pad}]`;
  }
  if (typeof value === 'object') {
    return `{\n${Object.keys(value)
      .map((k) => `${pad}  ${k}: ${toTsLiteral(value[k], indent + 2)},`)
      .join('\n')}\n${pad}}`;
  }
  return 'null';
}

mkdirSync(outDir, { recursive: true });
const files = readdirSync(docDir).filter((f) => f.endsWith('.docx')).sort();
const articles = [];

for (const file of files) {
  const { value: html } = await mammoth.convertToHtml({ path: join(docDir, file) });
  writeFileSync(join(outDir, file.replace(/\.docx$/, '.html')), html, 'utf8');
  const article = parseHandoff(html, file);
  articles.push(article);
  console.log(
    'OK',
    article.slug,
    `sub=${JSON.stringify(article.subtitle).slice(0, 40)}`,
    `feat=${article.feature_rows.length}`,
    `find=${article.findings_sections.length}`,
    `links=${article.findings_sections.filter((s) => s.link_url).length}`,
    `faq=${article.faqs.length}`,
    `rel=${article.related.length}`,
  );
}

writeFileSync(join(outDir, 'new-seed-articles.json'), JSON.stringify(articles, null, 2), 'utf8');
const ts = `import type { ResearchArticleInput } from '@/lib/research-articles';\n\n/** Seed articles parsed from DocumentContent developer handoffs (2026-10-08). */\nexport const RESEARCH_HANDOFF_SEED_ARTICLES: ResearchArticleInput[] = ${toTsLiteral(articles, 0)};\n`;
writeFileSync(join(root, 'src/lib/research-handoff-seed-data.ts'), ts, 'utf8');
console.log(`Wrote ${articles.length} articles → src/lib/research-handoff-seed-data.ts`);
