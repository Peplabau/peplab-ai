import { createClient } from '@supabase/supabase-js';
import { createReadStream, existsSync, readFileSync } from 'node:fs';
import { readdir, stat } from 'node:fs/promises';
import path from 'node:path';

function readAppSupabaseDefaults() {
  try {
    const source = readFileSync(path.resolve('src/lib/supabase.ts'), 'utf8');
    return {
      url: source.match(/SUPABASE_URL\s*=.*?\|\|\s*'([^']+)'/)?.[1],
      anonKey: source.match(/SUPABASE_ANON_KEY\s*=.*?\|\|\s*'([^']+)'/)?.[1],
    };
  } catch {
    return {};
  }
}

const appDefaults = readAppSupabaseDefaults();

const SUPABASE_URL =
  process.env.SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  appDefaults.url;

const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  appDefaults.anonKey;
const HAS_SERVICE_KEY = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY);

const BUCKET = process.env.PRODUCT_IMAGE_BUCKET || 'product-images';
const DEFAULT_IMAGE_DIRS = ['viles', 'Popular', 'High popularity', 'NEW'];
const IMAGE_DIRS = (process.env.IMAGE_DIRS || process.env.VILES_DIR || DEFAULT_IMAGE_DIRS.join(','))
  .split(',')
  .map((dir) => dir.trim())
  .filter(Boolean)
  .map((dir) => path.resolve(dir));
const DRY_RUN = process.argv.includes('--dry-run');
const LIST_PRODUCTS = process.argv.includes('--list-products');
const CATEGORY_FOLDERS = new Set(['popular', 'high-popularity', 'new']);

const FOLDER_ALIASES = {
  '5-AMINO-1MQ': ['5-amino-1mq', '5 amino 1mq', 'amino'],
  'ACETIC WATER': ['acetic-water', 'acetic acid water', 'acetic water'],
  'ADAMAX': ['adamax'],
  'AHK-CU': ['ahk-cu', 'ahk'],
  'AOD-9604': ['aod-9604', 'aod'],
  'BAC WATER': ['bac-water', 'bacteriostatic-water', 'bacteriostatic water', 'bac water'],
  BPC: ['bpc-157', 'bpc157', 'bpc'],
  'BPC+TB': ['bpc-5mg-tb-5mg', 'bpc-tb-combo', 'bpc-tb', 'bpc tb', 'bpc+tb', 'bpc-157-tb-500'],
  CAGRILINTIDE: ['cagrilintide'],
  'CJC-1295  DAC': ['cjc-1295-dac', 'cjc 1295 dac'],
  'CJC-1295 NO DAC': ['cjc-1295-no-dac', 'cjc no dac'],
  'CJC+IPA': ['cjc-1295-no-dac-ipa-5mg', 'cjc-ipamorelin', 'cjc-ipa', 'cjc+ipa', 'cjc-1295-ipamorelin'],
  DIHEXA: ['dihexa'],
  DSIP: ['dsip'],
  EPITALON: ['epithalon', 'epitalon'],
  'FOX04-DRI': ['fox04-dri', 'foxo4-dri', 'fox'],
  'GAC WATER': ['gac-water', 'gac water'],
  GHRP: ['ghrp-6', 'ghrp'],
  'GHRP-6': ['ghrp-6', 'ghrp'],
  GHK: ['ghk-cu', 'ghk cu', 'ghk'],
  GLUTATHIONE: ['glutathione', 'glutat'],
  GLOW: ['glow'],
  HCG: ['hcg'],
  HGH: ['hgh-191aa', 'hgh', 'somatropin'],
  'IGF 1 LR3': ['igf-1-lr3', 'igf 1 lr3', 'igf1-lr3'],
  IPAMORELIN: ['ipamorelin'],
  KISS: ['kisspeptin', 'kisspeptin-10', 'kiss'],
  KLOW: ['klow'],
  KPV: ['kpv'],
  MOTS: ['mots-c', 'mots c', 'mots'],
  'MOTS-C': ['mots-c', 'mots c', 'mots'],
  MT1: ['melanotan-i', 'melanotan-1', 'mt-1', 'mt1'],
  MT2: ['mt-2', 'melanotan-ii', 'melanotan-2', 'mt2'],
  'NAD+': ['nad', 'nad+', 'nad-plus'],
  'PNC-27': ['pnc-27', 'pnc'],
  RETA: ['retatrutide', 'reta'],
  SEMAGLUTIDE: ['semaglutide', 'sema'],
  SELANK: ['selank'],
  SEMAX: ['semax'],
  'SEMAX + SELANK': ['semax--selank', 'semax-selank', 'semax plus selank', 'semax+selank'],
  'SERMOTELIN': ['sermorelin', 'sermotelin'],
  'SLU-PP-332': ['slu-pp-332', 'slupp332', 'slup'],
  'SNAP-8': ['snap-8', 'snap'],
  'SS-31': ['ss-31', 'ss'],
  TB500: ['tb-500', 'tb500', 'tb'],
  TESAMORELIN: ['tesamorelin', 'tesa'],
  'THYMOSIN APLHA-1': ['thymosin-alpha-1', 'thymosin-aplha-1', 'thymosin alpha 1', 'aplha', 'alpha'],
  TRIZEPATIDE: ['tirzepatide', 'trizepatide', 'triz'],
  VIP: ['vip'],
  'PT-141': ['pt-141', 'pt'],
};

const MIME_TYPES = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
};

function normalize(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/\+/g, ' plus ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function dosageNumber(value) {
  const matches = String(value || '').match(/\d+(?:\.\d+)?/g);
  if (!matches?.length) return null;
  return Number(matches[matches.length - 1]);
}

function extractImageDose(fileName) {
  return dosageNumber(path.basename(fileName, path.extname(fileName)));
}

function getPublicUrl(client, storagePath) {
  return client.storage.from(BUCKET).getPublicUrl(storagePath).data.publicUrl;
}

async function walkImages(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await walkImages(fullPath));
      continue;
    }

    const ext = path.extname(entry.name).toLowerCase();
    if (MIME_TYPES[ext]) files.push(fullPath);
  }

  return files;
}

async function collectImageFiles(roots) {
  const files = [];
  const missing = [];

  for (const root of roots) {
    if (!existsSync(root)) {
      missing.push(root);
      continue;
    }
    files.push(...(await walkImages(root)).map((filePath) => ({ root, filePath })));
  }

  return { files, missing };
}

function productFolderFromRelativePath(relativePath) {
  const parts = relativePath.split(path.sep).filter(Boolean);
  while (parts.length > 1 && CATEGORY_FOLDERS.has(normalize(parts[0]))) {
    parts.shift();
  }
  return parts[0] || '';
}

function productKeys(product) {
  return [
    product.slug,
    product.name,
    product.id,
  ].filter(Boolean).map(normalize);
}

function buildProductLookup(products) {
  const lookup = new Map();

  for (const product of products) {
    for (const key of productKeys(product)) lookup.set(key, product);
  }

  for (const [folder, aliases] of Object.entries(FOLDER_ALIASES)) {
    const folderKey = normalize(folder);
    for (const alias of aliases) {
      const product = products.find((p) => productKeys(p).includes(normalize(alias)));
      if (product) {
        lookup.set(folderKey, product);
        break;
      }
    }
  }

  return lookup;
}

function matchDosage(product, dose) {
  const rows = product.product_dosages || [];
  return rows.find((row) => dosageNumber(row.mg) === dose) || null;
}

function productStorageSlug(product) {
  return normalize(product.slug || product.name || product.id);
}

async function main() {
  if (!SUPABASE_KEY) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY, SUPABASE_SERVICE_KEY, or VITE_SUPABASE_ANON_KEY.');
  }

  if (!DRY_RUN && !LIST_PRODUCTS && !HAS_SERVICE_KEY) {
    throw new Error('Real seeding requires SUPABASE_SERVICE_ROLE_KEY or SUPABASE_SERVICE_KEY. Dry-run can use the app anon key, but uploads/DB updates should use a service key.');
  }

  const client = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: products, error } = await client
    .from('products')
    .select('id, slug, name, product_dosages(id, mg, unit, image_url)')
    .eq('is_active', true);

  if (error) throw error;

  if (LIST_PRODUCTS) {
    for (const product of products || []) {
      const tiers = (product.product_dosages || [])
        .map((row) => `${row.mg}${row.unit ? ` ${row.unit}` : ''}`)
        .join(', ');
      console.log(`${product.slug || '(no-slug)'} | ${product.name} | ${tiers}`);
    }
    return;
  }

  const productLookup = buildProductLookup(products || []);
  const { files: imageFiles, missing } = await collectImageFiles(IMAGE_DIRS);
  const results = {
    uploaded: 0,
    updated: 0,
    skipped: [],
  };
  const seededDosageIds = new Set();

  for (const missingDir of missing) {
    results.skipped.push(`${missingDir} - image directory not found`);
  }

  for (const { root, filePath } of imageFiles) {
    const relativePath = path.relative(root, filePath);
    const folderName = productFolderFromRelativePath(relativePath);
    const dose = extractImageDose(filePath);
    const product = productLookup.get(normalize(folderName));

    if (!product) {
      results.skipped.push(`${relativePath} - no matching product for folder "${folderName}"`);
      continue;
    }

    if (dose == null) {
      const rows = product.product_dosages || [];
      if (rows.length === 1) {
        const dosage = rows[0];
        if (seededDosageIds.has(dosage.id)) {
          results.skipped.push(`${relativePath} - duplicate image for ${product.slug || product.name} ${dosage.mg}; first match already selected`);
          continue;
        }

        const ext = path.extname(filePath).toLowerCase();
        const storagePath = [
          'vials',
          productStorageSlug(product),
          `default${ext}`,
        ].join('/');

        if (DRY_RUN) {
          console.log(`[dry-run] ${relativePath} -> ${product.slug || product.name} / ${dosage.mg} => ${storagePath}`);
          continue;
        }

        const fileInfo = await stat(filePath);
        const { data: uploadData, error: uploadError } = await client.storage
          .from(BUCKET)
          .upload(storagePath, createReadStream(filePath), {
            cacheControl: '3600',
            contentType: MIME_TYPES[ext],
            duplex: 'half',
            upsert: true,
          });

        if (uploadError) {
          results.skipped.push(`${relativePath} - upload failed: ${uploadError.message}`);
          continue;
        }

        results.uploaded += 1;
        const publicUrl = getPublicUrl(client, uploadData?.path || storagePath);
        const { error: updateError } = await client
          .from('product_dosages')
          .update({
            image_url: publicUrl,
            updated_at: new Date().toISOString(),
          })
          .eq('id', dosage.id);

        if (updateError) {
          results.skipped.push(`${relativePath} - DB update failed: ${updateError.message}`);
          continue;
        }

        results.updated += 1;
        seededDosageIds.add(dosage.id);
        console.log(`Seeded ${relativePath} (${fileInfo.size} bytes) -> ${product.slug || product.name} ${dosage.mg}: ${publicUrl}`);
        continue;
      }

      results.skipped.push(`${relativePath} - no dose number found in filename and product has ${rows.length} dosage rows`);
      continue;
    }

    const dosage = matchDosage(product, dose);
    if (!dosage) {
      const available = (product.product_dosages || [])
        .map((row) => `${row.mg}${row.unit ? ` ${row.unit}` : ''}`)
        .join(', ') || 'none';
      results.skipped.push(`${relativePath} - no ${dose} tier for ${product.slug || product.name}; available: ${available}`);
      continue;
    }

    if (seededDosageIds.has(dosage.id)) {
      results.skipped.push(`${relativePath} - duplicate image for ${product.slug || product.name} ${dosage.mg}; first match already selected`);
      continue;
    }

    const ext = path.extname(filePath).toLowerCase();
    const storagePath = [
      'vials',
      productStorageSlug(product),
      `${dose}${dosage.unit ? String(dosage.unit).toLowerCase() : ''}${ext}`,
    ].join('/');

    if (DRY_RUN) {
      console.log(`[dry-run] ${relativePath} -> ${product.slug || product.name} / ${dosage.mg} => ${storagePath}`);
      continue;
    }

    const fileInfo = await stat(filePath);
    const { data: uploadData, error: uploadError } = await client.storage
      .from(BUCKET)
      .upload(storagePath, createReadStream(filePath), {
        cacheControl: '3600',
        contentType: MIME_TYPES[ext],
        duplex: 'half',
        upsert: true,
      });

    if (uploadError) {
      results.skipped.push(`${relativePath} - upload failed: ${uploadError.message}`);
      continue;
    }

    results.uploaded += 1;

    const publicUrl = getPublicUrl(client, uploadData?.path || storagePath);
    const { error: updateError } = await client
      .from('product_dosages')
      .update({
        image_url: publicUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('id', dosage.id);

    if (updateError) {
      results.skipped.push(`${relativePath} - DB update failed: ${updateError.message}`);
      continue;
    }

    results.updated += 1;
    seededDosageIds.add(dosage.id);
    console.log(`Seeded ${relativePath} (${fileInfo.size} bytes) -> ${product.slug || product.name} ${dosage.mg}: ${publicUrl}`);
  }

  console.log('\nSeed summary');
  console.log(`Uploaded: ${results.uploaded}`);
  console.log(`Updated dosage rows: ${results.updated}`);
  console.log(`Skipped: ${results.skipped.length}`);
  for (const skipped of results.skipped) console.log(`- ${skipped}`);
}

main().catch((error) => {
  console.error(error?.message || error);
  process.exit(1);
});
