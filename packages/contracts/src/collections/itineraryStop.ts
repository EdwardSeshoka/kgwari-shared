import type { WineContract } from "../catalog/index.js";
import type { ProducerContract } from "../provenance/index.js";
import type { TastingNoteContract } from "../social/index.js";
import type { NegotiatedText } from "../text/index.js";

/**
 * One stop on an itinerary — a place, and whatever happened there.
 *
 * ## What a stop is FOR, and the shape it forced
 *
 * An itinerary used to be a collection of estates: `subject: "estates"`, one
 * producer per row. A real route does not survive that. Somebody documenting the
 * Franschhoek wine tram arrives at Grande Provence, tastes four things, writes up
 * two of them, takes the 14:00 tram, and eats at the estate she started from.
 * The old shape could hold the estates and nothing else — and the fixture proved
 * it, describing "three cellar doors, one long lunch, and one designated driver"
 * above an `itemCount` of five whose subject said estates.
 *
 * So the row is no longer a thing, it is an OCCASION. A stop is the unit a route
 * is actually made of, and it is what `itemCount` finally counts honestly: the
 * same estate visited in the morning and again at dinner is two stops, which the
 * old shape could only render as a duplicate or lose.
 *
 * ## Heterogeneous INSIDE a stop, homogeneous as a list
 *
 * This does not reopen the mixed-container question that
 * {@link CollectionKind} closes, and it must not be read as doing so. The
 * itinerary's items are all stops — one subject, exactly as before. What is
 * mixed is what a stop CONTAINS, one level down. Nesting is not mixing: a member
 * asks "what did we do at Kanonkop", never "is this row a wine or a place", and
 * the Save mechanism remains the only flat bag of unlike things.
 *
 * ## The stop owns no content of its own
 *
 * Every field below points at a record that already exists somewhere else — a
 * producer, a vintage, a note, an event. There is deliberately no prose field and
 * no photo field on the stop itself.
 *
 * That is a real constraint with a real cost, and the cost is worth naming: a
 * remark about the PLACE rather than about a wine — the drive up, the light in the
 * barrel room, the fact that lunch ran long — has nowhere to go. Today it goes in
 * the itinerary's own `description`, and a photograph goes on the note that
 * carries it ({@link TastingNoteContract.photo}).
 *
 * If it turns out stops must speak for themselves, the answer is a note about a
 * place, in the social domain, alongside the note about a wine. It is NOT a
 * string on this type. A string here would acquire a language tag, then a
 * verdict, then a save count, and arrive at being a note by accretion — with none
 * of a note's moderation, none of its authorship, and no ledger row.
 *
 * ## Resolved on the wire, owned by nobody here
 *
 * "It is only links" describes OWNERSHIP, not the wire. The fields below carry
 * the domains' own contracts rather than ids, for the reason
 * {@link CollectionItemContract} already gives: a detail page of ids is a page of
 * second fetches, one per row, and a five-stop route would open with fifteen of
 * them. Carrying the real contracts also means a wine on a route and the same
 * wine in a search result cannot disagree about what it is.
 *
 * Because they are resolved copies of records the stop does not own, they are
 * BEST-EFFORT. A vintage can be delisted and an author can delete her note after
 * the route was published, so a stop must render with fewer wines than the card's
 * tally claims. That is the same latitude {@link CollectionPreviewItemContract}
 * already takes — a display fact, not truth — and for the same reason: a page
 * that refetches to check its own tally has given back everything the shape
 * bought.
 */
export type ItineraryStopContract = {
  /**
   * The STOP's id, which is not the place's.
   *
   * A route can call at one estate twice — a morning tasting and dinner — so the
   * producer id is not unique within an itinerary and a client keyed on it would
   * drop a stop. This is also what a note's `origin.stopId` points at.
   */
  id: string;
  /**
   * Where you are.
   *
   * REQUIRED, and the only required content on a stop: a stop you cannot go to is
   * not a stop. {@link ProducerContract} rather than a name, because a stop is
   * somewhere you are going — it needs its region and its own page to open onto,
   * and a route whose stops are strings is a route you cannot follow.
   *
   * This is why freezing an estates Lens yields an itinerary and not a shelf. The
   * rule runs once, and each estate it returns becomes a stop carrying that
   * producer and nothing else — a route skeleton, in the order the rule returned,
   * for its author to fill in.
   */
  place: ProducerContract;
  /**
   * ISO-8601 CALENDAR DAY — `2026-07-18`, never an instant.
   *
   * ## Why a day and not a timestamp
   *
   * Two stops at one estate on one day are told apart by their position in the
   * route, not by the clock, so sub-day precision would buy nothing and cost the
   * whole timezone question {@link EventContract.timezone} exists to answer. A
   * day also matches how a member says it: the tram was "the eighteenth", not
   * 09:40 SAST.
   *
   * ## What needs it
   *
   * The cellar credits where a bottle was first met, and a wine met on two routes
   * has two meetings. Without a day, "first" resolves to whichever route was
   * WRITTEN UP first rather than which day came first — so a route documented
   * months late would steal the credit from the afternoon that earned it. See
   * {@link CellarHoldingContract.firstMet}.
   *
   * ## Absent, and what reads it then
   *
   * Optional, because a draft is a list of places before it is a set of dates and
   * a member adds Meerlust before deciding which Saturday. A consumer that needs
   * a day and has none falls back to the ITINERARY's `createdAt` — right for the
   * common case of a day written up the same evening, and wrong only for a route
   * filed late, which is exactly the case this field exists to fix. Nothing may
   * invent a day from the stop's position.
   *
   * On a planned route this is an intention and on a documented one a record,
   * which is the same reading {@link ItineraryMode} governs everywhere else.
   */
  date?: string;
  /**
   * What was poured here, in the order it was poured.
   *
   * Absent on a planned route, which has not happened yet, and absent on a stop
   * where nothing was tasted — lunch is a stop. Neither is a defect, and a
   * consumer that renders an empty tasting list for either is wrong twice.
   */
  wines?: WineContract[];
  /**
   * What the member wrote here.
   *
   * Real notes from the social domain, not excerpts: a note written on the tram
   * is a full opinion about a specific vintage, and it keeps every one of a
   * note's properties — it attaches to the vintage, counts toward that wine's
   * note count, and can be promoted as the most-saved note on the wine's page.
   *
   * What it does NOT get is a ledger row of its own. See
   * {@link TastingNoteContract.origin}: publishing the route is one act, and nine
   * notes from one afternoon are not nine contributions.
   */
  notes?: TastingNoteContract[];
  /**
   * The evening or the ride, when the stop was one.
   *
   * A reference and never {@link EventContract}, because an event carries
   * admission and booking, and Kgwari does not take the booking — the event's own
   * page owns that, exactly as {@link SavableKind} says. Embedding five events to
   * print five names would also drag the whole events domain onto a page that has
   * no business holding it.
   */
  event?: ItineraryStopEventRefContract;
};

/**
 * The event a stop was, named just enough to link to it.
 *
 * Denormalized rather than fetched, the same trade the card's preview strip
 * makes: a route lists what it called at without fanning out across the events
 * domain per stop. Like the strip, it is a display fact and can lag the event
 * behind it.
 */
export type ItineraryStopEventRefContract = {
  eventId: string;
  /**
   * The evening's name, as {@link NegotiatedText}.
   *
   * A tasting title is CURATED PROSE — somebody wrote "Wynhuis tramrit" in a
   * language — so it travels as negotiated text carrying the language the server
   * actually landed on. That is what lets a client badge a fallback rather than
   * present it as a translation, which matters here because an Afrikaans title
   * served silently to an English reader misrepresents whose words they are.
   *
   * Deliberately NOT the legacy `title: string` + `titleLanguage?: string` pair
   * that {@link EventContract} still carries. Two fields that must agree are two
   * fields that eventually will not, and a new contract has no reason to inherit
   * a shape the text carriers exist to replace. A producer copying from an event
   * wraps once; nothing downstream has to remember to look for the tag.
   */
  title: NegotiatedText;
  /**
   * ISO-8601. When the event starts — or started.
   *
   * Absent for an event with no fixed time, matching
   * {@link EventContract.startDateTime}. Which TENSE a client renders this in is
   * not this field's business and must not be guessed from it: an
   * {@link ItineraryMode} of `planned` reads "the 14:00 tram" beside a way to
   * book, and `documented` reads "we took the 14:00 tram" with no call to action
   * at all.
   */
  startDateTime?: string;
};
