/**
 * The structured half of a tasting note — what the member actually observed,
 * as answers rather than prose.
 *
 * ## Why this exists, and why it looks like the register
 *
 * The register has been able to REPORT structured readings since the record
 * model shipped: scale means with distributions, tiered aroma mentions, a colour
 * reading with its swatch. Nothing carried them per note. The aggregate existed
 * with no wire shape for its own input, which is a system that can only be
 * seeded.
 *
 * So every key here is the SAME key the register serves — `TastingMetricKey`,
 * `AromaKey`, `ColourReadingKey` — and that identity is the point rather than a
 * convenience. It is what makes the register a sum of notes instead of a
 * parallel vocabulary, and it is the entire search story: the index holds
 * `aroma.fynbosSmoke`, one member wrote it in Afrikaans, another browses it in
 * French, and no translated word passes through the index. Two vocabularies, one
 * for writing and one for reading, would break that on the first divergence.
 *
 * ## Everything is optional
 *
 * The note and the verdict are the only required things a member owes a wine
 * (see {@link TastingNoteContract}). Appearance, nose, palate, pour, cellar and
 * value are all offered and none demanded — a member who writes two sentences
 * and picks a word has written a complete note. An absent reading is a member
 * who did not answer, which is a different fact from an answer of "medium", and
 * the register counts answers per metric for exactly that reason.
 */

import type { AromaKey, BottleConditionKey } from "../vocabulary/index.js";
import type { NoteColourReadingContract } from "./noteColourReading.js";
import type { NoteDrinkingWindowContract } from "./noteDrinkingWindow.js";
import type { NotePourContract } from "./notePour.js";
import type { NoteScaleAnswerContract } from "./noteScaleAnswer.js";

/**
 * Everything structured a note can carry. Every field optional; see the module
 * header for why.
 */
export type NoteReadingsContract = {
  /** Scale answers, at most one per metric. A repeated key is a malformed note. */
  scales?: NoteScaleAnswerContract[];
  /** Aromas named. An unordered SET — the order a member tapped them is not a fact. */
  aromas?: AromaKey[];
  colour?: NoteColourReadingContract;
  pour?: NotePourContract;
  /**
   * The state of the bottle.
   *
   * INVARIANT: **a fault never counts against the wine's record.** A note
   * reporting anything in {@link FAULT_CONDITIONS} is excluded from every
   * register aggregation — the verdict distribution, the scale means, the aroma
   * mentions, the colour reading. That exclusion is SERVER policy, stated here
   * because it is the reason this field is worth collecting: a corked bottle is
   * a failed closure, and the estate did not make it.
   *
   * The note itself still stands, and still reads in the room. It is evidence
   * about an evening rather than about a wine.
   */
  condition?: BottleConditionKey;
  drinkingWindow?: NoteDrinkingWindowContract;
};
