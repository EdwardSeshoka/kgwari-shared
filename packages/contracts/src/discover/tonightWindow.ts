/**
 * The window the room's figures are counted over.
 *
 * Sent as two instants rather than a word, because a client handed the string
 * "tonight" cannot say what it was told: it can neither state the span nor tell
 * when the number went stale. Two instants answer both.
 *
 * ## It is no longer an evening
 *
 * It was, and the earlier note here said so — a local evening, starting and
 * ending at different UTC instants depending on where the member stood. That
 * was never what the server sent. The hours were UTC and nothing else was, so a
 * member in Auckland had their whole evening outside the window and never saw
 * the section at all, while the figures inside it were drawn from the entire
 * world regardless of who was reading.
 *
 * The server now sends a ROLLING window ending at the moment of the request —
 * the shortest span containing every timezone's most recent evening. Producers
 * should send that; consumers should assume nothing about its length beyond
 * what these two instants say, and must not name a time of day from it. The
 * figures are global, and a heading claiming otherwise is the one thing this
 * contract cannot stop a client doing.
 *
 * A reader-local window is the upgrade, and it needs a field that does not exist
 * yet: the client's UTC offset, sent with the request. Until it does, "tonight"
 * is a word no surface can honestly say.
 */
export type TonightWindowContract = {
  /** ISO-8601, inclusive. */
  from: string;
  /** ISO-8601, exclusive. */
  to: string;
};
