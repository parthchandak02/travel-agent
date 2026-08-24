#!/usr/bin/env node
/** Fill empty day_plans[].days[] with variant schedules from vibe + plan id. */
import fs from 'fs';

const path = process.argv[2];
if (!path) {
  console.error('Usage: node fill-day-plans.mjs <trip-explorer.json>');
  process.exit(1);
}
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

const FILLS = {
  'opt-5': {
    'plan-b': [
      { label: 'Friday Sep 4', image: 'https://plumascounty.org/wp-content/uploads/2022/05/bucks-lake-hero-image.jpg', blocks: [{ time: '15:30', title: 'Depart Redwood City', activity: 'Late arrival to Bucks Lake / Quincy', drive_min: 210, duration: '3.5–4.5 hr', parking: '—', backup: 'Grocery in Quincy' }] },
      { label: 'Saturday Sep 5', image: 'https://pub-914f467f2aa4493eb491250fcc951590.r2.dev/waterfalls/5753/0.jpg', blocks: [{ time: '06:00', title: 'Feather Falls', activity: '8.5 mi hike — tough after late Friday', drive_min: 45, duration: '5–6 hr', parking: 'Trailhead by 6:30 AM', backup: 'Mill Creek overlook only', official_url: 'https://www.fs.usda.gov/recarea/plumas/recarea/?recid=11198', maps_url: 'https://www.google.com/maps/search/Feather+Falls+Trailhead' }] },
      { label: 'Sunday Sep 6', image: 'https://plumascounty.org/wp-content/uploads/2022/05/young-girl-jumping-into-bucks-lake.jpg', blocks: [{ time: '08:00', title: 'Bucks Lake recovery day', activity: 'Kayak, swim, low-key shoreline', drive_min: 20, duration: '4 hr', parking: 'Before 9 AM', backup: 'Quincy Main Street lunch' }] },
      { label: 'Monday Sep 7', image: 'https://plumascounty.org/wp-content/uploads/2022/06/Belden-Historic-Bridge.jpg', blocks: [{ time: '09:00', title: 'Feather River Canyon', activity: 'Scenic drive home', drive_min: 240, duration: '4–5 hr', parking: '—', backup: '—' }] },
    ],
    'plan-c': [
      { label: 'Friday Sep 4', blocks: [{ time: '15:30', title: 'Arrive Quincy', activity: 'Check in downtown — more lodging options', drive_min: 210, duration: '3.5–4 hr', parking: '—', backup: '—' }] },
      { label: 'Saturday Sep 5', image: 'https://plumascounty.org/wp-content/uploads/2022/05/young-girl-jumping-into-bucks-lake.jpg', blocks: [{ time: '07:30', title: 'Bucks Lake day trip', activity: '45 min drive each way; Sandy Point + marina', drive_min: 45, duration: '5 hr on site', parking: 'Before 8 AM', backup: 'Lakeshore picnic' }] },
      { label: 'Sunday Sep 6', image: 'https://pub-914f467f2aa4493eb491250fcc951590.r2.dev/waterfalls/5753/0.jpg', blocks: [{ time: '06:30', title: 'Feather Falls', activity: 'Hike from Quincy base (extra drive)', drive_min: 60, duration: '5–6 hr', parking: '7 AM', backup: 'Spanish Creek trail' }] },
      { label: 'Monday Sep 7', blocks: [{ time: '09:00', title: 'Return to Bay Area', activity: 'Straight shot via Oroville / I-80', drive_min: 240, duration: '4–5 hr', parking: '—', backup: '—' }] },
    ],
  },
  'opt-4': {
    'plan-b': [
      { label: 'Friday Sep 4', blocks: [{ time: '15:30', title: 'Arrive Sierra City', activity: 'Shortest mountain drive; check in near Buttes trail', drive_min: 180, duration: '3–3.5 hr', parking: '—', backup: '—' }] },
      { label: 'Saturday Sep 5', image: 'https://gonevadacounty.com/wp-content/uploads/2025/09/Emerald_Pools_Color-1024x683.jpg', blocks: [{ time: '09:00', title: 'North Yuba swim', activity: 'Rocky Rest or Poole Bar — easy river day', drive_min: 25, duration: '3 hr', parking: 'Early', backup: 'Downieville stroll' }] },
      { label: 'Sunday Sep 6', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Hike_to_the_top_of_the_Sierra_Buttes.jpg/960px-Hike_to_the_top_of_the_Sierra_Buttes.jpg', blocks: [{ time: '06:30', title: 'Sierra Buttes', activity: '5.1 mi from nearby trailhead', drive_min: 15, duration: '3–4 hr', parking: '7 AM', backup: 'Packer Saddle viewpoint', maps_url: 'https://www.google.com/maps/search/Sierra+Buttes' }] },
      { label: 'Monday Sep 7', image: 'https://www.parks.ca.gov/pages/494/images/P0066542.JPG', blocks: [{ time: '09:00', title: 'Malakoff Diggins stop', activity: 'Historic mine on drive home', drive_min: 90, duration: '2 hr', parking: '$10', backup: 'Skip if tired', official_url: 'https://parks.ca.gov/MalakoffDiggins/' }] },
    ],
    'plan-c': [
      { label: 'Friday Sep 4', blocks: [{ time: '15:30', title: 'Arrive Downieville', activity: 'River town base on North Yuba', drive_min: 195, duration: '3–3.5 hr', parking: '—', backup: '—' }] },
      { label: 'Saturday Sep 5', image: 'https://gonevadacounty.com/wp-content/uploads/2025/09/Emerald_Pools_Color-1024x683.jpg', blocks: [{ time: '08:30', title: 'Yuba river day', activity: 'Swim holes + riverside lunch', drive_min: 20, duration: '4 hr', parking: 'Limited', backup: 'Indoor Downieville' }] },
      { label: 'Sunday Sep 6', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Hike_to_the_top_of_the_Sierra_Buttes.jpg/960px-Hike_to_the_top_of_the_Sierra_Buttes.jpg', blocks: [{ time: '07:00', title: 'Sierra Buttes (optional)', activity: 'Only if group has energy', drive_min: 45, duration: '3–4 hr', parking: '7 AM', backup: 'Blair Lake picnic' }] },
      { label: 'Monday Sep 7', blocks: [{ time: '09:00', title: 'Scenic return', activity: 'CA-49 south to Bay Area', drive_min: 210, duration: '3.5–4 hr', parking: '—', backup: '—' }] },
    ],
  },
  'opt-1': {
    'plan-b': [
      { label: 'Friday Sep 4', blocks: [{ time: '15:30', title: 'Arrive Nevada City', activity: 'Short drive; early dinner downtown', drive_min: 150, duration: '2.5–3 hr', parking: '—', backup: '—' }] },
      { label: 'Saturday Sep 5', image: 'https://gonevadacounty.com/wp-content/uploads/2025/09/Emerald_Pools_Color-1024x683.jpg', blocks: [{ time: '08:00', title: 'South Yuba shuttle', activity: '$2 shuttle Fri–Sun — skip parking fight', drive_min: 25, duration: '3 hr river', parking: 'Shuttle lot', backup: 'Deer Creek Tribute Trail', official_url: 'https://gonevadacounty.com/emerald-pools-yuba-river/' }] },
      { label: 'Sunday Sep 6', image: 'https://myhikes.org/images_uploads/Loch%20Levens%20Lakes%2Floch_levens_2_20170217223547UTC.jpg', blocks: [{ time: '06:30', title: 'Loch Leven Lakes', activity: 'Alpine hike + optional swim', drive_min: 60, duration: '4–5 hr', parking: '7 AM', backup: 'First lake only', maps_url: 'https://www.google.com/maps/search/Loch+Leven' }] },
      { label: 'Monday Sep 7', image: 'https://www.parks.ca.gov/pages/494/images/P0066542.JPG', blocks: [{ time: '09:00', title: 'Malakoff Diggins', activity: 'Historic park en route home', drive_min: 45, duration: '2 hr', parking: '$10', backup: 'Direct home', official_url: 'https://parks.ca.gov/MalakoffDiggins/' }] },
    ],
    'plan-c': [
      { label: 'Friday Sep 4', blocks: [{ time: '15:30', title: 'Arrive Grass Valley', activity: 'More chain hotels + suites inventory', drive_min: 150, duration: '2.5–3 hr', parking: '—', backup: '—' }] },
      { label: 'Saturday Sep 5', image: 'https://gonevadacounty.com/wp-content/uploads/2025/09/Emerald_Pools_Color-1024x683.jpg', blocks: [{ time: '06:30', title: 'Emerald Pools', activity: '35 min from GV; arrive before 7 AM', drive_min: 35, duration: '3 hr', parking: 'Two small lots', backup: 'Shuttle Plan B' }] },
      { label: 'Sunday Sep 6', image: 'https://images.unsplash.com/photo-1511593358241-7eea1f3c84e5?w=800', blocks: [{ time: '10:00', title: 'Nevada City + easy trail', activity: 'Deer Creek Tribute Trail + brunch', drive_min: 15, duration: '3 hr', parking: 'Downtown', backup: 'Winery loop' }] },
      { label: 'Monday Sep 7', blocks: [{ time: '09:00', title: 'Return home', activity: 'Short Monday drive', drive_min: 150, duration: '2.5–3 hr', parking: '—', backup: '—' }] },
    ],
  },
};

let filled = 0;
for (const opt of data.options || []) {
  const pack = FILLS[opt.id];
  if (!pack) continue;
  for (const plan of opt.day_plans || []) {
    if ((plan.days || []).length) continue;
    if (pack[plan.id]) {
      plan.days = pack[plan.id];
      filled++;
    }
  }
}

if (data.group_message) {
  data.group_message =
    'Three Sierra options for Labor Day — tap a card to compare. Top pick: Bucks Lake + Feather Falls (lake Saturday, waterfall Sunday). Easiest logistics: Nevada City. Most adventurous: Downieville / Sierra Buttes. Each option has 3 day-plan variants.';
}

if (data.meta) {
  data.meta.chosen_option_id = data.meta.chosen_option_id || data.meta.recommended_option_id;
  data.meta.chosen_plan_id = 'plan-a';
  data.meta.trip_map_url = 'trip-map.html';
}

fs.writeFileSync(path, JSON.stringify(data, null, 2));
console.log(`Filled ${filled} empty day plans in ${path}`);
