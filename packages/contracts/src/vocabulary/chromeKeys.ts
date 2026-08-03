import { AROMAS } from "./aromas.js";
import { CLOSURES } from "./closures.js";
import { COLOUR_READINGS } from "./colours.js";
import { BOTTLE_CONDITIONS } from "./conditions.js";
import { FERMENTS } from "./ferments.js";
import { GRAPES } from "./grapes.js";
import { DECANT_STEPS, GLASS_SHAPES, TASTED_MODES } from "./pour.js";
import { RIM_READINGS } from "./rims.js";
import { SOILS } from "./soils.js";
import { TASTING_SCALES } from "./tastingScales.js";

/**
 * Every chrome key the closed vocabularies declare, for a locale-catalogue
 * parity check.
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
 *
 * COLOUR READINGS were missing until 7.0 — an enumerable set that nothing
 * enumerated, which is exactly the gap this list exists to close. They join the
 * note-capture vocabularies (rims, pour, bottle condition) added alongside them.
 */
export const VOCABULARY_CHROME_KEYS: readonly string[] = [
  ...new Set([
    ...CLOSURES,
    ...SOILS,
    ...FERMENTS,
    ...AROMAS,
    ...GRAPES,
    ...COLOUR_READINGS,
    ...RIM_READINGS,
    ...BOTTLE_CONDITIONS,
    ...TASTED_MODES,
    ...DECANT_STEPS,
    ...GLASS_SHAPES,
    ...Object.values(TASTING_SCALES)
      .flat()
      .filter((rung) => rung !== "")
  ])
];

/**
 * @deprecated Renamed to {@link VOCABULARY_CHROME_KEYS} in 7.0, when the
 * vocabularies moved out of `catalog`. The old name said "catalog" about a set a
 * tasting note, a register and a search index all draw from equally — and a name
 * that describes the folder a thing used to live in is the kind of drift this
 * package writes tests against. Kept as an alias so a locale parity check does
 * not break on the move.
 */
export const CATALOG_CHROME_KEYS: readonly string[] = VOCABULARY_CHROME_KEYS;
