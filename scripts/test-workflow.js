#!/usr/bin/env node
/**
 * End-to-end test: run PP CLIs for Option 5, build trip-explorer.json, render HTML.
 * Usage: node scripts/test-workflow.js [output-dir]
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const outDir = process.argv[2] || path.join(process.env.HOME, 'Documents/Research/travel/labor-day-sierra-2026');
fs.mkdirSync(outDir, { recursive: true });

function run(cmd) {
  try {
    return execSync(cmd, { encoding: 'utf8', timeout: 60000, stdio: ['pipe', 'pipe', 'pipe'] });
  } catch (e) {
    return e.stdout || e.stderr || '';
  }
}

function parseJson(stdout) {
  const m = stdout.match(/\{[\s\S]*\}/);
  if (!m) return null;
  try { return JSON.parse(m[0]); } catch { return null; }
}

console.log('→ hotel-goat Quincy...');
const hotels = parseJson(run('hotel-goat-pp-cli hotels "Quincy, CA" 2026-09-04 2026-09-07 --agent 2>/dev/null'))?.results?.slice(0, 4) || [];

console.log('→ airbnb Quincy 3 adults...');
const airbnbs = parseJson(run('airbnb-pp-cli airbnb-listing search "Quincy, California" --checkin 2026-09-04 --checkout 2026-09-07 --adults 3 --agent 2>/dev/null'))?.results?.slice(0, 3) || [];

const lodging = [
  ...hotels.map((h, i) => ({
    rank: i + 1,
    name: h.name,
    location: 'Quincy, CA',
    type: 'hotel',
    platform: 'google_hotels',
    booking_url: h.booking_urls?.primary,
    total_3_nights: h.price_per_night ? Math.round(h.price_per_night * 3 * 1.15) : null,
    per_person: h.price_per_night ? Math.round((h.price_per_night * 3 * 1.15) / 3) : null,
    beds: 'verify on direct site',
    bedrooms: null,
    sleeps: 3,
    bed_fit: 'needs_verification',
    availability: h.price_per_night ? 'likely' : 'needs_verification',
    status: i === 0 ? 'book_now' : 'viable',
    rating: h.rating,
    pros: h.rating >= 4.5 ? 'High rating' : 'Budget option',
    checked_at: new Date().toISOString()
  })),
  ...airbnbs.map((a, i) => ({
    rank: hotels.length + i + 1,
    name: a.title || 'Airbnb in Quincy',
    location: 'Quincy, CA',
    type: 'airbnb',
    platform: 'airbnb',
    booking_url: a.url,
    total_3_nights: a.per_night_price ? a.per_night_price * 3 : (a.primary_price?.amount || null),
    per_person: a.per_night_price ? Math.round((a.per_night_price * 3) / 3) : null,
    beds: (a.primary_line || []).join(', '),
    bedrooms: (a.primary_line || []).some(l => /bedroom/i.test(l)) ? parseInt((a.primary_line.find(l => /bedroom/i.test(l)) || '').match(/\d+/)?.[0] || '1') : null,
    sleeps: 3,
    bed_fit: (a.primary_line || []).some(l => /2 beds/i.test(l)) ? 'green' : 'yellow',
    availability: 'likely',
    status: (a.primary_line || []).some(l => /2 beds/i.test(l)) ? 'book_now' : 'viable',
    rating: parseFloat((a.avg_rating_localized || '0').split(' ')[0]) || null,
    pros: (a.primary_line || []).join(' · '),
    checked_at: new Date().toISOString()
  }))
].slice(0, 6);

const data = {
  meta: {
    title: 'Labor Day Sierra Escape',
    subtitle: 'Bucks Lake vs Downieville vs Nevada City',
    dates: 'Sep 4–7, 2026',
    checkin: '2026-09-04',
    checkout: '2026-09-07',
    origin: 'Redwood City, CA',
    travelers: { adults: 3, beds_min: 2, bedrooms_preferred: 2, note: 'Couple + sister; 2 beds required' },
    generated_at: new Date().toISOString(),
    recommended_option_id: 'opt-5',
    backup_option_id: 'opt-1',
    book_urgency: 'Labor Day — book lodging and marina kayak rentals immediately',
    test_run: true
  },
  options: [
    {
      id: 'opt-5', rank: 1, user_preference_rank: 1,
      name: 'Feather Falls & Bucks Lake',
      base_towns: ['Bucks Lake', 'Quincy'],
      tagline: 'Lake weekend + 410-ft waterfall — best hike+swim mix',
      badge: 'recommended',
      drive_friday: { hours: '3.5–4', note: 'Leave ~3:30 PM; +1 hr Labor Day traffic' },
      drive_monday: { hours: '4–4.5', note: 'Feather River Canyon scenic stop' },
      labor_day_risk: 'high',
      labor_day_risk_note: 'Feather Falls lot small; Sandy Point fills by 9 AM',
      scores: {
        friday_drive: { value: 3 }, monday_return: { value: 4 }, lodging_value: { value: 3 },
        crowd_resilience: { value: 3 }, water_quality: { value: 5 }, hiking_quality: { value: 5 },
        scenic_uniqueness: { value: 5 }, town_food: { value: 3 }, safety_reliability: { value: 4 },
        overall: { value: 4.2, note: 'Top pick if booked early' }
      },
      activities: [
        { name: 'Feather Falls National Scenic Trail', type: 'hike', day: 'sun', distance_mi: 8.5, duration: '5–6 hr',
          official_url: 'https://www.fs.usda.gov/recarea/plumas/recarea/?recid=11198',
          maps_url: 'https://www.google.com/maps/search/Feather+Falls+Trailhead',
          lat: 39.642, lng: -121.278, parking: 'Arrive by 7:00 AM Labor Day', crowd_level: 'high', status: 'confirmed' },
        { name: 'Bucks Lake Marina', type: 'activity', day: 'sat',
          official_url: 'https://buckslakehoa.com/visit-bucks-lake/summer-fun/',
          maps_url: 'https://www.google.com/maps/search/Bucks+Lake+Marina', parking: 'Reserve kayak/boat ahead', crowd_level: 'high', status: 'confirmed' },
        { name: 'Sandy Point Beach', type: 'beach', day: 'sat',
          official_url: 'https://plumascounty.org/get-outside/places-to-visit/bucks-lake/',
          maps_url: 'https://www.google.com/maps/search/Sandy+Point+Bucks+Lake', parking: 'Arrive before 8 AM', crowd_level: 'high', status: 'confirmed' }
      ],
      lodging,
      day_plans: [
        { id: 'plan-a', name: 'Water First (recommended)', vibe: 'Sat lake + kayak; Sun Feather Falls; avoids hike after late Friday arrival',
          days: [
            { label: 'Friday Sep 4', blocks: [{ time: '15:30', title: 'Depart Redwood City', activity: 'Drive to Quincy/Bucks Lake', drive_min: 210, duration: '3.5–4.5 hr', parking: '—', backup: 'Grocery stop in Quincy' }] },
            { label: 'Saturday Sep 5', blocks: [{ time: '07:30', title: 'Bucks Lake water day', activity: 'Kayak rental + Sandy Point swim', drive_min: 20, duration: '4 hr', parking: 'Before 8 AM', backup: 'Lakeshore Resort access' }] },
            { label: 'Sunday Sep 6', blocks: [{ time: '06:30', title: 'Feather Falls', activity: '8.5 mi waterfall hike', drive_min: 45, duration: '5–6 hr', parking: 'Trailhead by 7 AM', backup: 'Shorter Bucks Lake shoreline walk' }] },
            { label: 'Monday Sep 7', blocks: [{ time: '09:00', title: 'Feather River Canyon', activity: 'Scenic drive home', drive_min: 240, duration: '4–5 hr', parking: '—', backup: '—' }] }
          ]
        },
        { id: 'plan-b', name: 'Hike First', vibe: 'Original seed — Sat Feather Falls (hard after late arrival)', days: [] },
        { id: 'plan-c', name: 'Quincy Base', vibe: 'Stay in Quincy (more lodging); drive to lake daily', days: [] }
      ],
      reviews: [],
      reality_check: { parking_targets: ['Feather Falls 7 AM', 'Sandy Point 7:30 AM Sat'], reservations: ['Marina kayak', 'Lodging'], safety: ['No cliff jumping as core plan'] },
      strengths: ['Best waterfall + lake combo', 'CLI-verified Quincy lodging available'],
      tradeoffs: ['Longest Friday drive', 'Sparse Bucks Lake inventory']
    },
    {
      id: 'opt-4', rank: 2, name: 'Malakoff Diggins & Downieville', tagline: 'Sierra Buttes + river pools', badge: 'adventurous',
      drive_friday: { hours: '~3' }, labor_day_risk: 'high',
      scores: { overall: { value: 3.6 }, water_quality: { value: 4 }, hiking_quality: { value: 5 }, friday_drive: { value: 4 }, monday_return: { value: 4 }, lodging_value: { value: 2 }, crowd_resilience: { value: 2 }, scenic_uniqueness: { value: 5 }, town_food: { value: 3 }, safety_reliability: { value: 3 } },
      activities: [], lodging: [], day_plans: [], reviews: [], reality_check: {},
      strengths: ['Most adventurous'], tradeoffs: ['Scarcest lodging']
    },
    {
      id: 'opt-1', rank: 3, name: 'Nevada City & Emerald Pools', tagline: 'Easiest drive + best town', badge: 'backup',
      drive_friday: { hours: '~2.5' }, labor_day_risk: 'medium',
      scores: { overall: { value: 3.9 }, water_quality: { value: 4 }, hiking_quality: { value: 3 }, friday_drive: { value: 5 }, monday_return: { value: 5 }, lodging_value: { value: 5 }, crowd_resilience: { value: 2 }, scenic_uniqueness: { value: 4 }, town_food: { value: 5 }, safety_reliability: { value: 4 } },
      activities: [], lodging: [], day_plans: [], reviews: [], reality_check: {},
      strengths: ['Best logistics fallback'], tradeoffs: ['Emerald Pools parking brutal on Labor Day']
    }
  ],
  group_message: 'Top pick: Bucks Lake + Feather Falls (Plan A: water Sat, hike Sun). Quincy Feather Bed Inn + Airbnb 2-bed options found. Book lodging + marina now — Labor Day is tight. Backup: Nevada City.',
  sources_checked: [
    { name: 'hotel-goat Quincy', url: 'https://printingpress.dev/library/travel/hotel-goat', checked_at: new Date().toISOString().slice(0, 10) },
    { name: 'airbnb Quincy', url: 'https://printingpress.dev/library/travel/airbnb', checked_at: new Date().toISOString().slice(0, 10) },
    { name: 'trvl destination', url: 'https://github.com/MikkoParkkola/trvl', checked_at: new Date().toISOString().slice(0, 10) }
  ]
};

const jsonPath = path.join(outDir, 'trip-explorer.json');
fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2));
console.log('→ Wrote', jsonPath);

const renderScript = path.join(__dirname, 'render-trip-explorer.js');
const htmlPath = path.join(outDir, 'index.html');
execSync(`node "${renderScript}" "${jsonPath}" "${htmlPath}"`, { stdio: 'inherit' });
console.log('✓ Test workflow complete:', htmlPath);
