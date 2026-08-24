# Trip Explorer JSON Schema

Canonical data contract for multi-option HTML output. Parent agent merges subagent payloads into one file.

## Top-level shape

```json
{
  "meta": {
    "title": "Labor Day Sierra Escape",
    "subtitle": "Bucks Lake vs Downieville vs Nevada City",
    "dates": "Sep 4–7, 2026",
    "depart_at": "2026-09-04T15:30:00-07:00",
    "return_at": "2026-09-07T18:00:00-07:00",
    "checkin": "2026-09-04",
    "checkout": "2026-09-07",
    "origin": "Redwood City, CA",
    "origin_lat": 37.4852,
    "origin_lng": -122.2364,
    "travelers": { "adults": 3, "children": 0, "beds_min": 2, "bedrooms_preferred": 2, "note": "3 adults — couple + sister; 2 beds required, 2BR preferred" },
    "vehicle": "normal-clearance sedan",
    "generated_at": "2026-08-23T17:00:00-07:00",
    "recommended_option_id": "opt-5",
    "backup_option_id": "opt-1",
    "book_urgency": null
  },
  "options": [ /* Option */ ],
  "group_message": "Under 180 words, copy-pasteable",
  "sources_checked": [
    { "name": "Plumas County Bucks Lake", "url": "https://...", "checked_at": "2026-08-23" }
  ]
}
```

**`meta.book_urgency`** — omit by default. Only set when the user explicitly wants a booking deadline callout on the page; lodging details belong in each option's lodging section, not a header banner.

## Option object

```json
{
  "id": "opt-5",
  "rank": 1,
  "user_preference_rank": 1,
  "name": "Feather Falls & Bucks Lake",
  "base_towns": ["Bucks Lake", "Quincy"],
  "tagline": "Lake weekend + 410-ft waterfall",
  "hero_image": "https://...",
  "hero_image_credit": "USFS / Plumas County",
  "badge": "recommended",
  "drive_friday": { "hours": "3.5–4", "miles": "~220", "note": "Leave 3:30 PM; traffic buffer +1 hr" },
  "drive_monday": { "hours": "4–4.5", "miles": "~230", "note": "Feather River Canyon scenic stop" },
  "highlights": {
    "water": "Bucks Lake swim, kayak/boat, Sandy Point",
    "hike": "Feather Falls 8.5 mi",
    "town": "Quincy dining fallback"
  },
  "labor_day_risk": "high",
  "labor_day_risk_note": "Marina rentals and Sandy Point fill early Saturday",
  "scores": {
    "friday_drive": { "value": 3, "note": "Longest Friday drive of the three" },
    "monday_return": { "value": 4, "note": "Scenic canyon exit" },
    "lodging_value": { "value": 3, "note": "Limited lake inventory" },
    "crowd_resilience": { "value": 3, "note": "Early starts required" },
    "water_quality": { "value": 5, "note": "Best lake access" },
    "hiking_quality": { "value": 5, "note": "Feather Falls standout" },
    "scenic_uniqueness": { "value": 5, "note": "Waterfall + alpine lake" },
    "town_food": { "value": 3, "note": "Quincy adequate" },
    "safety_reliability": { "value": 4, "note": "Paved access; verify fire" },
    "overall": { "value": 4.2, "note": "Best hike+swim balance if booked early" }
  },
  "activities": [
    {
      "name": "Feather Falls Trail",
      "type": "hike",
      "day": "sun",
      "official_url": "https://...",
      "maps_url": "https://www.google.com/maps/dir/?api=1&destination=...",
      "lat": 39.642,
      "lng": -121.278,
      "image": "https://...",
      "distance_mi": 8.5,
      "elevation_ft": 2200,
      "duration": "5–6 hr",
      "parking": "Small lot — arrive by 7:00 AM Labor Day",
      "status": "confirmed",
      "crowd_level": "high",
      "backup": "Bucks Lake shoreline hike",
      "review_snippet": "Trail is worth the early start — AllTrails 2025",
      "review_url": "https://..."
    }
  ],
  "lodging": [
    {
      "rank": 1,
      "name": "Bucks Lake Marina Cabins",
      "location": "Bucks Lake, CA",
      "type": "cabin",
      "platform": "direct",
      "booking_url": "https://...",
      "total_3_nights": null,
      "per_person": null,
      "availability": "needs_verification",
      "beds": "2 beds / 1 bedroom",
      "bedrooms": 1,
      "sleeps": 3,
      "bed_fit": "yellow",
      "amenities": ["kitchen", "lake_access", "parking"],
      "drive_to_saturday": "5 min",
      "drive_to_sunday": "45 min to Feather Falls",
      "pros": "On the water; marina rentals walkable",
      "cons": "Limited Labor Day inventory",
      "status": "book_now",
      "checked_at": "2026-08-23T17:00:00-07:00"
    }
  ],
  "day_plans": [
    {
      "id": "plan-a",
      "name": "Water First",
      "vibe": "Recover from Friday drive; save hike for Sunday",
      "budget_tier": "mid",
      "days": [
        {
          "date": "2026-09-05",
          "label": "Saturday",
          "blocks": [
            {
              "time": "07:30",
              "title": "Sandy Point / Marina",
              "activity": "Kayak rental + swim",
              "drive_min": 10,
              "duration": "3 hr",
              "parking": "Arrive before 8 AM",
              "meal": "Picnic lunch",
              "backup": "Lakeshore Resort public access",
              "official_url": "https://...",
              "maps_url": "https://..."
            }
          ]
        }
      ]
    }
  ],
  "reviews": [
    {
      "source": "Reddit r/norcalhiking",
      "url": "https://...",
      "date": "2025-08",
      "quote": "Feather Falls lot was full by 9 AM on Labor Day Saturday.",
      "sentiment": "caution"
    }
  ],
  "reality_check": {
    "parking_targets": ["Feather Falls 7:00 AM", "Sandy Point 7:30 AM Sat"],
    "reservations": ["Marina kayak — call ahead", "Lodging — book immediately"],
    "verify_48h": ["Fire restrictions", "Smoke", "Marina hours"],
    "safety": ["No cliff jumping as core plan", "River flow varies"]
  },
  "strengths": ["Best waterfall hike", "Real lake weekend"],
  "tradeoffs": ["Longest Friday drive", "Sparse lodging"],
  "eliminate": false,
  "eliminate_reason": null
}
```

## Status enums

| Field | Values |
|-------|--------|
| `badge` | `recommended`, `backup`, `adventurous`, `fragile`, `eliminate` |
| `activity.status` | `confirmed`, `likely`, `unverified`, `not_recommended` |
| `lodging.status` | `book_now`, `viable`, `eliminate`, `needs_verification` |
| `lodging.availability` | `available`, `limited`, `sold_out`, `needs_verification` |

## Validation rules

- Every activity with `lat`/`lng` must have `maps_url`
- `total_3_nights` null → must set `availability: needs_verification`
- `review.quote` must have `review.url` — no invented quotes
- `day_plans` minimum 2 per option (A + B); 3 preferred (C = backup pace)
- `scores.overall.value` = weighted average of other scores (parent computes)
