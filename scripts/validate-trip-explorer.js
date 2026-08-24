#!/usr/bin/env node
/**
 * Validate trip-explorer.json against product success criteria.
 * Usage: node validate-trip-explorer.js <trip-explorer.json>
 * Exit 0 if pass (warnings ok); exit 1 if errors.
 */
const fs = require('fs');

const path = process.argv[2];
if (!path) {
  console.error('Usage: node validate-trip-explorer.js <trip-explorer.json>');
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(path, 'utf8'));
const errors = [];
const warnings = [];

const opts = data.options || [];
const m = data.meta || {};

// Meta
if (!m.origin) errors.push('meta.origin missing');
if (!m.dates && !(m.checkin && m.checkout)) warnings.push('meta.dates or checkin/checkout recommended');
if (!m.depart_at) warnings.push('meta.depart_at recommended (start datetime for drive scoring)');
if (!m.return_at) warnings.push('meta.return_at recommended (end datetime)');
if (m.book_urgency) warnings.push('meta.book_urgency set — omit unless user asked for booking banner');

// Option count
if (opts.length < 2) errors.push(`need 2–5 options, got ${opts.length}`);
if (opts.length > 5) warnings.push(`more than 5 options (${opts.length}) — consider trimming`);

for (const o of opts) {
  const label = o.id || o.name || '?';

  if (!o.scores?.overall?.value) warnings.push(`${label}: scores.overall missing`);
  if (!o.drive_friday?.hours) warnings.push(`${label}: drive_friday.hours missing`);
  if (!o.drive_monday?.hours) warnings.push(`${label}: drive_monday.hours missing`);

  const lodges = o.lodging || [];
  if (lodges.length < 4) errors.push(`${label}: need 4+ lodging, got ${lodges.length}`);
  else if (!lodges.some(l => l.bed_fit)) warnings.push(`${label}: lodging missing bed_fit on some rows`);

  const acts = o.activities || [];
  if (acts.length < 3) errors.push(`${label}: need 3+ activities, got ${acts.length}`);
  for (const a of acts) {
    if (!a.official_url && !a.maps_url) warnings.push(`${label}: activity "${a.name}" missing URLs`);
    if (typeof a.lat !== 'number') warnings.push(`${label}: activity "${a.name}" missing lat/lng`);
  }

  const reviews = o.reviews || [];
  if (reviews.length < 2) warnings.push(`${label}: need 2+ reviews, got ${reviews.length}`);

  const plans = o.day_plans || [];
  if (plans.length < 2) warnings.push(`${label}: recommend 3 day_plans, got ${plans.length}`);
  const filled = plans.filter(p => (p.days || []).length > 0);
  if (filled.length < 1) errors.push(`${label}: at least one day_plan must have days[]`);
  if (filled.length < plans.length) warnings.push(`${label}: ${plans.length - filled.length} plan(s) still empty`);

  if (!o.hero_image) warnings.push(`${label}: hero_image missing`);
  if (!o.tradeoffs?.length) warnings.push(`${label}: tradeoffs[] empty — compare table needs "the catch"`);
}

if (data.group_message && data.group_message.length > 900) {
  warnings.push('group_message very long — keep under ~180 words');
}

console.log(`Validated: ${path}`);
console.log(`  Options: ${opts.length}`);
console.log(`  Errors: ${errors.length}`);
console.log(`  Warnings: ${warnings.length}`);
if (errors.length) {
  errors.forEach(e => console.log('  ✗', e));
}
if (warnings.length) {
  warnings.forEach(w => console.log('  ⚠', w));
}

if (errors.length) {
  console.log('\nFAIL — fix errors before publish');
  process.exit(1);
}
console.log('\nPASS' + (warnings.length ? ' (with warnings)' : ''));
process.exit(0);
