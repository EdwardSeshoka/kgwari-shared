import { curated } from "../curated.mjs";
import { slug } from "../data.mjs";
import { spread } from "../random.mjs";
import { lensRow } from "../lenses.mjs";

const CURATED = curated("collections");

/**
 * The published lists — shelves, itineraries and the house's selections.
 *
 * ## Why this became a generated stage
 *
 * `collections.json` was hand-maintained and therefore outside `--check`, the
 * same gap editorial and the notes had. Five rows also could not exercise the
 * thing the landings are FOR: an authorship lens over five lists is three chips
 * of one or two, and a fixture like that cannot tell a working filter from a
 * broken one.
 *
 * The five curated rows stay verbatim and first — `discover/curation.json` and
 * the Masthead's chapters 03 and 05 name their ids, and a member who followed a
 * link has to land on the thing they tapped.
 *
 * ## Every generated list has an author in one of the three buckets
 *
 * The authorship lens asks WHO, and its three answers beyond "all" are
 * sommeliers, members and Kgwari. Generating authors at random would leave the
 * buckets lopsided by luck; the rotation below guarantees every chip has enough
 * behind it to be worth tapping, which is the state the landing is designed
 * around rather than a happy accident.
 */

/** Shelf titles — a member's words, not a vocabulary. */
const SHELF_TITLES = [
  ["Bottles for a long lunch", "Nothing that needs thinking about."],
  ["The cellar's quiet corner", "Wines I keep forgetting I have, and shouldn't."],
  ["Chenin, the long way round", "Ten years of one grape, in the order I met it."],
  ["Under two hundred", "Proof that the good stuff is not always dear."],
  ["Bought on the farm", "Every one of these came home in the boot."],
  ["For the sceptics", "Pour these blind to anyone who says the Cape can't age."]
];

/**
 * Route titles, and nothing else about a route.
 *
 * The stops, the mode, the places and the byline all live in `buildRoutes`, which
 * runs first — so a card is not TOLD its stop count and its tally, it is handed the
 * stops and counts them. That is the correction this stage most needed: the numbers
 * used to be `spread` values above a detail page that did not exist, and a card
 * claiming "9 wines" could not be contradicted by anything.
 *
 * Only the titles stay here, because a title is what the landing sorts and reads and
 * the id is derived from it — and those ids are referenced from outside the
 * generator.
 */
const ITINERARY_TITLES = [
  "A morning in Franschhoek",
  "The Hemel-en-Aarde run",
  "Constantia, end to end",
  "Elgin, slowly"
];

/** How many stops a route's detail line shows before it stops listing. */
const STOPS_SHOWN = 3;

/**
 * The three authorship buckets, rotated rather than drawn.
 *
 * The house's byline is a NAME AND NO MARK, exactly as an in-house editorial
 * piece is attributed — which is also why the lens buckets have to be computed
 * on the server: `{ name: "Kgwari" }` and a member byline with no status are the
 * same shape, so nothing structural tells them apart.
 */
const AUTHORS = [
  { name: "Nomsa Dlamini", tier: "professional", role: "sommelier" },
  { name: "Lerato Mabaso", status: "collector" },
  { name: "Kgwari" },
  { name: "Marius Louw", tier: "professional", role: "sommelier" },
  { name: "Sipho Ndlovu", status: "enthusiast" }
];

/** Which lens a byline falls under. The server's decision, modelled here. */
export function authorshipLens(author) {
  if (author.tier === "professional") return "lens.sommeliers";
  if (author.status !== undefined) return "lens.members";
  return "lens.kgwari";
}

export function buildCollections({ wines, routes }) {
  const curatedIds = new Set(CURATED.map((c) => c.id));

  const shelves = SHELF_TITLES.map(([title, description], i) => {
    const author = AUTHORS[i % AUTHORS.length];
    const id = `collection_${slug(title)}`;
    const picks = wines.slice(i * 4, i * 4 + 3);
    return {
      id,
      // Kgwari's own list is a Selection; everyone else's is a Shelf. The kind
      // is a function of the author, never a badge added on top.
      kind: author.name === "Kgwari" ? "selection" : "shelf",
      subject: "wines",
      title,
      description,
      author,
      // Strictly more than the strip shows, for the same reason.
      itemCount: picks.length + 1 + spread(`${id}n`, 0, 12),
      saveCount: spread(`${id}s`, 0, 240),
      preview: picks.map((wine) => ({
        contentId: wine.id,
        title: `${wine.name}${wine.vintage ? ` ${wine.vintage}` : ""}`
      })),
      createdAt: `2026-0${5 + (i % 3)}-${String(4 + i * 3).padStart(2, "0")}T09:30:00.000Z`
    };
  }).filter((c) => !curatedIds.has(c.id));

  /**
   * The facts a route's card derives from its own stops.
   *
   * Nothing here is invented. `itemCount` is the number of stops, `contents` counts
   * what is nested inside them, and the strip is the first few stops keyed on the
   * STOP — so the card and the page it opens cannot disagree, because the card was
   * never told the numbers.
   */
  const routeFacts = (id, route) => {
    const { stops, mode } = route;
    const wineCount = stops.reduce((total, stop) => total + (stop.wines?.length ?? 0), 0);
    const noteCount = stops.reduce((total, stop) => total + (stop.notes?.length ?? 0), 0);
    return {
      subject: "stops",
      mode,
      author: route.author,
      // A route has a direction, so the stops ARE the detail line in the author's
      // order — re-sorting somebody's list deletes the part they made.
      itemCount: stops.length,
      // Only a route that happened has anything nested to tally. On a plan the field
      // is ABSENT rather than zeroed: "0 wines · 0 notes" turns an itinerary somebody
      // has not driven yet into an empty diary.
      ...(mode === "documented" ? { contents: { wines: wineCount, notes: noteCount } } : {}),
      // Keyed on the STOP and captioned with the place. A route that doubles back
      // repeats an estate, so a strip keyed on the producer would silently draw one
      // plate for two stops.
      // Always strictly fewer entries than stops. A short route showing every one of
      // them teaches a consumer that `preview.length` is the count, and it is not.
      preview: stops.slice(0, Math.min(STOPS_SHOWN, stops.length - 1)).map((stop) => ({
        contentId: stop.id,
        title: stop.place.name
      }))
    };
  };

  const itineraries = ITINERARY_TITLES.map((title, i) => {
    const id = `collection_${slug(title)}`;
    const route = routes.byCollection.get(id);
    if (route === undefined) {
      throw new Error(
        `collections: "${id}" has no stops — every route's detail is built in ` +
          `buildRoutes, and a card without one would claim a page that does not exist`
      );
    }
    const facts = routeFacts(id, route);
    return {
      id,
      // Kgwari's own list is a Selection; everyone else's is a Shelf or an Itinerary.
      // The kind is a function of the author, never a badge added on top.
      kind: facts.author.name === "Kgwari" ? "selection" : "itinerary",
      title,
      ...facts,
      saveCount: spread(`${id}s`, 0, 120),
      createdAt: `2026-0${6 + (i % 2)}-${String(2 + i * 5).padStart(2, "0")}T14:00:00.000Z`
    };
  }).filter((c) => !curatedIds.has(c.id));

  /**
   * The curated rows, with a route's counts REPLACED by what its stops actually hold.
   *
   * The curated pool stays the source of a row's identity — its id, title, blurb,
   * cover and save count — because those ids are named from outside the generator.
   * What it is no longer the source of is arithmetic: a hand-written `itemCount` of
   * five above a page with four stops is exactly the drift the detail exists to
   * settle, and the row that had it was the flagship.
   *
   * The byline is asserted rather than overwritten. If the pool and the route table
   * ever disagree about who wrote a route, that is a fixture bug and the notes on
   * that route would be attributed to the wrong person.
   */
  const curatedRows = CURATED.map((row) => {
    const route = routes.byCollection.get(row.id);
    if (route === undefined) return row;
    if (row.author?.name !== route.author.name) {
      throw new Error(
        `collections: "${row.id}" is bylined "${row.author?.name}" in the curated pool ` +
          `and "${route.author.name}" in the route table — the notes written on it ` +
          `would carry the wrong author`
      );
    }
    const { contents, ...facts } = routeFacts(row.id, route);
    return {
      ...row,
      ...facts,
      // Removed rather than left stale when a curated route turns out to be a plan.
      ...(contents !== undefined ? { contents } : { contents: undefined })
    };
  }).map((row) => {
    if (row.contents === undefined) {
      const { contents, ...rest } = row;
      return rest;
    }
    return row;
  });

  const all = [...curatedRows, ...shelves, ...itineraries];

  /**
   * A landing: the rows for one subject, newest first, with its chip row.
   *
   * Date order INCLUDING the house's. Kgwari is a lens and not a band, so a
   * Selection sorts among the members' and the sommeliers' lists and the byline
   * does the only distinguishing there is — sorting the house to the top would
   * invent the curated badge the taxonomy refused.
   */
  const landing = (subject) => {
    const rows = all
      .filter((c) => c.subject === subject)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return {
      items: rows,
      lenses: lensRow(rows.map((row) => authorshipLens(row.author)), [
        "lens.all",
        "lens.sommeliers",
        "lens.members",
        "lens.kgwari"
      ])
    };
  };

  /**
   * Opening a list — `GetCollectionResponse`, keyed by collection id.
   *
   * ## Why this fixture had to exist
   *
   * The card has always said the ordered list belongs to the collection's own
   * endpoint, and that endpoint had no seed at all. So every surface could show a
   * route and none could open one, and the three arms of
   * `CollectionItemContract` shipped with nothing behind them.
   *
   * A map rather than an array because the response is per collection: a consumer
   * asks for one id and gets one page, and a flat list would make every double
   * search for its own row.
   *
   * ## Both arms, not just the one that prompted this
   *
   * Routes are what this was built for, and a fixture holding only routes would
   * teach a consumer that `items` is always stops. So a shelf's detail is emitted
   * too — the same endpoint, the wines arm — and the `estates` arm stays absent
   * on purpose: it is reachable only from a Lens, which is nobody's to render and
   * is deliberately not seeded anywhere.
   */
  const winesById = new Map(wines.map((wine) => [wine.id, wine]));

  const details = Object.fromEntries(
    all.map((collection) => {
      const route = routes.byCollection.get(collection.id);
      if (route !== undefined) {
        return [
          collection.id,
          { item: collection, items: route.stops.map((stop) => ({ subject: "stops", stop })) }
        ];
      }
      /**
       * A shelf opens onto WINES, and the rows start with the ones its strip
       * promised — a member who tapped a label has to find it on the page. The
       * rest fill to `itemCount`, because a strip is a handful of a list and never
       * a census of it.
       */
      const promised = (collection.preview ?? [])
        .map((entry) => winesById.get(entry.contentId))
        .filter((wine) => wine !== undefined);
      const promisedIds = new Set(promised.map((wine) => wine.id));
      const filler = wines
        .filter((wine) => !promisedIds.has(wine.id))
        .slice(0, Math.max(0, collection.itemCount - promised.length));
      return [
        collection.id,
        {
          item: collection,
          items: [...promised, ...filler].map((wine) => ({ subject: "wines", wine }))
        }
      ];
    })
  );

  return { all, details, shelves: landing("wines"), itineraries: landing("stops") };
}
