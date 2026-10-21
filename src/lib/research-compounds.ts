/**
 * Research Library compound helpers.
 * Live compound cards come from published `research_articles` (DB) with seed fallback.
 */

import {
  listPublishedResearchArticles,
  researchCompoundPath,
  type ResearchArticle,
} from '@/lib/research-articles';
import { RESEARCH_SEED_ARTICLES } from '@/lib/research-seed-data';

export type ResearchCompound = {
  slug: string;
  name: string;
  category: string;
  cardTitle: string;
  cardDescription: string;
  productSlug: string;
  overviewPath: string | null;
};

export function articleToCompound(article: ResearchArticle): ResearchCompound {
  return {
    slug: article.slug,
    name: article.name,
    category: article.category,
    cardTitle: article.card_title || `What is ${article.name}?`,
    cardDescription: article.card_description,
    productSlug: article.product_slug || article.slug,
    overviewPath: researchCompoundPath(article.slug),
  };
}

function seedAsCompounds(): ResearchCompound[] {
  return RESEARCH_SEED_ARTICLES.filter((a) => a.status === 'published').map((a) =>
    articleToCompound({
      ...a,
      id: `seed-${a.slug}`,
      product_slug: a.product_slug || null,
      author_name: a.author_name || null,
      published_at: a.published_at || null,
      created_at: a.published_at || '',
      updated_at: a.published_at || '',
    }),
  );
}

/** Published compounds for the Find Your Compound hub (DB first, seed fallback). */
export async function loadResearchCompounds(): Promise<ResearchCompound[]> {
  try {
    const rows = await listPublishedResearchArticles();
    if (rows.length > 0) {
      return rows.map(articleToCompound).sort((a, b) => a.name.localeCompare(b.name));
    }
  } catch (err) {
    console.error('loadResearchCompounds:', err);
  }
  return seedAsCompounds().sort((a, b) => a.name.localeCompare(b.name));
}
