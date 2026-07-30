import type {
  SearchBrowseGroupContract,
  SearchResultContract
} from "./search.js";

/**
 * `GET /search?q=…` — the committed query's WHOLE match set, unfiltered.
 *
 * The server must NOT pre-filter by facet. The client's filter index derives
 * its facets from this list, so a filtered payload would leave the index
 * offering only the facet the member is already inside. Faceting is a client
 * concern precisely because the whole set is cheap to send at these sizes.
 */
export type SearchResponse = {
  items: SearchResultContract[];
  /** Echoed back so a late response can be matched to its query. */
  query: string;
};

/**
 * `GET /search/suggest?q=…` — type-ahead for a partial query.
 *
 * Same row shape as {@link SearchResponse}, deliberately: a suggestion and the
 * result it becomes are the same object at two densities, so the client renders
 * both with one component. Expect a short list; the server caps it.
 */
export type SearchSuggestResponse = {
  items: SearchResultContract[];
  query: string;
};

/**
 * `GET /search/browse` — the ways in offered on the search home before
 * anything is typed.
 */
export type SearchBrowseResponse = {
  groups: SearchBrowseGroupContract[];
};
