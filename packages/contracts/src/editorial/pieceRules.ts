import type { EditorialContentType } from "./contentType.js";

/**
 * The blocks a piece of each type may legally carry — the validation rule, in
 * one place.
 *
 * Published as data rather than restated in a server validator and a client
 * renderer, for the reason {@link ../trust!personaTier} is: two implementations
 * of one rule is one chance to disagree, and the disagreement here would be a
 * cause piece quietly rendering a buy button on one platform and not the other.
 *
 * A piece carrying a block its type does not allow is a VALIDATION ERROR at
 * write time, not a field a client hides. Hiding it would leave the wrong thing
 * stored and shown by whatever renders it next.
 */
export const EDITORIAL_PIECE_RULES = {
  article: { event: false, offer: true, pairing: true, mentions: true },
  guide: { event: false, offer: false, pairing: true, mentions: true },
  story: { event: false, offer: false, pairing: true, mentions: true },
  new_arrival: { event: false, offer: true, pairing: true, mentions: true },
  event: { event: true, offer: false, pairing: true, mentions: true },
  trial: { event: false, offer: false, pairing: false, mentions: true },
  occasion: { event: true, offer: false, pairing: true, mentions: true },
  season: { event: false, offer: false, pairing: true, mentions: true },
  /**
   * A cause carries neither commerce nor wine mentions. A piece about a relief
   * fund that also sells you a case is not a cause piece, and the rule is here
   * rather than in an editor's head.
   */
  cause: { event: false, offer: false, pairing: false, mentions: false },
  offer: { event: false, offer: true, pairing: true, mentions: true }
} as const satisfies Readonly<
  Record<
    EditorialContentType,
    { event: boolean; offer: boolean; pairing: boolean; mentions: boolean }
  >
>;
