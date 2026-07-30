import type { Verdict } from "../trust/index.js";

/**
 * Search is a UNIFIED ledger: a wine, an estate, a region, a tasting and a
 * person all come back in one ranked list, in one row shape. The kind is a
 * field on the row rather than a separate result type — that is what lets the
 * client render a single scroll that never changes gear between entities.
 *
 * Consequence for the backend: every contributing domain projects into this one
 * shape. A result is deliberately thin — enough to render a row and to route to
 * the entity — never the entity itself. Clients fetch the full record from the
 * owning domain once a row is opened.
 */
export type SearchEntityKind =
  | "WINE"
  | "ESTATE"
  | "REGION"
  | "TASTING"
  | "PERSON";

/**
 * The facet a result answers to in the filter index. Derived from
 * {@link SearchEntityKind}, but sent explicitly so the client never has to own
 * the kind→facet table — and so a kind can later split across facets (or two
 * kinds merge into one) without a client release.
 */
export type SearchFacet =
  | "wines"
  | "estates"
  | "regions"
  | "tastings"
  | "people";

/**
 * One row of the ledger.
 *
 * `entityId` is the id within the owning domain (a wine id, a region id); `id`
 * is unique across the whole result set and is what the client keys on — two
 * kinds may legitimately share an entity id.
 */
export type SearchResultContract = {
  /** Unique within a result set. Key rows on this, not on `entityId`. */
  id: string;
  kind: SearchEntityKind;
  facet: SearchFacet;
  /** Id within the owning domain — what the client routes with. */
  entityId: string;
  /**
   * The mono eyebrow above the title: an estate for a wine, a region for an
   * estate, a role for a person. Absent when the row has no natural parent.
   */
  producer?: string;
  title: string;
  /** A vintage, "Est. 1693 · 6 wines", "88 notes". Pre-composed by the server. */
  meta?: string;
  /**
   * Only wines carry a verdict. Present on other kinds is a server bug — the
   * client renders it if sent, so the guard belongs on the write side.
   */
  verdict?: Verdict;
  imageUrl?: string;
};

/**
 * A way into the catalogue offered before anything is typed — one row of the
 * search home's index (a region, a style, a verdict) with its tally.
 */
export type SearchBrowseItemContract = {
  id: string;
  label: string;
  /** Pre-formatted tally, e.g. "312". Absent when the count is unknown. */
  count?: string;
  /** The query this way-in runs when chosen. Defaults to `label`. */
  query?: string;
};

/**
 * A titled group of ways in. `labelKey` is a localisation key, not display
 * copy — the server never sends translated text, so a group heading reads in
 * the member's language without a round trip.
 */
export type SearchBrowseGroupContract = {
  id: string;
  labelKey: string;
  items: SearchBrowseItemContract[];
};
