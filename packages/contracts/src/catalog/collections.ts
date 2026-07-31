import { Composition, type CompositionInterface } from "@edwardseshoka/foundation";

import type { VerdictWord } from "../trust/index.js";
import { VERDICTS } from "../trust/index.js";
import type { CollectionBadgeKey } from "./vocabulary/index.js";
import type { WineContract } from "./wine.js";

/**
 * How the catalogue groups itself into collections — owned by catalog, because
 * grouping wines has nothing in common with assembling a discover page or
 * ranking a search result.
 *
 * It lives in `contracts` rather than in either app for the same reason
 * {@link ../member!tierForProfile} does: it is a rule *about the vocabulary*,
 * derived entirely from fields the contract already defines. Two apps deriving
 * it separately is two chances to disagree about what "worth opening" means.
 *
 * ## Why it takes contracts, not a structural constraint
 *
 * An earlier version was generic over anything wine-shaped, so a backend entity
 * and a wire contract could both be passed without either importing the other.
 * That flexibility had no user: the frontend never builds a collection (it
 * hardcodes `collections: []` and only holds the type to consume one), leaving
 * exactly two callers, and both can hold a `WineContract`.
 *
 * It also cost two bugs, both from mis-declaring "the loosest shape a caller
 * might hold" — `location` was required here and absent on four wines, then
 * `isFeatured` was required here and optional on the wire, which meant
 * `WineContract` never actually satisfied the constraint it was written for.
 *
 * The deeper reason is that **a collection is a response shape, not a domain
 * concept**. "Featured Picks" is a way of presenting a catalogue, so composing
 * at the contract level is the more correct layering rather than a concession.
 */
/** The collections the catalogue offers. A closed set — hence a chrome key. */
export type WineCollectionKey =
  | "featured_picks"
  | "home_market_icons"
  | "worth_opening_now";

/**
 * One collection: which one it is, and what is in it.
 *
 * **No title, subtitle, description or badge label.** The version this replaced
 * composed all four in English on the server — `title: "Featured Picks"`,
 * `description: "A curated set of standout bottles…"` — which is the same fault
 * the search meta line was fixed for: a server sending display copy has
 * hardcoded one language into every client. The set of collections is closed, so
 * `key` travels and the client renders all four strings from its own catalog.
 *
 * `badgeKey` is separate from `key` because not every collection wears a badge,
 * and which one does is a presentation decision that should not require a new
 * collection.
 */
export type WineCollectionContract = {
  key: WineCollectionKey;
  badgeKey?: CollectionBadgeKey;
  /**
   * Interpolations for the client's copy — the same key-plus-params pattern
   * {@link ../catalog!LockedSectionContract} uses. `home_market_icons` carries
   * its `countryCode` so one key reads "South African Icons" or "Icônes
   * françaises" without a collection per market.
   */
  params?: Readonly<Record<string, string | number>>;
  wines: readonly WineContract[];
};

/** How many wines a collection shows before it is truncated. */
const COLLECTION_SIZE = 8;

/**
 * The market a catalogue is being read from. Defaults to the home market.
 *
 * A PARAMETER rather than a constant, and that is the fix for a real bug: the
 * version this replaced hardcoded a South African region list and titled the
 * result "South African Icons". Defensible when the catalogue was South African;
 * wrong the moment `fr-FR`, `de`, `it` and `es` became launch locales, because a
 * French member was shown somebody else's icons under somebody else's heading.
 *
 * It also matches on `countryCode` rather than substring-searching a free-text
 * area, which is both more robust and the only field with full coverage — four
 * of the catalogue's wines have no `location` at all, and all four are the
 * international ones.
 */
const DEFAULT_HOME_MARKET = "ZA";

/** Ordinal rank of a verdict (best = 0); absent verdicts sort last. */
function verdictRank(verdict: VerdictWord | undefined): number {
  if (verdict === undefined) return VERDICTS.length;
  const index = VERDICTS.indexOf(verdict);
  return index === -1 ? VERDICTS.length : index;
}

function dedupeById(wines: readonly WineContract[]): WineContract[] {
  const seen = new Set<string>();
  const deduped: WineContract[] = [];
  for (const wine of wines) {
    if (seen.has(wine.id)) continue;
    seen.add(wine.id);
    deduped.push(wine);
  }
  return deduped;
}

/** What varies per call: the catalogue being grouped. */
export type WineCollectionSources = Readonly<{
  wines: readonly WineContract[];
}>;

/**
 * Groups a catalogue into its collections.
 *
 * **The market is configuration, the wines are input**, which is why the market
 * is a constructor argument and not part of `compose`. Which market a catalogue
 * is read from is decided once for a request; which wines are in it changes on
 * every call. Folding both into one bundle made every call site restate a
 * setting that never varies.
 */
export class WineCollectionsComposition
  implements CompositionInterface<WineCollectionSources, WineCollectionContract[]>
{
  constructor(private readonly homeMarket: string = DEFAULT_HOME_MARKET) {}

  compose({ wines }: WineCollectionSources): WineCollectionContract[] {
    if (wines.length === 0) return [];

    const featured = dedupeById(wines.filter((wine) => wine.isFeatured)).slice(0, COLLECTION_SIZE);

    const homeMarket = dedupeById(
      wines.filter((wine) => wine.countryCode === this.homeMarket)
    ).slice(0, COLLECTION_SIZE);

    const worthOpening = dedupeById(
      [...wines]
        .filter((wine) => wine.verdict !== undefined)
        .sort((left, right) => {
          const byVerdict = verdictRank(left.verdict) - verdictRank(right.verdict);
          if (byVerdict !== 0) return byVerdict;
          return (right.noteCount ?? 0) - (left.noteCount ?? 0);
        })
    ).slice(0, COLLECTION_SIZE);

    // Declarative rather than a sequence of pushes, and the helper encodes the
    // rule: an absent section beats an empty one, because a client should never
    // render a heading over nothing.
    return Composition.present<WineCollectionContract>([
      featured.length > 0
        ? { key: "featured_picks", badgeKey: "badge.featured", wines: featured }
        : null,
      homeMarket.length > 0
        ? { key: "home_market_icons", params: { countryCode: this.homeMarket }, wines: homeMarket }
        : null,
      worthOpening.length > 0 ? { key: "worth_opening_now", wines: worthOpening } : null
    ]);
  }
}
