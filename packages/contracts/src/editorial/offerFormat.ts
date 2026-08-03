import type { CanonicalText, Measurement } from "../text/index.js";

/** One bottling on offer — a format, and how much wine is in it. */
export type EditorialOfferFormatContract = {
  name: CanonicalText;
  /** Volume, e.g. 750 ml or 1.5 l. A measurement, never the string "magnum". */
  volume?: Measurement;
};
