import type {
  GetCellarIndexResponse,
  ListCellarResponse
} from "@edwardseshoka/contracts/cellar";

import rawCellar from "./cellar.json" with { type: "json" };
import rawIndex from "./cellar-index.json" with { type: "json" };

/**
 * One member's cellar — Thandi Nkosi's, because she already authors a route.
 *
 * ## Why it is somebody who exists elsewhere in the seed
 *
 * `collection_two_days_in_stellenbosch` is hers: five stops, calling at Meerlust
 * twice. That is what lets the route projection below be DERIVED from the same
 * stops the itinerary's detail page renders, rather than being a second, divergent
 * account of the same afternoon. A cellar belonging to an invented member could
 * only ever have had its routes invented too.
 *
 * ## Every figure is computed from the holdings, never written beside them
 *
 * `bottles`, `wines`, `estates`, `readyThisYear`, `keepingSince` and the price band
 * all come out of `items`. The generator has no table of them to get wrong, which
 * is the property this fixture exists to have: a summary told its own numbers can
 * disagree with the list it describes, and that is the failure the cellar contract
 * is most concerned with.
 *
 * The states it deliberately holds:
 *
 * - **Two holdings with `bottles: 0`** — drunk, and kept on record. `wines` counts
 *   them and `bottles` does not, which is the whole reason those are two figures.
 * - **`figuresAvailable: true` with a band**, because the fixture is above the
 *   suppression threshold. A launch cellar is `GetCellarIndexResponse.StubFactory
 *   .makeLaunch()` in the contracts package; a generated seed is the wrong place
 *   for it, since every figure here is derived from real rows.
 * - **One currency throughout.** Nothing is ever converted, so a mixed-currency
 *   cellar has no band at all — and a fixture that mixed them would be exercising
 *   the absent-band path while looking like it exercised the band.
 * - **Private shelves and lenses.** The `shelves` and `lenses` runs hold rows that
 *   appear in NO landing, because a member's own index is the one surface that
 *   shows unpublished collections. The `following` and `routes` runs point at real
 *   ids from `collectionsSamples`, so every row there opens onto something.
 */
export const cellarSamples = {
  /**
   * `GET /cellar` — the holdings, and the wines met on routes without being held.
   *
   * `metOnRoutes` is the interesting half. Its one group has TWO rows and a
   * `wineCount` of ONE: the same bottle was poured at stop 1 and again at stop 5,
   * because the route came back to Meerlust for dinner. A consumer that reports
   * `items.length` as the number of wines met is wrong here — which is precisely
   * why the count is sent rather than derived.
   *
   * One wine she was poured is NOT in the projection at all, because she went on to
   * buy it: it is a holding now, and a cellar listing it in both places would count
   * one bottle as two different kinds of thing.
   */
  cellar: rawCellar as unknown as ListCellarResponse,
  /**
   * `GET /cellar/index` — the home page over those holdings.
   *
   * Four runs and three doors. The Ready-this-year door takes its title, its rule
   * and its count from the lens object itself, so the two cannot drift — which is
   * the one thing `CELLAR_INDEX_RULES` cares most about and the reason the door
   * carries the words at all.
   */
  cellarIndex: rawIndex as unknown as GetCellarIndexResponse
} as const;

/**
 * The member's cellar home.
 *
 * A function rather than a bare export for the reason every other `create*` here is
 * one: it gives the fixture a single place to grow a parameter — a second member,
 * a launch-sized cellar — without every call site changing shape on the day it does.
 */
export function createCellarIndex(): GetCellarIndexResponse {
  return cellarSamples.cellarIndex;
}

/** The holdings themselves, with the route projection beside them. */
export function createCellar(): ListCellarResponse {
  return cellarSamples.cellar;
}
