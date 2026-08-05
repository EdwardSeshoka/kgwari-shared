import type { TransactedMoneyContract } from "../money/index.js";
import type { WineContract } from "../catalog/index.js";
import type { CellarFirstMetContract } from "./routeProjection.js";

/**
 * What a member holds, and what they know about it that the catalogue does not.
 *
 * ## Why this is its own module and not part of `catalog`
 *
 * A catalogue is one shared set of wines, identical for everybody. A cellar is
 * one member's holdings. They were the same interface in the backend for a long
 * time — seven methods told apart only by the adjective "public"
 * (`listPublic`, `getPublicById`) — and the adjective was load-bearing precisely
 * because two concepts were sharing one seam. Putting the cellar back inside
 * `catalog` here would re-merge in the contract what the split just separated.
 *
 * ## A holding is a REFERENCE, never a copy
 *
 * A cellar row used to duplicate the whole wine, which meant every catalogue
 * correction left a stale copy behind in each cellar holding it: fixing an ABV
 * or a region fixed the catalogue and nothing else. What belongs to the member
 * is what they paid, when they got it, how many bottles are left and what they
 * thought — none of which the catalogue knows, and all of which survive the wine
 * record changing underneath.
 */
export type CellarEntryContract = {
  /** The catalogue wine this holding refers to. */
  wineId: string;
  /**
   * Bottles currently held.
   *
   * Zero is legitimate and is not the same as no holding: a wine drunk but kept
   * on record is how a member remembers having owned it. A client that treats
   * `0` as "remove the row" erases that.
   */
  bottles: number;
  /**
   * What this member paid.
   *
   * {@link TransactedMoneyContract} rather than a bare {@link MoneyContract},
   * and the difference is mutability. A *listed* price is the distributor's
   * current fact and changes freely; a *paid* price is the member's immutable
   * historical record. Collapsing the two lets a distributor's price change
   * silently rewrite what a member remembers paying — see
   * {@link ../money!PriceKind}.
   *
   * Its `asOf` is when the money moved, which is NOT always when the bottles
   * arrived — see {@link acquiredAt}.
   */
  paidPrice?: TransactedMoneyContract;
  /**
   * ISO-8601. When the bottles entered the cellar.
   *
   * **Deliberately separate from `paidPrice.asOf`, and not a duplicate of it.**
   * For most bottles the two dates are the same day. For wine bought en primeur
   * they are years apart: a member pays on release and the bottles arrive two or
   * three vintages later. One date cannot state both, and picking either one
   * would misdate the other.
   *
   * A bottle that was a gift has an `acquiredAt` and no `paidPrice`, which is
   * why this does not simply ride along on the price.
   */
  acquiredAt?: string;
  /**
   * The member's own words about their own bottle.
   *
   * Not a tasting note and not a verdict — those are public and belong to the
   * social feature. This is private: "last two bottles, saving them for the
   * anniversary".
   */
  note?: string;
  /**
   * BCP 47 tag the note was authored in.
   *
   * A note is prose, so it carries its language the same way a tasting's title
   * does — see {@link ../events!EventContract.titleLanguage}. It matters less
   * here than there, because a private note has no audience to translate it for;
   * it is stated anyway so a client rendering a mixed-language cellar can set
   * the text direction and pick a font per note rather than per member.
   */
  noteLanguage?: string;
};

/**
 * One holding as a client renders it: the member's facts, and the wine they
 * attach to.
 *
 * **Nested rather than flattened on purpose.** `holding.entry.bottles` and
 * `holding.wine.name` say whose fact each field is at the point of use, which is
 * the distinction this whole module exists to keep. A flat shape would put the
 * member's `paidPrice` and the distributor's `price` side by side as though they
 * were the same kind of thing.
 *
 * `wine` is nullable because a holding outlives its catalogue entry. A wine
 * withdrawn from the catalogue does not take the member's bottles with it, and
 * dropping the holding would be deleting a member's record because somebody
 * edited a catalogue.
 */
export type CellarHoldingContract = {
  entry: CellarEntryContract;
  wine: WineContract | null;
  /**
   * Where the member first met this bottle, when a route knows.
   *
   * DERIVED, which is why it sits on the holding and not on
   * {@link CellarEntryContract}. The entry is what the member typed — what they
   * paid, when it arrived, what they think of it. This is computed from their own
   * routes at read time, so it corrects itself when a stop is fixed and vanishes
   * when the stop is deleted. Storing it on the entry would make the cellar hold a
   * copy of an afternoon and then disagree with it.
   *
   * Absent for most of a cellar — see {@link CellarFirstMetContract}.
   */
  firstMet?: CellarFirstMetContract;
};
