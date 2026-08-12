import { spread } from "../random.mjs";

/**
 * One member's cellar — the holdings, and the home page over them.
 *
 * ## Whose cellar, and why it is somebody who already exists
 *
 * Thandi Nkosi, because she already authors `collection_two_days_in_stellenbosch`
 * — a documented route with five stops, three of them pouring something. Inventing
 * a member here would have produced a cellar with routes nothing else in the seed
 * knows about, and the projection over them could never be checked against the
 * route detail it is derived from.
 *
 * ## Everything is DERIVED, and that is the point of the stage
 *
 * `bottles`, `wines`, `estates`, `readyThisYear`, `keepingSince` and the price
 * band are all computed from the holdings below — never written down beside them.
 * A summary told its own numbers is a summary that can disagree with the list it
 * describes, which is the single failure the cellar contract is most concerned
 * with, and a fixture that hardcoded them could not catch a composer that got the
 * arithmetic wrong.
 *
 * The same goes for the doors: the Ready-this-year door takes its title, its rule
 * and its count from the lens object itself, so the two cannot drift.
 *
 * ## The readiness rule is the COMPOSER's, and this is one copy of it
 *
 * `WineContract` carries no drinking window, so readiness has to come from
 * somewhere: here it is a plain span off the vintage. The backend will have its
 * own rule and a better one. What `CELLAR_INDEX_RULES.readyThisYearAgrees` checks
 * is not that the two rules match — they need not — but that within ONE response
 * the lens and the masthead were computed by the same one.
 *
 * Draws only from `spread`, never `rnd`, so inserting this stage re-rolls nothing
 * downstream.
 */

/** Whose cellar this is. A byline that already authors routes in the seed. */
const MEMBER = { name: "Thandi Nkosi", tier: "professional", role: "sommelier" };

/** The routes she wrote. Her cellar shows her own, never everybody's. */
const isHers = (author) => author?.name === MEMBER.name;

/** The year the seed is written against — see `Freshness`. */
const THIS_YEAR = 2026;

/**
 * A plain cellaring span off the vintage.
 *
 * Eight years to twenty, which is a Bordeaux blend's shape and wrong for a Chenin.
 * It is deliberately simple: this is a stand-in for a rule the backend owns, and a
 * more elaborate one here would look like the authority it is not.
 */
const isReadyThisYear = (wine) =>
  wine.vintage !== undefined &&
  THIS_YEAR >= wine.vintage + 8 &&
  THIS_YEAR <= wine.vintage + 20;

/** The p25 and p75 of a sorted list — the middle half, never the extremes. */
const middleHalf = (sorted) => ({
  low: sorted[Math.floor((sorted.length - 1) * 0.25)],
  high: sorted[Math.floor((sorted.length - 1) * 0.75)]
});

export function buildCellar({ wines, collections, routes }) {
  /**
   * What she was poured on her own routes, gathered before the holdings are chosen.
   *
   * The order matters and is the correction this stage needed: picking holdings
   * first swallowed every wine the route poured, and the projection came out empty —
   * a fixture that silently demonstrated nothing on the one section it exists for.
   */
  const poured = [];
  for (const [itineraryId, route] of routes.byCollection) {
    if (!isHers(route.author)) continue;
    route.stops.forEach((stop, position) => {
      for (const wine of stop.wines ?? []) {
        poured.push({ itineraryId, route, stop, position, wine });
      }
    });
  }

  /**
   * ONE of them came home in the boot, and must therefore NOT appear in the
   * projection.
   *
   * The case the whole met-versus-held distinction turns on: a wine met and then
   * bought is a holding, and a cellar that listed it in both places would count one
   * bottle as two different kinds of thing. Keeping one is what makes the exclusion
   * observable rather than vacuous.
   */
  /**
   * Chosen from the wines poured exactly ONCE, so the twice-poured one survives into
   * the projection.
   *
   * That leaves a group whose `items` has two rows and whose `wineCount` is one — a
   * route that called at Meerlust in the morning and again at dinner, pouring the
   * same bottle. It is the fixture's most useful property: a consumer that reports
   * `items.length` as the number of wines met is wrong here and nowhere else, and
   * that is exactly the count the contract sends rather than derives.
   */
  const timesPoured = new Map();
  for (const { wine } of poured) {
    timesPoured.set(wine.id, (timesPoured.get(wine.id) ?? 0) + 1);
  }
  const boughtLater = poured.find(
    (entry) => entry.wine.price?.currency === "ZAR" && timesPoured.get(entry.wine.id) === 1
  )?.wine;
  const metOnly = new Set(
    poured.map((entry) => entry.wine.id).filter((id) => id !== boughtLater?.id)
  );

  /**
   * Twenty-eight wines on record, and the bottle she brought back among them.
   *
   * Priced in ZAR only. A cellar bought across two markets has no single band —
   * nothing is ever converted — and a fixture that mixed currencies would be
   * exercising the absent-band path rather than the band.
   */
  const pool = wines.filter(
    (wine) => wine.price?.currency === "ZAR" && !metOnly.has(wine.id)
  );
  const held = [
    ...(boughtLater ? [boughtLater] : []),
    ...pool.filter((wine) => wine.id !== boughtLater?.id)
  ].slice(0, 28);
  if (held.length < 20) {
    throw new Error(
      `cellar: only ${held.length} ZAR-priced wines in the catalogue — the seed needs ` +
        `at least twenty to sit above the figures threshold it is meant to demonstrate`
    );
  }

  const holdings = held.map((wine, index) => {
    /**
     * Two bottles are DRUNK AND KEPT — `bottles: 0`, still on record.
     *
     * The state a client is most likely to treat as a deletion, so the fixture has
     * it: `wines` counts these and `bottles` does not, which is the whole reason
     * the two figures are different numbers.
     */
    const bottles = index < 2 ? 0 : 1 + spread(`${wine.id}b`, 0, 2);
    const month = 1 + spread(`${wine.id}m`, 0, 11);
    const acquiredAt = `${2021 + spread(`${wine.id}y`, 0, 4)}-${String(month).padStart(2, "0")}-12T00:00:00.000Z`;
    return {
      entry: {
        wineId: wine.id,
        bottles,
        /* What she paid, near what it lists for — a paid price is her own fact. */
        paidPrice: {
          amountMinorUnits: Math.round(
            wine.price.amountMinorUnits * (0.82 + spread(`${wine.id}p`, 0, 30) / 100)
          ),
          currency: wine.price.currency,
          asOf: acquiredAt
        },
        acquiredAt
      },
      wine
    };
  });

  /**
   * The wines she met on her own routes and does not hold.
   *
   * Derived from the stops themselves rather than listed, so a route edited in
   * `buildRoutes` moves this without anybody remembering to. A wine she went on to
   * BUY drops out — it is a holding now, and a cellar that showed it in both places
   * would be counting one bottle as two different kinds of thing.
   */
  const heldIds = new Set(holdings.map((holding) => holding.entry.wineId));
  const byItinerary = new Map();
  for (const { itineraryId, route, stop, position, wine } of poured) {
    /* The one she bought drops out here — it is a holding now. */
    if (heldIds.has(wine.id)) continue;
    if (!byItinerary.has(itineraryId)) byItinerary.set(itineraryId, { route, items: [] });
    byItinerary.get(itineraryId).items.push({
      wine,
      stopId: stop.id,
      /* Sent, never counted from this array — a stop that poured nothing
         contributes no row, so position here is not position on the route. */
      stopOrdinal: position + 1,
      placeName: { source: "canonical", text: stop.place.name },
      ...(stop.notes?.[0]?.verdict ? { verdict: stop.notes[0].verdict } : {})
    });
  }

  const metGroups = [...byItinerary].map(([itineraryId, { route, items }]) => {
    const dates = route.stops.map((stop) => stop.date).filter(Boolean).sort();
    return {
      itineraryId,
      itineraryTitle:
        collections.all.find((row) => row.id === itineraryId)?.title ?? itineraryId,
      ...(dates[0] ? { date: dates[0] } : {}),
      items
    };
  });

  /** Wines, not bottles, and never to be added to the figure above it. */
  const metWineCount = new Set(
    metGroups.flatMap((group) => group.items.map((item) => item.wine.id))
  ).size;

  const metOnRoutes =
    metGroups.length > 0 ? { wineCount: metWineCount, groups: metGroups } : undefined;

  // ---- the masthead, every figure of it computed from the holdings above ----

  const bottles = holdings.reduce((total, holding) => total + holding.entry.bottles, 0);
  const estates = new Set(
    holdings.map((holding) => holding.wine.producerId).filter(Boolean)
  ).size;
  const readyRows = holdings.filter(
    (holding) => holding.entry.bottles > 0 && isReadyThisYear(holding.wine)
  );
  const paid = holdings
    .map((holding) => holding.entry.paidPrice.amountMinorUnits)
    .sort((a, b) => a - b);
  const band = middleHalf(paid);
  const currency = holdings[0].entry.paidPrice.currency;

  const summary = {
    bottles,
    wines: holdings.length,
    estates,
    readyThisYear: readyRows.length,
    keepingSince: holdings
      .map((holding) => holding.entry.acquiredAt)
      .sort()[0],
    priceBand: {
      low: { amountMinorUnits: band.low, currency },
      high: { amountMinorUnits: band.high, currency }
    },
    /* Server policy, modelled: twenty priced bottles is where the figures start
       saying more than the sentence does. */
    figuresAvailable: bottles >= 20
  };

  // ---- the index ----

  /**
   * Her own shelves, which are PRIVATE and therefore not in `collections.json`.
   *
   * That absence is the point rather than an oversight: a member's own index is the
   * one surface that shows unpublished rows, and a fixture whose every shelf was
   * also on the public landing could not demonstrate it.
   */
  const shelfOf = (title, description, rows) => ({
    id: `collection_hers-${title.toLowerCase().replace(/\s+/g, "-")}`,
    kind: "shelf",
    subject: "wines",
    title,
    description,
    author: MEMBER,
    itemCount: rows.length,
    preview: rows.slice(0, 3).map((holding) => ({
      contentId: holding.wine.id,
      title: `${holding.wine.name}${holding.wine.vintage ? ` ${holding.wine.vintage}` : ""}`
    })),
    createdAt: "2026-04-18T09:00:00.000Z"
  });

  const shelves = [
    shelfOf("Drinking now", "What is open, or about to be.", readyRows),
    shelfOf("The long game", "Bought young and left alone.", holdings.slice(10, 19))
  ];

  /**
   * Her lenses — the rows nothing else in the package can produce.
   *
   * A lens is derived, so it can never be published and never appears on a landing.
   * Each one states its rule as a key and its operands, so the sub-line reads in any
   * locale; the year rides `unit.vintageYear` rather than being spelled into the key.
   */
  const readyLens = {
    id: "collection_hers-ready-this-year",
    kind: "lens",
    subject: "wines",
    title: "Ready this year",
    rule: {
      key: "lensRule.drinkingWindowIncludes",
      operands: [{ source: "measurement", value: THIS_YEAR, unitKey: "unit.vintageYear" }]
    },
    author: MEMBER,
    /* The SAME count the masthead carries, from the same rows. */
    itemCount: readyRows.length,
    createdAt: "2026-05-02T19:40:00.000Z"
  };

  const stellenboschRows = holdings.filter(
    (holding) => holding.wine.region === "Stellenbosch"
  );
  const regionLens = {
    id: "collection_hers-everything-from-stellenbosch",
    kind: "lens",
    subject: "wines",
    title: "Everything from Stellenbosch",
    /* A place is a proper noun, so the operand is canonical text and not a key. */
    rule: {
      key: "lensRule.regionIs",
      operands: [{ source: "canonical", text: "Stellenbosch" }]
    },
    author: MEMBER,
    itemCount: stellenboschRows.length,
    createdAt: "2026-05-19T08:15:00.000Z"
  };

  const lenses = [readyLens, regionLens].filter((lens) => lens.itemCount > 0);

  /** Published lists by other people. Real ids, so every row opens onto something. */
  const following = collections.all
    .filter((row) => row.kind === "selection" && !isHers(row.author))
    .slice(0, 2);

  /** Her own routes, in the collections pool, so the section's rows resolve. */
  const hersRoutes = collections.all.filter(
    (row) => row.kind === "itinerary" && isHers(row.author)
  );

  /* Empty runs are OMITTED rather than sent — a heading over no rows asks a reader
     what they have lost, and the answer is nothing. */
  const sections = [
    { kind: "shelves", items: shelves, count: shelves.length },
    { kind: "lenses", items: lenses, count: lenses.length },
    { kind: "following", items: following, count: following.length },
    { kind: "routes", items: hersRoutes, count: hersRoutes.length }
  ].filter((section) => section.items.length > 0);

  /**
   * The doors, each taking its words and its number from the object behind it.
   *
   * The Ready-this-year door is built FROM `readyLens` rather than beside it, which
   * is what makes the two impossible to drift: there is one title, one rule and one
   * count, read twice.
   */
  const doors = [
    {
      target: { kind: "collection", collectionId: readyLens.id },
      title: readyLens.title,
      rule: readyLens.rule,
      count: readyLens.itemCount
    },
    ...(metOnRoutes ? [{ target: { kind: "metOnRoutes" }, count: metOnRoutes.wineCount }] : []),
    { target: { kind: "requests" }, count: 2 }
  ];

  return {
    holdings: { items: holdings, ...(metOnRoutes ? { metOnRoutes } : {}) },
    index: { summary, sections, doors }
  };
}
