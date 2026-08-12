import type { MoneyContract } from "../money/index.js";
import type { CellarEntryContract, CellarHoldingContract } from "./cellar.js";
import type { CellarRouteProjectionContract } from "./routeProjection.js";

/**
 * `GET /cellar` — every holding, each resolved against the catalogue, and what
 * the member has met without holding.
 *
 * ## Two lists, and they must never be added together
 *
 * `items` is possession: bottles, with a count. `metOnRoutes` is a projection over
 * the member's own routes: wines, without one. The screen shows both — "34
 * bottles" above, "7 wines" below — and the numbers count different things.
 *
 * They are siblings rather than one merged list precisely so that a client cannot
 * accidentally total them. A single array with an optional `bottles` would make
 * phantom possession one `.length` away; two fields make the reader name which
 * question they are answering. See {@link CellarRouteProjectionContract}, which
 * carries the rest of the argument and the absences that enforce it.
 *
 * ## Not the cellar HOME
 *
 * This is the holdings themselves. The home — masthead, shelves, lenses, doors —
 * is {@link GetCellarIndexResponse}, which carries collections and never holdings.
 * The two meet at exactly one point: the index's `metOnRoutes` door states the
 * count, and this response carries the projection behind it. The door is a figure;
 * the page it opens is the list.
 *
 * {@link CellarHoldingContract.firstMet} is likewise read HERE and not on the
 * index, and for the same reason — it is a fact about one bottle, and the index
 * holds no bottles.
 */
export type ListCellarResponse = {
  items: CellarHoldingContract[];
  /**
   * Wines met on routes and not held — the "From your itineraries" group.
   *
   * Absent for a member who has never been on a route, and absent is not an empty
   * group: with nothing met there is no section to head, and a heading reading
   * "0 wines" invites a member to wonder what they have lost. A client renders the
   * group only when this is present.
   */
  metOnRoutes?: CellarRouteProjectionContract;
};

/** `GET /cellar/{wineId}` — one holding. */
export type GetCellarEntryResponse = {
  item: CellarHoldingContract | null;
};

/**
 * Body accepted by `POST /cellar`.
 *
 * **Only the member's own facts appear here**, and that is the point. The body
 * this replaced — `POST /wines` — took `name`, `estate`, `region`, `imageUrl`,
 * `description` and `isFeatured`, so a member could file their own idea of what
 * a wine *is* and that copy then diverged from the catalogue's. Those fields are
 * the catalogue's. What is left is a reference plus what only the member knows.
 *
 * The server rejects a `wineId` the catalogue cannot resolve: now that a holding
 * is a reference, an id nothing points at is a dangling pointer rather than a
 * self-contained row.
 *
 * `paidPrice` is a plain {@link MoneyContract} here even though the stored form
 * is transacted. The date it was paid is `acquiredAt` unless the member says
 * otherwise, so requiring an `asOf` on the way in would make every client send
 * the same date twice.
 */
export type AddCellarEntryRequest = {
  wineId: string;
  bottles: number;
  paidPrice?: MoneyContract;
  /** ISO-8601. Defaults to now when the member does not say. */
  acquiredAt?: string;
  note?: string;
  noteLanguage?: string;
};

export type AddCellarEntryResponse = {
  item: CellarEntryContract;
};
