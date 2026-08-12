import type {
  CollectionContract,
  CollectionRuleContract,
  ItineraryCollectionContract
} from "../collections/index.js";
import type { MoneyContract } from "../money/index.js";
import type { CellarRouteProjectionContract } from "./routeProjection.js";

/**
 * A member's own cellar HOME — the masthead, the index, and the doors above it.
 *
 * ## The gap this closes
 *
 * There was no way to ask for a member's own cellar. `ListCollectionsResponse` is
 * the public feed: it returns {@link ../collections!PublishedCollectionContract}[],
 * which excludes a Lens *by type*, and its lens row is the authorship one —
 * sommeliers, members, Kgwari. A member's own index is her shelves, **her own
 * rules**, what she follows and where she has been, and not one of those four can
 * come from that endpoint.
 *
 * ## One request, because the page is one page
 *
 * Three round-trips for a masthead, an index and two doors would let them disagree
 * with each other on a slow connection — and the doors exist precisely to agree
 * with the index. A door that names a set and then shows a different count than
 * the lens it opens is worse than no door.
 *
 * ## Member-scoped, which is what makes it different from every card feed
 *
 * {@link ../collections!CollectionContract} says outright that a member's own index
 * needs private rows and therefore needs a member-scoped contract rather than a
 * loosened public one. This is that contract. Rows here may be unpublished — a
 * shelf she has not shared, a route she is still planning — because the only reader
 * is their author. Nothing in this response may be forwarded to a feed.
 *
 * ## What it does NOT carry
 *
 * **Holdings.** The index carries collections; the bottles themselves are
 * {@link ListCellarResponse}. That split is why `bottles` below is a figure and not
 * a list: a cellar home that shipped its holdings would page, and a masthead that
 * counted a page has started lying at holding fifty-one.
 */
export type GetCellarIndexResponse = {
  summary: CellarSummaryContract;
  /**
   * The index, in the order it is to be drawn.
   *
   * A section the member has nothing in is OMITTED rather than sent empty. A
   * heading over no rows asks a reader what they have lost, and the answer is
   * nothing — they have simply never made a lens. The one exception is a cellar
   * with nothing at all, which sends no sections and lets the masthead carry the
   * whole page.
   */
  sections: CellarSectionContract[];
  doors: CellarDoorContract[];
};

/**
 * The masthead: the sentence the page opens on, and the figures that corroborate
 * it.
 *
 * ## Nothing here may be re-derived
 *
 * Not one of these can be computed from {@link ListCellarResponse} once holdings
 * page, and computing them while they happen to fit is how a page starts lying at
 * holding fifty-one. Compose no sentences from them either: the counts and the
 * date travel, and the plural rules and the word order are the locale's — "3
 * bottles" hardcodes English, and "keeping since 2021" hardcodes English word
 * order on top of it.
 */
export type CellarSummaryContract = {
  /**
   * Bottles held.
   *
   * Sums `bottles` across holdings, so a drunk-and-kept row adds nothing — see
   * {@link CellarEntryContract.bottles}, where zero is a legitimate state and not a
   * deletion.
   *
   * **This is the only possession figure on the page and nothing may be added to
   * it.** {@link CellarRouteProjectionContract.wineCount} sits a section away
   * counting wines the member met and does not own; a client that totals the two
   * has invented bottles on the one screen whose job is to say what somebody has.
   */
  bottles: number;
  /**
   * Distinct wines on record.
   *
   * INCLUDING the drunk-and-kept, which is exactly why it is not {@link bottles}.
   * A member who drank her last Rubicon still has it on record, and a figure line
   * that dropped it would report her cellar shrinking because she opened something.
   */
  wines: number;
  estates: number;
  /**
   * Bottles whose drinking window includes the current year.
   *
   * The same number the "Ready this year" lens returns, computed once and by the
   * same rule — and sent here as well as on that lens's door because they are one
   * record read twice, not two counts. A door that names a set and then disagrees
   * with it is worse than no door.
   *
   * **This one is not fully checkable, and the gap is worth naming.**
   * `CELLAR_INDEX_RULES.readyThisYearAgrees` holds a door to the row it opens, which
   * catches the drift that actually happens. What no rule can catch is THIS field
   * disagreeing with that lens, because nothing on the wire says which lens is the
   * ready-this-year one: the id is a composer's, and matching on the title would be
   * matching on the author's words. A marker would fix it and is not worth a field
   * yet — the door and the lens agreeing is most of the value, and a composer that
   * derives both counts from one query cannot produce the third disagreement.
   */
  readyThisYear: number;
  /**
   * ISO-8601 of the earliest acquisition.
   *
   * "Three years deep" is composed at the render edge from this and the clock — a
   * DATE travels and a duration does not, for the same reason
   * {@link ../catalog!WineRegisterContract.firstFiledAt} is a date. A composed
   * duration is stale on its own anniversary and wrong in every locale but the one
   * that wrote it.
   *
   * Absent for a cellar whose holdings carry no acquisition dates — a real state,
   * because {@link CellarEntryContract.acquiredAt} is itself optional and a member
   * who has never dated a bottle has no year to be deep since.
   */
  keepingSince?: string;
  /**
   * The middle half of what the member paid.
   *
   * Two amounts and never a single average: an average of four bottles is a number
   * about nothing, and the honest claim is "half of what you hold cost between X
   * and Y". Percentiles rather than the cheapest and dearest bottle, which are one
   * purchase each — the same call {@link ../catalog!PaidPriceBandContract} makes
   * about the market, and {@link ../catalog!RegisterSpreadContract} about a tasting
   * scale.
   *
   * One currency, and nothing is ever converted. A cellar bought across two markets
   * has no single band, and the composer sends none rather than inventing a rate —
   * see {@link ../money!MoneyContract}, where a stored conversion is a claim about
   * an exchange rate that stops being true within days.
   *
   * Absent when too few bottles carry a price to have a middle, and absent whenever
   * {@link figuresAvailable} is false.
   */
  priceBand?: { low: MoneyContract; high: MoneyContract };
  /**
   * Whether the figure line is drawn at all.
   *
   * **The threshold is the server's, and this field is the entire reason that is
   * not a client rule.** Below roughly twenty priced bottles the counts say nothing
   * a sentence cannot, so the design suppresses them — and that is the same shape
   * as the empty-below-two lens-row suppression the taxonomy already puts upstream.
   * A client that counts to twenty itself is a second copy of a threshold, and the
   * two drift the first time the number moves.
   *
   * The counts above are still sent when this is false, because the page still
   * needs them for its opening sentence; what this governs is the FIGURE LINE. The
   * one field that follows it absolutely is {@link priceBand}, which is never
   * present when this is false.
   */
  figuresAvailable: boolean;
};

/**
 * Which run of the index a section is.
 *
 * Four, and the reason there is a `kind` at all is that a client must not derive
 * one. Grouping by {@link ../collections!CollectionKind} on the client means the
 * client owns the rule for what counts as a shelf — the duplication that made the
 * lens row a server job in the first place. `following` is not a kind at all: it is
 * a RELATIONSHIP, and nothing on a card distinguishes a selection the member
 * follows from one merely rendered to her.
 */
export type CellarSectionKindContract = "shelves" | "lenses" | "following" | "routes";

/**
 * What every section carries regardless of what its rows are.
 *
 * `items` is deliberately not here: the routes run holds a narrower row than the
 * other three, and hoisting the array to the base would type it as the widest of
 * them — which is how a route's tense and tally would become optional on the one
 * section that requires them.
 */
type CellarSectionBase = {
  /**
   * The whole section's count — **not `items.length`**.
   *
   * The standfirst reads "15 of your own, in the order you made them" while the
   * first page may hold ten. The head describes the SECTION; the array is a page of
   * it. A client that counts the array labels its own page size.
   */
  count: number;
  /** Opaque. Absent when this page is the last of the section. */
  nextCursor?: string;
};

/**
 * The three runs made of ordinary collection cards.
 *
 * ## The order is not the server's to choose in every case
 *
 * Shelves arrive in the MEMBER's order — hers to arrange, and re-sorting somebody's
 * list deletes the part of it she made. Lenses and Following arrive in the
 * server's. Either way the client renders the array as given and sorts nothing,
 * which is the same rule {@link ../collections!CollectionContract} states for a
 * collection's own contents.
 *
 * ## Why the rows are `CollectionContract` and not the published narrowing
 *
 * Because a Lens is a row here. `PublishedCollectionContract` excludes one by type
 * precisely so a derived list cannot reach a feed — and a member's own index is not
 * a feed. It is the one surface where a lens is legitimately drawn, which is why
 * {@link ../collections!CollectionContract.rule} exists and why it is read here and
 * essentially nowhere else.
 */
export type CellarCollectionSectionContract = CellarSectionBase & {
  kind: "shelves" | "lenses" | "following";
  items: CollectionContract[];
};

/**
 * Routes the member has been on, or means to go on.
 *
 * ## Why routes are a section and the wines met are not
 *
 * A route is a collection she authored, so it belongs in the index beside her
 * shelves and reads as one more run of cards. The WINES she met on those routes are
 * not collections at all — they are a projection over her own itineraries, they
 * carry no bottle count, and they belong with the holdings that
 * {@link ListCellarResponse} serves. Putting them in the index would be the index
 * carrying holdings, which is the one thing it does not do.
 *
 * So the index gives them a DOOR instead — see
 * {@link CellarDoorTargetContract}'s `metOnRoutes` arm, which is the figure that
 * names that set. The section is the routes; the door is what they poured.
 *
 * ## Rows carry their tense
 *
 * {@link ../collections!ItineraryCollectionContract} rather than a bare collection,
 * because a plan and a record are opposite cards: a planned stop with an event
 * offers a way to book it and a documented one must not, since the evening is over.
 * A section typed as ordinary collections would drop `mode` and leave every client
 * inferring tense from whether anything has been written yet — the derivation
 * {@link ../collections!ItineraryMode} exists to forbid.
 *
 * Rows here may be UNPUBLISHED, unlike anywhere a route card is otherwise drawn. A
 * member planning next Saturday has a draft nobody else may see, and the only
 * reader of this response is its author.
 */
export type CellarRoutesSectionContract = CellarSectionBase & {
  kind: "routes";
  items: ItineraryCollectionContract[];
};

/** One run of the index. Discriminated on `kind`, because the rows differ. */
export type CellarSectionContract =
  | CellarCollectionSectionContract
  | CellarRoutesSectionContract;

/**
 * Where a door goes.
 *
 * ## The rule that decides what is a door and what is a figure
 *
 * A figure that NAMES A SET is a door; a figure that is only a number stays a
 * number. That is why `bottles`, `wines` and `estates` live in the summary and are
 * not tappable — there is no page of "estates" to arrive at — while "ready this
 * year" and "met on routes" are rows, because each is a set somebody can be shown.
 */
export type CellarDoorTargetContract =
  | { kind: "collection"; collectionId: string }
  /**
   * The wines met on routes and not held.
   *
   * Opens {@link ListCellarResponse}, whose `metOnRoutes` carries the projection —
   * so unlike the requests arm below, this door has somewhere to go on the day it
   * ships. Its `count` is
   * {@link CellarRouteProjectionContract.wineCount}: **wines, not bottles**, and
   * never to be added to {@link CellarSummaryContract.bottles} on the way past.
   */
  | { kind: "metOnRoutes" }
  /**
   * The request ledger, WHICH DOES NOT EXIST.
   *
   * There is no request-ledger contract in this package and this arm does not
   * invent one — a ledger is a feature with statuses, replies and quoted prices,
   * and guessing at its shape here would produce something the real one has to
   * break.
   *
   * So this is a door with a count and nowhere to go. That is deliberate rather
   * than premature: the row is part of the page's argument — a figure that names a
   * set is a door — and shipping the page without it means re-opening the layout
   * later instead of wiring one closure. A client draws the row and declares the
   * intent; pressing it does nothing until the ledger exists.
   */
  | { kind: "requests" };

/**
 * A row above the index.
 *
 * ## Why this is a union and not one shape with optional words
 *
 * A door to a member's lens has to carry that lens's own title, because the door
 * and the lens are one object and the door cannot look it up — the lens may not be
 * on this page of the index. A door to the wines she met on routes has no such
 * words: its row is called the same thing on every cellar in every locale, which
 * makes its name CHROME the client already owns, and a server sending it would be
 * shipping an English sentence to be printed verbatim.
 *
 * One shape with `title?` would blur those into "sometimes there are words", and a
 * client would render whichever it was handed — a chrome key where a member's title
 * belongs, or nothing at all where her lens's name should be. Discriminating on the
 * target makes each door carry exactly what only the server can know.
 */
export type CellarDoorContract = CellarCollectionDoorContract | CellarFixedDoorContract;

/**
 * A door onto one of the member's own collections — in practice a lens.
 *
 * ## The words are the TARGET's own, denormalised on purpose
 *
 * The Ready-this-year door and the Ready-this-year lens are one record read twice.
 * The server sends the same strings from that record so the two cannot disagree; a
 * client that instead renders the door from a lens it happens to have loaded has
 * reintroduced exactly the drift this denormalisation removes — and gets nothing at
 * all on the page where the lens fell past the cursor.
 */
export type CellarCollectionDoorContract = {
  target: { kind: "collection"; collectionId: string };
  /**
   * The collection's own title, copied verbatim.
   *
   * A BARE string, mirroring {@link ../collections!CollectionContract.title} for the
   * reason {@link CellarRouteGroupContract.itineraryTitle} states: these are a
   * member's typed words carried across, and wrapping a copy in
   * {@link ../text!NegotiatedText} would claim the server negotiated a title it
   * merely copied.
   */
  title: string;
  /**
   * The target's rule, when the target is a lens.
   *
   * Structured rather than rendered, so the door's sub-line is composed at the
   * render edge exactly as the lens row's is — same rule, same words, one
   * catalogue entry. A `detail: string` here would have been the server writing
   * "Drinking window includes 2026" in English and the door reading differently
   * from the lens it opens in every other locale.
   *
   * Absent when the target is not a lens, which is the only case a shelf door
   * arises in. See {@link ../collections!CollectionContract.rule} for the
   * present-iff-lens biconditional this inherits.
   */
  rule?: CollectionRuleContract;
  /** Items behind the door — bottles, on any collection a cellar door opens. */
  count: number;
};

/**
 * A door whose row is named by the client — the routes projection, and the ledger.
 *
 * There is exactly one of each per cellar and neither has an author, so neither has
 * words for the server to send. What only the server knows is the number, and that
 * is all this carries.
 */
export type CellarFixedDoorContract = {
  target: { kind: "metOnRoutes" } | { kind: "requests" };
  /**
   * How many things are behind it, in the target's OWN unit.
   *
   * `metOnRoutes` counts WINES — {@link CellarRouteProjectionContract.wineCount} —
   * and `requests` counts open requests. Neither is bottles, and a client that sums
   * a column of doors has added three different units together and printed the
   * result over a member's cellar.
   */
  count: number;
};
