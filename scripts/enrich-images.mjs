#!/usr/bin/env node
/** Add hero_image, gallery, and activity images to trip-explorer.json */
import fs from 'fs';
import path from 'path';

const IMG = {
  'opt-5': {
    hero: 'https://plumascounty.org/wp-content/uploads/2022/05/bucks-lake-hero-image.jpg',
    hero_credit: 'Plumas County Tourism',
    gallery: [
      { url: 'https://plumascounty.org/wp-content/uploads/2022/05/bucks-lake-hero-image.jpg', caption: 'Bucks Lake at 5,200 ft' },
      { url: 'https://pub-914f467f2aa4493eb491250fcc951590.r2.dev/waterfalls/5753/0.jpg', caption: 'Feather Falls — 410 ft' },
      { url: 'https://plumascounty.org/wp-content/uploads/2022/05/young-girl-jumping-into-bucks-lake.jpg', caption: 'Swimming at Bucks Lake' },
      { url: 'https://plumascounty.org/wp-content/uploads/2022/06/Belden-Town-Hero-Imaage.jpg', caption: 'Feather River Canyon (Monday drive)' },
    ],
    acts: {
      'Feather Falls': 'https://pub-914f467f2aa4493eb491250fcc951590.r2.dev/waterfalls/5753/0.jpg',
      'Bucks Lake': 'https://plumascounty.org/wp-content/uploads/2022/05/young-girl-jumping-into-bucks-lake.jpg',
      'Sandy Point': 'https://plumascounty.org/wp-content/uploads/2022/05/bucks-lake-hero-image.jpg',
      'Marina': 'https://plumascounty.org/wp-content/uploads/2022/05/bucks-lake-hero-image.jpg',
      'Mill Creek': 'https://plumascounty.org/wp-content/uploads/2022/05/bucks-lake-hero-image.jpg',
      'Feather River': 'https://plumascounty.org/wp-content/uploads/2022/06/Belden-Historic-Bridge.jpg',
    },
    lodge: 'https://images.unsplash.com/photo-1449158743715-0acffed1da56?w=400',
    lodges: {
      'Bucks Lake Marina': 'https://plumascounty.org/wp-content/uploads/2022/05/bucks-lake-hero-image.jpg',
      'Quincy Feather': 'https://www.quincyfeatherbed.com/wp-content/uploads/2019/05/Quincy-Feather-Bed-Inn-Exterior.jpg',
      'Gold Pan': 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400',
      'Airbnb': 'https://plumascounty.org/wp-content/uploads/2022/05/bucks-lake-hero-image.jpg',
    },
  },
  'opt-4': {
    hero: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Hike_to_the_top_of_the_Sierra_Buttes.jpg/960px-Hike_to_the_top_of_the_Sierra_Buttes.jpg',
    hero_credit: 'Wikimedia Commons',
    gallery: [
      { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/A_hiker_descends_the_stairs_used_to_access_the_Sierra_Buttes_fire_lookout%2C_Sept_28%2C_2024%2C_on_the_Tahoe_National_Forest_%2820240928-FS-PRW-001%29.jpg/960px-A_hiker_descends_the_stairs_used_to_access_the_Sierra_Buttes_fire_lookout%2C_Sept_28%2C_2024%2C_on_the_Tahoe_National_Forest_%2820240928-FS-PRW-001%29.jpg', caption: 'Sierra Buttes fire lookout stairs' },
      { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Hike_to_the_top_of_the_Sierra_Buttes.jpg/960px-Hike_to_the_top_of_the_Sierra_Buttes.jpg', caption: 'Summit views' },
      { url: 'https://www.parks.ca.gov/pages/494/images/P0066542.JPG', caption: 'Malakoff Diggins hydraulic mine' },
      { url: 'https://gonevadacounty.com/wp-content/uploads/2025/09/Emerald_Pools_Color-1024x683.jpg', caption: 'North Yuba river pools (similar vibe)' },
    ],
    acts: {
      'Malakoff': 'https://www.parks.ca.gov/pages/494/images/P0066542.JPG',
      'Blair Lake': 'https://www.parks.ca.gov/pages/494/images/P0066542.JPG',
      'Sierra Buttes': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/A_hiker_descends_the_stairs_used_to_access_the_Sierra_Buttes_fire_lookout%2C_Sept_28%2C_2024%2C_on_the_Tahoe_National_Forest_%2820240928-FS-PRW-001%29.jpg/960px-A_hiker_descends_the_stairs_used_to_access_the_Sierra_Buttes_fire_lookout%2C_Sept_28%2C_2024%2C_on_the_Tahoe_National_Forest_%2820240928-FS-PRW-001%29.jpg',
      'Yuba': 'https://gonevadacounty.com/wp-content/uploads/2025/09/Emerald_Pools_Color-1024x683.jpg',
      'Downieville': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
    },
    lodge: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3a4?w=400',
    lodges: {
      'Buttes Resort': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Hike_to_the_top_of_the_Sierra_Buttes.jpg/960px-Hike_to_the_top_of_the_Sierra_Buttes.jpg',
      'Yuba River Inn': 'https://gonevadacounty.com/wp-content/uploads/2025/09/Emerald_Pools_Color-1024x683.jpg',
      'Riverside': 'https://gonevadacounty.com/wp-content/uploads/2025/09/Emerald_Pools_Color-1024x683.jpg',
      'Shangri': 'https://images.unsplash.com/photo-1520250497591-112f2f40a3a4?w=400',
    },
  },
  'opt-1': {
    hero: 'https://gonevadacounty.com/wp-content/uploads/2025/09/Emerald_Pools_Color-1024x683.jpg',
    hero_credit: 'Go Nevada County',
    gallery: [
      { url: 'https://gonevadacounty.com/wp-content/uploads/2025/09/Emerald_Pools_Color-1024x683.jpg', caption: 'Emerald Pools / Yuba River' },
      { url: 'https://myhikes.org/images_uploads/Loch%20Levens%20Lakes%2Floch_levens_2_20170217223547UTC.jpg', caption: 'Loch Leven alpine lakes' },
      { url: 'https://images.unsplash.com/photo-1511593358241-7eea1f3c84e5?w=800', caption: 'Historic Nevada City' },
      { url: 'https://www.parks.ca.gov/pages/494/images/P0066542.JPG', caption: 'Malakoff Diggins (Monday)' },
    ],
    acts: {
      'Emerald Pools': 'https://gonevadacounty.com/wp-content/uploads/2025/09/Emerald_Pools_Color-1024x683.jpg',
      'Deer Creek': 'https://images.unsplash.com/photo-1511593358241-7eea1f3c84e5?w=800',
      'Loch Leven': 'https://myhikes.org/images_uploads/Loch%20Levens%20Lakes%2Floch_levens_2_20170217223547UTC.jpg',
      'Nevada City': 'https://images.unsplash.com/photo-1511593358241-7eea1f3c84e5?w=800',
      'Malakoff': 'https://www.parks.ca.gov/pages/494/images/P0066542.JPG',
      'South Yuba': 'https://gonevadacounty.com/wp-content/uploads/2025/09/Emerald_Pools_Color-1024x683.jpg',
    },
    lodge: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400',
    lodges: {
      'Nevada City Inn': 'https://gonevadacounty.com/wp-content/uploads/2025/09/Emerald_Pools_Color-1024x683.jpg',
      'Courtyard Suites': 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400',
      'Best Western': 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400',
      'Outside Inn': 'https://images.unsplash.com/photo-1511593358241-7eea1f3c84e5?w=800',
    },
  },
};

function matchLodge(name, lodges, fallback) {
  if (!lodges) return fallback;
  const n = name.toLowerCase();
  for (const [k, url] of Object.entries(lodges)) {
    if (n.includes(k.toLowerCase())) return url;
  }
  return fallback;
}

function matchAct(name, acts) {
  const n = name.toLowerCase();
  for (const [k, url] of Object.entries(acts)) {
    if (n.includes(k.toLowerCase())) return url;
  }
  return null;
}

const jsonPath = process.argv[2] || path.join(process.env.HOME, 'Documents/Research/travel/labor-day-sierra-2026/trip-explorer.json');
const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

for (const opt of data.options) {
  const pack = IMG[opt.id];
  if (!pack) continue;
  opt.hero_image = pack.hero;
  opt.hero_credit = pack.hero_credit;
  opt.gallery = pack.gallery;
  for (const a of opt.activities || []) {
    a.image = a.image || matchAct(a.name, pack.acts);
  }
  for (const l of opt.lodging || []) {
    l.image = l.image || matchLodge(l.name, pack.lodges, pack.lodge);
  }
  for (const plan of opt.day_plans || []) {
    for (const day of plan.days || []) {
      const first = (day.blocks || [])[0];
      if (first && !day.image) {
        day.image = matchAct(first.title || first.activity || '', pack.acts) || pack.hero;
      }
    }
  }
}

fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2));
console.log('Enriched images in', jsonPath);
