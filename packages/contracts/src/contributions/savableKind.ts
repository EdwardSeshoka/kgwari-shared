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
 */
export type SavableKind = "note" | "wine" | "event" | "editorial";
