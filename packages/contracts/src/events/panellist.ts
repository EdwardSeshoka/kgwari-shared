import type { CanonicalText, NegotiatedText } from "../text/index.js";
import type { TrustTier } from "../trust/index.js";

/**
 * Somebody on the panel — a winemaker, a sommelier, a writer.
 *
 * ORDERED as sent: a panel has a lead and the running order is editorial, so it
 * is not the client's to sort. `house` is the estate or restaurant they appear
 * for, which is a different fact from their role and often the reason a member
 * comes.
 */
export type EventPanellistContract = {
  name: CanonicalText;
  tier?: TrustTier;
  /** Their role at this event, as prose — "cellarmaster", "in conversation with". */
  role?: NegotiatedText;
  house?: CanonicalText;
};
