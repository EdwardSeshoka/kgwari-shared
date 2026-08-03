import type { NegotiatedText } from "../text/index.js";
import type { TrustBylineContract } from "../trust/index.js";

/**
 * What happened, filed after the fact.
 *
 * Its OWN byline and its OWN `filedAt`, separate from the announcement's. An
 * announcement is written before by whoever is hosting; a recap is written after
 * and often by somebody else, and collapsing them attributes one person's
 * account of an evening to the person who advertised it.
 */
export type EventRecapContract = {
  body: NegotiatedText[];
  byline?: TrustBylineContract;
  /** ISO-8601. When the recap was filed — not when the event ran. */
  filedAt: string;
};
