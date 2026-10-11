"""Parse PEPLAB-Short-Product-Copy.docx into src/lib/peplab-short-product-copy.ts"""
from __future__ import annotations

import json
import re
import zipfile
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DOCX = ROOT / "PEPLAB-Short-Product-Copy.docx"
OUT_TS = ROOT / "src" / "lib" / "peplab-short-product-copy.ts"
OUT_JSON = ROOT / "src" / "lib" / "peplab-short-product-copy.json"

W = "{http://schemas.openxmlformats.org/wordprocessingml/2006/main}"
R = "{http://schemas.openxmlformats.org/officeDocument/2006/relationships}"
REL = "{http://schemas.openxmlformats.org/package/2006/relationships}"

# Doc product name → storefront product slug
NAME_TO_PRODUCT_SLUG: dict[str, str] = {
    "Retatrutide": "reta",
    "GHK-Cu": "ghk-cu",
    "Tirzepatide": "tirzepatide",
    "Tesamorelin": "tesamorelin",
    "BPC-157 + TB-500 Blend": "bpc-5mg-tb-5mg",
    "MOTS-C": "mots-c",
    "CJC-1295 No DAC + Ipamorelin Blend": "cjc-1295-no-dac-ipa-5mg",
    "KLOW Blend": "klow",
    "Melanotan 2": "mt-2",
    "NAD+": "nad",
    "BPC-157": "bpc-157",
    "GLOW Blend": "glow",
    "PT-141": "pt-141",
    "KPV": "kpv",
    "Ipamorelin": "ipamorelin",
    "SS-31": "ss-31",
    "HCG": "hcg",
    "Semax": "semax",
    "SLU-PP-332": "slu-pp-332",
    "Glutathione": "glutathione",
    "IGF-1 LR3": "igf-1-lr3",
    "Semaglutide": "Semaglutide",
    "Semax + Selank Blend": "semax--selank",
    "TB-500": "tb-500",
    "SNAP-8": "snap-8",
    "AHK-Cu": "ahk-cu",
    "DSIP": "dsip",
    "Kisspeptin-10": "kisspeptin-10",
    "Selank": "selank",
    "CJC-1295 DAC": "cjc-1295-dac",
    "CJC-1295 No DAC": "cjc-1295-no-dac",
    "Cagrilintide": "cagrilintide",
    "ARA-290": "ara-290",
    "Epitalon": "epitalon",
    "Thymosin Alpha-1": "thymosin-aplha-1",
    "AOD-9604": "aod-9604",
    "5-Amino-1MQ": "5-amino-1mq",
    "ADAMAX": "adamax",
    "FOXO4-DRI": "fox04-dri",
    "Dihexa": "dihexa",
    "Sermorelin": "sermotelin",
    "GHRP-2": "ghrp-2",
    "GHRP-6": "ghrp-6",
    "Melatonin": "melatonin",
    "PNC-27": "pnc-27",
    "VIP": "vip",
    "ADALANK": "adalank",
    "Cartalax": "cartalax",
    "Cerebrolysin": "cerebrolysin",
    "IGF-1 DES": "igf-1-des",
    "LL-37": "ll-37",
    "P21": "p21",
    "PE-22-28": "pe-22-28",
    "Thymalin": "thymalin",
    "BAC Water 0.9% Benzyl Alcohol": "bac-water",
    "Acetic Water 0.6% Acetic Acid": "acetic-water",
    "1mL 31G 6mm Syringes": "1ml-31g-6mm-syringes",
    "Sharps Container": "sharps-container",
    "Glass Nasal Spray": "nasal-spray-10ml",
}

# Doc product name → research compound slug (omit accessories / no article)
NAME_TO_RESEARCH_SLUG: dict[str, str | None] = {
    "Retatrutide": "retatrutide",
    "GHK-Cu": "ghk-cu",
    "Tirzepatide": "tirzepatide",
    "Tesamorelin": "tesamorelin",
    "BPC-157 + TB-500 Blend": "bpc-157-tb-500",
    "MOTS-C": "mots-c",
    "CJC-1295 No DAC + Ipamorelin Blend": "cjc-1295-no-dac-ipamorelin",
    "KLOW Blend": "klow",
    "Melanotan 2": "melanotan-2",
    "NAD+": "nad-plus",
    "BPC-157": "bpc-157",
    "GLOW Blend": "glow",
    "PT-141": "pt-141",
    "KPV": "kpv",
    "Ipamorelin": "ipamorelin",
    "SS-31": "ss-31",
    "HCG": "hcg",
    "Semax": "semax",
    "SLU-PP-332": "slu-pp-332",
    "Glutathione": None,
    "IGF-1 LR3": "igf-1-des",  # closest published research if LR3 absent; prefer None if no page
    "Semaglutide": None,
    "Semax + Selank Blend": "semax",
    "TB-500": None,
    "SNAP-8": None,
    "AHK-Cu": None,
    "DSIP": None,
    "Kisspeptin-10": None,
    "Selank": "semax",  # selank often paired; leave None if no dedicated page
    "CJC-1295 DAC": "cjc-1295-dac",
    "CJC-1295 No DAC": "cjc-1295-no-dac",
    "Cagrilintide": "cagrilintide",
    "ARA-290": "ara-290",
    "Epitalon": "epitalon",
    "Thymosin Alpha-1": "thymosin-alpha-1",
    "AOD-9604": "aod-9604",
    "5-Amino-1MQ": "5-amino-1mq",
    "ADAMAX": "adamax",
    "FOXO4-DRI": "foxo4-dri",
    "Dihexa": "dihexa",
    "Sermorelin": "sermorelin",
    "GHRP-2": "ghrp-2",
    "GHRP-6": "ghrp-6",
    "Melatonin": "melatonin",
    "PNC-27": "pnc-27",
    "VIP": "vip",
    "ADALANK": "adalank",
    "Cartalax": "cartalax",
    "Cerebrolysin": "cerebrolysin",
    "IGF-1 DES": "igf-1-des",
    "LL-37": "ll-37",
    "P21": "p21",
    "PE-22-28": None,
    "Thymalin": None,
    "BAC Water 0.9% Benzyl Alcohol": None,
    "Acetic Water 0.6% Acetic Acid": None,
    "1mL 31G 6mm Syringes": None,
    "Sharps Container": None,
    "Glass Nasal Spray": None,
}

# Fix inaccurate research mappings
NAME_TO_RESEARCH_SLUG["IGF-1 LR3"] = None
NAME_TO_RESEARCH_SLUG["Selank"] = None
NAME_TO_RESEARCH_SLUG["Semax + Selank Blend"] = None


def paragraph_text(p: ET.Element) -> str:
    return "".join((t.text or "") for t in p.iter(f"{W}t")).strip()


def load_rels(z: zipfile.ZipFile) -> dict[str, str]:
    rels_xml = z.read("word/_rels/document.xml.rels")
    root = ET.fromstring(rels_xml)
    out: dict[str, str] = {}
    for rel in root:
        rid = rel.get("Id")
        target = rel.get("Target")
        if rid and target:
            out[rid] = target
    return out


def extract_paragraphs(z: zipfile.ZipFile) -> list[tuple[str, str | None]]:
    """Return list of (text, hyperlink_url_or_None)."""
    rels = load_rels(z)
    root = ET.fromstring(z.read("word/document.xml"))
    rows: list[tuple[str, str | None]] = []
    for p in root.iter(f"{W}p"):
        text = paragraph_text(p)
        if not text:
            continue
        href: str | None = None
        for hl in p.iter(f"{W}hyperlink"):
            rid = hl.get(f"{R}id")
            if rid and rid in rels:
                target = rels[rid]
                if target.startswith("http") or target.startswith("/"):
                    href = target
                    break
        rows.append((text, href))
    return rows


ENTRY_RE = re.compile(r"^(\d{2})\s+(.+)$")
# Doc uses en-dash / em-dash / bullet-like separators between Type and Key details
PROPS_SPLIT_RE = re.compile(
    r"Type:\s*(.+?)\s*(?:[\u2013\u2014\u00b7\u2022\-–—]|)\s*Key details:\s*(.+)$",
    re.I,
)


def parse_entries(rows: list[tuple[str, str | None]]) -> list[dict]:
    entries: list[dict] = []
    current: dict | None = None
    research_href: str | None = None

    def flush():
        nonlocal current, research_href
        if not current:
            return
        name = current["name"]
        # Skip TOC/intro false positives (e.g. "59 product entries for…")
        if name not in NAME_TO_PRODUCT_SLUG or not current.get("description"):
            current = None
            research_href = None
            return
        product_slug = NAME_TO_PRODUCT_SLUG.get(name)
        research_slug = NAME_TO_RESEARCH_SLUG.get(name)
        if research_href:
            m = re.search(r"/research/compounds/([^/?#]+)", research_href)
            if m:
                research_slug = m.group(1)
        current["productSlug"] = product_slug
        current["researchSlug"] = research_slug
        current["researchHref"] = (
            f"/research/compounds/{research_slug}" if research_slug else None
        )
        prep = current.get("preparation", "").strip()
        storage = current.get(
            "storage",
            "Follow the product label for storage before and after preparation.",
        )
        current["labPreparation"] = (
            f"## Preparation Summary\n\n{prep}\n\n## Storage\n\n{storage}"
        )
        props_raw = re.sub(r"[\u2013\u2014\u00b7\u2022]+", " - ", current.get("propertiesRaw", ""))
        type_val = ""
        key_details = ""
        pm = re.search(
            r"Type:\s*(.+?)\s*-\s*Key details:\s*(.+)$",
            props_raw,
            re.I,
        )
        if pm:
            type_val = pm.group(1).strip()
            key_details = pm.group(2).strip()
        else:
            km = re.search(r"Key details:\s*(.+)$", props_raw, re.I)
            tm = re.search(r"Type:\s*(.+)$", props_raw, re.I)
            if km:
                key_details = km.group(1).strip()
            if tm:
                type_val = re.split(r"Key details:", tm.group(1), flags=re.I)[0].strip(" \t\u2013\u2014\u00b7\u2022-–—")
        current["properties"] = []
        if type_val:
            current["properties"].append({"label": "Type", "value": type_val})
        if key_details:
            current["properties"].append({"label": "Key details", "value": key_details})
        for k in ("propertiesRaw", "storage", "proposedStorage"):
            current.pop(k, None)
        entries.append(current)
        current = None
        research_href = None

    for text, href in rows:
        m = ENTRY_RE.match(text)
        if m:
            flush()
            current = {
                "number": int(m.group(1)),
                "name": m.group(2).strip(),
                "description": "",
                "propertiesRaw": "",
                "preparation": "",
                "storage": "",
                "proposedStorage": "",
                "overview": "",
            }
            continue
        if not current:
            continue
        if text.startswith("DESCRIPTION "):
            current["description"] = text[len("DESCRIPTION ") :].strip()
        elif text.startswith("PROPERTIES "):
            current["propertiesRaw"] = text[len("PROPERTIES ") :].strip()
        elif text.startswith("PREPARATION "):
            current["preparation"] = text[len("PREPARATION ") :].strip()
        elif text.startswith("Storage:"):
            current["storage"] = text[len("Storage:") :].strip()
        elif text.lower().startswith("proposed storage"):
            current["proposedStorage"] = text
        elif text.startswith("OVERVIEW "):
            current["overview"] = text[len("OVERVIEW ") :].strip()
        elif text.strip().upper() == "RESEARCH OVERVIEW":
            research_href = href
    flush()
    return entries


def main() -> None:
    with zipfile.ZipFile(DOCX) as z:
        rows = extract_paragraphs(z)
    entries = parse_entries(rows)
    entries.sort(key=lambda e: e.get("number", 0))
    by_slug = {e["productSlug"]: e for e in entries if e.get("productSlug")}
    ordered = sorted(by_slug.values(), key=lambda e: e.get("number", 0))

    OUT_JSON.write_text(json.dumps({"entries": ordered}, ensure_ascii=False, indent=2), encoding="utf-8")

    # Emit TypeScript module
    ts = f"""/**
 * PEPLAB short product copy - generated from PEPLAB-Short-Product-Copy.docx
 * Do not publish proposed lyophilised-storage wording until SKU docs verify it.
 * Regenerated by: python scripts/parse-short-product-copy.py
 */

import {{ resolveProductSlug }} from '@/lib/product-slug-aliases';

export type ShortProductProperty = {{ label: string; value: string }};

export type ShortProductCopy = {{
  number: number;
  name: string;
  productSlug: string;
  description: string;
  properties: ShortProductProperty[];
  preparation: string;
  overview: string;
  labPreparation: string;
  researchSlug: string | null;
  researchHref: string | null;
}};

export const PEPLAB_SHORT_PRODUCT_COPY: ShortProductCopy[] = {json.dumps(ordered, ensure_ascii=False, indent=2)};

const BY_SLUG: Record<string, ShortProductCopy> = Object.fromEntries(
  PEPLAB_SHORT_PRODUCT_COPY.map((entry) => [entry.productSlug, entry]),
);

/** Resolve short copy for a storefront product slug (aliases → canonical slug). */
export function getShortProductCopy(productSlug: string | null | undefined): ShortProductCopy | undefined {{
  if (!productSlug) return undefined;
  const candidates = [productSlug, resolveProductSlug(productSlug)];
  for (const slug of candidates) {{
    if (BY_SLUG[slug]) return BY_SLUG[slug];
  }}
  const lower = resolveProductSlug(productSlug).toLowerCase();
  return Object.values(BY_SLUG).find((e) => e.productSlug.toLowerCase() === lower);
}}
"""
    OUT_TS.write_text(ts, encoding="utf-8")
    print(f"Wrote {len(entries)} entries ({len(by_slug)} with productSlug) to {OUT_TS.name}")
    missing = [e["name"] for e in entries if not e.get("productSlug")]
    if missing:
        print("Missing productSlug:", ", ".join(missing))


if __name__ == "__main__":
    main()
