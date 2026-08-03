/**
 * What KIND of piece this is — and since 7.0, what it is legally allowed to
 * contain.
 *
 * The first four are the shapes editorial has always had. The six added for the
 * detail model name what estates actually publish, and they are not decoration:
 * the type GATES the piece (see {@link EDITORIAL_PIECE_RULES}). A `cause` piece
 * may not carry a commercial block or wine mentions, because a piece about a
 * fire relief fund that also sells you a case is not a cause piece — and the
 * only way to keep that true is to make it unrepresentable rather than
 * discouraged.
 *
 * BREAKING for exhaustive matches: a `switch` over the old four now misses six.
 * That is the intended failure — a client rendering an `offer` as though it were
 * an `article` would drop the price table silently.
 */
export type EditorialContentType =
  | "article"
  | "guide"
  | "story"
  | "new_arrival"
  | "event"
  | "trial"
  | "occasion"
  | "season"
  | "cause"
  | "offer";
