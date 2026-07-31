import type { Mapper } from "@edwardseshoka/foundation";

import type { SearchResultContract } from "../search.js";
import { facetFor, searchRowId } from "./searchRowId.js";

/**
 * What a REGION row needs.
 *
 * `exonym` and `nameLanguage` now exist on `RegionContract` too — they had no
 * wire representation at all until this projection needed them, which is how a
 * real localisation feature ends up living only inside a seed generator. The
 * narrow type stays regardless: a projection's input is its audit, and listing
 * six fields is the statement that only six can reach a public row.
 */
export type ProjectableRegion = {
  id: string;
  name: string;
  country: string;
  parentRegion?: string;
  /** True when the name differs by language — "Bourgogne" vs "Burgundy". */
  exonym?: boolean;
  /** BCP 47 tag of the name in `name`. Only meaningful with `exonym`. */
  nameLanguage?: string;
  wineCount: number;
};

/**
 * A region → its REGION row.
 *
 * **An exonymous place is NEGOTIATED.** The server states which name it served
 * and in what language, so a client can badge a fallback rather than pass it off
 * as a translation. A place with one name everywhere stays canonical — claiming
 * a negotiation that never happened is as wrong as hiding one that did.
 */
export const RegionToSearchRowMapper: Mapper<ProjectableRegion, SearchResultContract> = {
  map(region) {
  const parent = region.parentRegion ?? region.country;
    return {
      success: true,
      data: {
        id: searchRowId("REGION", region.id),
        kind: "REGION",
        facet: facetFor("REGION"),
        entityId: region.id,
        title: region.exonym
          ? { source: "negotiated", text: region.name, languageTag: region.nameLanguage ?? "en" }
          : { source: "canonical", text: region.name },
        ...(parent ? { eyebrow: { source: "canonical" as const, text: parent } } : {}),
        meta: { kind: "region", wineCount: region.wineCount }
      }
    };
  }
};
