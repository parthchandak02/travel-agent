#!/usr/bin/env node
/**
 * Fill empty day_plans[].days[] from a per-trip fills file.
 *
 * Usage: node fill-day-plans.mjs <trip-explorer.json> [day-plan-fills.json]
 *
 * The fills file defaults to day-plan-fills.json next to the trip JSON. Shape:
 *   {
 *     "group_message": "optional override",
 *     "meta": { "chosen_plan_id": "plan-a" },           // optional meta overrides
 *     "plans": { "<option id>": { "<plan id>": [ <day>, ... ] } }
 *   }
 * See examples/fictional-trip/day-plan-fills.json. Only empty plans are filled.
 */
import fs from 'fs';
import path from 'path';

const jsonPath = process.argv[2];
if (!jsonPath) {
  console.error('Usage: node fill-day-plans.mjs <trip-explorer.json> [day-plan-fills.json]');
  process.exit(1);
}
const fillsPath = process.argv[3] || path.join(path.dirname(jsonPath), 'day-plan-fills.json');
const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
const fills = fs.existsSync(fillsPath) ? JSON.parse(fs.readFileSync(fillsPath, 'utf8')) : {};
const plans = fills.plans || {};

let filled = 0;
for (const opt of data.options || []) {
  const pack = plans[opt.id];
  if (!pack) continue;
  for (const plan of opt.day_plans || []) {
    if ((plan.days || []).length) continue;
    if (pack[plan.id]) {
      plan.days = pack[plan.id];
      filled++;
    }
  }
}

if (fills.group_message && data.group_message !== undefined) {
  data.group_message = fills.group_message;
}

if (data.meta) {
  data.meta.chosen_option_id = data.meta.chosen_option_id || data.meta.recommended_option_id;
  data.meta.chosen_plan_id = data.meta.chosen_plan_id || 'plan-a';
  data.meta.trip_map_url = data.meta.trip_map_url || 'trip-map.html';
  Object.assign(data.meta, fills.meta || {});
}

fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2));
console.log(`Filled ${filled} empty day plans in ${jsonPath}` + (fs.existsSync(fillsPath) ? '' : ' (no fills file)'));
