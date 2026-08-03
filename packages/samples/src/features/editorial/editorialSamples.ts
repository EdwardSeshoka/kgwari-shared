import type {
  EditorialContract,
  EditorialDetailContract,
  ListEditorialResponse
} from "@edwardseshoka/contracts/editorial";

import rawEditorial from "./editorial.json" with { type: "json" };
import rawDetails from "./editorial-details.json" with { type: "json" };
import rawArchive from "./archive-landing.json" with { type: "json" };

/**
 * Sample editorial content — the editorial service's own sample.
 *
 * Two collections, and the split matches the contracts': `editorial` is the CARD
 * a list renders, `details` is the document behind it. Not every card has a
 * detail, which is the honest state rather than a gap — a piece can be listed
 * before it is written up in full, and a consumer that assumes the join is total
 * renders a blank page for the ones that are not.
 */
export const editorialSamples = {
  editorial: rawEditorial as EditorialContract[],
  details: rawDetails as unknown as EditorialDetailContract[],
  /**
   * The ARCHIVE landing — everything written, with an authorship chip row.
   *
   * The lens asks WHO because at launch the archive holds two voices at very
   * different volumes and pure recency hides the rarer one.
   */
  archiveLanding: rawArchive as unknown as ListEditorialResponse
} as const;
