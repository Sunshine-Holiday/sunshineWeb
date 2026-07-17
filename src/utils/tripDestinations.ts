/**
 * Helpers to group trips by destination "state" for navbar mega-menu
 * and destination detail pages.
 *
 * Prefer the admin-selected `trip.state` field. Fall back to keyword
 * matching on title for older trips that predate the field.
 */

/** Preset destinations shown in Create/Edit trip State dropdown. */
export const PRESET_STATES = [
  "Mahabaleshwar",
  "Matheran",
  "Lonavala",
  "Khandala",
  "Devkund",
  "Panchgani",
  "Alibaug",
  "Konkan",
  "Kokan",
  "Tarkarli",
  "Ganpatipule",
  "Murud",
  "Harihareshwar",
  "Raigad",
  "Rajgad",
  "Sinhagad",
  "Bhandardara",
  "Igatpuri",
  "Lavasa",
  "Shirdi",
  "Nashik",
  "Pune",
  "Mumbai",
  "Goa",
  "Ooty",
  "Manali",
  "Kerala",
  "Jaipur",
  "Bangalore",
  "Bengaluru",
] as const;

/** @deprecated use PRESET_STATES — kept for keyword fallback matching */
export const DESTINATION_KEYWORDS = [...PRESET_STATES];

export const TOUR_TYPE_LABELS: Record<string, string> = {
  "One Day Tours": "One Day Tour",
  "Stay Package": "Stay Packages",
  "Domestic Tours": "Domestic Packages",
  "Educational Tours": "Educational Tours",
};

/** Categories hidden from public website navigation / trip tabs */
export const HIDDEN_PUBLIC_CATEGORIES = new Set(["Interconnected Tours"]);

export function slugify(text: string): string {
  return String(text || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function getTripDestination(trip: {
  title?: string;
  location?: string;
  state?: string;
}): string {
  // Admin-selected state wins (explicit management)
  if (trip.state?.trim()) return trip.state.trim();

  const title = trip.title || "";
  const titleLower = title.toLowerCase();
  for (const d of DESTINATION_KEYWORDS) {
    if (titleLower.includes(d.toLowerCase())) return d;
  }
  // fall back to departure location
  if (trip.location?.trim()) return trip.location.trim();
  return "Other";
}

/** Merge preset list with states already used on trips (for dropdowns). */
export function getStateOptions(trips: any[] = []): string[] {
  const set = new Set<string>(PRESET_STATES as unknown as string[]);
  for (const t of trips) {
    if (t?.state?.trim()) set.add(String(t.state).trim());
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}

export function getDestinationSlug(name: string): string {
  return slugify(name);
}

export function findDestinationFromSlug(
  slug: string,
  trips: any[]
): string | null {
  const destinations = getUniqueDestinations(trips);
  const match = destinations.find((d) => slugify(d) === slug);
  return match || null;
}

export function getUniqueDestinations(trips: any[]): string[] {
  const set = new Set<string>();
  for (const t of trips) {
    set.add(getTripDestination(t));
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}

export function filterTripsByDestination(
  trips: any[],
  destination: string
): any[] {
  return trips.filter((t) => getTripDestination(t) === destination);
}

export function filterTripsByCategory(trips: any[], category: string): any[] {
  if (!category || category === "All") return trips;
  return trips.filter((t) => t.category === category);
}

export function getCategoriesFromTrips(trips: any[]): string[] {
  const set = new Set<string>();
  for (const t of trips) {
    if (t.category && !HIDDEN_PUBLIC_CATEGORIES.has(t.category)) {
      set.add(t.category);
    }
  }
  // Prefer known order (no Interconnected — shown via One Day / Stay instead)
  const order = [
    "One Day Tours",
    "Stay Package",
    "Domestic Tours",
    "Educational Tours",
  ];
  const list = Array.from(set);
  list.sort((a, b) => {
    const ia = order.indexOf(a);
    const ib = order.indexOf(b);
    if (ia === -1 && ib === -1) return a.localeCompare(b);
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });
  return list;
}

export const STATE_DESCRIPTIONS: Record<string, string> = {
  Mahabaleshwar:
    "Hill station getaways with scenic viewpoints, strawberries, and cool climate — perfect for weekend escapes from Pune & Mumbai.",
  Matheran:
    "Asia’s only automobile-free hill station. Toy train vibes, viewpoints, and nature walks.",
  Lonavala:
    "Popular hill station known for waterfalls, forts, and quick getaways from Pune & Mumbai.",
  Ooty: "Queen of hill stations — lakes, gardens, and tea estates in the Nilgiris.",
  Manali: "Snow peaks, adventure sports, and Himalayan beauty.",
  Kerala: "Backwaters, beaches, and lush greenery of God’s Own Country.",
  Jaipur: "Pink City heritage, forts, and royal Rajasthan experiences.",
  Pune: "Departure hub and nearby weekend destinations from Pune.",
  Bangalore: "Tours departing from Bangalore to popular getaways.",
  Mumbai: "Tours and packages departing from Mumbai.",
  default:
    "Explore carefully curated holiday packages for this destination with Sunshine Holiday Packages.",
};

export function getDestinationDescription(name: string): string {
  return STATE_DESCRIPTIONS[name] || STATE_DESCRIPTIONS.default;
}
