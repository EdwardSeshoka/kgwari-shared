import type { WineContract } from "../catalog/index.js";
import type { WineActionContract } from "./actions.js";

/**
 * The featured wine hero — "This week's pick". Carries the selected
 * {@link WineContract} (a vintage) plus editorial framing and up to two actions.
 * Hero stats are derived on the client from the wine: verdict · noteCount ·
 * (vintageDisplay ?? vintage). It never invents a wine-specific shape.
 */
export type DiscoverWineHeroContract = {
  kind: "wine";
  /** Issue marker, e.g. "No. 47". */
  issueLabel?: string;
  /** Kicker, e.g. "This week's pick". */
  kicker?: string;
  /** Editorial display title, e.g. "Rubicon, once more." */
  title: string;
  description?: string;
  wine: WineContract;
  primaryAction?: WineActionContract;
  secondaryAction?: WineActionContract;
};
