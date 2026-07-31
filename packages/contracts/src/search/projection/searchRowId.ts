import type { SearchEntityKind, SearchFacet } from "../search.js";

/**
 * The ledger id for a projected row.
 *
 * `entityId` alone is NOT unique across the ledger: search is a unified index,
 * so a wine and a tasting may legitimately carry the same domain id. The kind
 * disambiguates, and the client keys rows on this rather than on `entityId`.
 *
 * It is also **deterministic**, which is what makes every writer idempotent: a
 * stream replay, a backfill or a seed regeneration computes the same id and
 * overwrites its own row instead of appending a duplicate.
 */
export function searchRowId(kind: SearchEntityKind, entityId: string): string {
  return `search_${kind.toLowerCase()}_${entityId}`;
}

/**
 * The facet a kind answers to.
 *
 * An explicit map rather than a lower-cased plural, because the contract states
 * a kind may later split across facets — which a string transform could not
 * express.
 */
const FACET_BY_KIND: Readonly<Record<SearchEntityKind, SearchFacet>> = {
  WINE: "wines",
  ESTATE: "estates",
  REGION: "regions",
  TASTING: "tastings",
  PERSON: "people"
};

export function facetFor(kind: SearchEntityKind): SearchFacet {
  return FACET_BY_KIND[kind];
}
