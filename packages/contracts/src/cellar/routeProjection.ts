import type { WineContract } from "../catalog/index.js";
import type { CanonicalText } from "../text/index.js";
import type { VerdictWord } from "../trust/index.js";

/**
 * Everything a member has tasted on a route, gathered under the cellar — and
 * belonging to nobody.
 *
 * ## What this is for
 *
 * A member walks four estates and meets eleven wines. Two come home in the boot;
 * the other nine exist only as an afternoon. Those nine are the most useful thing
 * the app knows about that member's palate and they had nowhere to live: the
 * cellar is possession, Save is intent, and neither describes "I drank this once,
 * standing up, at half past ten".
 *
 * So they appear in the cellar automatically, as a GROUP, and the member does
 * nothing to put them there. No confirmation, no Add, no tap — a projection over
 * their own routes, always current because there is nothing stored to fall behind.
 *
 * ## A projection is not possession, and the shape has to enforce it
 *
 * This is the dangerous idea in the whole redesign, and it is dangerous in one
 * specific way: the cellar is the surface where the app tells a member what they
 * OWN. A group of eleven wines sitting under thirty-four bottles will be read as
 * forty-five of something unless the shapes make that impossible.
 *
 * So, deliberately:
 *
 * - **Nothing here has a `bottles` field.** Not zero — absent. A count of bottles
 *   is the one fact that means possession, and {@link CellarEntryContract} is the
 *   only type in this package that carries it. A wine met on a route has no
 *   bottle number to be wrong about.
 * - **This counts WINES** ({@link CellarRouteProjectionContract.wineCount}), and a
 *   client must never sum it with a bottle count. Two numbers on one screen
 *   counting two different things is the honest rendering; one total across both
 *   is phantom possession.
 * - **No price, no acquisition, no private note.** Those are the member's facts
 *   about a bottle they hold. Meeting a wine produces a tasting note, which is
 *   public and lives in `social`.
 *
 * If a member later buys one, that is an ordinary {@link AddCellarEntryRequest}
 * with an ordinary `acquiredAt`. The route did not put it there; they did.
 *
 * ## Derived, so there is nothing to keep in step
 *
 * A rule over that member's own routes, evaluated on read — the same kind of
 * thing a Lens is, and unpublishable for the same reason. It has no order to drag
 * and no author but the member. Delete a stop and the wine leaves; correct a
 * verdict and the verdict here corrects too. Storing it instead would create a
 * second copy of the afternoon, and the two would disagree the first time
 * somebody edited a note.
 */
export type CellarRouteProjectionContract = {
  /**
   * How many WINES the member has met on routes and does not hold.
   *
   * The header number, and the reason it is stated rather than counted from
   * `groups`: the group list pages and the header does not, so a client that
   * summed what it had would label the section with its own page size.
   *
   * It counts wines, and the cellar's own total counts bottles. Nothing may add
   * them together — see this type's own note on why that is the failure mode
   * worth designing against.
   */
  wineCount: number;
  /**
   * One entry per route, newest route first.
   *
   * Grouped rather than flat because the answer to "where did I have that?" is a
   * day out, not a wine list — and because grouping sidesteps the awkward case
   * below without pretending to solve it.
   */
  groups: CellarRouteGroupContract[];
};

/**
 * One route's worth of wines met.
 *
 * Carries the route's title denormalized, so the cellar can head a group without
 * fetching every itinerary it mentions — the same trade the collection card's
 * preview strip makes, and like the strip it may lag the route's own title.
 */
export type CellarRouteGroupContract = {
  itineraryId: string;
  /**
   * The route's own title, denormalized for the heading.
   *
   * A BARE string, and that is a decision rather than an omission. It mirrors
   * {@link CollectionContract.title}, which is a member's typed words carried bare
   * for the reason {@link CollectionPreviewItemContract.title} states: a caption
   * beside it on the same screen is bare too, and the authoritative form arrives
   * with the entity when the route is opened. Wrapping a copy in
   * {@link NegotiatedText} here would claim the server negotiated a title it merely
   * copied.
   */
  itineraryTitle: string;
  /**
   * ISO-8601 calendar day the route happened, when it is known.
   *
   * The route's earliest {@link ItineraryStopContract.date}, falling back to its
   * `createdAt`. Absent for a route whose stops carry no dates — which is a plan,
   * and a plan has poured nothing, so a dateless group here should be empty and
   * usually will not exist at all.
   */
  date?: string;
  items: CellarMetWineContract[];
};

/**
 * One wine, met once, on a route.
 *
 * ## What it deliberately lacks
 *
 * No `bottles`, no `paidPrice`, no `acquiredAt`, no private note. Every one of
 * those is a fact about a bottle somebody owns, and this is a fact about an
 * afternoon. The absences are the contract: a client cannot render this row as a
 * holding because there is nothing on it to render.
 */
export type CellarMetWineContract = {
  /**
   * The catalogue wine, resolved.
   *
   * Nullable for the same reason {@link CellarHoldingContract.wine} is: a wine can
   * be withdrawn from the catalogue after somebody drank it, and that does not
   * unhappen the afternoon. The row still renders from the stop it came from.
   */
  wine: WineContract | null;
  /** Which stop poured it. Not which place — a route can call at one estate twice. */
  stopId: string;
  /**
   * Where it was in the route — `1` for the first stop.
   *
   * Sent rather than derived from the group's order, because this list is the
   * wines and not the stops: a stop that poured nothing contributes no row, so
   * position here is not position on the route, and counting rows would mislabel
   * every stop after the first silent one.
   */
  stopOrdinal: number;
  /**
   * The place's name, denormalized for the row, as {@link CanonicalText}.
   *
   * A name and not a {@link ProducerContract}: this row says where a wine was met
   * and opens onto the WINE, not the estate. Carrying the whole producer would
   * fan out across the provenance domain once per wine met, on a screen that shows
   * every route a member has ever been on.
   *
   * Canonical because an estate name is a PROPER NOUN — "Meerlust Estate" is the
   * same word in Cape Town and in Québec, there is nothing to negotiate, and the
   * search index must never stem it. Carried rather than bare so the row declares
   * which of the three sources it is, exactly as {@link EventVenueContract.name}
   * does for the same kind of word.
   */
  placeName: CanonicalText;
  /**
   * What the member said about it at the time, if they wrote it down.
   *
   * The verdict off their own note from that stop, denormalized so the group reads
   * without fetching every note behind it. Absent is the common case — most wines
   * met on a route are never written up, and a row with no verdict is a complete
   * row rather than an unfinished one.
   */
  verdict?: VerdictWord;
};

/**
 * Where a member first met a bottle they now hold.
 *
 * ## Provenance the cellar has no other way of knowing
 *
 * A holding says what was paid and when the bottles arrived. It cannot say that
 * this Chenin was poured at half past ten on the eighteenth and came home in the
 * boot that afternoon — and that is the fact a member actually remembers a bottle
 * by. Only a route knows it.
 *
 * ## Which meeting is "first", and why the stop needed a date
 *
 * A wine met on two routes has two meetings. Ranked by
 * {@link ItineraryStopContract.date}, this is the earlier AFTERNOON. Ranked by
 * anything else available — the route's `createdAt`, the note's — it is whichever
 * route was WRITTEN UP first, so a day documented months late would steal credit
 * from the day that earned it. That asymmetry is the entire argument for a stop
 * carrying a day, and it is why this field can exist at all.
 *
 * Absent when the wine was never met on a route: bought on recommendation, sent by
 * a friend, inherited. Most of a cellar is this, and a client that treats the
 * absence as a gap will draw an empty provenance line under almost every bottle.
 */
export type CellarFirstMetContract = {
  itineraryId: string;
  /** Denormalized for the line. A display fact — it can lag the route's title. */
  itineraryTitle: string;
  stopId: string;
  /** Where in the route — `1` for the first stop. */
  stopOrdinal: number;
  /** ISO-8601 calendar day. Absent only if the stop carries none. */
  date?: string;
};
