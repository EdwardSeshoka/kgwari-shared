import type {
  SearchBrowseGroupContract,
  SearchResultContract
} from "@edwardseshoka/contracts/search";

import rawCorpus from "./search-corpus.json" with { type: "json" };
import rawBrowseGroups from "./browse-groups.json" with { type: "json" };

const corpus = rawCorpus as SearchResultContract[];
const browseGroups = rawBrowseGroups as SearchBrowseGroupContract[];

/**
 * The searchable ledger — every kind search returns, projected into the one row
 * shape, referencing the SAME entity ids as the catalog, provenance, events and
 * social samples. That cross-reference is the point: an app double and a seeded
 * backend both resolve `entityId` against real seed records rather than inventing
 * their own, so opening a search result lands on a record that exists.
 *
 * The backend seeds its search index from this; the frontend's app double
 * queries it in memory. Neither owns a private copy.
 */
export function createSearchCorpus(): SearchResultContract[] {
  return corpus;
}

/** The ways into the catalogue offered before anything is typed. */
export function createSearchBrowseGroups(): SearchBrowseGroupContract[] {
  return browseGroups;
}
