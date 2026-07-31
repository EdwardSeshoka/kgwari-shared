import type { MoneyContract } from "../money/index.js";
import type { CellarEntryContract, CellarHoldingContract } from "./cellar.js";

/** `GET /cellar` — every holding, each resolved against the catalogue. */
export type ListCellarResponse = {
  items: CellarHoldingContract[];
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
