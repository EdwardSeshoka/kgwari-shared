import type { Measurement, NegotiatedText } from "../text/index.js";
import type { DecantStepKey, GlassShapeKey, TastedModeKey } from "../vocabulary/index.js";

/**
 * The conditions the note was taken under — facts about the TASTING, never
 * about the wine.
 *
 * They ride the note so the register can honour them: a blind reading and a
 * sighted one are not interchangeable evidence, and neither is a bottle poured
 * cold and one at cellar temperature. See {@link ../vocabulary!pour}.
 */
export type NotePourContract = {
  tasted?: TastedModeKey;
  decant?: DecantStepKey;
  glass?: GlassShapeKey;
  /**
   * Serving temperature. A {@link Measurement}, never "18 °C" — the number and
   * the unit are separate facts, and the unit key names the scale it was
   * actually recorded in rather than one Kgwari converted it to.
   */
  temperature?: Measurement;
  /**
   * What it was drunk with, in the member's own words.
   *
   * The one genuinely authored field in the pour block, so it carries the
   * language it was written in like any other prose. A closed pairing vocabulary
   * was considered and refused: dinner is not a controlled set.
   */
  pairing?: NegotiatedText;
};
