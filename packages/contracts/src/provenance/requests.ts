import type { AppellationContract } from "./appellation.js";
import type { ProducerContract } from "./producer.js";
import type { RegionContract } from "./region.js";

/**
 * The two documents a DOORWAY opens onto.
 *
 * "Find your way in" has always pushed at a region or a producer, and neither
 * had an endpoint — the entrances were built and the rooms behind them were not.
 * A doorway whose target resolves to nothing is the failure the search corpus
 * was audited for once already.
 *
 * `null` rather than an error for a missing id, matching every other detail
 * response here: a reader who followed a stale link wants a page that says so,
 * not a stack trace.
 */
export type GetRegionResponse = {
  item: RegionContract | null;
};

export type GetProducerResponse = {
  item: ProducerContract | null;
};

/**
 * An appellation, which a wine's own record links to.
 *
 * Included because `WineAppellationRefContract` is a REF — an id, a name and a
 * system — and a ref exists to be resolved. Without this it can only ever be
 * rendered as text.
 */
export type GetAppellationResponse = {
  item: AppellationContract | null;
};
