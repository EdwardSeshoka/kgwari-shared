/**
 * The search endpoints.
 *
 * Two obligations sit on the CLIENT for every request here, neither of which a
 * type can enforce. They are written down in this file because it is the one
 * both sides read:
 *
 * 1. **Send `Accept-Language`** as the member's ordered preference list. The
 *    server negotiates curated text against it and reports what it found — per
 *    field via `NegotiatedText.languageTag`, and for the response as a whole via
 *    {@link SearchResponse.contentLanguage}.
 * 2. **Send NFC-normalised query text.** `é` has two Unicode encodings — one
 *    code point, or `e` followed by a combining acute — and they are different
 *    byte strings to an index. Two members typing what looks like the same query
 *    get different results unless the client normalises first. Digit variants
 *    (`٥` → `5`) normalise at the same boundary. The index applies the same
 *    normalisation at write time; the query side is the client's half of it.
 */
import type {
  SearchBrowseGroupContract,
  SearchResultContract
} from "./search.js";

/**
 * The most rows `GET /search` returns for one query.
 *
 * Exported rather than left as server trivia because both sides depend on it:
 * the server caps here, and the client derives its facet counts from whatever
 * arrives — so a client that does not know a cap exists cannot tell "12 wines"
 * from "12 wines, and the rest were cut". See {@link SearchResponse.truncated}.
 */
export const SEARCH_RESULT_LIMIT = 200;

/**
 * The most rows `GET /search/suggest` returns for a partial query.
 *
 * This is a product decision about type-ahead density, not a transport budget,
 * which is why it is pinned rather than left to the server: it matches the count
 * the search screen was designed around. Sending more than the type-ahead shows
 * would be waste; sending fewer would leave a designed row empty. Change it here
 * and both sides move together.
 */
export const SEARCH_SUGGEST_LIMIT = 4;

/**
 * `GET /search?q=…` — the committed query's WHOLE match set, unfiltered.
 *
 * The server must NOT pre-filter by facet. The client's filter index derives
 * its facets from this list, so a filtered payload would leave the index
 * offering only the facet the member is already inside. Faceting is a client
 * concern precisely because the whole set is cheap to send at these sizes —
 * bounded by {@link SEARCH_RESULT_LIMIT}, which is what keeps "cheap" true.
 */
export type SearchResponse = {
  items: SearchResultContract[];
  /** Echoed back so a late response can be matched to its query. */
  query: string;
  /**
   * BCP 47 tag the negotiated text came back in, echoing `Content-Language`.
   * When it is not what `Accept-Language` asked for, curated text fell back —
   * and the client may badge that rather than pass a fallback off as a
   * translation.
   */
  contentLanguage: string;
  /**
   * True when the match set hit {@link SEARCH_RESULT_LIMIT} and rows were cut.
   *
   * Sent because the alternative is a silent lie: the client counts what it
   * received to render "{{count}} results", so a capped set would report the cap
   * as the answer. A truncated result is still a good result — it just may not
   * narrow when the member refines the query, which is the one thing they would
   * otherwise reasonably conclude.
   */
  truncated: boolean;
};

/**
 * `GET /search/suggest?q=…` — type-ahead for a partial query.
 *
 * Same row shape as {@link SearchResponse}, deliberately: a suggestion and the
 * result it becomes are the same object at two densities, so the client renders
 * both with one component. Capped at {@link SEARCH_SUGGEST_LIMIT}.
 *
 * No `truncated` flag: type-ahead is *always* a shortlist, so truncation is the
 * normal case rather than information. Nothing renders a count here.
 */
export type SearchSuggestResponse = {
  items: SearchResultContract[];
  query: string;
  /** See {@link SearchResponse.contentLanguage}. */
  contentLanguage: string;
};

/**
 * `GET /search/browse` — the ways in offered on the search home before
 * anything is typed.
 */
export type SearchBrowseResponse = {
  groups: SearchBrowseGroupContract[];
  /** See {@link SearchResponse.contentLanguage}. */
  contentLanguage: string;
};
