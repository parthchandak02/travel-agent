#!/usr/bin/env node
/**
 * Convert trip-explorer.json (chosen option + plan) → TripKit YAML
 */
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const jsonPath = args.find(a => !a.startsWith('--'));
if (!jsonPath) process.exit(1);
const optFlag = args.indexOf('--option');
const planFlag = args.indexOf('--plan');
const outPath = args.find((a, i) => !a.startsWith('--') && i > 0 && a.endsWith('.yaml')) || path.join(path.dirname(jsonPath), 'trip.yaml');

const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
const optId = optFlag >= 0 ? args[optFlag + 1] : (data.meta?.chosen_option_id || data.meta?.recommended_option_id);
const planId = planFlag >= 0 ? args[planFlag + 1] : (data.meta?.chosen_plan_id || 'plan-a');

const opt = (data.options || []).find(o => o.id === optId);
const plan = (opt?.day_plans || []).find(p => p.id === planId) || opt?.day_plans?.[0];
if (!opt || !plan) { console.error('Missing option/plan'); process.exit(1); }

const lodge = (opt.lodging || []).find(l => l.rank === 1);
const colors = ['#2e7db5', '#1b5e3b', '#c44b25', '#5b44b0'];
const typeMap = { hike: 'hike', swim: 'activity', beach: 'beach', activity: 'activity', town: 'city', historic: 'museum' };

function q(s) { return JSON.stringify(String(s)); }
function findAct(title) {
  const t = (title || '').toLowerCase();
  return (opt.activities || []).find(a => t.includes(a.name.toLowerCase().slice(0, 10)) || a.name.toLowerCase().includes(t.slice(0, 10)));
}

const dayBlocks = (plan.days || []).map((d, i) => {
  const blocks = d.blocks || [];
  const driveMin = blocks.reduce((s, b) => s + (Number(b.drive_min) || 0), 0);
  const stops = blocks.filter(b => b.title && !/depart|return|arrive|drive home|scenic drive/i.test(b.title)).map(b => {
    const act = findAct(b.title);
    if (!act?.lat) return null;
    return { act, b };
  }).filter(Boolean);

  let yaml = `  - number: ${i + 1}\n    title: ${q(d.label)}\n    date: ${q(d.label)}\n    status: upcoming\n    color: ${colors[i % colors.length]}\n    summary:\n      drive: ${q(driveMin ? `~${Math.round(driveMin / 60 * 10) / 10} hr` : '—')}\n      hike: ${q(stops.find(s => s.act.type === 'hike')?.b.duration || '—')}\n      miles: "—"`;
  if (lodge) {
    yaml += `\n    lodging:\n      name: ${q(lodge.name)}\n      location: ${q(lodge.location || '')}\n      price_estimate: ${q(lodge.total_3_nights ? `~$${Math.round(lodge.total_3_nights / 3)}/night` : '')}\n      booked: false\n      notes: ${q(lodge.pros || '')}\n      navigate_url: ${q(lodge.booking_url || '')}`;
  }
  const tips = blocks.map(b => b.backup).filter(b => b && b !== '—');
  if (tips.length) yaml += `\n    tips:\n${tips.map(t => `      - ${q(t)}`).join('\n')}`;
  yaml += '\n    stops:\n';
  if (!stops.length) yaml += '      []\n';
  else {
    for (const { act, b } of stops) {
      yaml += `      - name: ${q(b.title)}\n        lat: ${act.lat}\n        lng: ${act.lng}\n        type: ${typeMap[act.type] || 'activity'}\n        label: ${q(act.type || 'Stop')}\n        description: ${q(b.activity || act.name)}\n        duration: ${q(b.duration || act.duration || '')}\n        image: ${q(act.image || d.image || '')}\n        navigate_url: ${q(b.maps_url || act.maps_url || '')}\n`;
      if (b.parking && b.parking !== '—') yaml += `        parking_fee: ${q(b.parking)}\n`;
    }
  }
  return yaml;
}).join('\n');

const m = data.meta || {};
const out = `trip:
  title: ${q(`${m.title || opt.name} — ${plan.name}`)}
  subtitle: ${q(opt.tagline || '')}
  dates: ${q(m.dates || '')}
  total_days: ${(plan.days || []).length}
  total_miles: "—"
  total_stops: ${(plan.days || []).reduce((n, d) => n + (d.blocks || []).filter(b => b.title && !/depart|return|arrive|drive home|scenic drive/i.test(b.title)).length, 0)}
  travelers:
    adults: ${m.travelers?.adults || 3}
    children: 0
  origin: ${q(m.origin || '')}
  origin_lat: ${m.origin_lat || 37.4852}
  origin_lng: ${m.origin_lng || -122.2364}
  vehicle: ${q(m.vehicle || 'sedan')}
days:
${dayBlocks}`;

fs.writeFileSync(outPath, out);
console.log('Wrote', outPath, `(${optId} / ${plan.id})`);
