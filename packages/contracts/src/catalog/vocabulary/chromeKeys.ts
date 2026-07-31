import { AROMAS } from "./aromas.js";
import { CLOSURES } from "./closures.js";
import { FERMENTS } from "./ferments.js";
import { GRAPES } from "./grapes.js";
import { SOILS } from "./soils.js";
import { TASTING_SCALES } from "./tastingScales.js";

/**
 * Every chrome key the catalogue declares, for a locale-catalogue parity check.
 *
 * This is the reason the vocabularies left the seed generator. Seven launch
 * locales need a list of what must be translated, and a set nobody can
 * enumerate cannot be checked — which is how `af` came to carry 238 keys to
 * `en`'s 416 with nothing reporting the gap.
 *
 * Tasting scales contribute only their labelled rungs: the blanks are
 * positional padding, not keys.
 *
 * **Deduplicated**, because the scales deliberately SHARE rungs — `tasting.low`
 * belongs to both tannin and acidity, `tasting.medium` to all four. Without the
 * `Set` this list asked for the same translation five times, which turns a
 * parity check into busywork and a translator's queue into a lie about how much
 * is left.
 */
export const CATALOG_CHROME_KEYS: readonly string[] = [
  ...new Set([
    ...CLOSURES,
    ...SOILS,
    ...FERMENTS,
    ...AROMAS,
    ...GRAPES,
    ...Object.values(TASTING_SCALES)
      .flat()
      .filter((rung) => rung !== "")
  ])
];
