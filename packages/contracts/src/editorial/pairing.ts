import type { NegotiatedText } from "../text/index.js";
import type { TrustBylineContract } from "../trust/index.js";

/**
 * What to drink it with, and whose idea that was.
 *
 * `suggestedBy` is a byline for the same reason every other suggestion on the
 * platform carries one: a pairing from the estate's chef and a pairing from the
 * marketing copy are different recommendations, and an unattributed one reads as
 * Kgwari's.
 */
export type EditorialPairingContract = {
  dish: NegotiatedText;
  reason?: NegotiatedText;
  /** How to serve it — temperature, decant, glass — in prose. */
  serve?: NegotiatedText;
  suggestedBy?: TrustBylineContract;
};
