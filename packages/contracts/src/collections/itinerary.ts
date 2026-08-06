import type { PublishedCollectionContract } from "./collection.js";

/**
 * An itinerary, as a surface renders the CARD.
 *
 * ## Why the card is narrowed and not loosened
 *
 * Everything an itinerary card draws, a shelf card already drew: a title
 * somebody typed, a byline, a cover, a count, a strip, a save count, a date. So
 * {@link CollectionContract} is unchanged and this is an intersection over it,
 * fixing `kind` and `subject` and adding the two fields only a route has.
 *
 * Adding `mode` to the shared card as an optional would have been the cheap
 * version, and it would make "absent" mean both "not an itinerary" and "an
 * itinerary whose tense nobody set". Narrowing instead puts the requirement where
 * it applies and nowhere else — the same technique
 * {@link PublishedCollectionContract} uses to keep a Lens out of a feed, and for
 * the same reason: a shape a producer cannot construct beats a rule a server
 * remembers.
 *
 * It extends the PUBLISHED contract, so a Lens cannot become an itinerary card by
 * intersection. A lens over estates is a rule and stays one; it reaches this type
 * only by being frozen, which runs the rule once and turns each estate it
 * returned into a stop.
 */
export type ItineraryCollectionContract = PublishedCollectionContract & {
  kind: "itinerary";
  /**
   * Always `"stops"`.
   *
   * It was `"estates"`, and the change is the whole point of this contract:
   * `itemCount` now counts occasions rather than places, so a route that calls at
   * one estate twice adds up.
   */
  subject: "stops";
  /** Whether this is a plan or a record. Decides tense and every call to action. */
  mode: ItineraryMode;
  /** Nested tallies for the sub-line. Absent means the route lists stops only. */
  contents?: ItineraryContentsContract;
};

/**
 * A plan, or a record of something that happened.
 *
 * ## Both are real products, and they are opposite cards
 *
 * The old fixture read "estates, in the order she means to drive them" — a plan,
 * written in the future tense, whose stops are places she has not been. A
 * write-up of the Franschhoek tram is the same record pointed backwards: the
 * stops happened, the wines were poured, the notes exist. Same shape, opposite
 * tense, and opposite call to action — a planned stop with an event offers a way
 * to book it, and a documented one must not, because the evening is over.
 *
 * Absence means opposite things in the two, which is the part a consumer gets
 * wrong first. A planned stop with no `wines` and no `notes` is COMPLETE; a
 * documented one with neither is a draft the author has not written up yet.
 *
 * ## Sent, not derived
 *
 * "Has any stop got a note yet" would answer this most of the time, and that is
 * the problem: a member writing up her day would watch the card flip from plan to
 * record halfway through the first note, taking the booking buttons on the
 * remaining four stops with it. Sent explicitly, exactly as
 * {@link CollectionKind} is and for the same trade — tense is the reader's
 * question, and deriving it from the contents is a table every client would have
 * to own and get wrong at the same moment.
 */
export type ItineraryMode = "planned" | "documented";

export const ITINERARY_MODES = [
  "planned",
  "documented"
] as const satisfies readonly ItineraryMode[];

/**
 * What is nested inside the stops, for the card's sub-line — "5 stops · 9 wines
 * · 4 notes".
 *
 * ## Why a second count is allowed here and nowhere else
 *
 * {@link CollectionContract.itemCount} says there is no separate wine count,
 * because a collection has one subject and cannot be part one thing and part
 * another. That still holds. This is not a second subject — the subject is
 * `stops`, `itemCount` counts them, and these are counts of things nested INSIDE
 * those stops. A shelf has nothing under its rows to tally, which is why this
 * field exists on an itinerary and on nothing else.
 *
 * It carries the sub-line's whole job: it is what tells a reader scrolling Latest
 * that a row is a day out rather than a list of four farm names. Without it the
 * only honest thing a route's card could say is its stop count, and the card that
 * lost the argument for embedding its notes needs something in exchange.
 *
 * ## It is a display fact, not truth
 *
 * Written when the route is written, and it may exceed what the detail page can
 * resolve — a delisted vintage, a note its author deleted. Nothing may reconcile
 * it against the stops at read time.
 */
export type ItineraryContentsContract = {
  /** Wines poured across every stop. Not distinct labels — the same wine twice counts twice. */
  wines: number;
  /**
   * Notes written across every stop.
   *
   * The number of notes, which is not the number of contributions this route made
   * to the corpus. That number is one. See {@link TastingNoteContract.origin}.
   */
  notes: number;
};
