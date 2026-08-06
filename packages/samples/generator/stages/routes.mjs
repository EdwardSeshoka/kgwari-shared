import { spread } from "../random.mjs";

/**
 * The STOPS behind every route, and the notes written on them.
 *
 * ## Why the detail is generated before the card
 *
 * A route's card claims a stop count and a tally of what is nested under those
 * stops. Until now both were `spread` values and the detail did not exist, so the
 * card could say "9 wines" above a page that poured four and nothing would notice.
 * This stage builds the stops first and `buildCollections` counts them — so the
 * card cannot disagree with the page it opens, because it is not told the numbers,
 * it is given the stops.
 *
 * That is the same correction `applyNoteCounts` made to `wine.noteCount`: a
 * fixture whose aggregate is invented teaches a consumer a shape and never a rule.
 *
 * ## Everything here draws from `spread`, never from `rnd`
 *
 * Deliberately, and for the reason `buildNotes` states: this stage runs in the
 * middle of the pipeline, and a stage that consumed the shared mutable stream
 * would re-roll the entire catalogue downstream — including every id referenced
 * from outside the generator. Hashing a stable string instead means routes can
 * grow without moving anything.
 *
 * ## The notes are real notes, and they go in the corpus
 *
 * A note written on the tram is a full opinion about a vintage: it counts toward
 * that wine's `noteCount`, it feeds the register, it can be the most-saved note on
 * an unclaimed record. So these are appended to the note corpus and run through
 * `applyNoteCounts` with everything else.
 *
 * What they must not do is appear as their own row in Latest — publishing the
 * route was one act. Every note here carries `origin`, and `buildMasthead` filters
 * on exactly that. If the ledger ever shows nine notes from one afternoon, this is
 * the field that was ignored.
 */

/**
 * The routes, and the shape of each.
 *
 * `places` names estates by the name the producer seed carries, because a stop is
 * a navigable proper noun — a route naming an estate the catalogue does not hold
 * is a detail page whose every heading leads nowhere. The build throws rather than
 * silently dropping a stop, which is the failure mode a hand-maintained fixture
 * had.
 *
 * The bylines live here rather than in `buildCollections` so the notes written on a
 * route are attributed to the person whose name is on it. Two rotations would drift
 * and the first symptom would be a member's route quoting somebody else.
 *
 * The three authorship buckets — sommeliers, members, the house — are each covered,
 * so the landing's lens chips have rows behind them by construction rather than by
 * luck.
 */
const ROUTES = [
  {
    id: "collection_two_days_in_stellenbosch",
    mode: "documented",
    from: "2026-06-10",
    author: { name: "Thandi Nkosi", tier: "professional", role: "sommelier" },
    places: ["Meerlust Estate", "Kanonkop Estate", "Rust en Vrede", "Tokara"],
    /** Five stops across FOUR places: dinner returns to where breakfast was. */
    shape: "returns"
  },
  {
    id: "collection_a_weekend_in_the_swartland",
    mode: "planned",
    from: "2026-09-05",
    author: { name: "Marius Louw", tier: "professional", role: "sommelier" },
    places: ["Sadie Family Wines", "A.A. Badenhorst", "Mullineux"],
    shape: "plan"
  },
  {
    id: "collection_a-morning-in-franschhoek",
    mode: "documented",
    from: "2026-05-04",
    author: { name: "Lerato Mabaso", status: "collector" },
    places: ["Boekenhoutskloof", "La Motte"],
    shape: "short"
  },
  {
    id: "collection_the-hemel-en-aarde-run",
    mode: "planned",
    from: "2026-09-19",
    author: { name: "Kgwari" },
    places: ["Hamilton Russell Vineyards", "Bouchard Finlayson"],
    shape: "plan"
  },
  {
    id: "collection_constantia-end-to-end",
    mode: "planned",
    from: "2026-10-03",
    author: { name: "Marius Louw", tier: "professional", role: "sommelier" },
    places: ["Klein Constantia", "Groot Constantia"],
    shape: "plan"
  },
  {
    id: "collection_elgin-slowly",
    mode: "documented",
    from: "2026-06-02",
    author: { name: "Sipho Ndlovu", status: "enthusiast" },
    /**
     * Elgin carries ONE estate in the producer seed, so this is a long morning at a
     * single place rather than a drive between several. Worth having: it is the route
     * whose every stop shares a `place.id`, which is what a strip keyed on the
     * producer instead of the stop would silently collapse to one plate.
     */
    places: ["Paul Cluver"],
    shape: "short"
  }
];

/**
 * What a member wrote at a stop. Prose, because a note is somebody's own words and
 * a generated adjective salad would teach a consumer that notes are decoration.
 */
const SAID = [
  "Poured before ten in the morning and still the best thing all day.",
  "The one everybody went quiet for.",
  "Came back for dinner and drank the one thing we skipped at breakfast.",
  "Tasted straight off the barrel, which is cheating and I do not care.",
  "Sharper than I remember it — the drive up may have helped.",
  "Bought two on the way out, which is the only review that counts."
];

/** How many stops each shape lays out, and what happens at each. */
const SHAPES = {
  /** Five stops, four places: the last calls again at the first. */
  returns: ["pours", "event", "silent", "pours", "revisit"],
  /** Three stops, no return — a shorter morning. */
  short: ["pours", "silent", "pours"],
  /**
   * A plan: four places, nothing poured and nothing written.
   *
   * One stop carries a BOOKED evening, which is the draft feature — a member adds
   * an estate and takes something that is on there while still planning. The rest
   * are places and a date, which is a complete planned stop rather than a draft of
   * one.
   */
  plan: ["bare", "booked", "bare", "bare"]
};

/** A byline turned into the note author it belongs to. One person, one identity. */
const asUser = (author) => ({
  id: `user_${author.name.toLowerCase().replace(/\s+/g, "_")}`,
  displayName: author.name,
  initials: author.name
    .split(/\s+/)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase(),
  ...(author.tier ? { tier: author.tier } : {}),
  ...(author.role ? { role: author.role } : {}),
  ...(author.status ? { status: author.status } : {})
});

/** A calendar DAY, `n` days on from a route's first. Never an instant — see the contract. */
const dayAfter = (from, n) => {
  const day = new Date(`${from}T00:00:00.000Z`);
  day.setUTCDate(day.getUTCDate() + n);
  return day.toISOString().slice(0, 10);
};

export function buildRoutes({ producers, wines, events }) {
  const producerByName = new Map(producers.map((producer) => [producer.name, producer]));
  const winesByProducer = new Map();
  for (const wine of wines) {
    if (wine.producerId === undefined) continue;
    const held = winesByProducer.get(wine.producerId) ?? [];
    held.push(wine);
    winesByProducer.set(wine.producerId, held);
  }

  /**
   * An evening AT a place, in the tense the route is in.
   *
   * A documented stop names one that is over and a planned stop one that is still
   * to come — the same forward/backward split `ListPlaceProgrammeRequest` refuses
   * to let a client cross. Absent when the estate has nothing on, which is normal.
   */
  const eventAt = (place, mode) => {
    /**
     * `past` for a day that happened, `open` for one still to come.
     *
     * These are the events domain's own lifecycle words — there is no "upcoming",
     * and reaching for one silently matched nothing, which is how every stop in this
     * fixture lost its evening. `open` rather than any-future because a plan offers a
     * BOOKING: a full or cancelled evening is not something a draft may hand a member.
     */
    const wanted = mode === "documented" ? "past" : "open";
    const found = events.find(
      (event) =>
        event.lifecycle === wanted &&
        event.visibility !== "private" &&
        (event.venueName === place.name || event.venue?.name?.text === place.name)
    );
    if (found === undefined) return undefined;
    return {
      eventId: found.id,
      /**
       * NegotiatedText, not the event's legacy `title` + `titleLanguage` pair. A
       * tasting title is curated prose, so the tag rides WITH the text and nothing
       * downstream has to remember to look for a second field.
       */
      title: {
        source: "negotiated",
        text: found.title,
        languageTag: found.titleLanguage ?? "en"
      },
      ...(found.startDateTime ? { startDateTime: found.startDateTime } : {})
    };
  };

  const notes = [];

  const stopsFor = (route) => {
    const plan = SHAPES[route.shape];
    const places = route.places.map((name) => {
      const producer = producerByName.get(name);
      if (producer === undefined) {
        throw new Error(
          `routes: "${route.id}" calls at "${name}", which the producer seed does not carry — ` +
            `a stop must be a navigable proper noun`
        );
      }
      return producer;
    });

    const stops = plan.map((what, index) => {
      // `revisit` returns to the first place; everything else walks the list and
      // wraps, so a route with two named estates still lays out four stops.
      const place = what === "revisit" ? places[0] : places[index % places.length];
      const stopId = `${route.id}__stop-${index + 1}`;
      // Two days in Stellenbosch is two days: the back half falls on the next one.
      const date = dayAfter(route.from, index >= plan.length - 2 && plan.length > 3 ? 1 : 0);

      const stop = { id: stopId, date, place };

      if (what === "booked") {
        const event = eventAt(place, route.mode);
        if (event !== undefined) stop.event = event;
        return stop;
      }
      if (what === "event") {
        const event = eventAt(place, route.mode);
        if (event !== undefined) stop.event = event;
        return stop;
      }
      // A planned stop and a lunch are both a place and nothing else. They are
      // structurally identical on purpose — `mode` is the only thing that says
      // which, and a consumer inferring tense from emptiness gets one wrong.
      if (what === "bare" || what === "silent") return stop;

      const pool = winesByProducer.get(place.id) ?? [];
      const poured = pool.slice(0, what === "revisit" ? 1 : spread(`${stopId}w`, 1, 3));
      if (poured.length > 0) stop.wines = poured;

      // Not every pour is written up — most are not. One note per stop that has
      // wines, and only when the stop draws it.
      const writes = poured.length > 0 && spread(`${stopId}n`, 0, 2) > 0;
      if (writes) {
        const subject = poured[0];
        const note = {
          id: `tasting-note_${stopId}`,
          wineVintageId: subject.id,
          user: asUser(route.author),
          verdict: ["Worth Revisiting", "Essential", "Unforgettable"][spread(`${stopId}v`, 0, 2)],
          note: SAID[spread(`${stopId}s`, 0, SAID.length - 1)],
          /** Tasted in the morning, written up that evening — hours apart, as a write-up is. */
          tastedAt: `${date}T09:40:00.000Z`,
          createdAt: `${date}T21:05:00.000Z`,
          saveCount: spread(`${stopId}c`, 0, 40),
          languageTag: "en",
          /**
           * What keeps this out of Latest. The route's row stands for the day, so
           * nine notes from one afternoon are one contribution — see
           * `TastingNoteContract.origin`.
           */
          origin: {
            itineraryId: route.id,
            itineraryTitle: route.title ?? route.id,
            stopId
          }
        };
        notes.push(note);
        stop.notes = [note];
      }

      return stop;
    });

    /**
     * An evening lands on whichever stop's place actually has one.
     *
     * The shape names a slot for it, but an estate either has something on or it does
     * not — and pinning the event to a fixed position meant a route whose second stop
     * was quiet lost its evening entirely. So the slot is a preference and this is the
     * fallback, which is also the honest model: you take what is on where you are.
     */
    if (!stops.some((stop) => stop.event !== undefined)) {
      for (const stop of stops) {
        const event = eventAt(stop.place, route.mode);
        if (event !== undefined) {
          stop.event = event;
          break;
        }
      }
    }

    return stops;
  };

  const byCollection = new Map();
  for (const route of ROUTES) {
    byCollection.set(route.id, {
      mode: route.mode,
      author: route.author,
      stops: stopsFor(route)
    });
  }

  return { byCollection, notes };
}

/**
 * Fills in each route's `itineraryTitle` once the cards exist.
 *
 * The note's origin carries the route's title denormalized so a breadcrumb needs no
 * fetch — but the titles live on the cards, which are built after this stage. So the
 * origin is written with the id and corrected here, in the one place, rather than
 * duplicating the title table into this file where it would drift from the cards.
 */
export function nameRouteOrigins({ notes, collections }) {
  const titleById = new Map(collections.map((collection) => [collection.id, collection.title]));
  for (const note of notes) {
    if (note.origin === undefined) continue;
    const title = titleById.get(note.origin.itineraryId);
    if (title !== undefined) note.origin.itineraryTitle = title;
  }
}
