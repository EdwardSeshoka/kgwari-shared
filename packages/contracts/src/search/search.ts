import type { MoneyContract } from "../money/index.js";
import type { Verdict } from "../trust/index.js";
import type {
  CanonicalText,
  ChromeText,
  NegotiatedText,
} from "../text/index.js";

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

/* ------------------------------------------------------------------------- *
 * Text on a row: three sources, never a bare string
 * ------------------------------------------------------------------------- */

/**
 * The three text sources moved to their own module — they are not a search
 * concept. A wine record's ninety fields, its register of tasting words and an
 * estate's own essay are governed by exactly the same three-way distinction, and
 * leaving these types inside `search` invited every other feature to declare its
 * own (the mistake money made inside `catalog`).
 *
 * Re-exported here so existing `@edwardseshoka/contracts/search` importers keep
 * resolving. The shapes are UNCHANGED.
 *
 * @see {@link ../text!CanonicalText}
 */
export type {
  CanonicalText,
  ChromeText,
  LocalizedText,
  Measurement,
  NegotiatedText,
  YearRange,
} from "../text/index.js";

/**
 * The row's title. Either a proper noun or negotiated prose — never chrome,
 * because no entity is named by an enum.
 */
export type SearchResultTitle = CanonicalText | NegotiatedText;

/**
 * The mono eyebrow above the title: an estate for a wine, a region for an
 * estate, a ROLE for a person. All three sources are legal here, and the role
 * case is why this cannot stay a plain string — "Sommelier" and "Enthusiast"
 * are `BusinessPersona` / `MemberStatus` values, so sending them as words would
 * hardcode English into every person row in the index.
 */
export type SearchResultEyebrow = CanonicalText | ChromeText | NegotiatedText;

/* ------------------------------------------------------------------------- *
 * The meta line: data, not a sentence
 * ------------------------------------------------------------------------- */

/**
 * The secondary line under the title, as the DATA it is composed from — never
 * as a composed string.
 *
 * This field used to be server-rendered text (`"Est. 1693 · 6 wines"`,
 * `"24 July · 4 seats left"`, `"88 notes"`). That is three localisation faults
 * in one field: it concatenates translated fragments (word order differs by
 * language), it hardcodes English plural rules (`1 note` vs `88 notes` is two
 * forms in English and up to six elsewhere), and `"24 July"` is a formatted
 * date, which no wire contract may carry. The client now renders each case
 * through `useLocalizedStrings` + `useFormatters`, so one full-sentence key per
 * case handles word order and plurals together. Author those keys in the
 * catalogs' existing i18next suffix style (`key` / `key_one`), not inline ICU —
 * the locale parity check is built around the suffix form.
 *
 * A note on YEARS: `year` and `foundedYear` are ordinals, not quantities. They
 * must NOT go through a grouping number formatter — `Intl.NumberFormat("fr")`
 * renders 2018 as "2 018". Interpolate them as plain digits; group only the
 * count fields.
 */
export type SearchResultMeta =
  /** A wine's vintage. */
  | Readonly<{ kind: "vintage"; year: number }>
  /**
   * A wine with no vintage — Champagne and most fortifieds are blended across
   * years by design. A distinct case rather than an omitted `meta`, because "NV"
   * is a real statement about the wine and not missing data; omitting it would
   * make a non-vintage Champagne indistinguishable from a row whose vintage
   * nobody recorded. It is also chrome: the client renders "NV", "sans
   * millésime" or "senza annata" from its catalog.
   */
  | Readonly<{ kind: "nonVintage" }>
  /** An estate: founding year, when known, and how many wines it has. */
  | Readonly<{ kind: "estate"; foundedYear?: number; wineCount: number }>
  /** A region and how many wines come from it. */
  | Readonly<{ kind: "region"; wineCount: number }>
  /** A tasting: when it starts, and how many seats are left. */
  | Readonly<{
      kind: "tasting";
      /** UTC ISO 8601. Formatted at the presentation edge. */
      startsAt: string;
      /**
       * Seats remaining. ABSENT MEANS UNCAPPED ("open") — not unknown. Whether
       * a low count earns scarcity emphasis is a presentation judgement, so the
       * server sends the number and takes no view.
       */
      seatsRemaining?: number;
    }>
  /** A person and how many tasting notes they have written. */
  | Readonly<{ kind: "noteCount"; count: number }>;

/* ------------------------------------------------------------------------- *
 * The row
 * ------------------------------------------------------------------------- */

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
  title: SearchResultTitle;
  /** Absent when the row has no natural parent. */
  eyebrow?: SearchResultEyebrow;
  meta?: SearchResultMeta;
  /**
   * Only wines carry a verdict. Present on other kinds is a server bug — the
   * client renders it if sent, so the guard belongs on the write side.
   *
   * Sent as the enum value, which IS the chrome key: the client renders the
   * member's language from its own catalog. See {@link ChromeText}.
   */
  verdict?: Verdict;
  /**
   * What the wine is currently listed at — the DISTRIBUTOR's fact, and the only
   * one of the three price concepts allowed on a search row.
   *
   * Named `listedPrice` rather than `price` on purpose. A *paid* price is the
   * member's immutable historical record and belongs to the cellar; a
   * *valuation* is derived and must always be marked an estimate. A field called
   * `price` invites all three into one slot, after which a distributor's price
   * change silently rewrites what a member remembers paying. See
   * {@link ../money!PriceKind}.
   *
   * Absent when the wine is not listed for sale — which is most of the
   * catalogue. Absence means "no listing", never "free" and never "unknown
   * price", so the client renders nothing rather than a zero.
   *
   * Only wines carry one. As with `verdict`, the client renders what it is sent,
   * so the guard belongs on the write side.
   */
  listedPrice?: MoneyContract;
  imageUrl?: string;
};

/* ------------------------------------------------------------------------- *
 * Browse — the ways in before anything is typed
 * ------------------------------------------------------------------------- */

/**
 * A way into the catalogue offered before anything is typed — one row of the
 * search home's index (a region, a style, a verdict) with its tally.
 */
export type SearchBrowseItemContract = {
  id: string;
  /**
   * How this way-in reads. A region is {@link CanonicalText}; a verdict is
   * {@link ChromeText} (the enum, rendered per locale); an exonymous
   * appellation is {@link NegotiatedText}.
   */
  label: CanonicalText | ChromeText | NegotiatedText;
  /**
   * The tally, as a NUMBER. Was a pre-formatted string (`"312"`), which cannot
   * be grouped per locale — `fr-CH` wants `1 234`, not `1234`. Absent when the
   * count is unknown.
   */
  count?: number;
  /**
   * The query this way-in runs when chosen.
   *
   * REQUIRED, where it used to default to `label`. That default stopped being
   * expressible the moment a label became a chrome key: the member sees
   * "Inoubliable" but the index holds `Unforgettable`, so the word on screen is
   * no longer the word to search for. Stating the query explicitly keeps the
   * two independent — and is why browsing by verdict works in every locale
   * without the index carrying a single translated verdict word.
   */
  query: string;
};

/**
 * A titled group of ways in. `labelKey` is a localisation key, not display
 * copy — the server never sends translated text, so a group heading reads in
 * the member's language without a round trip.
 */
/**
 * The ways into the catalogue offered before anything is typed.
 *
 * A CLOSED set, because which ways in exist is an editorial decision and not
 * data. It was two open strings — `id: "region"` plus
 * `labelKey: "home.byRegion"` — which is two names for one thing and neither of
 * them checkable. The decision then had nowhere to live and ended up expressed
 * procedurally in the seed generator, interleaved with the tallies it needed.
 */
export type SearchBrowseGroupKey = "region" | "verdict" | "country";

/**
 * One way in, and what it offers.
 *
 * `key` IS the chrome key the client renders the heading from — the same
 * arrangement as a verdict word or a collection key, and why the separate
 * `labelKey` is gone. A closed set renders itself.
 */
export type SearchBrowseGroupContract = {
  key: SearchBrowseGroupKey;
  items: SearchBrowseItemContract[];
};
