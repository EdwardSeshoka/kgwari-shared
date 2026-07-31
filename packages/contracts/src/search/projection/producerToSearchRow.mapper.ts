import type { Mapper } from "@edwardseshoka/foundation";

import type { SearchResultContract } from "../search.js";
import { facetFor, searchRowId } from "./searchRowId.js";

/**
 * What an ESTATE row needs.
 *
 * `foundedYear` now exists on `ProducerContract`, having been missing while the
 * estate meta line needed it. The narrow input stays anyway: a projection's
 * input type is its audit, and five fields is the statement that only five can
 * reach a row everyone can read.
 */
export type ProjectableProducer = {
  id: string;
  name: string;
  regionName?: string;
  foundedYear?: number;
  wineCount: number;
};

/** A producer → its ESTATE row. No verdict and no price — only wines carry those. */
export const ProducerToSearchRowMapper: Mapper<ProjectableProducer, SearchResultContract> = {
  map(producer) {
    return {
      success: true,
      data: {
        id: searchRowId("ESTATE", producer.id),
        kind: "ESTATE",
        facet: facetFor("ESTATE"),
        entityId: producer.id,
        title: { source: "canonical", text: producer.name },
        ...(producer.regionName
          ? { eyebrow: { source: "canonical" as const, text: producer.regionName } }
          : {}),
        meta: {
          kind: "estate",
          ...(producer.foundedYear ? { foundedYear: producer.foundedYear } : {}),
          wineCount: producer.wineCount
        }
      }
    };
  }
};
