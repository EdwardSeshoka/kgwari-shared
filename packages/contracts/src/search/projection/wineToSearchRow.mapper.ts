import type { Mapper } from "@edwardseshoka/foundation";

import type { VerdictWord } from "../../trust/index.js";

import type { SearchResultContract } from "../search.js";
import { facetFor, searchRowId } from "./searchRowId.js";

/**
 * What a WINE row needs.
 *
 * A `Projectable*` input like its four siblings, rather than `WineContract`.
 * `WineContract` happens to carry everything, so taking it worked — but it also
 * put ninety-odd fields in scope for a function that reads eight, and left this
 * one mapper reading differently from the rest of the folder.
 *
 * Declaring the minimum is what makes a projection auditable: the fields listed
 * here are exactly the fields that can reach a search row, and a `WineContract`
 * satisfies it structurally without either side importing the other.
 */
export type ProjectableWine = {
  id: string;
  name: string;
  estate?: string;
  vintage?: number;
  vintageDisplay?: string;
  verdict?: VerdictWord;
  price?: { amountMinorUnits: number; currency: string };
  imageUrl?: string;
};

/**
 * A wine → its row in the unified ledger.
 *
 * Deliberately **thin**: enough to render a row and route to the wine, never
 * the wine itself. The client fetches the full record from catalog once a row is
 * opened, which is what keeps the ledger cheap to rewrite.
 */
export const WineToSearchRowMapper: Mapper<ProjectableWine, SearchResultContract> = {
  map(wine) {
    return {
      success: true,
      data: {
        id: searchRowId("WINE", wine.id),
        kind: "WINE",
        facet: facetFor("WINE"),
        entityId: wine.id,
        title: { source: "canonical", text: wine.name },
        ...(wine.estate ? { eyebrow: { source: "canonical" as const, text: wine.estate } } : {}),
        /**
         * THREE outcomes, not two. A wine with no vintage RECORDED is not a
         * non-vintage wine, and conflating them made six of seven seeded rows
         * claim something false — including a Bordeaux château. `nonVintage` is
         * a statement about the wine; absence is a statement about the record.
         */
        ...(wine.vintage
          ? { meta: { kind: "vintage" as const, year: wine.vintage } }
          : wine.vintageDisplay === "NV"
            ? { meta: { kind: "nonVintage" as const } }
            : {}),
        ...(wine.verdict ? { verdict: wine.verdict } : {}),
        ...(wine.price ? { listedPrice: wine.price } : {}),
        ...(wine.imageUrl ? { imageUrl: wine.imageUrl } : {})
      } as SearchResultContract
    };
  }
};
