#!/usr/bin/env node
/**
 * Add hero_image, gallery, and activity/lodging/day images to trip-explorer.json
 * from a per-trip image map.
 *
 * Usage: node enrich-images.mjs <trip-explorer.json> [images.json]
 *
 * The image map defaults to images.json next to the trip JSON. Shape (keyed by option id):
 *   {
 *     "<option id>": {
 *       "hero": "https://...", "hero_credit": "...",
 *       "gallery": [ { "url": "https://...", "caption": "..." } ],
 *       "acts":   { "<activity name substring>": "https://..." },
 *       "lodge":  "https://... (fallback lodging image)",
 *       "lodges": { "<lodging name substring>": "https://..." }
 *     }
 *   }
 * See examples/fictional-trip/images.json. Existing images are never overwritten,
 * except hero/gallery, which the map sets when present.
 */
import fs from 'fs';
import path from 'path';

const jsonPath = process.argv[2];
if (!jsonPath) {
  console.error('Usage: node enrich-images.mjs <trip-explorer.json> [images.json]');
  process.exit(1);
}
const imagesPath = process.argv[3] || path.join(path.dirname(jsonPath), 'images.json');
if (!fs.existsSync(imagesPath)) {
  console.log(`No image map at ${imagesPath} — skipping enrichment`);
  process.exit(0);
}
const IMG = JSON.parse(fs.readFileSync(imagesPath, 'utf8'));
const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

function matchKey(name, map) {
  const n = (name || '').toLowerCase();
  for (const [k, url] of Object.entries(map || {})) {
    if (n.includes(k.toLowerCase())) return url;
  }
  return null;
}

for (const opt of data.options || []) {
  const pack = IMG[opt.id];
  if (!pack) continue;
  if (pack.hero) opt.hero_image = pack.hero;
  if (pack.hero_credit) opt.hero_credit = pack.hero_credit;
  if (pack.gallery) opt.gallery = pack.gallery;
  for (const a of opt.activities || []) {
    a.image = a.image || matchKey(a.name, pack.acts);
  }
  for (const l of opt.lodging || []) {
    l.image = l.image || matchKey(l.name, pack.lodges) || pack.lodge || null;
  }
  for (const plan of opt.day_plans || []) {
    for (const day of plan.days || []) {
      const first = (day.blocks || [])[0];
      if (first && !day.image) {
        day.image = matchKey(first.title || first.activity || '', pack.acts) || pack.hero || null;
      }
    }
  }
}

fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2));
console.log('Enriched images in', jsonPath);
