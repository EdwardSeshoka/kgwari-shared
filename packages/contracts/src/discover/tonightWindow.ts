/**
 * The window a tonight figure counts over.
 *
 * Sent as two instants rather than a word, because "tonight" is not a duration:
 * it is a local evening, it starts and ends at different UTC instants depending
 * on where the member is, and a client handed the string "tonight" cannot say
 * what it was told. A client handed a window can render "since 6pm" and can also
 * tell when the number went stale.
 */
export type TonightWindowContract = {
  /** ISO-8601, inclusive. */
  from: string;
  /** ISO-8601, exclusive. */
  to: string;
};
