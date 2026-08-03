import { PEOPLE } from "../data.mjs";
import { IMAGES } from "../images.mjs";
import { curated } from "../curated.mjs";
import { int, pick, rnd, spread } from "../random.mjs";
import { TASTING_TITLES, slug } from "../data.mjs";

const CURATED_EVENTS = curated("events");

/**
 * The event types the contract actually declares.
 *
 * Listed here rather than inline, because the inline version drew from a list
 * containing `"masterclass"` — a value `WineEventType` has never had. Nothing
 * caught it: the seed is cast to the contract rather than checked against it, so
 * an invalid enum shipped in the fixture every consumer builds against. The
 * fifth member (`launch`) was missing at the same time.
 */
const EVENT_TYPES = ["winemaker_dinner", "sommelier_led", "pairing", "tasting", "launch"];

/**
 * Where an evening is in its life.
 *
 * Derived here the way a server would derive it — from the clock and the counts
 * — rather than picked at random, because the whole point of `lifecycle` is that
 * it agrees with the fields beside it. A `full` event with seats left is a
 * fixture that teaches a consumer the two are independent.
 *
 * `cancelled` is the one state no clock implies, so it is assigned rather than
 * computed: a fixed slice of the run, chosen by a stable hash so it does not
 * move when something upstream draws one more random number.
 */
function lifecycleOf({ id, startsAt, capacity, taken, now }) {
  if (spread(`${id}cancel`, 0, 19) === 0) return "cancelled";
  if (Date.parse(startsAt) < now) return "past";
  if (capacity !== undefined && taken !== undefined && taken >= capacity) return "full";
  return "open";
}

/**
 * Whether an evening can still be booked.
 *
 * Neither a cancelled nor a past event can, and both for reasons no client
 * should have to infer: one is off and the other already happened. A fixture
 * offering "request a seat" on last month's dinner teaches a consumer that
 * `booking` is independent of `lifecycle`, which is exactly the coupling the
 * lifecycle exists to express.
 */
const isBookable = (lifecycle) => lifecycle !== "cancelled" && lifecycle !== "past";

/**
 * The v2 block a curated event was written before.
 *
 * The curated-first rule exists so IDS survive — `discover/curation.json` and
 * the editorial event piece both name these — not so the rows stay frozen in
 * whatever shape they were authored in. Adding fields breaks no reference, and
 * leaving them off would mean the one event an editorial announcement embeds is
 * the one event with no lifecycle, no capacity and no way to book it.
 *
 * Anything the curated row already states wins: this fills gaps, it does not
 * overwrite curation.
 */
function enrichCurated(event, now) {
  const capacity = event.capacity ?? 24 + spread(`${event.id}cap`, 0, 36);
  const taken = event.taken ?? Math.min(capacity, spread(`${event.id}taken`, 0, capacity));
  const lifecycle =
    event.lifecycle ??
    lifecycleOf({ id: event.id, startsAt: event.startDateTime, capacity, taken, now });

  return {
    ...event,
    ...(event.endDateTime || !event.startDateTime
      ? {}
      : {
          endDateTime: new Date(Date.parse(event.startDateTime) + 150 * 60 * 1000).toISOString()
        }),
    timezone: event.timezone ?? "Africa/Johannesburg",
    venue: event.venue ?? {
      name: { source: "canonical", text: event.venueName ?? "The Cellar" },
      ...(event.location ? { city: { source: "canonical", text: event.location } } : {}),
      countryCode: "ZA"
    },
    languages: event.languages ?? ["en"],
    admission: event.admission ?? "ticketed",
    capacity,
    taken,
    seatsAvailable: capacity - taken,
    lifecycle,
    ...(event.booking || !isBookable(lifecycle)
      ? {}
      : {
          booking: {
            claimant: { source: "canonical", text: event.venueName ?? event.title },
            actionKey: "booking.requestSeat",
            url: `https://kgwari.example/events/${event.id}`
          }
        }),
    saveCount: event.saveCount ?? spread(`${event.id}save`, 0, 210)
  };
}

/** Tastings, titled across every launch language so the corpus exercises all six. */
export function buildTastings({ producers, regions }) {
  // The clock the fixture is written against. A constant rather than `Date.now()`
  // — the generator is deterministic, and a seed whose lifecycle flipped from
  // `open` to `past` because a day went by would fail `--check` on its own.
  const now = Date.parse("2026-08-03T00:00:00.000Z");

  const curatedEventIds = new Set(CURATED_EVENTS.map((e) => e.id));
  const events = [...CURATED_EVENTS.map((e) => enrichCurated(e, now)), ...TASTING_TITLES.map(([title, lang], i) => {
    const p = producers[(i * 7) % producers.length];
    const region = regions.find((r) => r.id === p.regionId);
    const day = 20 + (i % 9);
    const capped = rnd() > 0.25;
    const id = `event_${slug(title)}`;
    const startsAt = `2026-0${day > 30 ? 9 : 8}-${String((day % 28) + 1).padStart(2, "0")}T${String(int(15, 19)).padStart(2, "0")}:00:00.000Z`;

    // Capacity and taken are the source; seats left is the DERIVED figure a list
    // row renders. Generating the three independently is how a fixture comes to
    // say 24 seats, 20 taken and 9 remaining.
    const capacity = capped ? int(12, 60) : undefined;
    const taken = capacity === undefined ? undefined : Math.min(capacity, int(0, capacity));
    const seatsAvailable = capacity === undefined ? undefined : capacity - taken;

    const lifecycle = lifecycleOf({ id, startsAt, capacity, taken, now });
    const host = PEOPLE[i % PEOPLE.length][0];
    const admission = pick(["open", "ticketed", "trade", "club"]);

    return {
      id,
      title,
      titleLanguage: lang,
      eventType: pick(EVENT_TYPES),
      startDateTime: startsAt,
      // Two and a half hours, so `endDateTime` is a fact rather than a guess a
      // client has to make in order to know when the room empties.
      endDateTime: new Date(Date.parse(startsAt) + 150 * 60 * 1000).toISOString(),
      // The VENUE's zone, never the reader's. Every seeded venue is a producer in
      // this catalogue, so the zone follows the region's country.
      timezone: region.countryCode === "ZA" ? "Africa/Johannesburg" : "Europe/Paris",
      venue: {
        name: { source: "canonical", text: p.name },
        ...(spread(`${id}room`, 0, 2) === 0
          ? { room: { source: "canonical", text: "The Cellar" } }
          : {}),
        city: { source: "canonical", text: region.name },
        countryCode: region.countryCode,
      },
      // The flat pair stays, and stays EQUAL to the structured block. They are
      // deprecated aliases rather than a second source of truth, so a fixture
      // where they disagree would be teaching the wrong lesson.
      venueName: p.name,
      location: region.name,
      // The title's language, plus English where it is not already — a room is
      // rarely conducted in one language only, and a member who does not speak
      // the first needs to know before booking rather than after.
      languages: lang === "en" ? ["en"] : [lang, "en"],
      admission,
      ...(capacity !== undefined ? { capacity, taken, seatsAvailable } : {}),
      imageUrl: IMAGES[i % IMAGES.length],
      host: { name: host, tier: "professional", role: "sommelier" },
      panel: [
        {
          name: { source: "canonical", text: host },
          tier: "professional",
          role: { source: "negotiated", text: "Host", languageTag: "en" },
        },
        {
          name: { source: "canonical", text: PEOPLE[(i + 11) % PEOPLE.length][0] },
          tier: "producer",
          role: { source: "negotiated", text: "Cellarmaster", languageTag: "en" },
          house: { source: "canonical", text: p.name },
        },
      ],
      lifecycle,
      // No booking on an evening that is off or already over — see `isBookable`.
      ...(!isBookable(lifecycle)
        ? {}
        : {
            booking: {
              claimant: { source: "canonical", text: p.name },
              actionKey: admission === "ticketed" ? "booking.buyTickets" : "booking.requestSeat",
              url: `https://${slug(p.name)}.example/book/${slug(title)}`,
            },
          }),
      // A recap is filed AFTER the evening, so only a past one has it — and it
      // carries its own byline and its own date, because the person who wrote up
      // what happened is rarely the person who advertised it.
      ...(lifecycle === "past"
        ? {
            recap: {
              body: [
                {
                  source: "negotiated",
                  text: `Six pours and a long argument about the ${region.name} vintage.`,
                  languageTag: "en",
                },
              ],
              byline: { name: PEOPLE[(i + 5) % PEOPLE.length][0], status: "collector" },
              filedAt: new Date(Date.parse(startsAt) + 36 * 60 * 60 * 1000).toISOString(),
            },
            notesFiled: spread(`${id}nf`, 0, 24),
          }
        : {}),
      saveCount: spread(`${id}save`, 0, 180),
      // Roughly one evening in nine is an enthusiast's, and therefore PRIVATE.
      // It is the whole feature minus the audience, so it carries a host, a
      // venue and seats like any other — what it does not do is reach Discover.
      // The corpus needs them: a fixture with none cannot catch a landing that
      // forgot to filter.
      ...(spread(`${id}vis`, 0, 8) === 0
        ? { visibility: "private", host: { name: host, status: "enthusiast" } }
        : {}),
      subject: { kind: "region", regionId: region.id },
    };
  }).filter((e) => !curatedEventIds.has(e.id))];

  return events;
}
