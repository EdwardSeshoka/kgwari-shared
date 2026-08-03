import type { CanonicalText } from "../text/index.js";

/**
 * How to take a seat — and it is never a Kgwari checkout.
 *
 * The claimant rule applied to events: Kgwari does not sell the seat, hold the
 * stock or take the payment, exactly as it does not sell the bottle (see
 * {@link ../catalog!ClaimantAvailabilityContract}). Booking hands off to whoever
 * is running the evening, at their own address.
 *
 * It is deliberately NOT a {@link ../discover!WineActionContract}. That stack is
 * Kgwari's own affordances — save, cellar, ask. A booking that joined it would
 * read as Kgwari's promise, and the promise belongs to the host.
 */
export type EventBookingContract = {
  /** Who the member is actually transacting with. Never truncated. */
  claimant: CanonicalText;
  /**
   * Which verb to render. A chrome key rather than a label — "Buy tickets" is
   * English, and a host who types their own button text has typed it once for
   * seven locales.
   */
  actionKey:
    | "booking.reserve"
    | "booking.buyTickets"
    | "booking.requestSeat"
    | "booking.joinList";
  /** The host's own destination. Absolute, external, and opened as such. */
  url: string;
};
