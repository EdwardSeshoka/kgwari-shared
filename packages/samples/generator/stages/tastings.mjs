import { PEOPLE } from "../data.mjs";
import { IMAGES } from "../images.mjs";
import { curated } from "../curated.mjs";
import { int, pick, rnd } from "../random.mjs";
import { TASTING_TITLES, slug } from "../data.mjs";

const CURATED_EVENTS = curated("events");

/** Tastings, titled across every launch language so the corpus exercises all six. */
export function buildTastings({ producers, regions }) {
  const curatedEventIds = new Set(CURATED_EVENTS.map((e) => e.id));
  const events = [...CURATED_EVENTS, ...TASTING_TITLES.map(([title, lang], i) => {
    const p = producers[(i * 7) % producers.length];
    const region = regions.find((r) => r.id === p.regionId);
    const day = 20 + (i % 9);
    const capped = rnd() > 0.25;
    return {
      id: `event_${slug(title)}`,
      title,
      titleLanguage: lang,
      eventType: pick(["winemaker_dinner", "sommelier_led", "pairing", "masterclass"]),
      startDateTime: `2026-0${day > 30 ? 9 : 8}-${String((day % 28) + 1).padStart(2, "0")}T${String(int(15, 19)).padStart(2, "0")}:00:00.000Z`,
      venueName: p.name,
      location: region.name,
      ...(capped ? { seatsAvailable: int(2, 40) } : {}),
      imageUrl: IMAGES[i % IMAGES.length],
      host: { name: PEOPLE[i % PEOPLE.length][0], tier: "professional", role: "sommelier" },
      subject: { kind: "region", regionId: region.id },
    };
  }).filter((e) => !curatedEventIds.has(e.id))];

  return events;
}
