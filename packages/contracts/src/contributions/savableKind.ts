/**
 * What can be saved. Every unit a surface renders as a card.
 *
 * ## Save is not cellaring, and it is not booking
 *
 * Save is INTENT: a member marking something to come back to. Cellaring is
 * possession, and {@link ../cellar!CellarEntryContract} owns it. Booking a seat
 * is a transaction with the host, and {@link ../events!EventBookingContract}
 * hands it off at the host's own address — Kgwari never takes the booking, holds
 * the stock or takes the payment. Folding any of the three into "save" would
 * make the lightest action in the app carry a promise it cannot keep.
 *
 * ## Following is saving
 *
 * `collection` is here because there is no separate follow model and there
 * should not be: a list you follow stays live because its author keeps curating
 * it, which is exactly what saving a live unit already means. A second verb
 * would give one act two counts to disagree about.
 *
 * ## Why an estate is savable
 *
 * `producer` is what "Estates you follow" is derived FROM. That lens is a rule
 * over these records, so without them the most obvious estates-subject lens a
 * member could have has no input — and an itinerary frozen out of it would have
 * nothing to enumerate.
 *
 * ## What this is NOT
 *
 * Save is the mixed-kind bookmark — wines, stories, evenings, together. That is
 * precisely why a {@link ../collections!CollectionContract} has ONE subject and
 * cannot mix: the two would otherwise be the same object with two names, and
 * nothing would explain to a member why the thing they saved is not on a shelf.
 * Different verb, different object.
 */
export type SavableKind =
  | "note"
  | "wine"
  | "event"
  | "editorial"
  | "collection"
  | "producer";
